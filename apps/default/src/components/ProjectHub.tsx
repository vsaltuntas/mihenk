import { useState, useMemo, useCallback } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import type { HayatProject, HayatTask } from '@/lib/mihenk-data';
import { cn } from '@/lib/utils';
import {
  FolderKanban, LayoutGrid, List, Search, X, Plus,
  CheckCircle2, Flame, Clock, ArrowRight, Inbox
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectDetail from './projects/ProjectDetail';

const STATUS_MAP: Record<string, { label: string; emoji: string; dot: string; badge: string }> = {
  idea: { label: 'Fikir', emoji: '💡', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  planning: { label: 'Planlama', emoji: '📋', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  active: { label: 'Aktif', emoji: '🔨', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  production: { label: 'Üretim', emoji: '🎬', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  completed: { label: 'Tamamlandı', emoji: '✅', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  paused: { label: 'Duraklatıldı', emoji: '⏸️', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

const CARD_GRADIENTS = [
  'from-purple-500/20 to-pink-500/10',
  'from-blue-500/20 to-cyan-500/10',
  'from-amber-500/20 to-orange-500/10',
  'from-green-500/20 to-emerald-500/10',
  'from-rose-500/20 to-red-500/10',
];

function ProjectCard({ project, index, tasks, onClick }: {
  project: HayatProject; index: number; tasks: HayatTask[]; onClick: () => void;
}) {
  const projectTasks = tasks.filter(t => t.project_id === project.id);
  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  const pct = project.progress ?? (projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0);
  const status = STATUS_MAP[project.status] || STATUS_MAP.idea;
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className={cn('bg-gradient-to-br rounded-2xl border border-border p-5 cursor-pointer hover:shadow-lg transition-all duration-200 group', gradient)}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', status.badge)}>{status.emoji} {status.label}</span>
        {project.channel_id && <span className="text-[10px] text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">{project.channel_id}</span>}
      </div>
      <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
      {project.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-muted-foreground">İlerleme</span><span className="text-[10px] font-bold">{pct}%</span></div>
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {project.deadline && <span className="text-[9px] text-muted-foreground">📅 {project.deadline}</span>}
          <span className="text-[10px] text-muted-foreground">{projectTasks.length} görev</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </motion.div>
  );
}

export default function ProjectHub() {
  const { data: projects, loading: loadingProjects, refetch: refetchProjects } = useMihenkData(mihenkAPI.getProjects, []);
  const { data: tasks, loading: loadingTasks, refetch: refetchTasks } = useMihenkData(mihenkAPI.getTasks, []);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<HayatProject | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [projForm, setProjForm] = useState({ name: '', description: '', channel: '' });
  const [saving, setSaving] = useState(false);

  const handleCreateProject = async () => {
    if (!projForm.name.trim()) { toast.error('Proje adı gerekli'); return; }
    setSaving(true);
    try {
      await mihenkAPI.createTask({
        title: projForm.name,
        status: 'idea',
        priority: 'medium',
        description: projForm.description || undefined,
        tags: projForm.channel || undefined,
      });
      setShowAdd(false);
      setProjForm({ name: '', description: '', channel: '' });
      refetchProjects();
      refetchTasks();
      toast.success('✅ Proje oluşturuldu!');
    } catch (e: unknown) {
      toast.error(`❌ Proje oluşturulamadı: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSaving(false); }
  };

  const allProjects = ensureArray(projects);
  const allTasks = ensureArray(tasks);
  const handleRefresh = useCallback(() => { refetchProjects(); refetchTasks(); }, [refetchProjects, refetchTasks]);

  const channels = useMemo(() => Array.from(new Set(allProjects.map(p => p.channel_id).filter(Boolean))), [allProjects]);
  const stats = useMemo(() => {
    const active = allProjects.filter(p => p.status === 'active' || p.status === 'production').length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'done').length;
    const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { active, totalTasks, completedTasks, rate };
  }, [allProjects, allTasks]);

  const filteredProjects = useMemo(() => {
    let result = allProjects;
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); result = result.filter(p => p.name?.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)); }
    if (channelFilter !== 'all') result = result.filter(p => p.channel_id === channelFilter || p.status === channelFilter);
    return result;
  }, [allProjects, searchQuery, channelFilter]);

  if (loadingProjects || loadingTasks) {
    return (<div className="module-transition space-y-4"><div className="h-8 w-48 shimmer rounded-lg" /><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-20 shimmer rounded-2xl" />)}</div><div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-40 shimmer rounded-2xl" />)}</div></div>);
  }

  return (
    <div className="module-transition space-y-5">
      <AnimatePresence mode="wait">
        {selectedProject ? (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} onRefresh={handleRefresh} />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3"><FolderKanban className="w-6 h-6 text-primary" /><div><h2 className="text-2xl font-bold">Projeler</h2><p className="text-xs text-muted-foreground">MİHENK'ten {allProjects.length} proje</p></div></div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  <Plus className="w-4 h-4" /> Yeni Proje
                </button>
                <div className="flex items-center bg-muted rounded-xl p-1">
                  <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground')}><LayoutGrid className="w-4 h-4" /></button>
                  <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground')}><List className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[{ label: 'Aktif Proje', value: stats.active, icon: Flame, color: 'text-orange-500' },{ label: 'Toplam Görev', value: stats.totalTasks, icon: CheckCircle2, color: 'text-blue-500' },{ label: 'Tamamlanan', value: `${stats.rate}%`, icon: Clock, color: 'text-green-500' }].map(s => (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center"><s.icon className={cn('w-5 h-5 mx-auto mb-1', s.color)} /><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              ))}
            </div>

            {/* Layout */}
            <div className="flex gap-4">
              {/* Sidebar */}
              <div className="w-[180px] flex-shrink-0 hidden lg:block space-y-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Filtre</p>
                {[{ id: 'all', label: 'Tüm Projeler', icon: FolderKanban, count: allProjects.length },{ id: 'idea', label: 'Fikirler', icon: Inbox, count: allProjects.filter(p => p.status === 'idea').length }].map(f => (
                  <button key={f.id} onClick={() => setChannelFilter(f.id)} className={cn('w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left', channelFilter === f.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground')}>
                    <div className="flex items-center gap-2"><f.icon className="w-3.5 h-3.5" />{f.label}</div><span className="opacity-60">{f.count}</span>
                  </button>
                ))}
                {channels.length > 0 && (<><div className="border-t border-border my-2" /><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">Kanallar</p>
                  {channels.map(ch => (<button key={ch} onClick={() => setChannelFilter(channelFilter === ch ? 'all' : (ch ?? 'all'))} className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left', channelFilter === ch ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground')}>{ch}</button>))}</>)}
                {allProjects.length > 0 && (<><div className="border-t border-border my-2" /><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">Projeler</p>
                  {allProjects.slice(0, 8).map(p => { const st = STATUS_MAP[p.status]; return (<button key={p.id} onClick={() => setSelectedProject(p)} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-muted text-muted-foreground transition-colors text-left"><div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', st?.dot || 'bg-gray-400')} /><span className="truncate">{p.name}</span></button>); })}</>)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Proje ara..." className="w-full bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none border border-border" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
                </div>
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-16"><FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" /><p className="text-muted-foreground text-sm">Proje bulunamadı</p></div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filteredProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} tasks={allTasks} onClick={() => setSelectedProject(p)} />)}</div>
                ) : (
                  <div className="bg-card rounded-2xl border border-border divide-y divide-border">
                    {filteredProjects.map(p => { const st = STATUS_MAP[p.status] || STATUS_MAP.idea; const pt = allTasks.filter(t => t.project_id === p.id); const pct = p.progress ?? 0; return (
                      <button key={p.id} onClick={() => setSelectedProject(p)} className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left group">
                        <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', st.dot)} />
                        <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{p.name}</p><div className="flex items-center gap-1.5 mt-1"><span className="text-[9px] text-muted-foreground">{st.emoji} {st.label}</span>{p.channel_id && <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full">{p.channel_id}</span>}</div></div>
                        <span className="text-[10px] text-muted-foreground">{pt.length} görev</span>
                        {pct > 0 && <div className="flex items-center gap-2 flex-shrink-0"><div className="w-16 bg-muted rounded-full h-1.5"><div className="h-1.5 rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} /></div><span className="text-[10px] text-muted-foreground tabular-nums w-8">{pct}%</span></div>}
                        <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary flex-shrink-0" />
                      </button>
                    ); })}
                  </div>
                )}
              </div>
            </div>
            {/* Add Project Modal */}
            <AnimatePresence>
              {showAdd && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-2xl">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-primary" /> Yeni Proje
                      </h3>
                      <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Proje Adı *</label>
                        <input autoFocus value={projForm.name} onChange={e => setProjForm(p => ({ ...p, name: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreateProject()}
                          placeholder="Proje adını girin..." className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Açıklama</label>
                        <textarea value={projForm.description} onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))}
                          placeholder="Proje açıklaması..." rows={3}
                          className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border resize-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Kanal</label>
                        <select value={projForm.channel} onChange={e => setProjForm(p => ({ ...p, channel: e.target.value }))}
                          className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border">
                          <option value="">Seçiniz...</option>
                          <option value="Nikbinler">Nikbinler</option>
                          <option value="Anatolian Lab">Anatolian Lab</option>
                          <option value="Personal">Personal</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={handleCreateProject} disabled={saving}
                          className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> {saving ? 'Oluşturuluyor...' : 'Proje Oluştur'}
                        </button>
                        <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
