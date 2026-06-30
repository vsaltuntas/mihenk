import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Mountain } from 'lucide-react';

const TABS = [
  { id: 'kazi', label: 'Kazı' },
  { id: 'kaynaklar', label: 'Kaynaklar' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'celiski', label: 'Çelişki' },
  { id: 'kanit', label: 'Kanıt' },
  { id: 'aktarim', label: 'Aktarım' },
];

export default function MadenModule() {
  const [tab, setTab] = useState(TABS[0]?.id || '');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Maden</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Mountain className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" /> Maden</h1>
        <p className="text-sm text-muted-foreground mt-1">Büyük arşivlerden bilgi cevheri çıkar</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <Mountain className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Maden hazırlanıyor</p>
      </div>
    </div>
  );
}
