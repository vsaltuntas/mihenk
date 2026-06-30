import { useState, useMemo } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
  BarChart3, Heart, Wallet, CheckCircle2,
  RefreshCw, Database, AlertCircle, Clock, ArrowRight, Calendar,
} from 'lucide-react';

export default function YasamRaporu() {
  const { setActiveModule } = useAppStore();
  const { data: tasks, loading: lT, error: eT } = useMihenkData(mihenkAPI.getTasks);
  const { data: moods, loading: lM, error: eM } = useMihenkData(mihenkAPI.getMoods);
  const { data: finance, loading: lF, error: eF } = useMihenkData(mihenkAPI.getFinanceRecords);
  const anyLoading = lT || lM || lF;
  const errors = [eT && 'Görevler', eM && 'Wellness', eF && 'Finans'].filter(Boolean) as string[];
  const [lastRefresh] = useState(() => new Date());

  const taskArr = useMemo(() => ensureArray(tasks), [tasks]);
  const moodArr = useMemo(() => ensureArray(moods), [moods]);
  const finArr = useMemo(() => ensureArray(finance), [finance]);

  const doneTasks = taskArr.filter(t => t.status === 'done').length;
  const todoTasks = taskArr.filter(t => t.status !== 'done').length;
  const taskRate = taskArr.length > 0 ? Math.round((doneTasks / taskArr.length) * 100) : 0;

  const avgMood = moodArr.length > 0 ? (moodArr.reduce((s, m) => s + (Number(m.mood_score) || 0), 0) / moodArr.length).toFixed(1) : '—';
  const avgEnergy = moodArr.length > 0 ? (moodArr.reduce((s, m) => s + (Number(m.energy_level) || 0), 0) / moodArr.length).toFixed(1) : '—';
  const avgSleep = moodArr.length > 0 ? (moodArr.reduce((s, m) => s + (Number(m.sleep_hours) || 0), 0) / moodArr.length).toFixed(1) : '—';

  const totalIncome = finArr.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalExpense = finArr.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  const totalSources = taskArr.length + moodArr.length + finArr.length;
  const isEmpty = totalSources === 0 && !anyLoading;

  // Date range from actual data
  const dateRange = useMemo(() => {
    const allDates = [
      ...taskArr.map(t => t.created_at),
      ...moodArr.map(m => m.created_at),
      ...finArr.map(f => f.created_at),
    ].filter(Boolean).map(d => new Date(d).getTime()).filter(t => !isNaN(t));
    if (allDates.length === 0) return null;
    const min = new Date(Math.min(...allDates));
    const max = new Date(Math.max(...allDates));
    return {
      from: min.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      to: max.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
  }, [taskArr, moodArr, finArr]);

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Yaşam</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" /> Yaşam Raporu
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Wellness, görev ve finans verilerinden yaşam özeti</p>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <Database className="w-3 h-3" />
          Görevler: {taskArr.length} · Mood: {moodArr.length} · Finans: {finArr.length}
          {dateRange && <><span className="mx-1">·</span><Calendar className="w-3 h-3" /> {dateRange.from} — {dateRange.to}</>}
          <span className="ml-auto flex items-center gap-1">
            <RefreshCw className={cn("w-3 h-3", anyLoading && "animate-spin")} />
            {lastRefresh.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {anyLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Rapor hazırlanıyor…</div>}
      {errors.length > 0 && <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-xs text-red-700 dark:text-red-400"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.join(', ')} yüklenemedi.</div>}

      {isEmpty && (
        <div className="mihenk-card p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="font-serif font-semibold text-lg mb-1">Henüz Rapor Verisi Yok</h3>
          <p className="text-sm text-muted-foreground">Görev, mood veya finans kaydı ekledikçe rapor burada oluşacak.</p>
        </div>
      )}

      {!isEmpty && (<>
        {/* Task Stats */}
        <div className="grid sm:grid-cols-3 gap-3">
          <button onClick={() => setActiveModule('gorevler')} className="mihenk-card p-4 text-center hover:-translate-y-0.5 transition-all group">
            <p className="text-2xl font-bold text-[hsl(var(--mihenk-green))]">{doneTasks}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Tamamlanan Görev</p>
            <p className="text-[9px] text-muted-foreground/50 mt-0.5">{taskArr.length} görevden · %{taskRate} oran</p>
          </button>
          <button onClick={() => setActiveModule('wellness')} className="mihenk-card p-4 text-center hover:-translate-y-0.5 transition-all group">
            <p className="text-2xl font-bold text-[hsl(var(--mihenk-gold))]">{avgMood}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Ortalama Mood</p>
            <p className="text-[9px] text-muted-foreground/50 mt-0.5">{moodArr.length} check-in</p>
          </button>
          <button onClick={() => setActiveModule('finans')} className="mihenk-card p-4 text-center hover:-translate-y-0.5 transition-all group">
            <p className={cn("text-2xl font-bold", netBalance >= 0 ? "text-[hsl(var(--mihenk-green))]" : "text-[hsl(var(--mihenk-red))]")}>{netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString('tr-TR')} ₺</p>
            <p className="text-[10px] text-muted-foreground mt-1">Net Bakiye</p>
            <p className="text-[9px] text-muted-foreground/50 mt-0.5">{finArr.length} işlem</p>
          </button>
        </div>

        {/* Wellness Detail */}
        {moodArr.length > 0 && (
          <div className="mihenk-card p-5">
            <h3 className="font-serif font-semibold mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[hsl(var(--mihenk-gold))]" /> Sağlık Özeti
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><p className="text-lg font-bold">{avgMood}/10</p><p className="text-[10px] text-muted-foreground">Ruh Hali Ort.</p></div>
              <div><p className="text-lg font-bold">{avgEnergy}/10</p><p className="text-[10px] text-muted-foreground">Enerji Ort.</p></div>
              <div><p className="text-lg font-bold">{avgSleep}s</p><p className="text-[10px] text-muted-foreground">Uyku Ort.</p></div>
            </div>
            <p className="text-[9px] text-muted-foreground/50 mt-3">Kaynak: Wellness Projesi · {moodArr.length} check-in kaydından hesaplandı</p>
          </div>
        )}

        {/* Finance Detail */}
        {finArr.length > 0 && (
          <div className="mihenk-card p-5">
            <h3 className="font-serif font-semibold mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[hsl(var(--mihenk-green))]" /> Finansal Özet
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><p className="text-lg font-bold text-green-500">+{totalIncome.toLocaleString('tr-TR')} ₺</p><p className="text-[10px] text-muted-foreground">Toplam Gelir</p></div>
              <div><p className="text-lg font-bold text-red-500">-{totalExpense.toLocaleString('tr-TR')} ₺</p><p className="text-[10px] text-muted-foreground">Toplam Gider</p></div>
              <div><p className={cn("text-lg font-bold", netBalance >= 0 ? "text-green-500" : "text-red-500")}>{netBalance.toLocaleString('tr-TR')} ₺</p><p className="text-[10px] text-muted-foreground">Net</p></div>
            </div>
            <p className="text-[9px] text-muted-foreground/50 mt-3">Kaynak: Finans Projesi · {finArr.length} işlem kaydından</p>
          </div>
        )}

        {/* Summary */}
        <div className="mihenk-card p-6">
          <h3 className="font-serif font-semibold mb-3">Rapor Özeti</h3>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            {doneTasks > 0 && <p>✅ {doneTasks}/{taskArr.length} görev tamamlandı (%{taskRate} verimlilik).</p>}
            {todoTasks > 0 && <p>📋 {todoTasks} görev hâlâ açık.</p>}
            {moodArr.length > 0 && <p>💛 Ortalama ruh hali {avgMood}/10, enerji {avgEnergy}/10, uyku {avgSleep} saat.</p>}
            {finArr.length > 0 && <p>💰 {finArr.length} finansal işlem, net bakiye: {netBalance.toLocaleString('tr-TR')} ₺.</p>}
            {totalSources === 0 && <p>Henüz yeterli veri yok.</p>}
          </div>
          <p className="text-[9px] text-muted-foreground/50 mt-3 border-t border-border pt-2">
            {totalSources} kayıttan hesaplandı{dateRange ? ` · ${dateRange.from} — ${dateRange.to}` : ''}
          </p>
        </div>
      </>)}
    </div>
  );
}
