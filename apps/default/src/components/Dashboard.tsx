import { useEffect, useState, useMemo } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import type { HayatTask } from '@/lib/mihenk-data';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  AlertTriangle, ArrowRight, Calendar, CheckCircle2,
  Clock, FileText, FolderKanban, Lightbulb,
  Shield, Target, Wallet, Heart,
  Sun, Moon, Bot, CircleAlert, ThumbsUp,
  ListChecks, ChevronRight, Plus,
  StickyNote, Link2, MessageCircle, Rocket, Zap,
  RefreshCw, Database, AlertCircle,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const FOCUS: Record<string, string> = {
  yaratici: 'Yaratıcı mod aktif — hayal kur, üret, dene.',
  operasyonel: 'Bugünün odağı — görevleri temizle.',
  dusunsel: 'Derinleş — analiz et, araştır, bağla.',
  sessiz: 'Sessiz mod — sadece kritik işler.',
  dinlenme: 'Dinlen, nefes al. Sistem kontrollü çalışıyor.',
};
const QUOTES = ["Her adımın, yeni bir eserin başlangıcı.", "Dikkat, en değerli para birimindir.", "Bugün ektiğin tohum, yarının ormanı.", "Odaklan. Üret. Tekrarla.", "Disiplin, motivasyonun bittiği yerde başlar.", "Basitlik, karmaşıklığın ötesindeki zarafettir."];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return { text: 'İyi geceler', emoji: '🌙' };
  if (h < 12) return { text: 'Günaydın', emoji: '🌅' };
  if (h < 18) return { text: 'İyi öğlenler', emoji: '☀️' };
  return { text: 'İyi akşamlar', emoji: '🌆' };
}

type TabId = 'bugun' | 'oncelikler' | 'riskler' | 'onaylar' | 'ajan' | 'gun_sonu';
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'bugun', label: 'Bugün', icon: Sun }, { id: 'oncelikler', label: 'Öncelikler', icon: Target },
  { id: 'riskler', label: 'Riskler', icon: AlertTriangle }, { id: 'onaylar', label: 'Onaylar', icon: Shield },
  { id: 'ajan', label: 'Ajan', icon: Bot }, { id: 'gun_sonu', label: 'Gün Sonu', icon: Moon },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 30000); return () => clearInterval(t); }, []);
  return (<div className="text-right"><p className="text-3xl font-mono font-bold tracking-tight">{time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p><p className="text-xs text-muted-foreground capitalize">{time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>);
}

function Empty({ label }: { label: string }) { return <span className="text-xs text-muted-foreground/70 italic">{label}</span>; }

function StatCard({ icon: Icon, label, value, emptyLabel, color, onClick }: { icon: React.ElementType; label: string; value: number | string | null; emptyLabel?: string; color: string; onClick?: () => void; }) {
  const isEmpty = value === null || value === 0 || value === '—';
  return (
    <button onClick={onClick} className="mihenk-card flex items-center gap-3 p-4 hover:-translate-y-0.5 transition-all duration-200 text-left w-full group">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}><Icon className="w-5 h-5 text-white" /></div>
      <div className="flex-1 min-w-0">{isEmpty ? <Empty label={emptyLabel || 'Veri bekliyor'} /> : <p className="text-xl font-bold leading-tight">{value}</p>}<p className="text-[11px] text-muted-foreground mt-0.5">{label}</p></div>
      <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all" />
    </button>
  );
}

function QuickActions() {
  const { setActiveModule } = useAppStore();
  const actions = [
    { icon: Lightbulb, label: 'Fikir Yakala', color: 'text-[hsl(var(--mihenk-gold))]', mod: 'fikirler' as const },
    { icon: StickyNote, label: 'Hızlı Not', color: 'text-[hsl(var(--mihenk-blue))]', mod: 'hizli_not' as const },
    { icon: CheckCircle2, label: 'Hızlı Görev', color: 'text-[hsl(var(--mihenk-green))]', mod: 'hizli_gorev' as const },
    { icon: Rocket, label: 'Proje Başlat', color: 'text-[hsl(var(--mihenk-red))]', mod: 'projeler' as const },
    { icon: Link2, label: 'Link Kaydet', color: 'text-purple-500', mod: 'yer_imleri' as const },
    { icon: MessageCircle, label: "Ajan'a Sor", color: 'text-cyan-500', mod: 'mihenk_asistani' as const },
  ];
  return (<div className="grid grid-cols-3 sm:grid-cols-6 gap-2">{actions.map(a => (<button key={a.label} onClick={() => setActiveModule(a.mod)} className="mihenk-card flex flex-col items-center gap-2 p-3 hover:-translate-y-0.5 transition-all duration-200 group"><div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-muted transition-colors"><a.icon className={cn('w-4 h-4', a.color)} /></div><span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</span></button>))}</div>);
}

function TaskRow({ task, onToggle }: { task: HayatTask; onToggle?: () => void }) {
  const isDone = task.status === 'done'; const isUrgent = task.priority === 'urgent'; const isHigh = task.priority === 'high';
  return (<div className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", isDone ? "opacity-50" : "hover:bg-muted/50")}><button onClick={onToggle} className={cn("w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors", isDone ? "bg-[hsl(var(--mihenk-green))] border-[hsl(var(--mihenk-green))]" : isUrgent ? "border-[hsl(var(--mihenk-red))]" : isHigh ? "border-[hsl(var(--mihenk-gold))]" : "border-border")}>{isDone && <CheckCircle2 className="w-3 h-3 text-white" />}</button><div className="flex-1 min-w-0"><p className={cn("text-sm", isDone && "line-through")}>{task.title}</p>{task.due_date && <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {task.due_date}</p>}</div><span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", isUrgent ? "badge-red" : isHigh ? "badge-gold" : "bg-muted text-muted-foreground")}>{task.priority}</span></div>);
}

function RiskCard({ title, level, description }: { title: string; level: 'yüksek' | 'orta' | 'düşük'; description: string }) {
  return (<div className={cn("mihenk-card p-4 border-l-4", level === 'yüksek' ? "border-l-[hsl(var(--mihenk-red))]" : level === 'orta' ? "border-l-[hsl(var(--mihenk-gold))]" : "border-l-[hsl(var(--mihenk-blue))]")}><div className="flex items-center gap-2 mb-1"><CircleAlert className={cn("w-4 h-4", level === 'yüksek' ? "text-[hsl(var(--mihenk-red))]" : level === 'orta' ? "text-[hsl(var(--mihenk-gold))]" : "text-[hsl(var(--mihenk-blue))]")} /><h4 className="text-sm font-semibold">{title}</h4><span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto", level === 'yüksek' ? "badge-red" : level === 'orta' ? "badge-gold" : "badge-blue")}>{level}</span></div><p className="text-xs text-muted-foreground">{description}</p></div>);
}

function CmdPanel({ urgentTasks, todoTasks, setActiveModule, ideaCount, noteCount, eventCount }: { urgentTasks: HayatTask[]; todoTasks: HayatTask[]; setActiveModule: (m: any) => void; ideaCount: number; noteCount: number; eventCount: number; }) {
  const rec = useMemo(() => { const u = urgentTasks.slice(0, 2); const r = todoTasks.filter(t => !u.includes(t)).slice(0, 3 - u.length); return [...u, ...r]; }, [urgentTasks, todoTasks]);
  return (<div className="space-y-3">
    <div className="mihenk-card p-4"><h4 className="font-serif font-semibold text-xs mb-3 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-[hsl(var(--mihenk-red))]" />Önerilen İşler</h4>{rec.length === 0 ? <div className="text-center py-4"><ThumbsUp className="w-6 h-6 mx-auto mb-1.5 text-muted-foreground/30" /><p className="text-xs text-muted-foreground">Temiz pist. Yeni iş başlat.</p></div> : <div className="space-y-1.5">{rec.map((t, i) => <div key={t.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-xs"><span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", i === 0 ? "bg-[hsl(var(--mihenk-red)/0.15)] text-[hsl(var(--mihenk-red))]" : i === 1 ? "bg-[hsl(var(--mihenk-gold)/0.15)] text-[hsl(var(--mihenk-gold))]" : "bg-muted text-muted-foreground")}>{i+1}</span><span className="flex-1 truncate">{t.title}</span></div>)}</div>}</div>
    <div className="mihenk-card p-4"><h4 className="font-serif font-semibold text-xs mb-2 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[hsl(var(--mihenk-gold))]" />Bekleyen Kararlar</h4><p className="text-xs text-muted-foreground/70 italic text-center py-3">Henüz karar bekleyen iş yok</p></div>
    <div className="mihenk-card p-4"><h4 className="font-serif font-semibold text-xs mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-purple-500" />Son Sinyaller</h4><div className="space-y-1.5">{[{ label: 'Fikirler', count: ideaCount, icon: Lightbulb, mod: 'fikirler' as const }, { label: 'Notlar', count: noteCount, icon: FileText, mod: 'notlar' as const }, { label: 'Etkinlikler', count: eventCount, icon: Calendar, mod: 'takvim' as const }].map(item => <button key={item.label} onClick={() => setActiveModule(item.mod)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-muted/60 transition-colors group"><item.icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="flex-1 text-left">{item.label}</span>{item.count > 0 ? <span className="text-muted-foreground font-medium">{item.count}</span> : <span className="text-muted-foreground/50 text-[10px] italic">bağlanmadı</span>}<ChevronRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" /></button>)}</div></div>
    <div className="mihenk-card p-4"><h4 className="font-serif font-semibold text-xs mb-2 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-[hsl(var(--mihenk-blue))]" />Ajan Önerileri</h4><div className="space-y-1.5">{urgentTasks.length > 0 && <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-md p-2">🎯 {urgentTasks.length} acil görev dikkat bekliyor.</p>}{ideaCount > 0 && <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-md p-2">💡 {ideaCount} fikir kuluçkada.</p>}{urgentTasks.length === 0 && ideaCount === 0 && <p className="text-xs text-muted-foreground/70 italic text-center py-2">Sistem sakin. Öneri yok.</p>}</div></div>
  </div>);
}

/* ═══ Main Dashboard ═══ */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('bugun');
  const { setActiveModule, energyMode } = useAppStore();
  const { data: tasks, loading: lTasks, error: eTasks, refetch: rTasks } = useMihenkData(mihenkAPI.getTasks);
  const { data: projects, loading: lProj, error: eProj, refetch: rProj } = useMihenkData(mihenkAPI.getProjects);
  const { data: finance, loading: lFin, error: eFin, refetch: rFin } = useMihenkData(mihenkAPI.getFinanceRecords);
  const { data: moods, loading: lMood, error: eMood } = useMihenkData(mihenkAPI.getMoods);
  const { data: events, loading: lEvent, error: eEvent } = useMihenkData(mihenkAPI.getEvents);
  const { data: notes, loading: lNote, error: eNote } = useMihenkData(mihenkAPI.getNotes);
  const { data: ideas, loading: lIdea, error: eIdea } = useMihenkData(mihenkAPI.getIdeas);
  const [lastRefresh] = useState(() => new Date());
  const anyLoading = lTasks || lProj || lFin || lMood || lEvent || lNote || lIdea;
  const sourceErrors = useMemo(() => [eTasks && 'Görevler', eProj && 'Projeler', eFin && 'Finans', eMood && 'Wellness', eEvent && 'Takvim', eNote && 'Notlar', eIdea && 'Fikirler'].filter(Boolean) as string[], [eTasks, eProj, eFin, eMood, eEvent, eNote, eIdea]);
  const taskArr = useMemo(() => ensureArray(tasks), [tasks]);
  const projArr = useMemo(() => ensureArray(projects), [projects]);
  const finArr = useMemo(() => ensureArray(finance), [finance]);
  const moodArr = useMemo(() => ensureArray(moods), [moods]);
  const eventArr = useMemo(() => ensureArray(events), [events]);
  const noteArr = useMemo(() => ensureArray(notes), [notes]);
  const ideaArr = useMemo(() => ensureArray(ideas), [ideas]);
  const greeting = getGreeting();
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const todoTasks = useMemo(() => taskArr.filter(t => t.status !== 'done'), [taskArr]);
  const doneTasks = useMemo(() => taskArr.filter(t => t.status === 'done'), [taskArr]);
  const urgentTasks = useMemo(() => todoTasks.filter(t => t.priority === 'urgent' || t.priority === 'high'), [todoTasks]);
  const blockedTasks = useMemo(() => todoTasks.filter(t => t.status === 'blocked'), [todoTasks]);
  const totalIncome = useMemo(() => finArr.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0), [finArr]);
  const totalExpense = useMemo(() => finArr.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0), [finArr]);
  const activeProjCount = useMemo(() => projArr.filter(p => p.status === 'active' || p.status === 'in_progress').length, [projArr]);
  const lastMood = useMemo(() => moodArr.length > 0 ? moodArr[moodArr.length - 1] : null, [moodArr]);
  const completionRate = taskArr.length > 0 ? Math.round((doneTasks.length / taskArr.length) * 100) : 0;
  const isOp = energyMode === 'operasyonel';
  const risks = useMemo(() => {
    const r: { title: string; level: 'yüksek' | 'orta' | 'düşük'; description: string }[] = [];
    if (blockedTasks.length > 0) r.push({ title: `${blockedTasks.length} görev bloklanmış`, level: 'yüksek', description: 'Bloklanmış görevler ilerlemeyi engelliyor.' });
    const net = totalIncome - totalExpense; const isNeg = net < 0;
    if (isNeg) r.push({ title: 'Giderler geliri aşıyor', level: 'yüksek', description: `Net: ${net.toLocaleString('tr-TR')} ₺` });
    const uc = urgentTasks.length; const manyUrgent = uc > 3;
    if (manyUrgent) r.push({ title: `${uc} acil görev birikmiş`, level: 'orta', description: 'Dikkat gerektiriyor.' });
    if (lastMood && lastMood.mood_score < 4) r.push({ title: 'Düşük ruh hali', level: 'orta', description: `Son mood: ${lastMood.mood_score}/10` });
    if (r.length === 0) r.push({ title: 'Risk yok', level: 'düşük', description: 'Sistem sağlıklı çalışıyor.' });
    return r;
  }, [blockedTasks, totalIncome, totalExpense, urgentTasks, lastMood]);

  return (
    <div className="module-transition space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Gün Masası</p>
          <h1 className="mihenk-module-title flex items-center gap-2"><span>{greeting.emoji}</span><span>{greeting.text}</span></h1>
          {isOp ? <p className="text-sm text-muted-foreground mt-1 font-medium">{FOCUS[energyMode]}</p> : <p className="text-sm text-muted-foreground mt-1 italic font-serif">"{quote}"</p>}
        </div>
        <LiveClock />
      </div>

      {/* Source freshness bar */}
      <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
        <Database className="w-3 h-3" />
        <span className="font-medium">Kaynaklar:</span>
        {[{ l: 'Görevler', c: taskArr.length, e: eTasks }, { l: 'Projeler', c: projArr.length, e: eProj }, { l: 'Finans', c: finArr.length, e: eFin }, { l: 'Wellness', c: moodArr.length, e: eMood }, { l: 'Takvim', c: eventArr.length, e: eEvent }, { l: 'Notlar', c: noteArr.length, e: eNote }, { l: 'Fikirler', c: ideaArr.length, e: eIdea }].map(s => (
          <span key={s.l} className={cn('px-1.5 py-0.5 rounded', s.e ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-muted')}>
            {s.l}: {s.e ? '⚠️' : s.c}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1">
          <RefreshCw className={cn("w-3 h-3", anyLoading && "animate-spin")} />
          {lastRefresh.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Error banner (partial failure) */}
      {sourceErrors.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{sourceErrors.join(', ')} kaynağı yüklenemedi — kısmi veri gösteriliyor.</span>
        </div>
      )}

      {/* Loading state */}
      {anyLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Veriler yükleniyor…</span>
        </div>
      )}

      <QuickActions />

      <div className="flex flex-wrap gap-1.5">
        {TABS.map(tab => { const isActive = activeTab === tab.id; const TI = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80")}><TI className="w-3.5 h-3.5" />{tab.label}</button>
        ); })}
      </div>

      <AnimatePresence mode="wait">
      {activeTab === 'bugun' && (
        <motion.div key="b" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={ListChecks} label="Açık Görevler" value={todoTasks.length || null} emptyLabel="Henüz görev yok" color="bg-[hsl(var(--mihenk-red))]" onClick={() => setActiveModule('gorevler')} />
            <StatCard icon={FolderKanban} label="Aktif Projeler" value={activeProjCount || null} emptyLabel="Proje bağlanmadı" color="bg-[hsl(var(--mihenk-blue))]" onClick={() => setActiveModule('projeler')} />
            <StatCard icon={Shield} label="Bekleyen Kararlar" value={null} emptyLabel="Karar bekleyen yok" color="bg-[hsl(var(--mihenk-gold))]" onClick={() => setActiveTab('onaylar')} />
            <StatCard icon={Calendar} label="Bugünkü Etkinlik" value={eventArr.length || null} emptyLabel="Etkinlik yok" color="bg-[hsl(var(--mihenk-green))]" onClick={() => setActiveModule('takvim')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setActiveModule('finans')} className="mihenk-card flex items-center gap-3 p-3 hover:shadow-md transition-all text-left"><Wallet className="w-4 h-4 text-[hsl(var(--mihenk-green))]" /><div>{finArr.length > 0 ? <p className="text-sm font-semibold">{((totalIncome - totalExpense) / 1000).toFixed(1)}k ₺</p> : <Empty label="Bağlanmadı" />}<p className="text-[10px] text-muted-foreground">Net Bakiye</p></div></button>
            <button onClick={() => setActiveModule('wellness')} className="mihenk-card flex items-center gap-3 p-3 hover:shadow-md transition-all text-left"><Heart className="w-4 h-4 text-[hsl(var(--mihenk-gold))]" /><div>{lastMood ? <p className="text-sm font-semibold">{lastMood.mood_score}/10</p> : <Empty label="Kayıt yok" />}<p className="text-[10px] text-muted-foreground">Ruh Hali</p></div></button>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 mihenk-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif font-semibold text-sm">Bugünün Görevleri</h3>
                <div className="flex items-center gap-3">
                  {taskArr.length > 0 && <div className="flex items-center gap-1.5"><div className="relative w-8 h-8"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{value:completionRate},{value:100-completionRate}]} cx="50%" cy="50%" innerRadius={10} outerRadius={15} dataKey="value" startAngle={90} endAngle={-270}><Cell fill="hsl(var(--mihenk-green))" /><Cell fill="hsl(var(--border))" /></Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex items-center justify-center"><span className="text-[8px] font-bold">{completionRate}%</span></div></div><span className="text-[10px] text-muted-foreground">{doneTasks.length}/{taskArr.length}</span></div>}
                  <span className="text-[10px] text-muted-foreground">{todoTasks.length} açık</span>
                </div>
              </div>
              <div className="space-y-1 max-h-[360px] overflow-y-auto">
                {todoTasks.length === 0 ? (
                  <div className="text-center py-10">{taskArr.length > 0 ? <><CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--mihenk-green))]/40" /><p className="text-sm text-muted-foreground">Tüm görevler tamamlandı 🎉</p></> : <><ListChecks className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">Henüz görev eklenmedi</p><button onClick={() => setActiveModule('hizli_gorev')} className="mt-2 text-xs text-primary hover:underline flex items-center gap-1 mx-auto"><Plus className="w-3 h-3" /> İlk görevini oluştur</button></>}</div>
                ) : todoTasks.slice(0, 8).map(task => <TaskRow key={task.id} task={task} onToggle={async () => { await mihenkAPI.updateTask({ id: task.id, status: 'done' }); }} />)}
              </div>
            </div>
            <CmdPanel urgentTasks={urgentTasks} todoTasks={todoTasks} setActiveModule={setActiveModule} ideaCount={ideaArr.length} noteCount={noteArr.length} eventCount={eventArr.length} />
          </div>
        </motion.div>
      )}
      {activeTab === 'oncelikler' && (
        <motion.div key="o" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
          <div className="mihenk-card p-4"><h3 className="font-serif font-semibold mb-3">Acil ve Yüksek Öncelikli Görevler</h3>{urgentTasks.length === 0 ? <div className="text-center py-8 text-muted-foreground"><ThumbsUp className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Acil görev yok. Rahat nefes al.</p></div> : <div className="space-y-1">{urgentTasks.map(t => <TaskRow key={t.id} task={t} />)}</div>}</div>
          <div className="mihenk-card p-4"><h3 className="font-serif font-semibold mb-3">Aktif Projeler</h3>{activeProjCount === 0 ? <div className="text-center py-6 text-muted-foreground"><FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">Aktif proje yok</p></div> : <div className="space-y-2">{projArr.filter(p => p.status === 'active' || p.status === 'in_progress').slice(0, 5).map(p => <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"><FolderKanban className="w-4 h-4 text-[hsl(var(--mihenk-blue))]" /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.name}</p><p className="text-[10px] text-muted-foreground">{p.status}</p></div><div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-[hsl(var(--mihenk-blue))]" style={{ width: `${p.progress || 0}%` }} /></div></div>)}</div>}</div>
        </motion.div>
      )}
      {activeTab === 'riskler' && (
        <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
          <div className="mihenk-card p-4 mb-2"><h3 className="font-serif font-semibold mb-1">Risk Taraması</h3><p className="text-xs text-muted-foreground">Otomatik analiz</p></div>
          {risks.map((r, i) => <RiskCard key={i} {...r} />)}
        </motion.div>
      )}
      {activeTab === 'onaylar' && (
        <motion.div key="oa" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><div className="mihenk-card p-8 text-center"><Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" /><h3 className="font-serif font-semibold mb-1">Bekleyen Onay Yok</h3><p className="text-sm text-muted-foreground max-w-sm mx-auto">Ajanlar bir karar noktasına geldiğinde burada görünür.</p></div></motion.div>
      )}
      {activeTab === 'ajan' && (
        <motion.div key="aj" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="mihenk-card p-4"><h3 className="font-serif font-semibold mb-3 flex items-center gap-2"><Bot className="w-4 h-4 text-[hsl(var(--mihenk-blue))]" />Ajan Önerileri</h3><div className="space-y-3">{[urgentTasks.length > 0 ? { icon: '🎯', title: 'Öncelik güncellenmeli', detail: `${urgentTasks.length} acil görev var.` } : null, doneTasks.length > 0 ? { icon: '📊', title: 'Verimlilik raporu', detail: `${doneTasks.length} görev tamamlandı. Oran: ${completionRate}%` } : null, ideaArr.length > 0 ? { icon: '💡', title: 'Fikirler birikmiş', detail: `${ideaArr.length} fikir kuluçkada.` } : null, { icon: '🎵', title: 'Maestro önerisi', detail: 'Yeni prompt denenebilir.' }].filter(Boolean).map((s, i) => <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"><span className="text-lg">{s!.icon}</span><div><p className="text-sm font-medium">{s!.title}</p><p className="text-xs text-muted-foreground mt-0.5">{s!.detail}</p></div></div>)}</div></div>
        </motion.div>
      )}
      {activeTab === 'gun_sonu' && (
        <motion.div key="gs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="mihenk-card p-6"><h3 className="font-serif font-semibold text-lg mb-4 flex items-center gap-2"><Moon className="w-5 h-5" />Gün Sonu Özeti</h3><div className="grid sm:grid-cols-3 gap-4 mb-6"><div className="text-center p-4 rounded-xl bg-[hsl(var(--mihenk-green)/0.06)]">{doneTasks.length > 0 ? <p className="text-2xl font-bold text-[hsl(var(--mihenk-green))]">{doneTasks.length}</p> : <Empty label="—" />}<p className="text-xs text-muted-foreground mt-1">Tamamlanan</p></div><div className="text-center p-4 rounded-xl bg-[hsl(var(--mihenk-gold)/0.06)]">{todoTasks.length > 0 ? <p className="text-2xl font-bold text-[hsl(var(--mihenk-gold))]">{todoTasks.length}</p> : <Empty label="—" />}<p className="text-xs text-muted-foreground mt-1">Yarına kalan</p></div><div className="text-center p-4 rounded-xl bg-[hsl(var(--mihenk-blue)/0.06)]"><p className="text-2xl font-bold text-[hsl(var(--mihenk-blue))]">{completionRate}%</p><p className="text-xs text-muted-foreground mt-1">Verimlilik</p></div></div><div className="border-t border-border pt-4"><h4 className="font-serif text-sm font-semibold mb-2">Yarın İçin Not</h4><p className="text-sm text-muted-foreground">{urgentTasks.length > 0 ? `${urgentTasks.length} acil görev yarına taşındı.` : taskArr.length > 0 ? 'Günün temiz geçti.' : 'Henüz veri yok. Yarın ilk görevini oluştur.'}</p></div></div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
