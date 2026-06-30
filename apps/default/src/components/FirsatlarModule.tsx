import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Target, GitPullRequest, Users, FileText, Trophy, XCircle } from 'lucide-react';

type TabId = 'pipeline' | 'lead' | 'gorusme' | 'teklif' | 'kazandi' | 'kaybetti';
const TABS: { id: TabId; label: string }[] = [
  { id: 'pipeline', label: 'Pipeline' }, { id: 'lead', label: 'Lead' }, { id: 'gorusme', label: 'Görüşme' },
  { id: 'teklif', label: 'Teklif' }, { id: 'kazandi', label: 'Kazandı' }, { id: 'kaybetti', label: 'Kaybetti' },
];

export default function FirsatlarModule() {
  const [tab, setTab] = useState<TabId>('pipeline');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">İnsan ve İş</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Target className="w-6 h-6 text-[hsl(var(--mihenk-green))]" /> Fırsatlar</h1>
        <p className="text-sm text-muted-foreground mt-1">İş, teklif, lead ve büyüme fırsatları</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Fırsat pipeline hazırlanıyor</p>
      </div>
    </div>
  );
}
