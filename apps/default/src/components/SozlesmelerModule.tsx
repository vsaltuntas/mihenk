import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FileSignature, CheckCircle2, RefreshCw, AlertTriangle, Users, List, File } from 'lucide-react';

type TabId = 'aktif' | 'yenileme' | 'riskli' | 'taraflar' | 'maddeler' | 'dosyalar';
const TABS: { id: TabId; label: string }[] = [
  { id: 'aktif', label: 'Aktif' }, { id: 'yenileme', label: 'Yenileme' }, { id: 'riskli', label: 'Riskli' },
  { id: 'taraflar', label: 'Taraflar' }, { id: 'maddeler', label: 'Maddeler' }, { id: 'dosyalar', label: 'Dosyalar' },
];

export default function SozlesmelerModule() {
  const [tab, setTab] = useState<TabId>('aktif');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">İnsan ve İş</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><FileSignature className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" /> Sözleşmeler</h1>
        <p className="text-sm text-muted-foreground mt-1">Hukuki ve finansal sözleşme takibi</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <FileSignature className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Sözleşme yönetimi hazırlanıyor</p>
      </div>
    </div>
  );
}
