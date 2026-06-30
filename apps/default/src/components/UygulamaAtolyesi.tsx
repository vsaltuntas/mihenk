import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Hammer, Layers } from 'lucide-react';

const TABS = [
  { id: 'brief', label: 'Brief' },
  { id: 'Çikti_tipi', label: 'Çıktı Tipi' },
  { id: 'Önizleme', label: 'Önizleme' },
  { id: 'run_monitor', label: 'Run Monitor' },
  { id: 'owner_review', label: 'Owner Review' },
];

export default function UygulamaAtolyesi() {
  const [tab, setTab] = useState(TABS[0]?.id || '');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ajanlar</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Hammer className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" /> Uygulama Atölyesi</h1>
        <p className="text-sm text-muted-foreground mt-1">Prompttan küçük uygulama ve prototip brief üret</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <Hammer className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Uygulama Atölyesi modülü hazırlanıyor</p>
      </div>
    </div>
  );
}
