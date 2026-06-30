import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Type, FileText, Scale, Music2, Heart, CheckCircle2 } from 'lucide-react';

type TabId = 'taslaklar' | 'ab' | 'elo' | 'ritim' | 'duygu' | 'final';
const TABS: { id: TabId; label: string }[] = [
  { id: 'taslaklar', label: 'Taslaklar' }, { id: 'ab', label: 'A/B' },
  { id: 'elo', label: 'ELO' }, { id: 'ritim', label: 'Ritim' },
  { id: 'duygu', label: 'Duygu' }, { id: 'final', label: 'Final' },
];

export default function LyricsLab() {
  const [tab, setTab] = useState<TabId>('taslaklar');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stüdyo</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Type className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" /> Lyrics Lab</h1>
        <p className="text-sm text-muted-foreground mt-1">Lirik varyasyonlarını kıyasla ve seç</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6">
        {tab === 'ab' ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-serif font-semibold text-xs mb-2 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-[hsl(var(--mihenk-red)/0.1)] text-[hsl(var(--mihenk-red))] flex items-center justify-center text-[10px] font-bold">A</span> Versiyon A</h4>
              <p className="text-sm text-muted-foreground italic leading-relaxed">Dağların ardında bir ses var<br/>Rüzgâr taşır onu uzaklara</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-serif font-semibold text-xs mb-2 flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-[hsl(var(--mihenk-blue)/0.1)] text-[hsl(var(--mihenk-blue))] flex items-center justify-center text-[10px] font-bold">B</span> Versiyon B</h4>
              <p className="text-sm text-muted-foreground italic leading-relaxed">Dağlar aşırı bir nefes var<br/>Yel alır götürür bilinmeze</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Type className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{tab === 'taslaklar' ? 'Söz taslakları burada listelenir' : tab === 'elo' ? 'ELO puanlaması ile en iyi versiyon seçimi' : tab === 'ritim' ? 'Hece ve ritim analizi' : tab === 'duygu' ? 'Duygu haritası ve ton analizi' : 'Final onaylı sözler'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
