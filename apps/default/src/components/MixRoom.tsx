import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SlidersHorizontal, Layers, Headphones, FileText, Archive, Activity } from 'lucide-react';

type TabId = 'sessions' | 'compare' | 'notes' | 'render' | 'artifacts' | 'worker';
const TABS: { id: TabId; label: string }[] = [
  { id: 'sessions', label: 'Sessions' }, { id: 'compare', label: 'Compare' },
  { id: 'notes', label: 'Listener Notes' }, { id: 'render', label: 'Render Queue' },
  { id: 'artifacts', label: 'Artifacts' }, { id: 'worker', label: 'Worker' },
];

export default function MixRoom() {
  const [tab, setTab] = useState<TabId>('sessions');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stüdyo</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><SlidersHorizontal className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" /> Mix Room</h1>
        <p className="text-sm text-muted-foreground mt-1">Mix/master kararları, karşılaştırma ve render takibi</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">{tab === 'sessions' ? 'Mix session listesi' : tab === 'compare' ? 'A/B mix karşılaştırması' : tab === 'notes' ? 'Dinleyici notları' : tab === 'render' ? 'Render kuyruğu' : tab === 'artifacts' ? 'Mix artifacts' : 'Worker durumu'}</p>
      </div>
    </div>
  );
}
