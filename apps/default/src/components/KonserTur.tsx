import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Calendar, Music2, Wallet, Users, CheckSquare, CalendarDays } from 'lucide-react';

type TabId = 'etkinlikler' | 'venue' | 'setlist' | 'butce' | 'ekip' | 'checklist' | 'takvim';
const TABS: { id: TabId; label: string }[] = [
  { id: 'etkinlikler', label: 'Etkinlikler' }, { id: 'venue', label: 'Venue' }, { id: 'setlist', label: 'Setlist' },
  { id: 'butce', label: 'Bütçe' }, { id: 'ekip', label: 'Ekip' }, { id: 'checklist', label: 'Checklist' }, { id: 'takvim', label: 'Takvim' },
];

export default function KonserTur() {
  const [tab, setTab] = useState<TabId>('etkinlikler');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">İnsan ve İş</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><MapPin className="w-6 h-6 text-[hsl(var(--mihenk-red))]" /> Konser & Tur</h1>
        <p className="text-sm text-muted-foreground mt-1">Etkinlik, konser ve turne operasyonu</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Konser & tur yönetimi hazırlanıyor</p>
      </div>
    </div>
  );
}
