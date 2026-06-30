import { useState, useMemo, useCallback } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import type { HayatTask } from '@/lib/mihenk-data';
import { cn } from '@/lib/utils';
import {
  Inbox, Sun, CalendarClock, AlertTriangle, FolderKanban,
  CheckCircle2, Clock, Plus, Circle, Search, X,
  Loader2, Send, Undo2, Trash2, CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'inbox' | 'bugun' | 'yaklasan' | 'geciken' | 'projeye_gore' | 'kanban' | 'tamamlanan';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'bugun', label: 'Bugün', icon: Sun },
  { id: 'yaklasan', label: 'Yaklaşan', icon: CalendarClock },
  { id: 'geciken', label: 'Geciken', icon: AlertTriangle },
  { id: 'projeye_gore', label: 'Projeye Göre', icon: FolderKanban },
  { id: 'kanban', label: 'Kanban', icon: FolderKanban },
  { id: 'tamamlanan', label: 'Tamamlanan', icon: CheckCircle2 },
];

const PRIORITIES = ['urgent', 'high', 'medium', 'low'] as const;
const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};
const PRIORITY_LABELS: Record<string, string> = { urgent: '🔴 Acil', high: '🟠 Yüksek', medium: '🟡 Orta', low: '🟢 Düşük' };
const STATUS_LABELS: Record<string, string> = { todo: 'Yapılacak', in_progress: 'Devam Eden', done: 'Tamamlanan', blocked: 'Bloklu' };
const KANBAN_COLS = ['todo', 'in_progress', 'blocked', 'done'];

/* ─── Task Item ─── */
function TaskItem({ task, projectName, onToggle, toggling, onDelete }: {
  task: HayatTask; projectName?: string; onToggle: (id: string, status: string) => void; toggling: string | null; onDelete?: (id: string) => void;
}) {
  const isDone = task.status === 'done';
  const isToggling = toggling === task.id;
  return (
    <motion.div layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      className={cn('group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors', isDone ? 'opacity-40' : 'hover:bg-muted/40')}>
      <button onClick={() => onToggle(task.id, task.status)} disabled={isToggling}
        className="flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50">
        {isToggling ? <Loader2 className="w-[18px] h-[18px] text-primary animate-spin" /> :
          isDone ? <CheckCircle2 className="w-[18px] h-[18px] text-green-500" /> :
            <Circle className={cn('w-[18px] h-[18px] transition-colors',
              task.priority === 'urgent' ? 'text-red-400 hover:text-red-500' :
              task.priority === 'high' ? 'text-orange-400 hover:text-orange-500' :
              'text-muted-foreground/40 group-hover:text-primary/60')} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', isDone && 'line-through text-muted-foreground')}>{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.due_date && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {task.due_date}</span>}
          {projectName && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><FolderKanban className="w-2.5 h-2.5" /> {projectName}</span>}
          {task.mihenk_id && <span className="text-[9px] font-mono text-muted-foreground/30 hidden group-hover:inline">{task.mihenk_id}</span>}
        </div>
      </div>
      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0', PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low)}>
        {PRIORITY_LABELS[task.priority] || task.priority}
      </span>
      {isDone && (
        <button onClick={() => onToggle(task.id, task.status)} title="Geri al"
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all">
          <Undo2 className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(task.id)} title="Sil"
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-500" />
        </button>
      )}
    </motion.div>
  );
}

/* ─── Kanban Column ─── */
function KanbanColumn({ title, tasks, projectMap, onToggle, toggling, onDelete }: {
  title: string; tasks: HayatTask[]; projectMap: Record<string, string>;
  onToggle: (id: string, s: string) => void; toggling: string | null; onDelete: (id: string) => void;
}) {
  return (
    <div className="mihenk-card p-3 min-w-[220px] flex-1">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider">{title}</h4>
        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div className="space-y-1.5 min-h-[100px]">
        {tasks.map(t => (
          <div key={t.id} className="p-2.5 rounded-lg bg-background border border-border/50 hover:shadow-sm transition-shadow group">
            <p className="text-xs font-medium leading-snug">{t.title}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium', PRIORITY_COLORS[t.priority])}>{PRIORITY_LABELS[t.priority]}</span>
              {t.due_date && <span className="text-[9px] text-muted-foreground">{t.due_date}</span>}
              {t.project_id && projectMap[t.project_id] && <span className="text-[9px] text-muted-foreground">{projectMap[t.project_id]}</span>}
            </div>
            <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onToggle(t.id, t.status)} className="text-[9px] text-primary">
                {t.status === 'done' ? '↩ Geri al' : '✓ Tamamla'}
              </button>
              <button onClick={() => onDelete(t.id)} className="text-[9px] text-red-500 hover:text-red-600">✕ Sil</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">Boş</p>}
      </div>
    </div>
  );
}

/* ─── Add Task Inline ─── */
function AddTaskInline({ projects, onAdd }: {
  projects: { id: string; name: string }[];
  onAdd: (title: string, priority: string, projectId?: string, dueDate?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), priority, projectId || undefined, dueDate || undefined);
    setTitle(''); setDueDate(''); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors">
      <Plus className="w-4 h-4" /> Görev ekle
    </button>
  );

  return (
    <div className="mihenk-card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
          placeholder="Görev başlığı..." className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2 pl-7 flex-wrap">
        <select value={priority} onChange={e => setPriority(e.target.value)} className="text-[10px] bg-muted rounded-lg px-2 py-1 outline-none">
          {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </select>
        {projects.length > 0 && (
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className="text-[10px] bg-muted rounded-lg px-2 py-1 outline-none max-w-[140px]">
            <option value="">Projesiz</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
        <div className="flex items-center gap-1">
          <CalendarDays className="w-3 h-3 text-muted-foreground" />
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="text-[10px] bg-muted rounded-lg px-2 py-1 outline-none" />
        </div>
        <div className="flex-1" />
        <button onClick={() => setOpen(false)} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1">İptal</button>
        <button onClick={submit} disabled={!title.trim()} className="text-[10px] bg-primary text-primary-foreground px-3 py-1 rounded-lg font-medium hover:opacity-90 disabled:opacity-40 flex items-center gap-1">
          <Send className="w-3 h-3" /> Ekle
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function GorevlerModule() {
  const [activeTab, setActiveTab] = useState<TabId>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [toggling, setToggling] = useState<string | null>(null);

  const { data: tasks, refetch } = useMihenkData(mihenkAPI.getTasks);
  const { data: projects } = useMihenkData(mihenkAPI.getProjects, []);
  const taskArr = useMemo(() => ensureArray(tasks), [tasks]);
  const projectArr = useMemo(() => ensureArray(projects), [projects]);
  const projectMap = useMemo(() => {
    const m: Record<string, string> = {};
    projectArr.forEach(p => { m[p.id] = p.name; });
    return m;
  }, [projectArr]);

  const todoTasks = useMemo(() => taskArr.filter(t => t.status !== 'done'), [taskArr]);
  const doneTasks = useMemo(() => taskArr.filter(t => t.status === 'done'), [taskArr]);

  const handleToggle = useCallback(async (id: string, currentStatus: string) => {
    setToggling(id);
    try {
      const ns = currentStatus === 'done' ? 'todo' : 'done';
      await mihenkAPI.updateTask({ id, status: ns });
      toast.success(ns === 'done' ? '✅ Görev tamamlandı' : '↩ Görev yeniden açıldı');
      refetch();
    } catch { toast.error('Görev güncellenemedi'); }
    finally { setToggling(null); }
  }, [refetch]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await mihenkAPI.deleteTask({ id });
      toast.success('Görev silindi');
      refetch();
    } catch { toast.error('Silinemedi'); }
  }, [refetch]);

  const handleAdd = useCallback(async (title: string, priority: string, projectId?: string, _dueDate?: string) => {
    try {
      await mihenkAPI.createTask({ title, priority, status: 'todo', parentId: projectId });
      toast.success('Görev eklendi');
      refetch();
    } catch { toast.error('Görev eklenemedi'); }
  }, [refetch]);

  const filtered = useMemo(() => {
    let base: HayatTask[];
    switch (activeTab) {
      case 'inbox': base = todoTasks; break;
      case 'bugun': base = todoTasks.filter(t => t.priority === 'urgent' || t.priority === 'high'); break;
      case 'yaklasan': base = todoTasks.filter(t => t.due_date); break;
      case 'geciken': base = todoTasks.filter(t => t.status === 'blocked' || t.priority === 'urgent'); break;
      case 'tamamlanan': base = doneTasks; break;
      default: base = todoTasks;
    }
    if (filterPriority !== 'all') base = base.filter(t => t.priority === filterPriority);
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); base = base.filter(t => t.title.toLowerCase().includes(q)); }
    return base;
  }, [activeTab, todoTasks, doneTasks, filterPriority, searchQuery]);

  const projectList = useMemo(() => projectArr.map(p => ({ id: p.id, name: p.name })), [projectArr]);

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">İş Omurgası</p>
        <h1 className="mihenk-module-title">Görevler</h1>
        <p className="text-sm text-muted-foreground mt-1">{taskArr.length} görev · {doneTasks.length} tamamlanan</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(tab => {
          const TabIcon = tab.icon;
          const count = tab.id === 'inbox' ? todoTasks.length : tab.id === 'tamamlanan' ? doneTasks.length : 0;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}>
              <TabIcon className="w-3.5 h-3.5" /> {tab.label}
              {count > 0 && <span className={cn('ml-1 px-1.5 py-0.5 rounded-full text-[10px]', activeTab === tab.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/20')}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Search + Filter */}
      {activeTab !== 'kanban' && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Görev ara..."
              className="w-full bg-card rounded-xl pl-8 pr-3 py-2 text-xs outline-none border border-border" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-muted-foreground" /></button>}
          </div>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="text-[10px] bg-card border border-border rounded-xl px-2.5 py-2 outline-none">
            <option value="all">Tüm Öncelikler</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_COLS.map(col => (
            <KanbanColumn key={col} title={STATUS_LABELS[col] || col} tasks={taskArr.filter(t => t.status === col)}
              projectMap={projectMap} onToggle={handleToggle} toggling={toggling} onDelete={handleDelete} />
          ))}
        </div>
      ) : activeTab === 'projeye_gore' ? (
        <div className="space-y-4">
          {(() => {
            const byProject: Record<string, HayatTask[]> = {};
            todoTasks.forEach(t => { const key = t.project_id || '_none'; if (!byProject[key]) byProject[key] = []; byProject[key].push(t); });
            return Object.entries(byProject).map(([projId, pts]) => (
              <div key={projId} className="mihenk-card p-4">
                <h3 className="font-serif font-semibold text-sm mb-2 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-primary" />
                  {projId === '_none' ? 'Projesiz Görevler' : (projectMap[projId] || `Proje: ${projId.slice(0, 8)}...`)}
                  <span className="text-[10px] text-muted-foreground ml-auto">{pts.length}</span>
                </h3>
                <AnimatePresence>
                  {pts.map(t => <TaskItem key={t.id} task={t} projectName={undefined} onToggle={handleToggle} toggling={toggling} onDelete={handleDelete} />)}
                </AnimatePresence>
              </div>
            ));
          })()}
        </div>
      ) : (
        <div className="mihenk-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-semibold text-sm">{TABS.find(t => t.id === activeTab)?.label} ({filtered.length})</h3>
          </div>
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">{activeTab === 'tamamlanan' ? 'Henüz tamamlanan görev yok' : 'Bu listede görev yok'}</p>
              </motion.div>
            ) : (
              <div className="space-y-0.5">
                {filtered.map(t => <TaskItem key={t.id} task={t} projectName={t.project_id ? projectMap[t.project_id] : undefined} onToggle={handleToggle} toggling={toggling} onDelete={handleDelete} />)}
              </div>
            )}
          </AnimatePresence>
          {activeTab !== 'tamamlanan' && (
            <div className="mt-3 pt-3 border-t border-border">
              <AddTaskInline projects={projectList} onAdd={handleAdd} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
