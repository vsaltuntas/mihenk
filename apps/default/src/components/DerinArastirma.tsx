import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, FileText, Layers, Scale, FileCheck, Gavel } from 'lucide-react';

type TabId = 'brief' | 'kaynaklar' | 'bulgular' | 'karsit' | 'ozet' | 'karar';
const TABS: { id: TabId; label: string }[] = [
  { id: 'brief', label: 'Araştırma Briefi' }, { id: 'kaynaklar', label: 'Kaynaklar' },
  { id: 'bulgular', label: 'Bulgular' }, { id: 'karsit', label: 'Karşıt Kanıt' },
  { id: 'ozet', label: 'Özet' }, { id: 'karar', label: 'Karar' },
];

export default function DerinArastirma() {
  const [tab, setTab] = useState<TabId>('brief');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bilgi ve Hafıza</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Search className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" /> Derin Araştırma</h1>
        <p className="text-sm text-muted-foreground mt-1">Uzun kaynaklı araştırmaları sistemli yap</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6">
        {tab === 'brief' && (
          <div className="space-y-4">
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Araştırma Sorusu</label><textarea placeholder="Ne araştırıyorsun?" rows={3} className="w-full mt-2 p-3 text-sm bg-muted/30 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kapsam</label><textarea placeholder="Hangi kaynaklar, hangi zaman aralığı..." rows={2} className="w-full mt-2 p-3 text-sm bg-muted/30 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Araştırmayı Başlat</button>
          </div>
        )}
        {tab !== 'brief' && (
          <div className="text-center py-12 text-muted-foreground">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Önce bir araştırma briefi oluştur</p>
          </div>
        )}
      </div>
    </div>
  );
}
