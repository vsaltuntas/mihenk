import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Radar, Clock, CheckCircle2, AlertTriangle, Disc, Radio } from 'lucide-react';

type TabId = 'yaklasan' | 'hazir' | 'eksik' | 'dagitimda' | 'yayinda';
const TABS: { id: TabId; label: string }[] = [
  { id: 'yaklasan', label: 'Yaklaşan' }, { id: 'hazir', label: 'Hazır' }, { id: 'eksik', label: 'Eksik Metadata' },
  { id: 'dagitimda', label: 'Dağıtımda' }, { id: 'yayinda', label: 'Yayında' },
];

export default function ReleaseRadar() {
  const [tab, setTab] = useState<TabId>('yaklasan');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Müzik ve Yayın</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Radar className="w-6 h-6 text-[hsl(var(--mihenk-red))]" /> Release Radar</h1>
        <p className="text-sm text-muted-foreground mt-1">Yayına yaklaşan track ve albümleri takip et</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <Radar className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Release pipeline hazırlanıyor</p>
      </div>
    </div>
  );
}
