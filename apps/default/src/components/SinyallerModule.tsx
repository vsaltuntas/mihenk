import { useMemo, useState } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Radio, FileText, Lightbulb, CheckSquare, Calendar, Music,
  Filter, Clock, RefreshCw, Database, AlertCircle, ArrowRight,
  AlertTriangle, Info,
} from 'lucide-react';
import { motion } from 'framer-motion';

type SignalType = 'not' | 'fikir' | 'gorev' | 'etkinlik' | 'uretim';

const FILTERS: { id: SignalType | 'tumu'; label: string; icon: React.ElementType }[] = [
  { id: 'tumu', label: 'Tümü', icon: Radio },
  { id: 'not', label: 'Not', icon: FileText },
  { id: 'fikir', label: 'Fikir', icon: Lightbulb },
  { id: 'gorev', label: 'Görev', icon: CheckSquare },
  { id: 'etkinlik', label: 'Etkinlik', icon: Calendar },
  { id: 'uretim', label: 'Üretim', icon: Music },
];

interface Signal {
  id: string;
  type: SignalType;
  title: string;
  detail?: string;
  time: string;
  icon: React.ElementType;
  color: string;
  sourceProject: string;
  severity: 'info' | 'warning' | 'critical';
  reason: string;
  mod: string;
}

function getSeverity(type: SignalType, item: Record<string, unknown>): 'info' | 'warning' | 'critical' {
  if (type === 'gorev') {
    if (item.priority === 'urgent') return 'critical';
    if (item.priority === 'high' || item.status === 'blocked') return 'warning';
  }
  return 'info';
}

function getReason(type: SignalType, item: Record<string, unknown>): string {
  if (type === 'gorev') {
    if (item.priority === 'urgent') return 'Acil öncelikli görev';
    if (item.status === 'blocked') return 'Bloklanmış görev';
    if (item.priority === 'high') return 'Yüksek öncelikli';
    return 'Görev kaydı';
  }
  if (type === 'not') return 'Yeni not oluşturuldu';
  if (type === 'fikir') return 'Fikir yakalandı';
  if (type === 'etkinlik') return 'Etkinlik planlandı';
  if (type === 'uretim') return 'Üretim kaydedildi';
  return 'Sinyal';
}

function timeSince(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}sa önce`;
  const days = Math.floor(hrs / 24);
  return `${days}g önce`;
}

export default function SinyallerModule() {
  const [filter, setFilter] = useState<SignalType | 'tumu'>('tumu');
  const { setActiveModule } = useAppStore();

  const { data: notes, loading: lN, error: eN } = useMihenkData(mihenkAPI.getNotes);
  const { data: ideas, loading: lI, error: eI } = useMihenkData(mihenkAPI.getIdeas);
  const { data: tasks, loading: lT, error: eT } = useMihenkData(mihenkAPI.getTasks);
  const { data: events, loading: lE, error: eE } = useMihenkData(mihenkAPI.getEvents);
  const { data: generations, loading: lG, error: eG } = useMihenkData(mihenkAPI.getMaestroGenerations);

  const anyLoading = lN || lI || lT || lE || lG;
  const errors = [eN && 'Notlar', eI && 'Fikirler', eT && 'Görevler', eE && 'Takvim', eG && 'Maestro'].filter(Boolean) as string[];
  const [lastRefresh] = useState(() => new Date());

  const signals = useMemo<Signal[]>(() => {
    const all: Signal[] = [];
    ensureArray(notes).forEach(n => all.push({
      id: `n-${n.id}`, type: 'not', title: n.title, detail: n.content?.slice(0, 80),
      time: n.created_at, icon: FileText, color: 'badge-blue',
      sourceProject: 'Not Projesi', severity: 'info', reason: getReason('not', n), mod: 'notlar',
    }));
    ensureArray(ideas).forEach(i => all.push({
      id: `i-${i.id}`, type: 'fikir', title: i.title, detail: i.description?.slice(0, 80),
      time: i.created_at, icon: Lightbulb, color: 'badge-gold',
      sourceProject: 'Fikir Projesi', severity: 'info', reason: getReason('fikir', i), mod: 'fikirler',
    }));
    ensureArray(tasks).forEach(t => all.push({
      id: `t-${t.id}`, type: 'gorev', title: t.title, detail: `${t.status} · ${t.priority}`,
      time: t.created_at, icon: CheckSquare, color: getSeverity('gorev', t) === 'critical' ? 'badge-red' : getSeverity('gorev', t) === 'warning' ? 'badge-gold' : 'badge-blue',
      sourceProject: 'Görev Projesi', severity: getSeverity('gorev', t), reason: getReason('gorev', t), mod: 'gorevler',
    }));
    ensureArray(events).forEach(e => all.push({
      id: `e-${e.id}`, type: 'etkinlik', title: e.title, detail: e.description?.slice(0, 80),
      time: e.created_at, icon: Calendar, color: 'badge-green',
      sourceProject: 'Takvim Projesi', severity: 'info', reason: getReason('etkinlik', e), mod: 'takvim',
    }));
    ensureArray(generations).forEach(g => all.push({
      id: `g-${g.id}`, type: 'uretim', title: g.title || 'Üretim', detail: g.platform || '',
      time: g.created_at, icon: Music, color: 'badge-gold',
      sourceProject: 'Maestro Projesi', severity: 'info', reason: getReason('uretim', g), mod: 'maestro',
    }));
    all.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return all;
  }, [notes, ideas, tasks, events, generations]);

  const filtered = useMemo(() => {
    if (filter === 'tumu') return signals;
    return signals.filter(s => s.type === filter);
  }, [signals, filter]);

  const isEmpty = signals.length === 0 && !anyLoading;

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Yakalama</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <Radio className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" /> Sinyaller
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Not, fikir, görev, etkinlik ve üretim olayları tek akışta</p>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <Database className="w-3 h-3" />
          {signals.length} sinyal · {signals.filter(s => s.severity === 'critical').length} kritik · {signals.filter(s => s.severity === 'warning').length} uyarı
          <span className="ml-auto flex items-center gap-1">
            <RefreshCw className={cn("w-3 h-3", anyLoading && "animate-spin")} />
            {lastRefresh.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {anyLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sinyaller taranıyor…</div>}
      {errors.length > 0 && <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-xs text-red-700 dark:text-red-400"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.join(', ')} yüklenemedi.</div>}

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(f => {
          const FIcon = f.icon;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filter === f.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>
              <FIcon className="w-3.5 h-3.5" /> {f.label}
            </button>
          );
        })}
      </div>

      {isEmpty && (
        <div className="mihenk-card p-8 text-center">
          <Radio className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Henüz sinyal yok. Veri ekledikçe burada belirecek.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && !isEmpty && (
          <div className="mihenk-card p-8 text-center">
            <Filter className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Bu filtrede sinyal yok</p>
          </div>
        )}
        {filtered.slice(0, 50).map((sig, i) => {
          const SigIcon = sig.icon;
          return (
            <motion.button
              key={sig.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setActiveModule(sig.mod as any)}
              className="mihenk-card p-3 flex items-start gap-3 hover:shadow-sm transition-shadow w-full text-left group"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", sig.color)}>
                <SigIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{sig.title}</p>
                  {sig.severity === 'critical' && <span className="badge-red text-[9px] px-1.5 py-0.5 rounded-full">kritik</span>}
                  {sig.severity === 'warning' && <span className="badge-gold text-[9px] px-1.5 py-0.5 rounded-full">uyarı</span>}
                </div>
                {sig.detail && <p className="text-xs text-muted-foreground truncate mt-0.5">{sig.detail}</p>}
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/60">
                  <span>{sig.reason}</span>
                  <span>· {sig.sourceProject}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {timeSince(sig.time)}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
