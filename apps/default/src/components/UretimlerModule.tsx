import { useState, useMemo } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import { cn } from '@/lib/utils';
import { Headphones, Star, BarChart3, Settings, FolderKanban, Disc, Play } from 'lucide-react';

type TabId = 'tumu' | 'favoriler' | 'rating' | 'provider' | 'projeye_gore' | 'katalog_bagli';
const TABS: { id: TabId; label: string }[] = [
  { id: 'tumu', label: 'Tüm Üretimler' }, { id: 'favoriler', label: 'Favoriler' }, { id: 'rating', label: 'Rating' },
  { id: 'provider', label: 'Provider' }, { id: 'projeye_gore', label: 'Projeye Göre' }, { id: 'katalog_bagli', label: 'Katalog Bağlı' },
];

export default function UretimlerModule() {
  const [tab, setTab] = useState<TabId>('tumu');
  const { data: gens } = useMihenkData(mihenkAPI.getMaestroGenerations);
  const genArr = useMemo(() => ensureArray(gens), [gens]);

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Müzik ve Yayın</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Headphones className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" /> Üretimler</h1>
        <p className="text-sm text-muted-foreground mt-1">Audio üretim çıktılarını arşivle — {genArr.length} üretim</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card divide-y divide-border">
        {genArr.slice(0, 20).map(g => (
          <div key={g.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[hsl(var(--mihenk-gold)/0.1)] flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 text-[hsl(var(--mihenk-gold))]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{g.title || `Üretim #${g.id.slice(0, 6)}`}</p>
              <p className="text-[10px] text-muted-foreground">{g.platform || 'Bilinmeyen'} · {g.status || 'completed'}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">{new Date(g.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
        ))}
        {genArr.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Henüz üretim yok</div>}
      </div>
    </div>
  );
}
