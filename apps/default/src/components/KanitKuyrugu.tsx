import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShieldQuestion } from 'lucide-react';

const TABS = [
  { id: 'aday', label: 'Aday' },
  { id: 'teyit_bekliyor', label: 'Teyit Bekliyor' },
  { id: 'dogrulandi', label: 'Doğrulandı' },
  { id: 'reddedildi', label: 'Reddedildi' },
  { id: 'eskidi', label: 'Eskidi' },
];

export default function KanitKuyrugu() {
  const [tab, setTab] = useState(TABS[0]?.id || '');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Maden</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><ShieldQuestion className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" /> Kanıt Kuyruğu</h1>
        <p className="text-sm text-muted-foreground mt-1">Önemli iddiaların doğrulanmadan ürüne girmemesini sağla</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <ShieldQuestion className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Kanıt Kuyruğu hazırlanıyor</p>
      </div>
    </div>
  );
}
