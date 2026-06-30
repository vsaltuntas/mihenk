import { useState, useMemo } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import { cn } from '@/lib/utils';
import {
  Disc3, Music, FileText, Sparkles, Search, Play, BarChart3, Wand2,
  AlertTriangle, Database, Key, ServerCrash, CheckCircle2, XCircle, Clock, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types ─── */
type HealthStatus = 'ok' | 'pending' | 'error';
interface SourceCheck { label: string; status: HealthStatus; detail: string; icon: typeof Key; }
type MaestroTab = 'dashboard' | 'projects' | 'prompts' | 'analyses' | 'generations';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  idea: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  production: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

/* ─── Pending Badge ─── */
type PendingStatus = 'PROVIDER_PENDING' | 'WORKER_PENDING' | 'STORAGE_PENDING' | 'READY';
function PendingBadge({ status }: { status: PendingStatus }) {
  const isReady = status === 'READY';
  const Icon = isReady ? CheckCircle2 : Clock;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
      isReady ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    )}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

/* ─── Source Health Panel ─── */
function SourceHealthPanel({ checks }: { checks: SourceCheck[] }) {
  return (
    <div className="bg-card/50 rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <ServerCrash className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Kaynak Sağlık Durumu</h3>
      </div>
      <div className="space-y-2">
        {checks.map((c) => {
          const color = c.status === 'ok' ? 'text-green-500' : c.status === 'pending' ? 'text-amber-500' : 'text-red-500';
          const SIcon = c.status === 'ok' ? CheckCircle2 : c.status === 'pending' ? Clock : XCircle;
          return (
            <div key={c.label} className="flex items-start gap-3 bg-background/60 rounded-xl p-3 border border-border/50">
              <SIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <c.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{c.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{c.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Maestro Empty State ─── */
function MaestroEmptyState() {
  const checks: SourceCheck[] = [
    { label: 'AI Müzik Üretim Provider (Suno / Udio)', status: 'pending', detail: 'Suno API key veya Udio token yok. Space Settings → Secrets → "SUNO_API_KEY" ekleyin.', icon: Key },
    { label: 'Analiz LLM Provider (OpenAI / Anthropic)', status: 'pending', detail: 'Melodi/harmoni analizi için LLM key gerekli. "OPENAI_API_KEY" veya proxy config bekleniyor.', icon: Key },
    { label: 'Generation Worker / Queue', status: 'pending', detail: 'Uzun süren müzik üretim job\'ları için worker/queue sistemi kurulmadı. Automation flow gerekli.', icon: Cpu },
    { label: 'Taskade Projects (Maestro DB)', status: 'pending', detail: 'Projeler, prompt\'lar, analizler, üretimler için Taskade project\'ler oluşturulmadı.', icon: Database },
    { label: 'API Getter Bağlantısı', status: 'pending', detail: 'getMaestroProjects/Prompts/Analyses/Generations/Dashboard tümü stub — boş array/object döndürüyor.', icon: ServerCrash },
  ];
  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-center py-10 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-2xl border border-dashed border-purple-500/20">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
          <Disc3 className="w-8 h-8 text-purple-500/40" />
        </div>
        <h3 className="text-base font-semibold mb-1">Maestro Henüz Aktif Değil</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          AI müzik üretim provider, analiz LLM, worker queue ve veri depolama katmanları kurulumu bekleniyor.
          Sahte proje/üretim gösterilmiyor — tüm modül gerçek bağlantı sonrası aktif olacak.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          <PendingBadge status="PROVIDER_PENDING" />
          <PendingBadge status="WORKER_PENDING" />
          <PendingBadge status="STORAGE_PENDING" />
        </div>
      </motion.div>
      <SourceHealthPanel checks={checks} />
      <div className="bg-card/50 rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Aktivasyon İçin Gerekenler
        </h3>
        <ol className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">1</span>
            <span><strong className="text-foreground">Suno / Udio API Key</strong> — Müzik üretim provider credentialı → <code className="text-[10px] bg-muted px-1 rounded">SUNO_API_KEY</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">2</span>
            <span><strong className="text-foreground">LLM Analiz Key</strong> — Melodi/harmoni analizi için OpenAI veya proxy setup</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">3</span>
            <span><strong className="text-foreground">Taskade Projects</strong> — 4 ayrı project: Projeler, Promptlar, Analizler, Üretimler (custom fields ile)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">4</span>
            <span><strong className="text-foreground">Automation Flows</strong> — Generation queue worker + provider webhook + veri senkronizasyonu</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function MaestroModule() {
  const { data: projects, loading: lp } = useMihenkData(mihenkAPI.getMaestroProjects, []);
  const { data: prompts, loading: lpr } = useMihenkData(mihenkAPI.getMaestroPrompts, []);
  const { data: analyses, loading: la } = useMihenkData(mihenkAPI.getMaestroAnalyses, []);
  const { data: generations, loading: lg } = useMihenkData(mihenkAPI.getMaestroGenerations, []);
  const { data: dashboard } = useMihenkData(mihenkAPI.getMaestroDashboard, []);

  const [activeTab, setActiveTab] = useState<MaestroTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const loading = lp || lpr || la || lg;
  const allProjects = ensureArray(projects);
  const allPrompts = ensureArray(prompts);
  const allAnalyses = ensureArray(analyses);
  const allGenerations = ensureArray(generations);
  const dash = dashboard as Record<string, unknown> | null;

  const hasData = allProjects.length > 0 || allPrompts.length > 0 || allAnalyses.length > 0 || allGenerations.length > 0;
  const providerStatus: PendingStatus = hasData ? 'READY' : 'PROVIDER_PENDING';

  const stats = useMemo(() => ({
    projects: dash?.total_projects ?? allProjects.length,
    prompts: dash?.total_prompts ?? allPrompts.length,
    analyses: dash?.total_analyses ?? allAnalyses.length,
    generations: dash?.total_generations ?? allGenerations.length,
  }), [dash, allProjects, allPrompts, allAnalyses, allGenerations]);

  if (loading) {
    return (
      <div className="module-transition space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
        <div className="h-[300px] shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="module-transition space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Disc3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Maestro</h2>
            <PendingBadge status={providerStatus} />
          </div>
          <p className="text-xs text-muted-foreground">
            {hasData ? 'Müzik prodüksiyon sistemi' : 'Kurulum bekleniyor'}
          </p>
        </div>
      </div>

      {/* Empty state or data */}
      {!hasData && <MaestroEmptyState />}

      {hasData && (
        <>
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {([
            { id: 'dashboard' as MaestroTab, label: 'Genel', icon: BarChart3 },
            { id: 'projects' as MaestroTab, label: 'Projeler', icon: Music },
            { id: 'prompts' as MaestroTab, label: 'Promptlar', icon: FileText },
            { id: 'analyses' as MaestroTab, label: 'Analizler', icon: Sparkles },
            { id: 'generations' as MaestroTab, label: 'Üretimler', icon: Wand2 },
          ]).map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center',
                activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}>
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

      <AnimatePresence mode="wait">
        {/* ═══ DASHBOARD ═══ */}
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Projeler', value: stats.projects, icon: Music, color: 'text-pink-500', bg: 'from-pink-500/15 to-purple-500/5' },
                { label: 'Prompt\'lar', value: stats.prompts, icon: FileText, color: 'text-blue-500', bg: 'from-blue-500/15 to-cyan-500/5' },
                { label: 'Analizler', value: stats.analyses, icon: Sparkles, color: 'text-amber-500', bg: 'from-amber-500/15 to-orange-500/5' },
                { label: 'Üretimler', value: stats.generations, icon: Wand2, color: 'text-green-500', bg: 'from-green-500/15 to-emerald-500/5' },
              ].map(s => (
                <div key={s.label} className={cn('bg-gradient-to-br rounded-2xl border border-border p-5', s.bg)}>
                  <s.icon className={cn('w-6 h-6 mb-2', s.color)} />
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent projects */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Music className="w-4 h-4 text-pink-500" /> Son Projeler
              </h3>
              <div className="space-y-2">
                {allProjects.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setActiveTab('projects')}>
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {p.name?.[0]?.toUpperCase() || '♬'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{p.description || p.genre || 'Proje'}</p>
                    </div>
                    {p.status && (
                      <span className={cn('text-[9px] font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[p.status] || STATUS_COLORS.draft)}>
                        {p.status}
                      </span>
                    )}
                  </div>
                ))}
                {allProjects.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Maestro projesi bulunamadı</p>
                )}
              </div>
            </div>

            {/* Recent generations */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-green-500" /> Son Üretimler
              </h3>
              <div className="space-y-2">
                {allGenerations.slice(0, 5).map(g => (
                  <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{g.title || g.url || `Üretim #${g.id.slice(0, 6)}`}</p>
                      <p className="text-[10px] text-muted-foreground">{g.platform || 'Suno'} · {g.created_at?.slice(0, 10)}</p>
                    </div>
                    {g.status && (
                      <span className={cn('text-[9px] font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[g.status] || STATUS_COLORS.draft)}>
                        {g.status}
                      </span>
                    )}
                  </div>
                ))}
                {allGenerations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Henüz üretim yok</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ PROJECTS ═══ */}
        {activeTab === 'projects' && (
          <motion.div key="projects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Proje ara..." className="w-full bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none border border-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((p, i) => (
                <div key={p.id}
                  className={cn(
                    'bg-gradient-to-br rounded-2xl border border-border p-5 hover:shadow-lg transition-all duration-200',
                    i % 4 === 0 ? 'from-pink-500/20 to-purple-500/10' :
                    i % 4 === 1 ? 'from-blue-500/20 to-cyan-500/10' :
                    i % 4 === 2 ? 'from-amber-500/20 to-orange-500/10' :
                    'from-green-500/20 to-emerald-500/10'
                  )}>
                  <div className="flex items-center gap-1.5 mb-3">
                    {p.status && (
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[p.status] || STATUS_COLORS.draft)}>
                        {p.status}
                      </span>
                    )}
                    {p.genre && <span className="text-[10px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">{p.genre}</span>}
                  </div>
                  <h3 className="font-bold text-base mb-1">{p.name}</h3>
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {p.bpm && <span>🎵 {p.bpm} BPM</span>}
                    {p.key && <span>🎹 {p.key}</span>}
                    <span className="ml-auto">{p.created_at?.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <Music className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">Proje bulunamadı</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ PROMPTS ═══ */}
        {activeTab === 'prompts' && (
          <motion.div key="prompts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Prompt ara..." className="w-full bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none border border-border" />
            </div>
            <div className="bg-card rounded-2xl border border-border divide-y divide-border">
              {filteredPrompts.length === 0 ? (
                <p className="p-8 text-center text-muted-foreground text-sm">Prompt bulunamadı</p>
              ) : (
                filteredPrompts.map(p => (
                  <div key={p.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{p.prompt_text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {p.prompt_type && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{p.prompt_type}</span>}
                        <span className="text-[10px] text-muted-foreground">{p.created_at?.slice(0, 10)}</span>
                      </div>
                    </div>
                    {p.status && (
                      <span className={cn('text-[9px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', STATUS_COLORS[p.status] || STATUS_COLORS.draft)}>
                        {p.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ ANALYSES ═══ */}
        {activeTab === 'analyses' && (
          <motion.div key="analyses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="bg-card rounded-2xl border border-border divide-y divide-border">
              {allAnalyses.length === 0 ? (
                <p className="p-8 text-center text-muted-foreground text-sm">Analiz bulunamadı</p>
              ) : (
                allAnalyses.map(a => (
                  <div key={a.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{a.analysis_type || 'Analiz'}</p>
                      {a.input_text && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{a.input_text}</p>}
                      {a.result && <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-1 italic">{a.result.slice(0, 200)}</p>}
                      <span className="text-[10px] text-muted-foreground mt-1 block">{a.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ GENERATIONS ═══ */}
        {activeTab === 'generations' && (
          <motion.div key="generations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allGenerations.length === 0 ? (
                <div className="col-span-2 text-center py-16">
                  <Wand2 className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-muted-foreground text-sm">Henüz üretim yok</p>
                </div>
              ) : (
                allGenerations.map(g => (
                  <div key={g.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                        <Play className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{g.title || `Üretim #${g.id.slice(0, 8)}`}</p>
                        <p className="text-[10px] text-muted-foreground">{g.platform || 'Suno'}</p>
                      </div>
                    </div>
                    {g.url && (
                      <a href={g.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline truncate block mb-2">{g.url}</a>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{g.created_at?.slice(0, 10)}</span>
                      {g.status && (
                        <span className={cn('font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[g.status] || STATUS_COLORS.draft)}>
                          {g.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
