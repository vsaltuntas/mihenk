import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PenTool, FileText, Layers, Search, GitBranch, Download, Sparkles } from 'lucide-react';

type TabId = 'editor' | 'konsept' | 'corpus' | 'analiz' | 'varyasyon' | 'export';
const TABS: { id: TabId; label: string }[] = [
  { id: 'editor', label: 'Editor' }, { id: 'konsept', label: 'Konsept' },
  { id: 'corpus', label: 'Corpus' }, { id: 'analiz', label: 'Analiz' },
  { id: 'varyasyon', label: 'Varyasyon' }, { id: 'export', label: 'Export' },
];

export default function VerseLab() {
  const [tab, setTab] = useState<TabId>('editor');
  const [text, setText] = useState('');

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stüdyo</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><PenTool className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" /> VerseLab</h1>
        <p className="text-sm text-muted-foreground mt-1">Lirik, şiir, söz ve konsept üretim laboratuvarı</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      {tab === 'editor' ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 mihenk-card p-4">
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Sözlerini yaz...&#10;&#10;Her satır bir verse, her boşluk bir nefes." rows={16} className="w-full text-sm bg-transparent outline-none resize-none leading-relaxed font-serif" />
          </div>
          <div className="space-y-3">
            <div className="mihenk-card p-4">
              <h4 className="font-serif font-semibold text-xs mb-2">Analiz</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Satır</span><span>{text.split('\n').filter(Boolean).length}</span></div>
                <div className="flex justify-between"><span>Kelime</span><span>{text.split(/\s+/).filter(Boolean).length}</span></div>
                <div className="flex justify-between"><span>Karakter</span><span>{text.length}</span></div>
              </div>
            </div>
            <div className="mihenk-card p-4">
              <h4 className="font-serif font-semibold text-xs mb-2">Araçlar</h4>
              <div className="space-y-1.5">
                <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-muted/60 transition-colors"><Sparkles className="w-3.5 h-3.5" /> AI Kafiye Öner</button>
                <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-muted/60 transition-colors"><GitBranch className="w-3.5 h-3.5" /> Varyasyon Üret</button>
                <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-muted/60 transition-colors"><Search className="w-3.5 h-3.5" /> Corpus Ara</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mihenk-card p-8 text-center">
          <Layers className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{tab === 'konsept' ? 'Konsept notları ve tema haritası' : tab === 'corpus' ? 'Referans söz arşivi' : tab === 'analiz' ? 'Metrik, kafiye, ritim analizi' : tab === 'varyasyon' ? 'A/B varyasyonları' : 'Export formatları'}</p>
        </div>
      )}
    </div>
  );
}
