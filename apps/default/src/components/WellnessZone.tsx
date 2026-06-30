import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { mihenkAPI, useMihenkData } from '@/lib/mihenk-data';
import {
  Heart, Droplets, Moon, Zap, Smile, Play, Pause,
  RotateCcw, Coffee, Brain, Flame, Timer, Sparkles,
  TrendingUp, CalendarDays, Pencil, Trash2, Save, Download
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Constants ─── */

const MOOD_EMOJIS = ['😵', '😢', '😞', '😐', '🙂', '😊', '😄', '🤩', '🥳', '🔥'];

const QUOTES = [
  { text: 'Bugün kendine yapabileceğin en iyi yatırım, bir nefes almak.', author: 'ZenZone' },
  { text: 'Her küçük adım, büyük değişimin başlangıcıdır.', author: 'Lao Tzu' },
  { text: 'Zihin bir paraşüt gibidir — sadece açıkken işe yarar.', author: 'Frank Zappa' },
  { text: 'Sakin su derindir.', author: 'Anonim' },
  { text: 'Odaklan, nefes al, yarat.', author: 'MİHENK' },
  { text: 'Mükemmel zamanı bekleme, şimdi başla.', author: 'Napoleon Hill' },
  { text: 'Kendine nazik ol — büyük işler sabır ister.', author: 'ZenZone' },
  { text: 'Bugünü yaşa, yarınla kafanı yorma.', author: 'Marcus Aurelius' },
];

const TIMER_PRESETS = [
  { label: 'Pomodoro', minutes: 25, icon: Brain, color: 'from-rose-500 to-orange-500' },
  { label: 'Kısa Mola', minutes: 5, icon: Coffee, color: 'from-green-500 to-teal-500' },
  { label: 'Uzun Mola', minutes: 15, icon: Coffee, color: 'from-blue-500 to-indigo-500' },
  { label: 'Deep Work', minutes: 50, icon: Flame, color: 'from-purple-500 to-pink-500' },
];

const HEATMAP_COLORS: Record<number, string> = {
  0: 'bg-muted',
  1: 'bg-red-300', 2: 'bg-red-300', 3: 'bg-orange-300',
  4: 'bg-orange-300', 5: 'bg-yellow-300', 6: 'bg-yellow-300',
  7: 'bg-lime-300', 8: 'bg-green-400', 9: 'bg-green-500', 10: 'bg-emerald-500',
};

/* ─── Timer Hook ─── */

function useTimer(initialMinutes: number) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [preset, setPreset] = useState(initialMinutes);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds(s => {
          if (s <= 1) {
            setIsRunning(false);
            toast.success('⏰ Süre doldu! Harika iş çıkardın!', { duration: 5000 });
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, totalSeconds]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = preset > 0 ? 1 - (totalSeconds / (preset * 60)) : 0;

  const toggle = () => setIsRunning(p => !p);
  const reset = (newMinutes?: number) => {
    setIsRunning(false);
    const m = newMinutes ?? preset;
    setPreset(m);
    setTotalSeconds(m * 60);
  };

  return { minutes, seconds, isRunning, progress, toggle, reset, totalSeconds };
}

/* ─── Main Component ─── */

export default function WellnessZone() {
  const { data: rawMoods } = useMihenkData(mihenkAPI.getMoods, []);
  const loading = false;
  const nodes = (rawMoods ?? []).map(m => ({
    id: m.id,
    parentId: null,
    completed: false,
    fieldValues: {
      '/text': m.mood_label || `Ruh hali: ${m.mood_score}`,
      '/attributes/@wmood': m.mood_score,
      '/attributes/@wenergy': m.energy_level || 5,
      '/attributes/@wsleep': m.sleep_hours || 7,
      '/attributes/@wnote': m.notes || '',
      '/attributes/@wdate': m.date,
    }
  }));
  const [activeTab, setActiveTab] = useState<'wellness' | 'focus' | 'checkin' | 'history'>('wellness');
  const [form, setForm] = useState({ mood: 7, energy: 6, sleep: 7, water: 4, note: '', habits: '' });
  const timer = useTimer(25);
  const [activePreset, setActivePreset] = useState(0);

  // Wellness Center state
  const [waterCount, setWaterCount] = useState(0);
  const WATER_GOAL = 8;
  const [supplements, setSupplements] = useState([
    { id: 1, name: 'D Vitamini', dose: '2000 IU', done: false, emoji: '☀️' },
    { id: 2, name: 'Magnezyum', dose: '400mg', done: false, emoji: '⚡' },
    { id: 3, name: 'Omega-3', dose: '1000mg', done: false, emoji: '🐟' },
    { id: 4, name: 'B12', dose: '500mcg', done: false, emoji: '💊' },
  ]);
  const [habits, setHabits] = useState([
    { id: 1, name: 'Sabah Egzersizi', done: false, emoji: '🏋️', streak: 3 },
    { id: 2, name: 'Meditasyon', done: false, emoji: '🧘', streak: 7 },
    { id: 3, name: 'Okuma (30dk)', done: false, emoji: '📚', streak: 12 },
    { id: 4, name: 'Günlük Yürüyüş', done: false, emoji: '🚶', streak: 5 },
    { id: 5, name: 'Sağlıklı Beslenme', done: false, emoji: '🥗', streak: 2 },
  ]);
  const [newHabit, setNewHabit] = useState('');
  const [newSupplement, setNewSupplement] = useState({ name: '', dose: '' });
  const [editingMoodId, setEditingMoodId] = useState<string | null>(null);
  const [editMoodForm, setEditMoodForm] = useState({ mood: 5, energy: 5, sleep: 7, water: 0, note: '' });

  const handleStartEditMood = (n: any) => {
    setEditingMoodId(n.id);
    setEditMoodForm({
      mood: Number(n.fieldValues['/attributes/@wmood']) || 5,
      energy: Number(n.fieldValues['/attributes/@wenrg']) || 5,
      sleep: Number(n.fieldValues['/attributes/@wslep']) || 7,
      water: Number(n.fieldValues['/attributes/@wwatr']) || 0,
      note: (n.fieldValues['/attributes/@wnote'] as string) || '',
    });
  };

  const handleSaveEditMood = useCallback(async () => {
    if (!editingMoodId) return;
    try {
      await mihenkAPI.updateMood(editingMoodId, {
        score: editMoodForm.mood,
        energy: editMoodForm.energy,
        sleep_hours: editMoodForm.sleep,
        water: editMoodForm.water,
        notes: editMoodForm.note,
      });
      setEditingMoodId(null);
      refetch();
      toast.success('✅ Check-in güncellendi!');
    } catch (e: unknown) {
      toast.error(`❌ Güncellenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  }, [editingMoodId, editMoodForm, refetch]);

  const handleDeleteMood = useCallback(async (id: string, label: string) => {
    if (!confirm(`"${label}" kaydını silmek istediğinize emin misiniz?`)) return;
    try {
      await mihenkAPI.deleteMood(id);
      refetch();
      toast.success('🗑️ Check-in silindi');
    } catch (e: unknown) {
      toast.error(`❌ Silinemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  }, [refetch]);

  const handleExportWellness = () => {
    const csv = ['Tarih,Mood,Enerji,UykuSaat,SuBardak,Not,Aliskanliklar']
      .concat(nodes.filter(n => n.parentId === null).map(n => [
        n.fieldValues['/attributes/@wdate'] || n.fieldValues['/attributes/@edate'] || '',
        n.fieldValues['/attributes/@wmood'] || '',
        n.fieldValues['/attributes/@wenrg'] || '',
        n.fieldValues['/attributes/@wslep'] || '',
        n.fieldValues['/attributes/@wwatr'] || '',
        String(n.fieldValues['/attributes/@wnote'] || '').replace(/"/g, '""'),
        String(n.fieldValues['/attributes/@whabi'] || '').replace(/"/g, '""'),
      ].map(v => `"${v}"`).join(',')))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV indirildi');
  };

  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Daily wellness score
  const dailyScore = useMemo(() => {
    const suppDone = supplements.filter(s => s.done).length;
    const habitsDone = habits.filter(h => h.done).length;
    const waterPct = Math.min(waterCount / WATER_GOAL, 1);
    const total = (suppDone / supplements.length) * 30 + (habitsDone / habits.length) * 50 + waterPct * 20;
    return Math.round(total);
  }, [supplements, habits, waterCount]);
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  // Build 30-day mood heatmap data
  const heatmapData = useMemo(() => {
    const days: { date: string; mood: number; label: string }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      const dayLabel = d.toLocaleDateString('tr-TR', { weekday: 'short' });

      // Find matching check-in
      const match = nodes.find(n => {
        const text = (n.fieldValues['/text'] as string) || '';
        return text.includes(d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }));
      });

      days.push({
        date: dateStr,
        mood: match ? Number(match.fieldValues['/attributes/@wmood']) || 0 : 0,
        label: dayLabel,
      });
    }
    return days;
  }, [nodes]);

  // Averages
  const averages = useMemo(() => {
    const checkins = nodes.filter(n => n.parentId === null);
    if (checkins.length === 0) return { mood: 0, energy: 0, sleep: 0, water: 0, count: 0 };
    const sum = checkins.reduce(
      (acc, n) => ({
        mood: acc.mood + (Number(n.fieldValues['/attributes/@wmood']) || 0),
        energy: acc.energy + (Number(n.fieldValues['/attributes/@wenrg']) || 0),
        sleep: acc.sleep + (Number(n.fieldValues['/attributes/@wslep']) || 0),
        water: acc.water + (Number(n.fieldValues['/attributes/@wwatr']) || 0),
      }),
      { mood: 0, energy: 0, sleep: 0, water: 0 }
    );
    const c = checkins.length;
    return {
      mood: (sum.mood / c).toFixed(1),
      energy: (sum.energy / c).toFixed(1),
      sleep: (sum.sleep / c).toFixed(1),
      water: (sum.water / c).toFixed(1),
      count: c,
    };
  }, [nodes]);

  // Trend data: last 14 mood entries
  const moodTrendData = useMemo(() => {
    const sorted = [...moods].sort((a, b) => (a.date || a.created_at || '').localeCompare(b.date || b.created_at || ''));
    return sorted.slice(-14).map(m => ({
      date: (m.date || m.created_at || '').slice(5, 10).replace('-', '/'),
      mood: Number(m.mood_score) || 0,
      enerji: Number(m.energy_level) || 0,
      uyku: Number(m.sleep_hours) || 0,
    }));
  }, [moods]);

  const handleCheckin = useCallback(async () => {
    try {
      await mihenkAPI.createMood({
        score: form.mood,
        energy: form.energy,
        sleep_hours: form.sleep,
        notes: form.note || `Ruh: ${form.mood}/10, Su: ${form.water}, Enerji: ${form.energy}/10`,
      });
      toast.success('✅ +25 XP — Check-in kaydedildi!');
      setActiveTab('history');
    } catch (e: unknown) {
      toast.error(`❌ Check-in başarısız: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  }, [form]);

  if (loading) {
    return (
      <div className="module-transition space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="h-[400px] shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="module-transition space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-rose-500" />
          <h2 className="text-2xl font-bold">ZenZone</h2>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {([
            { id: 'wellness', label: 'Wellness', icon: Heart },
            { id: 'focus', label: 'Focus', icon: Timer },
            { id: 'checkin', label: 'Check-in', icon: Smile },
            { id: 'history', label: 'Geçmiş', icon: CalendarDays },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ═══════════ WELLNESS CENTER TAB ═══════════ */}
        {activeTab === 'wellness' && (
          <motion.div key="wellness" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-5">
            {/* Bugünkü Skor */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Bugünkü Wellness Skoru</p>
                  <p className="text-5xl font-bold mt-1 text-emerald-600">%{dailyScore}</p>
                  <p className="text-sm text-muted-foreground mt-1">{today}</p>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#10B981" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - dailyScore / 100)}
                      className="transition-all duration-700" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="w-7 h-7 text-emerald-500" />
                  </div>
                </div>
              </div>
              {/* AI Wellness Koçu */}
              <div className="mt-4 p-3 bg-white/10 dark:bg-black/20 rounded-xl">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">🤖 AI WELLNESS KOÇU</p>
                <p className="text-xs text-muted-foreground">
                  {dailyScore === 0 && 'Güne henüz başlamadın. Takviye ve alışkanlıklarını tamamlayarak skoru yükselt!'}
                  {dailyScore > 0 && dailyScore < 30 && 'İyi başlangıç! Su içmeyi ve alışkanlıklarını tamamlamayı unutma.'}
                  {dailyScore >= 30 && dailyScore < 60 && 'Yolun ortasındasın, devam et! Biraz daha ve harika bir gün olacak.'}
                  {dailyScore >= 60 && dailyScore < 90 && 'Mükemmel ilerliyorsun! Bugünü güçlü bitir.'}
                  {dailyScore >= 90 && 'Harika! Bugün wellness hedeflerini neredeyse tamamen tamamladın. 🎉'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Takviyeler */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">💊 Takviyeler
                    <span className="text-xs text-muted-foreground font-normal">
                      {supplements.filter(s => s.done).length}/{supplements.length}
                    </span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {supplements.map(s => (
                    <button key={s.id} onClick={() => setSupplements(p => p.map(x => x.id === s.id ? { ...x, done: !x.done } : x))}
                      className={cn('w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border text-left',
                        s.done ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-muted/50 border-border hover:bg-muted')}>
                      <span className="text-lg">{s.emoji}</span>
                      <div className="flex-1">
                        <p className={cn('text-sm font-medium', s.done && 'line-through opacity-50')}>{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.dose}</p>
                      </div>
                      {s.done && <span className="text-green-500 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input value={newSupplement.name} onChange={e => setNewSupplement(p => ({ ...p, name: e.target.value }))}
                      placeholder="Takviye adı" className="flex-1 bg-muted rounded-lg px-2.5 py-2 text-xs outline-none border border-border" />
                    <input value={newSupplement.dose} onChange={e => setNewSupplement(p => ({ ...p, dose: e.target.value }))}
                      placeholder="Doz" className="w-20 bg-muted rounded-lg px-2.5 py-2 text-xs outline-none border border-border" />
                    <button onClick={() => {
                      if (!newSupplement.name.trim()) return;
                      setSupplements(p => [...p, { id: Date.now(), name: newSupplement.name, dose: newSupplement.dose || '-', done: false, emoji: '💊' }]);
                      setNewSupplement({ name: '', dose: '' });
                    }} className="bg-primary text-primary-foreground px-2.5 py-2 rounded-lg text-xs font-medium">+</button>
                  </div>
                </div>
              </div>

              {/* Alışkanlıklar */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">🔥 Alışkanlıklar
                    <span className="text-xs text-muted-foreground font-normal">
                      {habits.filter(h => h.done).length}/{habits.length}
                    </span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {habits.map(h => (
                    <button key={h.id} onClick={() => setHabits(p => p.map(x => x.id === h.id ? { ...x, done: !x.done } : x))}
                      className={cn('w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border text-left',
                        h.done ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-muted/50 border-border hover:bg-muted')}>
                      <span className="text-lg">{h.emoji}</span>
                      <div className="flex-1">
                        <p className={cn('text-sm font-medium', h.done && 'line-through opacity-50')}>{h.name}</p>
                        <p className="text-[10px] text-amber-600">🔥 {h.streak} gün streak</p>
                      </div>
                      {h.done && <span className="text-amber-500 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newHabit.trim()) {
                          setHabits(p => [...p, { id: Date.now(), name: newHabit, done: false, emoji: '⚡', streak: 0 }]);
                          setNewHabit('');
                        }
                      }}
                      placeholder="Yeni alışkanlık... (Enter)" className="flex-1 bg-muted rounded-lg px-2.5 py-2 text-xs outline-none border border-border" />
                  </div>
                </div>
              </div>
            </div>

            {/* Su Tüketimi */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  💧 Su Tüketimi
                  <span className="text-xs text-muted-foreground font-normal">{waterCount}/{WATER_GOAL} bardak</span>
                </h3>
                <div className="text-xs font-bold text-blue-500">%{Math.round((waterCount / WATER_GOAL) * 100)}</div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-muted rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-300"
                    style={{ width: `${Math.min((waterCount / WATER_GOAL) * 100, 100)}%` }} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setWaterCount(c => Math.max(0, c - 1))}
                    className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-sm flex items-center justify-center font-bold">-</button>
                  <button onClick={() => setWaterCount(c => Math.min(WATER_GOAL + 5, c + 1))}
                    className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center justify-center font-bold">+</button>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {Array.from({ length: WATER_GOAL }, (_, i) => (
                  <button key={i} onClick={() => setWaterCount(i + 1)}
                    className={cn('aspect-square rounded-lg text-lg transition-all hover:scale-110 flex items-center justify-center',
                      i < waterCount ? 'opacity-100' : 'opacity-20')}>
                    💧
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ FOCUS TAB ═══════════ */}
        {activeTab === 'focus' && (
          <motion.div
            key="focus"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Motivasyon Quote */}
            <div className="text-center py-2">
              <p className="text-sm italic text-muted-foreground">"{quote.text}"</p>
              <p className="text-xs text-muted-foreground/60 mt-1">— {quote.author}</p>
            </div>

            {/* Timer Card */}
            <div className={cn(
              'relative rounded-2xl border border-border overflow-hidden',
              'bg-gradient-to-br', TIMER_PRESETS[activePreset].color
            )}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative z-10 p-8 text-center text-white">
                {/* Preset Label */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {(() => {
                    const Icon = TIMER_PRESETS[activePreset].icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    {TIMER_PRESETS[activePreset].label}
                  </span>
                </div>

                {/* Circular Progress Ring */}
                <div className="relative w-56 h-56 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                    <circle
                      cx="100" cy="100" r="90" fill="none"
                      stroke="white" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 90}
                      strokeDashoffset={2 * Math.PI * 90 * (1 - timer.progress)}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-mono font-bold tracking-tight tabular-nums">
                      {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
                    </span>
                    {timer.isRunning && (
                      <span className="text-xs mt-2 opacity-70 animate-pulse">Odaklan...</span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => timer.reset()}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={timer.toggle}
                    className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                  >
                    {timer.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => {
                      const next = (activePreset + 1) % TIMER_PRESETS.length;
                      setActivePreset(next);
                      timer.reset(TIMER_PRESETS[next].minutes);
                    }}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <Coffee className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {TIMER_PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => { setActivePreset(i); timer.reset(p.minutes); }}
                  className={cn(
                    'py-2.5 rounded-xl text-xs font-medium transition-all border',
                    activePreset === i
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <p.icon className="w-4 h-4" />
                    <span>{p.label}</span>
                    <span className="text-[10px] opacity-60">{p.minutes}dk</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Smile, label: 'Mood Ort.', value: averages.mood, color: 'text-amber-500', suffix: '/10' },
                { icon: Zap, label: 'Enerji Ort.', value: averages.energy, color: 'text-yellow-500', suffix: '/10' },
                { icon: Moon, label: 'Uyku Ort.', value: averages.sleep, color: 'text-indigo-500', suffix: 's' },
                { icon: Flame, label: 'Check-in', value: averages.count, color: 'text-rose-500', suffix: '' },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
                  <s.icon className={cn('w-4 h-4 mx-auto mb-1', s.color)} />
                  <p className="text-lg font-bold">{s.value}<span className="text-xs text-muted-foreground">{s.suffix}</span></p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════ CHECK-IN TAB ═══════════ */}
        {activeTab === 'checkin' && (
          <motion.div
            key="checkin"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Günlük Check-in</h3>
                  <p className="text-sm text-muted-foreground">{today}</p>
                </div>
                <div className="text-5xl transition-all duration-300">{MOOD_EMOJIS[form.mood - 1]}</div>
              </div>

              {/* Mood Slider */}
              <div className="space-y-5">
                {[
                  { key: 'mood' as const, icon: Smile, label: 'Mood', color: 'text-amber-500', max: 10 },
                  { key: 'energy' as const, icon: Zap, label: 'Enerji', color: 'text-yellow-500', max: 10 },
                  { key: 'sleep' as const, icon: Moon, label: 'Uyku (saat)', color: 'text-indigo-500', max: 12 },
                  { key: 'water' as const, icon: Droplets, label: 'Su (bardak)', color: 'text-blue-500', max: 15 },
                ].map(s => (
                  <div key={s.key} className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className={cn('w-4 h-4', s.color)} />
                      <span className="text-sm font-medium">{s.label}</span>
                      <span className="ml-auto text-lg font-bold tabular-nums">{form[s.key]}</span>
                    </div>
                    <input
                      type="range" min={1} max={s.max} value={form[s.key]}
                      onChange={e => setForm(p => ({ ...p, [s.key]: Number(e.target.value) }))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                ))}
              </div>

              {/* Habits */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Bugün tamamlanan alışkanlıklar
                </label>
                <input
                  value={form.habits}
                  onChange={e => setForm(p => ({ ...p, habits: e.target.value }))}
                  placeholder="Spor, meditasyon, okuma..."
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border"
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Günlük not
                </label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="Bugün nasıl hissediyorsun? ✍️"
                  className="w-full bg-muted rounded-xl p-3 text-sm outline-none resize-none h-20 border border-border"
                />
              </div>

              <button
                onClick={handleCheckin}
                className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Check-in Yap (+25 XP)
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════ HISTORY TAB ═══════════ */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Mood/Energy Trend Chart */}
            {moodTrendData.length > 1 && (
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <h3 className="font-semibold text-sm">Son Check-in Trendi</h3>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Mood</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Enerji</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Uyku</span>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="mood" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="Mood" />
                      <Line type="monotone" dataKey="enerji" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Enerji" />
                      <Line type="monotone" dataKey="uyku" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Uyku" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 30-Day Mood Heatmap */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">30 Günlük Mood Haritası</h3>
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {heatmapData.map((d, i) => (
                  <div key={i} className="group relative">
                    <div
                      className={cn(
                        'w-full aspect-square rounded-md transition-transform hover:scale-110 cursor-pointer',
                        d.mood > 0 ? HEATMAP_COLORS[d.mood] : 'bg-muted'
                      )}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover border border-border rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      <p className="font-medium">{d.date} ({d.label})</p>
                      {d.mood > 0 ? (
                        <p>{MOOD_EMOJIS[d.mood - 1]} Mood: {d.mood}/10</p>
                      ) : (
                        <p className="text-muted-foreground">Check-in yok</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-muted-foreground">Düşük</span>
                {[1, 3, 5, 7, 9].map(v => (
                  <div key={v} className={cn('w-3 h-3 rounded-sm', HEATMAP_COLORS[v])} />
                ))}
                <span className="text-[10px] text-muted-foreground">Yüksek</span>
              </div>
            </div>

            {/* Check-in List */}
            <div className="bg-card rounded-2xl border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Geçmiş Check-in'ler</h3>
                <span className="text-xs text-muted-foreground">{nodes.filter(n => n.parentId === null).length} kayıt</span>
              </div>
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {nodes.filter(n => n.parentId === null).length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground text-sm">Henüz check-in yok. Bugün ilkini yap! 🌟</p>
                ) : (
                  nodes.filter(n => n.parentId === null).map(n => {
                    const mood = Number(n.fieldValues['/attributes/@wmood']) || 5;
                    const isEditing = editingMoodId === n.id;

                    if (isEditing) {
                      return (
                        <div key={n.id} className="p-4 space-y-3 bg-muted/30 border-l-2 border-primary">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground">Mood ({editMoodForm.mood}/10)</label>
                              <input type="range" min={1} max={10} value={editMoodForm.mood} onChange={e => setEditMoodForm(p => ({ ...p, mood: +e.target.value }))} className="w-full" />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground">Enerji ({editMoodForm.energy}/10)</label>
                              <input type="range" min={1} max={10} value={editMoodForm.energy} onChange={e => setEditMoodForm(p => ({ ...p, energy: +e.target.value }))} className="w-full" />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground">Uyku ({editMoodForm.sleep}s)</label>
                              <input type="range" min={0} max={12} step={0.5} value={editMoodForm.sleep} onChange={e => setEditMoodForm(p => ({ ...p, sleep: +e.target.value }))} className="w-full" />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground">Su ({editMoodForm.water}b)</label>
                              <input type="range" min={0} max={15} value={editMoodForm.water} onChange={e => setEditMoodForm(p => ({ ...p, water: +e.target.value }))} className="w-full" />
                            </div>
                          </div>
                          <input value={editMoodForm.note} onChange={e => setEditMoodForm(p => ({ ...p, note: e.target.value }))} placeholder="Not..." className="w-full bg-background rounded-lg px-3 py-2 text-xs outline-none border border-border" />
                          <div className="flex gap-2">
                            <button onClick={handleSaveEditMood} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[10px] font-semibold">
                              <Save className="w-3 h-3" /> Kaydet
                            </button>
                            <button onClick={() => setEditingMoodId(null)} className="px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-muted rounded-lg">İptal</button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={n.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors group">
                        <span className="text-3xl">{MOOD_EMOJIS[mood - 1]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{n.fieldValues['/text'] as string}</p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                            <span>🌙 {n.fieldValues['/attributes/@wslep']}s</span>
                            <span>💧 {n.fieldValues['/attributes/@wwatr']}b</span>
                            <span>⚡ {n.fieldValues['/attributes/@wenrg']}/10</span>
                          </div>
                          {n.fieldValues['/attributes/@wnote'] && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                              {n.fieldValues['/attributes/@wnote'] as string}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEditMood(n)} className="p-1.5 rounded-lg hover:bg-muted" title="Düzenle">
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDeleteMood(n.id, n.fieldValues['/text'] as string)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20" title="Sil">
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold">{mood}</span>
                            <span className="text-xs text-muted-foreground">/10</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
