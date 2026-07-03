import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Scale } from 'lucide-react';

const TABS = [
  { id: 'yeni', label: 'Yeni' },
  { id: 'yanlis_pozitif', label: 'Yanlış Pozitif' },
  { id: 'volkan_teyidi', label: 'Volkan Teyidi' },
  { id: 'kalibrasyon', label: 'Kalibrasyon' },
  { id: 'kapananlar', label: 'Kapananlar' },
];

export default function CeliskiMotoru() {
  const [tab, setTab] = useState(TABS[0]?.id || '');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Maden</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Scale className="w-6 h-6 text-[hsl(var(--mihenk-red))]" /> Çelişki Motoru</h1>
        <p className="text-sm text-muted-foreground mt-1">Verideki tutarsızlıkları bul ve işaretle</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Çelişki Motoru hazırlanıyor</p>
      </div>
    </div>
  );
}
