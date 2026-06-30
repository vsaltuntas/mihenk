import { useState, useMemo } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import {
  BarChart3, TrendingUp, CheckCircle2, Zap, Flame,
  Wallet, Heart, FileText, Music, Calendar, Users,
  FolderKanban, Activity, Lightbulb, Youtube, Disc3,
  RefreshCw, Database, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area, CartesianGrid, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Constants ─── */

const PERIODS = [
  { id: '7', label: '7 Gün' },
  { id: '30', label: '30 Gün' },
  { id: '90', label: '90 Gün' },
  { id: '365', label: '1 Yıl' },
];

type FilterId = 'all' | 'finance' | 'wellness' | 'projects' | 'catalog' | 'crm';

const FILTERS: { id: FilterId; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'all', label: 'Genel', icon: BarChart3, color: 'text-primary' },
  { id: 'finance', label: 'Finans', icon: Wallet, color: 'text-green-500' },
  { id: 'wellness', label: 'Wellness', icon: Heart, color: 'text-rose-500' },
  { id: 'projects', label: 'Projeler', icon: FolderKanban, color: 'text-blue-500' },
  { id: 'catalog', label: 'Müzik', icon: Music, color: 'text-purple-500' },
  { id: 'crm', label: 'Kişiler', icon: Users, color: 'text-amber-500' },
];

/* ─── Main Component ─── */

export default function AnalyticsHub() {
  // Fetch all MİHENK data
  const { data: rawRecords, loading: lRec, error: eRec } = useMihenkData(mihenkAPI.getFinanceRecords, []);
  const { data: rawAccounts } = useMihenkData(mihenkAPI.getFinanceAccounts, []);
  const { data: rawMoods, loading: lMood, error: eMood } = useMihenkData(mihenkAPI.getMoods, []);
  const { data: rawTasks, loading: lTask, error: eTask } = useMihenkData(mihenkAPI.getTasks, []);
  const { data: rawProjects, loading: lProj, error: eProj } = useMihenkData(mihenkAPI.getProjects, []);
  const { data: rawArtists, loading: lArt, error: eArt } = useMihenkData(mihenkAPI.getArtists, []);
  const { data: rawTracks } = useMihenkData(mihenkAPI.getTracks, []);
  const { data: rawContacts, loading: lCon, error: eCon } = useMihenkData(mihenkAPI.getContacts, []);
  const { data: rawEvents, loading: lEv, error: eEv } = useMihenkData(mihenkAPI.getEvents, []);
  const { data: rawNotes, loading: lNote, error: eNote } = useMihenkData(mihenkAPI.getNotes, []);
  const { data: rawIdeas, loading: lIdea, error: eIdea } = useMihenkData(mihenkAPI.getIdeas, []);
  const { data: rawChannels } = useMihenkData(mihenkAPI.getYouTubeChannels, []);
  const { data: rawVideos } = useMihenkData(mihenkAPI.getYouTubeVideos, []);
  const { data: gamification, loading: lGam } = useMihenkData(mihenkAPI.getGamification, []);
  const anyLoading = lRec || lMood || lTask || lProj || lArt || lCon || lEv || lNote || lIdea || lGam;
  const sourceErrors = useMemo(() => [eRec && 'Finans', eMood && 'Wellness', eTask && 'Görevler', eProj && 'Projeler', eArt && 'Katalog', eCon && 'Kişiler', eEv && 'Takvim', eNote && 'Notlar', eIdea && 'Fikirler'].filter(Boolean) as string[], [eRec, eMood, eTask, eProj, eArt, eCon, eEv, eNote, eIdea]);
  const [lastRefresh] = useState(() => new Date());

  const records = ensureArray(rawRecords);
  const accounts = ensureArray(rawAccounts);
  const moods = ensureArray(rawMoods);
  const tasks = ensureArray(rawTasks);
  const projects = ensureArray(rawProjects);
  const artists = ensureArray(rawArtists);
  const tracks = ensureArray(rawTracks);
  const contacts = ensureArray(rawContacts);
  const events = ensureArray(rawEvents);
  const notes = ensureArray(rawNotes);
  const ideas = ensureArray(rawIdeas);
  const channels = ensureArray(rawChannels);
  const videos = ensureArray(rawVideos);

  const [period, setPeriod] = useState('30');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  // Module counts
  const moduleCounts = useMemo(() => ({
    finance: records.length,
    accounts: accounts.length,
    wellness: moods.length,
    projects: projects.length,
    tasks: tasks.length,
    catalog: artists.length,
    tracks: tracks.length,
    calendar: events.length,
    crm: contacts.length,
    notes: notes.length,
    ideas: ideas.length,
    youtube: channels.length + videos.length,
  }), [records, accounts, moods, projects, tasks, artists, tracks, contacts, events, notes, ideas, channels, videos]);

  const totalEntries = records.length + moods.length + tasks.length + artists.length + contacts.length + events.length + notes.length + ideas.length;

  // Finance stats
  const financeStats = useMemo(() => {
    const gelir = records.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
    const gider = records.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0);
    return { gelir, gider, net: gelir - gider };
  }, [records]);

  // Wellness averages
  const wellnessStats = useMemo(() => {
    if (moods.length === 0) return { avgMood: 0, avgEnergy: 0, avgSleep: 0, count: 0 };
    const sum = moods.reduce((acc, m) => ({
      mood: acc.mood + (Number(m.mood_score) || 0),
      energy: acc.energy + (Number(m.energy_level) || 0),
      sleep: acc.sleep + (Number(m.sleep_hours) || 0),
    }), { mood: 0, energy: 0, sleep: 0 });
    const c = moods.length;
    return {
      avgMood: +(sum.mood / c).toFixed(1),
      avgEnergy: +(sum.energy / c).toFixed(1),
      avgSleep: +(sum.sleep / c).toFixed(1),
      count: c,
    };
  }, [moods]);

  // Task stats
  const taskStats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'done').length;
    return {
      total: tasks.length,
      completed,
      rate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    };
  }, [tasks]);

  // Module status bar chart data
  const moduleStatusData = useMemo(() => [
    { name: 'Finans', count: records.length, color: '#10B981' },
    { name: 'Wellness', count: moods.length, color: '#EC4899' },
    { name: 'Görevler', count: tasks.length, color: '#3B82F6' },
    { name: 'Projeler', count: projects.length, color: '#6366F1' },
    { name: 'Katalog', count: artists.length + tracks.length, color: '#8B5CF6' },
    { name: 'Takvim', count: events.length, color: '#F59E0B' },
    { name: 'Kişiler', count: contacts.length, color: '#06B6D4' },
    { name: 'Notlar', count: notes.length, color: '#6366F1' },
    { name: 'Fikirler', count: ideas.length, color: '#F97316' },
    { name: 'YouTube', count: channels.length + videos.length, color: '#EF4444' },
  ], [records, moods, tasks, projects, artists, tracks, events, contacts, notes, ideas, channels, videos]);

  // Radar data
  const radarData = useMemo(() => [
    { subject: 'Finans', A: Math.min(records.length * 5, 100) },
    { subject: 'Sağlık', A: Math.min(wellnessStats.avgMood * 10, 100) },
    { subject: 'Projeler', A: Math.min(taskStats.rate, 100) },
    { subject: 'Müzik', A: Math.min((artists.length + tracks.length) * 5, 100) },
    { subject: 'Sosyal', A: Math.min(contacts.length * 8, 100) },
    { subject: 'Planlama', A: Math.min(events.length * 8, 100) },
  ], [records, wellnessStats, taskStats, artists, tracks, contacts, events]);

  // REAL activity trend: bucket all records by day-of-week from created_at
  const activityTrend = useMemo(() => {
    const allItems = [
      ...records.map(r => r.created_at),
      ...moods.map(m => m.created_at),
      ...tasks.map(t => t.created_at),
      ...events.map(e => e.created_at),
      ...notes.map(n => n.created_at),
      ...ideas.map(i => i.created_at),
      ...contacts.map(c => c.created_at),
    ].filter(Boolean);
    const buckets: Record<number, number> = {};
    for (const ts of allItems) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) { const day = d.getDay(); buckets[day] = (buckets[day] || 0) + 1; }
    }
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return dayNames.map((name, i) => ({ name, aktivite: buckets[i] || 0 }));
  }, [records, moods, tasks, events, notes, ideas, contacts]);

  // Gamification
  const gData = gamification as Record<string, unknown> | null;
  const xp = Number(gData?.xp ?? gData?.total_xp ?? 0);
  const level = Number(gData?.level ?? 1);
  const streak = Number(gData?.streak ?? gData?.current_streak ?? 0);

  // KPIs based on filter
  const kpis = useMemo(() => {
    const isPositive = financeStats.net >= 0;
    if (activeFilter === 'finance') {
      return [
        { label: 'Net Akış', value: `₺${financeStats.net.toLocaleString('tr-TR')}`, icon: TrendingUp, color: isPositive ? 'text-green-500' : 'text-red-500' },
        { label: 'Toplam Gelir', value: `₺${financeStats.gelir.toLocaleString('tr-TR')}`, icon: TrendingUp, color: 'text-green-500' },
        { label: 'Toplam Gider', value: `₺${financeStats.gider.toLocaleString('tr-TR')}`, icon: Wallet, color: 'text-red-500' },
        { label: 'İşlem Sayısı', value: String(records.length), icon: Activity, color: 'text-blue-500' },
      ];
    }
    if (activeFilter === 'wellness') {
      return [
        { label: 'Mood Ort.', value: `${wellnessStats.avgMood}/10`, icon: Heart, color: 'text-rose-500' },
        { label: 'Enerji Ort.', value: `${wellnessStats.avgEnergy}/10`, icon: Zap, color: 'text-yellow-500' },
        { label: 'Uyku Ort.', value: `${wellnessStats.avgSleep}s`, icon: Heart, color: 'text-indigo-500' },
        { label: 'Check-in', value: String(wellnessStats.count), icon: CheckCircle2, color: 'text-green-500' },
      ];
    }
    if (activeFilter === 'projects') {
      return [
        { label: 'Toplam Görev', value: String(taskStats.total), icon: FolderKanban, color: 'text-blue-500' },
        { label: 'Tamamlanan', value: String(taskStats.completed), icon: CheckCircle2, color: 'text-green-500' },
        { label: 'Tamamlanma %', value: `%${taskStats.rate}`, icon: TrendingUp, color: 'text-primary' },
        { label: 'Proje Sayısı', value: String(projects.length), icon: Flame, color: 'text-amber-500' },
      ];
    }
    if (activeFilter === 'catalog') {
      return [
        { label: 'Sanatçı', value: String(artists.length), icon: Music, color: 'text-purple-500' },
        { label: 'Parça', value: String(tracks.length), icon: Disc3, color: 'text-indigo-500' },
        { label: 'YouTube', value: String(channels.length), icon: Youtube, color: 'text-red-500' },
        { label: 'Video', value: String(videos.length), icon: Youtube, color: 'text-rose-500' },
      ];
    }
    if (activeFilter === 'crm') {
      return [
        { label: 'Toplam Kişi', value: String(contacts.length), icon: Users, color: 'text-cyan-500' },
        { label: 'Etkinlik', value: String(events.length), icon: Calendar, color: 'text-amber-500' },
        { label: 'Notlar', value: String(notes.length), icon: FileText, color: 'text-indigo-500' },
        { label: 'Fikirler', value: String(ideas.length), icon: Lightbulb, color: 'text-orange-500' },
      ];
    }
    // General
    return [
      { label: 'Toplam Kayıt', value: String(totalEntries), icon: BarChart3, color: 'text-primary' },
      { label: 'Level', value: `${level} (${xp} XP)`, icon: Zap, color: 'text-yellow-500' },
      { label: 'Mood Skoru', value: `${wellnessStats.avgMood}/10`, icon: Heart, color: 'text-rose-500' },
      { label: 'Net Akış', value: `₺${financeStats.net.toLocaleString('tr-TR')}`, icon: TrendingUp, color: isPositive ? 'text-green-500' : 'text-red-500' },
    ];
  }, [activeFilter, financeStats, wellnessStats, taskStats, totalEntries, records, projects, artists, tracks, contacts, events, notes, ideas, channels, videos, level, xp]);

  const isEmpty = totalEntries === 0 && !anyLoading;
  if (anyLoading && totalEntries === 0) {
    return (
      <div className="module-transition space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
        <div className="h-[300px] shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="module-transition space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Analytics Hub</h2>
            <p className="text-xs text-muted-foreground">MİHENK tüm verilerin analizi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-xl p-1">
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  period === p.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground')}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Source bar */}
      <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
        <Database className="w-3 h-3" />
        <span className="font-medium">Kaynaklar:</span>
        {[{l:'Finans',c:records.length},{l:'Wellness',c:moods.length},{l:'Görevler',c:tasks.length},{l:'Projeler',c:projects.length},{l:'Katalog',c:artists.length+tracks.length},{l:'Kişiler',c:contacts.length},{l:'Takvim',c:events.length}].map(s => (
          <span key={s.l} className="px-1.5 py-0.5 rounded bg-muted">{s.l}: {s.c}</span>
        ))}
        <span className="ml-auto flex items-center gap-1">
          <RefreshCw className={cn("w-3 h-3", anyLoading && "animate-spin")} />
          {lastRefresh.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {sourceErrors.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{sourceErrors.join(', ')} yüklenemedi — kısmi analiz.</span>
        </div>
      )}

      {isEmpty && (
        <div className="mihenk-card p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="font-serif font-semibold text-lg mb-1">Henüz Veri Yok</h3>
          <p className="text-sm text-muted-foreground">Modüllere veri ekledikçe analitikler burada belirecek.</p>
        </div>
      )}

      {!isEmpty && (<>
      {/* Gamification Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Flame className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Level {level} • {xp} XP</p>
          <p className="text-xs text-muted-foreground">🔥 {streak} gün seri • {taskStats.completed} görev tamamlandı</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold tabular-nums">{totalEntries}</p>
          <p className="text-[10px] text-muted-foreground">toplam kayıt</p>
        </div>
      </div>

      {/* Module Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border',
              activeFilter === f.id
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'border-border hover:bg-muted text-muted-foreground')}>
            <f.icon className="w-3.5 h-3.5" />
            {f.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <AnimatePresence mode="wait">
        <motion.div key={activeFilter}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <k.icon className={cn('w-4 h-4', k.color)} />
                <span className="text-xs text-muted-foreground">{k.label}</span>
              </div>
              <p className={cn('text-xl font-bold tabular-nums', k.color)}>{k.value}</p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module Status Bar Chart */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Modül Verileri
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleStatusData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={55} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                  {moduleStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" /> Hayat Dengesi Radarı
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis tick={false} domain={[0, 100]} />
                <Radar name="Skor" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Trend */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" /> Haftalık Aktivite Trendi
        </h3>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="aktivite" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { name: 'Finans', icon: Wallet, count: records.length, color: 'from-green-500 to-emerald-600', desc: 'işlem' },
          { name: 'Wellness', icon: Heart, count: moods.length, color: 'from-rose-500 to-pink-600', desc: 'check-in' },
          { name: 'Görevler', icon: CheckCircle2, count: tasks.length, color: 'from-blue-500 to-indigo-600', desc: 'görev' },
          { name: 'Projeler', icon: FolderKanban, count: projects.length, color: 'from-indigo-500 to-violet-600', desc: 'proje' },
          { name: 'Katalog', icon: Music, count: artists.length, color: 'from-purple-500 to-violet-600', desc: 'sanatçı' },
          { name: 'Takvim', icon: Calendar, count: events.length, color: 'from-amber-500 to-orange-600', desc: 'etkinlik' },
          { name: 'Kişiler', icon: Users, count: contacts.length, color: 'from-cyan-500 to-teal-600', desc: 'kişi' },
          { name: 'Notlar', icon: FileText, count: notes.length, color: 'from-slate-500 to-gray-600', desc: 'not' },
          { name: 'Fikirler', icon: Lightbulb, count: ideas.length, color: 'from-orange-500 to-amber-600', desc: 'fikir' },
          { name: 'YouTube', icon: Youtube, count: videos.length, color: 'from-red-500 to-rose-600', desc: 'video' },
        ].map(m => (
          <div key={m.name} className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
            <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', m.color)}>
              <m.icon className="w-4 h-4 text-white" />
            </div>
            <p className="font-semibold text-sm">{m.name}</p>
            <p className="text-lg font-bold tabular-nums">{m.count}</p>
            <p className="text-[10px] text-muted-foreground">{m.desc}</p>
          </div>
        ))}
      </div>
      </>)}
    </div>
  );
}
