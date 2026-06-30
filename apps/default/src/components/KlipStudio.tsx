import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Clapperboard, Layers, Image, Video, Youtube, Disc } from 'lucide-react';

type TabId = 'storyboard' | 'sahne' | 'asset' | 'render' | 'youtube' | 'katalog';
const TABS: { id: TabId; label: string }[] = [
  { id: 'storyboard', label: 'Storyboard' }, { id: 'sahne', label: 'Sahne' },
  { id: 'asset', label: 'Asset' }, { id: 'render', label: 'Render' },
  { id: 'youtube', label: 'YouTube' }, { id: 'katalog', label: 'Katalog' },
];

export default function KlipStudio() {
  const [tab, setTab] = useState<TabId>('storyboard');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stüdyo</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Clapperboard className="w-6 h-6 text-[hsl(var(--mihenk-red))]" /> Klip Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">Video klip, storyboard ve görsel yayın üretimi</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <Clapperboard className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">{tab === 'storyboard' ? 'Sahne sahne storyboard planlama' : tab === 'sahne' ? 'Sahne listesi ve detayları' : tab === 'asset' ? 'Görsel asset yönetimi' : tab === 'render' ? 'Video render kuyruğu' : tab === 'youtube' ? 'YouTube bağlantısı' : 'Katalog bağlantısı'}</p>
      </div>
    </div>
  );
}
