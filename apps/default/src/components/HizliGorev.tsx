import { useState, useCallback } from 'react';
import { mihenkAPI } from '@/lib/mihenk-data';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { CirclePlus, Send, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const PRIORITIES = [
  { id: 'urgent', label: 'Acil', color: 'badge-red' },
  { id: 'high', label: 'Yüksek', color: 'badge-gold' },
  { id: 'medium', label: 'Orta', color: 'badge-blue' },
  { id: 'low', label: 'Düşük', color: 'bg-muted text-muted-foreground' },
];

type RecentCreate = { title: string; priority: string; time: Date; success: boolean; error?: string };

export default function HizliGorev() {
  const { setActiveModule } = useAppStore();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);
  const [recentCreates, setRecentCreates] = useState<RecentCreate[]>([]);

  const save = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed) { toast.error('Görev başlığı gerekli'); return; }
    setSaving(true);
    try {
      await mihenkAPI.createTask({ title: trimmed, priority, status: 'todo' });
      toast.success(`Görev eklendi: "${trimmed}"`);
      setRecentCreates(prev => [{ title: trimmed, priority, time: new Date(), success: true }, ...prev.slice(0, 4)]);
      setTitle('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      toast.error(`Görev eklenemedi: ${msg}`);
      setRecentCreates(prev => [{ title: trimmed, priority, time: new Date(), success: false, error: msg }, ...prev.slice(0, 4)]);
    }
    setSaving(false);
  }, [title, priority]);

  return (
    <div className="module-transition space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Yakalama</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <CirclePlus className="w-6 h-6 text-[hsl(var(--mihenk-green))]" />
          Hızlı Görev
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Anlık görev yakalama → Görev Projesi (qujHhVX1pJpC2Jh4)</p>
      </div>

      <div className="mihenk-card p-6 space-y-4 max-w-2xl">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Görev ne?"
          className="w-full text-lg font-serif font-semibold bg-transparent outline-none placeholder:text-muted-foreground"
          onKeyDown={e => e.key === 'Enter' && save()}
          autoFocus
        />
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map(p => (
            <button key={p.id} onClick={() => setPriority(p.id)} className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              priority === p.id ? "ring-2 ring-primary/50 " + p.color : p.color + " opacity-50 hover:opacity-75"
            )}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            <Send className="w-4 h-4" /> {saving ? 'Ekleniyor...' : 'Ekle'}
          </button>
          <button onClick={() => setActiveModule('gorevler')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Tüm Görevler <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Recent creates */}
      {recentCreates.length > 0 && (
        <div className="max-w-2xl space-y-2">
          <h4 className="text-xs text-muted-foreground font-medium">Son Eklenenler</h4>
          {recentCreates.map((rc, i) => (
            <div key={i} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-xs", rc.success ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30" : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30")}>
              {rc.success ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <span className="flex-1 truncate">{rc.title}</span>
              <span className={cn("px-1.5 py-0.5 rounded-full text-[9px]", PRIORITIES.find(p => p.id === rc.priority)?.color || 'bg-muted')}>{rc.priority}</span>
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {rc.time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              {rc.success && <button onClick={() => setActiveModule('gorevler')} className="text-primary hover:underline">Görevlerde Gör</button>}
              {!rc.success && <span className="text-red-500 truncate max-w-[120px]">{rc.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
