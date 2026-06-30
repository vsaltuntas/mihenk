import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Columns, Plus, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';

type TabId = 'alternatifler' | 'kriterler' | 'puanlama' | 'risk' | 'sonuc';
const TABS: { id: TabId; label: string }[] = [
  { id: 'alternatifler', label: 'Alternatifler' }, { id: 'kriterler', label: 'Kriterler' },
  { id: 'puanlama', label: 'Puanlama' }, { id: 'risk', label: 'Risk' }, { id: 'sonuc', label: 'Sonuç' },
];

export default function KarsilastirModule() {
  const [tab, setTab] = useState<TabId>('alternatifler');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bilgi ve Hafıza</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Columns className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" /> Karşılaştır</h1>
        <p className="text-sm text-muted-foreground mt-1">Alternatifleri yan yana koyarak karar ver</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6">
        <div className="text-center py-8">
          <Columns className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-serif font-semibold mb-1">Yeni Karşılaştırma</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">Alternatifleri, kriterleri ve riskleri yan yana koy. Net bir karar çıkar.</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Karşılaştırma Oluştur</button>
        </div>
      </div>
    </div>
  );
}
