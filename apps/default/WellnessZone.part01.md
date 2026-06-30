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

