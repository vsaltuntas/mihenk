import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bell, FolderKanban, Mail, Wallet, Music, Settings, Shield, Clock, CheckCircle2 } from 'lucide-react';

type FilterId = 'tumu' | 'proje' | 'mail' | 'finans' | 'uretim' | 'sistem' | 'insan_onayi';

const FILTERS: { id: FilterId; label: string; icon: React.ElementType }[] = [
  { id: 'tumu', label: 'Tümü', icon: Bell },
  { id: 'proje', label: 'Proje', icon: FolderKanban },
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'finans', label: 'Finans', icon: Wallet },
  { id: 'uretim', label: 'Üretim', icon: Music },
  { id: 'sistem', label: 'Sistem', icon: Settings },
  { id: 'insan_onayi', label: 'İnsan Onayı', icon: Shield },
];

// Placeholder notifications
const SAMPLE_NOTIFICATIONS = [
  { id: 1, type: 'sistem', title: 'MİHENK başarıyla yüklendi', detail: 'Tüm modüller aktif', time: 'Az önce', read: false },
  { id: 2, type: 'sistem', title: 'Kabuk dönüşümü tamamlandı', detail: '56 modül tanımlandı, 13 aktif', time: '5 dk önce', read: false },
  { id: 3, type: 'proje', title: 'Yeni modül hazır', detail: 'Gün Masası, Görevler, Sinyaller aktif', time: '10 dk önce', read: true },
];

export default function BildirimMerkezi() {
  const [filter, setFilter] = useState<FilterId>('tumu');

  const filtered = filter === 'tumu'
    ? SAMPLE_NOTIFICATIONS
    : SAMPLE_NOTIFICATIONS.filter(n => n.type === filter);

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bugün</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <Bell className="w-6 h-6 text-[hsl(var(--mihenk-red))]" />
          Bildirim Merkezi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Tüm uyarılar tek yerde</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(f => {
          const FIcon = f.icon;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>
              <FIcon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.map(n => (
          <div key={n.id} className={cn("mihenk-card p-4 flex items-start gap-3", !n.read && "border-l-2 border-l-[hsl(var(--mihenk-red))]")}>
            <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.read ? "bg-muted" : "bg-[hsl(var(--mihenk-red))]")} />
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.detail}</p>
            </div>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
              <Clock className="w-2.5 h-2.5" /> {n.time}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="mihenk-card p-8 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Bu kategoride bildirim yok</p>
          </div>
        )}
      </div>
    </div>
  );
}
