import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Library, MapPin, Music2, GitBranch, BookOpen, ListMusic } from 'lucide-react';

type TabId = 'turkuler' | 'bolge' | 'makam' | 'varyantlar' | 'kaynaklar' | 'repertuvar';
const TABS: { id: TabId; label: string }[] = [
  { id: 'turkuler', label: 'Türküler' }, { id: 'bolge', label: 'Bölge' },
  { id: 'makam', label: 'Makam/Usul' }, { id: 'varyantlar', label: 'Varyantlar' },
  { id: 'kaynaklar', label: 'Kaynaklar' }, { id: 'repertuvar', label: 'Repertuvar' },
];

const SAMPLE_TURKU = [
  { title: 'Mihriban', bolge: 'Erzurum', makam: 'Kürdi', kaynak: 'Âşık Veysel' },
  { title: 'Uzun İnce Bir Yoldayım', bolge: 'Sivas', makam: 'Kürdi', kaynak: 'Âşık Veysel' },
  { title: 'Sarı Gelin', bolge: 'Kars', makam: 'Segâh', kaynak: 'Anonim' },
  { title: 'Çemberimde Gül Oya', bolge: 'Trakya', makam: 'Hüseyni', kaynak: 'Anonim' },
  { title: 'Ah Bu Ben Miyim', bolge: 'Ege', makam: 'Nihavend', kaynak: 'Neşet Ertaş' },
];

export default function TurkuArsivi() {
  const [tab, setTab] = useState<TabId>('turkuler');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stüdyo</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Library className="w-6 h-6 text-[hsl(var(--mihenk-red))]" /> Türkü Arşivi</h1>
        <p className="text-sm text-muted-foreground mt-1">Türkü, halk müziği ve kültürel kaynak arşivi</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card divide-y divide-border">
        {SAMPLE_TURKU.map(t => (
          <div key={t.title} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
            <Music2 className="w-4 h-4 text-[hsl(var(--mihenk-red))] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-[10px] text-muted-foreground">{t.kaynak}</p>
            </div>
            <span className="text-[10px] badge-blue px-1.5 py-0.5 rounded-full">{t.makam}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{t.bolge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
