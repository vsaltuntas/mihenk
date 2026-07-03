import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Repeat, Play, Pause, Clock, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

type TabId = 'aktif' | 'planlanan' | 'gecmis' | 'hatali' | 'duraklatilmis';
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'aktif', label: 'Aktif', icon: Play },
  { id: 'planlanan', label: 'Planlanan', icon: Calendar },
  { id: 'gecmis', label: 'Geçmiş Run', icon: Clock },
  { id: 'hatali', label: 'Hatalı', icon: AlertTriangle },
  { id: 'duraklatilmis', label: 'Duraklatılmış', icon: Pause },
];

const SAMPLE_RECURRING = [
  { id: 1, title: 'Haftalık Finans Triage', frequency: 'Her Pazartesi', status: 'aktif', lastRun: '2026-06-09', nextRun: '2026-06-16' },
  { id: 2, title: 'Sabah Ritüeli — Check-in', frequency: 'Her gün 08:00', status: 'aktif', lastRun: '2026-06-16', nextRun: '2026-06-17' },
  { id: 3, title: 'Aylık Yaşam Raporu', frequency: 'Her ayın 1\'i', status: 'aktif', lastRun: '2026-06-01', nextRun: '2026-07-01' },
  { id: 4, title: 'Release Metadata Check', frequency: 'Her Cuma', status: 'planlanan', lastRun: null, nextRun: '2026-06-20' },
  { id: 5, title: 'Backup Integrity Test', frequency: 'Her ayın 15\'i', status: 'duraklatilmis', lastRun: '2026-05-15', nextRun: null },
];

export default function TekrarlayanModule() {
  const [tab, setTab] = useState<TabId>('aktif');
  const filtered = SAMPLE_RECURRING.filter(r => {
    if (tab === 'aktif') return r.status === 'aktif';
    if (tab === 'planlanan') return r.status === 'planlanan';
    if (tab === 'duraklatilmis') return r.status === 'duraklatilmis';
    return true;
  });

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">İş Omurgası</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <Repeat className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" />
          Tekrarlayan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Düzenli işleri ve tekrar eden ritüelleri yönet</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => { const I = t.icon; return (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
            <I className="w-3.5 h-3.5" />{t.label}
          </button>
        ); })}
      </div>
      <div className="space-y-2">
        {filtered.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="mihenk-card p-4 flex items-center gap-4">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", r.status === 'aktif' ? "bg-[hsl(var(--mihenk-green)/0.1)]" : r.status === 'duraklatilmis' ? "bg-muted" : "bg-[hsl(var(--mihenk-blue)/0.1)]")}>
              {r.status === 'aktif' ? <Play className="w-4 h-4 text-[hsl(var(--mihenk-green))]" /> : r.status === 'duraklatilmis' ? <Pause className="w-4 h-4 text-muted-foreground" /> : <Calendar className="w-4 h-4 text-[hsl(var(--mihenk-blue))]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{r.title}</p>
              <p className="text-[10px] text-muted-foreground">{r.frequency}</p>
            </div>
            <div className="text-right shrink-0">
              {r.nextRun && <p className="text-[10px] text-muted-foreground">Sonraki: {r.nextRun}</p>}
              {r.lastRun && <p className="text-[10px] text-muted-foreground">Son: {r.lastRun}</p>}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="mihenk-card p-8 text-center"><CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">Bu kategoride kayıt yok</p></div>
        )}
      </div>
    </div>
  );
}
