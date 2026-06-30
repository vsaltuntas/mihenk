import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

const TABS = [
  { id: 'kullanicilar', label: 'Kullanıcılar' },
  { id: 'roller', label: 'Roller' },
  { id: 'scope', label: 'Scope' },
  { id: 'oturumlar', label: 'Oturumlar' },
  { id: 'davetler', label: 'Davetler' },
  { id: 'audit', label: 'Audit' },
];

export default function ErisimModule() {
  const [tab, setTab] = useState(TABS[0]?.id || '');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sistem</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Lock className="w-6 h-6 text-[hsl(var(--mihenk-red))]" /> Erişim</h1>
        <p className="text-sm text-muted-foreground mt-1">Yetki, rol, oturum ve sahiplik kontrolü</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card p-6 text-center py-12 text-muted-foreground">
        <Lock className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Erişim hazırlanıyor</p>
      </div>
    </div>
  );
}
