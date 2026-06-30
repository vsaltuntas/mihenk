import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AudioWaveform, Upload, BarChart3, Music2, Key, Volume2, Layers, FileText } from 'lucide-react';

type TabId = 'upload' | 'waveform' | 'bpm' | 'key' | 'loudness' | 'stem' | 'rapor';
const TABS: { id: TabId; label: string }[] = [
  { id: 'upload', label: 'Upload' }, { id: 'waveform', label: 'Waveform' }, { id: 'bpm', label: 'BPM' },
  { id: 'key', label: 'Key' }, { id: 'loudness', label: 'Loudness' }, { id: 'stem', label: 'Stem' }, { id: 'rapor', label: 'Rapor' },
];

export default function SesAnaliz() {
  const [tab, setTab] = useState<TabId>('upload');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stüdyo</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><AudioWaveform className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" /> Ses Analiz</h1>
        <p className="text-sm text-muted-foreground mt-1">Audio teknik analizleri — BPM, Key, Loudness, Stem</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6">
        {tab === 'upload' ? (
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/30 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-serif font-semibold mb-1">Audio Dosyası Yükle</h3>
            <p className="text-xs text-muted-foreground">WAV, MP3, FLAC — maks 100 MB</p>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AudioWaveform className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Önce bir audio dosyası yükle</p>
          </div>
        )}
      </div>
    </div>
  );
}
