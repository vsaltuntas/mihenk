import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, Radar, Search, Music2, BarChart3, Columns, Bookmark } from 'lucide-react';

type TabId = 'radar' | 'artist' | 'track' | 'charts' | 'karsilastirma' | 'kaydet';
const TABS: { id: TabId; label: string }[] = [
  { id: 'radar', label: 'Radar' }, { id: 'artist', label: 'Artist Search' }, { id: 'track', label: 'Track Signals' },
  { id: 'charts', label: 'Charts' }, { id: 'karsilastirma', label: 'Karşılaştırma' }, { id: 'kaydet', label: 'Kaydet' },
];

export default function ChartmetricModule() {
  const [tab, setTab] = useState<TabId>('radar');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Müzik ve Yayın</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><TrendingUp className="w-6 h-6 text-[hsl(var(--mihenk-green))]" /> Chartmetric</h1>
        <p className="text-sm text-muted-foreground mt-1">Müzik pazar sinyalleri ve sanatçı/track intelligence</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">{tab === 'radar' ? 'Pazar radarı — trend sinyalleri' : tab === 'artist' ? 'Sanatçı arama ve analiz' : tab === 'track' ? 'Track sinyal izleme' : tab === 'charts' ? 'Chart sıralamaları' : tab === 'karsilastirma' ? 'Sanatçı karşılaştırması' : 'Kaydedilen veriler'}</p>
      </div>
    </div>
  );
}
