import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LockKeyhole } from 'lucide-react';

const TABS = [
  { id: 'hassas_cikarimlar', label: 'Hassas Çıkarımlar' },
  { id: 'finans_ekleri', label: 'Finans Ekleri' },
  { id: 'ucuncu_kisi', label: 'Üçüncü Kişi' },
  { id: 'acimasizlik', label: 'Acımasızlık' },
  { id: 'ertelenenler', label: 'Ertelenenler' },
];

export default function KapaliOda() {
  const [tab, setTab] = useState(TABS[0]?.id || '');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Maden</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><LockKeyhole className="w-6 h-6 text-[hsl(var(--mihenk-red))]" /> Kapalı Oda</h1>
        <p className="text-sm text-muted-foreground mt-1">Hassas bilgileri ayrı tut</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <LockKeyhole className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Kapalı Oda hazırlanıyor</p>
      </div>
    </div>
  );
}
