import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MonitorSpeaker, Play, Layers, FileText, Download, Upload, Activity } from 'lucide-react';

type TabId = 'jobs' | 'stem' | 'transkript' | 'output' | 'import' | 'worker';
const TABS: { id: TabId; label: string }[] = [
  { id: 'jobs', label: 'Jobs' }, { id: 'stem', label: 'Stem' }, { id: 'transkript', label: 'Transkript' },
  { id: 'output', label: 'Output Ref' }, { id: 'import', label: 'Import' }, { id: 'worker', label: 'Worker Durumu' },
];

export default function StudyomModule() {
  const [tab, setTab] = useState<TabId>('jobs');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stüdyo</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><MonitorSpeaker className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" /> Stüdyom</h1>
        <p className="text-sm text-muted-foreground mt-1">Fiziksel Mac/stüdyo worker ile ses işleri</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6">
        {tab === 'worker' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--mihenk-green)/0.06)]">
              <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--mihenk-green))]" />
              <div className="flex-1"><p className="text-sm font-medium">Mac Studio Worker</p><p className="text-[10px] text-muted-foreground">Çevrimiçi · Son sync: 2 dk önce</p></div>
              <Activity className="w-4 h-4 text-[hsl(var(--mihenk-green))]" />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MonitorSpeaker className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">{tab === 'jobs' ? 'Worker job kuyruğu' : tab === 'stem' ? 'Stem ayrıştırma sonuçları' : tab === 'transkript' ? 'Audio transkript çıktıları' : tab === 'output' ? 'Referans output dosyaları' : 'Audio import kuyruğu'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
