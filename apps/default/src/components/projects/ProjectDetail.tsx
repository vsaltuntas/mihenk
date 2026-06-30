import { useState, useMemo, useCallback } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import type { HayatProject, HayatTask } from '@/lib/mihenk-data';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, CheckCircle2, Circle, Plus, Send,
  Loader2, FileText, Users, DollarSign, GitBranch,
  CalendarDays, BarChart3, AlertTriangle, Trash2, Pencil, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_MAP: Record<string, { label: string; emoji: string; dot: string; badge: string }> = {
  idea: { label: 'Fikir', emoji: '💡', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  planning: { label: 'Planlama', emoji: '📋', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  active: { label: 'Aktif', emoji: '🔨', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  production: { label: 'Üretim', emoji: '🎬', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  completed: { label: 'Tamamlandı', emoji: '✅', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  paused: { label: 'Duraklatıldı', emoji: '⏸️', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

const PRIORITY_MAP: Record<string, { label: string; cls: string }> = {
  urgent: { label: '🔴 Acil', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  high: { label: '🟠 Yüksek', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  medium: { label: '🟡 Normal', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  low: { label: '🟢 Düşük', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
};

type TabId = 'ozet' | 'gorevler' | 'zaman' | 'dosyalar' | 'finans' | 'kisiler' | 'graph';
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'ozet', label: 'Özet', icon: BarChart3 },
  { id: 'gorevler', label: 'Görevler', icon: CheckCircle2 },
  { id: 'zaman', label: 'Zaman Çizgisi', icon: CalendarDays },
  { id: 'dosyalar', label: 'Dosyalar', icon: FileText },
  { id: 'finans', label: 'Finans', icon: DollarSign },
  { id: 'kisiler', label: 'Kişiler', icon: Users },
  { id: 'graph', label: 'Graph', icon: GitBranch },
];

function InlineTaskAdd({ projectId, onCreated }: { projectId?: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);
  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await mihenkAPI.createTask({ title: title.trim(), priority, status: 'todo', parentId: projectId });
      toast.success('Görev eklendi'); setTitle(''); setPriority('medium'); setOpen(false); onCreated();
    } catch { toast.error('Görev eklenemedi'); } finally { setSaving(false); }
  };
  if (!open) return (
    <button onClick={() => setOpen(true)} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
      <Plus className="w-4 h-4" /> Yeni görev ekle
    </button>
  );
  return (
    <div className="px-4 py-3 space-y-2 bg-muted/30">
      <div className="flex items-center gap-2">
        <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setOpen(false); }}
          placeholder="Görev başlığı..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50" />
      </div>
      <div className="flex items-center gap-2 pl-7">
        <select value={priority} onChange={e => setPriority(e.target.value)} className="text-[10px] bg-card border border-border rounded-lg px-2 py-1 outline-none">
          <option value="low">🟢 Düşük</option><option value="medium">🟡 Normal</option><option value="high">🟠 Yüksek</option><option value="urgent">🔴 Acil</option>
        </select>
        <div className="flex-1" />
        <button onClick={() => setOpen(false)} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted">İptal</button>
        <button onClick={handleSubmit} disabled={saving || !title.trim()} className="text-[10px] bg-primary text-primary-foreground px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center gap-1">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Ekle
        </button>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, toggling }: { task: HayatTask; onToggle: (id: string, s: string) => void; toggling: string | null }) {
  const isDone = task.status === 'done';
  const priority = PRIORITY_MAP[task.priority];
  const isToggling = toggling === task.id;
  return (
    <motion.div layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group">
      <button onClick={() => onToggle(task.id, task.status)} disabled={isToggling} className="flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50">
        {isToggling ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : isDone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />}
      </button>
      <div className="flex-1 min-w-0">
        <span className={cn('text-sm transition-all', isDone && 'line-through text-muted-foreground')}>{task.title}</span>
        {task.due_date && <p className="text-[10px] text-muted-foreground mt-0.5">📅 {task.due_date}</p>}
      </div>
      {task.mihenk_id && <span className="text-[9px] font-mono text-muted-foreground/40 hidden group-hover:inline">{task.mihenk_id}</span>}
      {priority && <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0', priority.cls)}>{priority.label}</span>}
    </motion.div>
  );
}

function OzetTab({ project, tasks }: { project: HayatProject; tasks: HayatTask[] }) {
  const status = STATUS_MAP[project.status] || STATUS_MAP.idea;
  const done = tasks.filter(t => t.status === 'done').length;
  const pct = project.progress ?? (tasks.length ? Math.round((done / tasks.length) * 100) : 0);
  const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;
  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
        {project.description && <p className="text-muted-foreground text-sm mb-4">{project.description}</p>}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', status.badge)}>{status.emoji} {status.label}</span>
          {project.channel_id && <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{project.channel_id}</span>}
          {project.deadline && <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">📅 {project.deadline}</span>}
          {project.mihenk_id && <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded-full text-muted-foreground/60">{project.mihenk_id}</span>}
        </div>
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">İlerleme</span><span className="text-xs font-bold">{pct}%</span></div>
          <div className="w-full bg-muted rounded-full h-2.5"><div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
          <p className="text-[10px] text-muted-foreground mt-1">{done}/{tasks.length} görev tamamlandı</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ l: 'Toplam', v: tasks.length, c: 'text-blue-500' }, { l: 'Tamamlanan', v: done, c: 'text-green-500' }, { l: 'Acil', v: urgent, c: 'text-red-500' }, { l: 'Bloklu', v: blocked, c: 'text-amber-500' }].map(s => (
          <div key={s.l} className="bg-card rounded-xl border border-border p-4 text-center"><p className={cn('text-2xl font-bold', s.c)}>{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></div>
        ))}
      </div>
    </div>
  );
}

function GorevlerTab({ tasks, projectId, onRefresh }: { tasks: HayatTask[]; projectId: string; onRefresh: () => void }) {
  const [toggling, setToggling] = useState<string | null>(null);
  const [fp, setFp] = useState('all');
  const [sq, setSq] = useState('');
  const toggle = useCallback(async (id: string, cur: string) => {
    setToggling(id);
    try { const ns = cur === 'done' ? 'todo' : 'done'; await mihenkAPI.updateTask({ id, status: ns }); toast.success(ns === 'done' ? '✅ Tamamlandı' : 'Yeniden açıldı'); onRefresh(); }
    catch { toast.error('Güncellenemedi'); } finally { setToggling(null); }
  }, [onRefresh]);
  const filtered = useMemo(() => {
    let r = tasks;
    if (fp !== 'all') r = r.filter(t => t.priority === fp);
    if (sq.trim()) { const q = sq.toLowerCase(); r = r.filter(t => t.title.toLowerCase().includes(q)); }
    return [...r.filter(t => t.status !== 'done'), ...r.filter(t => t.status === 'done')];
  }, [tasks, fp, sq]);
  return (
    <div className="bg-card rounded-2xl border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border gap-2 flex-wrap">
        <h3 className="font-semibold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Görevler <span className="text-xs text-muted-foreground font-normal">({tasks.length})</span></h3>
        <div className="flex items-center gap-2">
          <input value={sq} onChange={e => setSq(e.target.value)} placeholder="Ara..." className="text-xs bg-muted rounded-lg px-2.5 py-1.5 outline-none w-32 border border-transparent focus:border-border" />
          <select value={fp} onChange={e => setFp(e.target.value)} className="text-[10px] bg-muted rounded-lg px-2 py-1.5 outline-none"><option value="all">Tümü</option><option value="urgent">🔴 Acil</option><option value="high">🟠 Yüksek</option><option value="medium">🟡 Normal</option><option value="low">🟢 Düşük</option></select>
        </div>
      </div>
      <div className="divide-y divide-border"><AnimatePresence mode="popLayout">
        {filtered.length === 0 ? <div className="py-10 text-center text-muted-foreground text-sm"><Circle className="w-8 h-8 mx-auto mb-2 opacity-20" /><p>Görev bulunamadı</p></div> : filtered.map(t => <TaskRow key={t.id} task={t} onToggle={toggle} toggling={toggling} />)}
      </AnimatePresence></div>
      <div className="border-t border-border"><InlineTaskAdd projectId={projectId} onCreated={onRefresh} /></div>
    </div>
  );
}

function ZamanTab({ tasks }: { tasks: HayatTask[] }) {
  const wd = tasks.filter(t => t.due_date).sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''));
  const nd = tasks.filter(t => !t.due_date);
  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <h3 className="font-semibold text-sm flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Zaman Çizgisi</h3>
      {wd.length === 0 && nd.length === 0 ? <p className="text-center text-muted-foreground text-sm py-8">Görev yok</p> : (
        <div className="space-y-2">
          {wd.map(t => (<div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30"><span className="text-xs text-muted-foreground font-mono w-20 flex-shrink-0">{t.due_date}</span><div className={cn('w-2 h-2 rounded-full flex-shrink-0', t.status === 'done' ? 'bg-green-500' : 'bg-blue-500')} /><span className={cn('text-sm flex-1', t.status === 'done' && 'line-through text-muted-foreground')}>{t.title}</span></div>))}
          {nd.length > 0 && <><div className="border-t border-border pt-2 mt-2"><p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Tarihsiz ({nd.length})</p></div>{nd.map(t => (<div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 opacity-60"><span className="text-xs text-muted-foreground font-mono w-20 flex-shrink-0">—</span><div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" /><span className="text-sm">{t.title}</span></div>))}</>}
        </div>
      )}
    </div>
  );
}

function BridgePendingTab({ tabName, icon: Icon }: { tabName: string; icon: React.ElementType }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-10 text-center space-y-3">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center"><Icon className="w-8 h-8 text-muted-foreground/30" /></div>
      <h3 className="font-semibold text-lg">{tabName}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">Bu sekme henüz veri kaynağına bağlanmadı. İlgili Taskade projesi kurulduğunda burada {tabName.toLowerCase()} verileri görünecek.</p>
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full"><AlertTriangle className="w-3 h-3" /> bridge pending</span>
    </div>
  );
}

/* ─── MAIN EXPORT ─── */
interface ProjectDetailProps { project: HayatProject; onBack: () => void; onRefresh: () => void; }

export default function ProjectDetail({ project, onBack, onRefresh }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('ozet');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDesc, setEditDesc] = useState(project.description || '');
  const [savingEdit, setSavingEdit] = useState(false);
  const { data: tasks, refetch: refetchTasks } = useMihenkData(mihenkAPI.getTasks, []);
  const allTasks = ensureArray(tasks);
  const projectTasks = useMemo(() => allTasks.filter(t => t.project_id === project.id), [allTasks, project.id]);
  const handleRefresh = useCallback(() => { refetchTasks(); onRefresh(); }, [refetchTasks, onRefresh]);
  const status = STATUS_MAP[project.status] || STATUS_MAP.idea;

  const handleSaveEdit = async () => {
    if (!editName.trim()) { toast.error('Proje adı gerekli'); return; }
    setSavingEdit(true);
    try {
      await mihenkAPI.updateTask({ id: project.id, title: editName, description: editDesc });
      project.name = editName;
      project.description = editDesc;
      setEditing(false);
      onRefresh();
      toast.success('✅ Proje güncellendi!');
    } catch (e: unknown) {
      toast.error(`❌ Güncellenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSavingEdit(false); }
  };
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="w-4 h-4" /> Projeler</button>
          <span className="text-muted-foreground/50">/</span>
          <div className="flex items-center gap-2"><div className={cn('w-2 h-2 rounded-full', status.dot)} /><span className="text-sm font-medium truncate">{project.name}</span></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditing(true); setEditName(project.name); setEditDesc(project.description || ''); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Düzenle
          </button>
          <button onClick={async () => {
            if (!confirm(`"${project.name}" projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
            try { await mihenkAPI.deleteTask({ id: project.id }); toast.success('Proje silindi'); onBack(); onRefresh(); }
            catch { toast.error('Proje silinemedi'); }
          }} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Sil
          </button>
        </div>
      </div>
      {editing && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="bg-card rounded-2xl border-2 border-primary/30 p-5 space-y-3">
          <h4 className="text-sm font-semibold">Projeyi Düzenle</h4>
          <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" placeholder="Proje adı *" />
          <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border resize-none" rows={2} placeholder="Açıklama..." />
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} disabled={savingEdit}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-60">
              <Save className="w-3.5 h-3.5" /> {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 text-xs text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
          </div>
        </motion.div>
      )}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors', activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            {tab.id === 'gorevler' && <span className="text-[9px] opacity-70">({projectTasks.length})</span>}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {activeTab === 'ozet' && <OzetTab project={project} tasks={projectTasks} />}
          {activeTab === 'gorevler' && <GorevlerTab tasks={projectTasks} projectId={project.id} onRefresh={handleRefresh} />}
          {activeTab === 'zaman' && <ZamanTab tasks={projectTasks} />}
          {activeTab === 'dosyalar' && <BridgePendingTab tabName="Dosyalar" icon={FileText} />}
          {activeTab === 'finans' && <BridgePendingTab tabName="Finans" icon={DollarSign} />}
          {activeTab === 'kisiler' && <BridgePendingTab tabName="Kişiler" icon={Users} />}
          {activeTab === 'graph' && <BridgePendingTab tabName="Bağlantı Graph'ı" icon={GitBranch} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
