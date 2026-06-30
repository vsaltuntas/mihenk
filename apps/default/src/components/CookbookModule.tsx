import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Music, Radio, Wallet, FileText, Bot, Settings, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type TabId = 'tumu' | 'uretim' | 'yayin' | 'finans' | 'not' | 'ajan' | 'sistem';
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'tumu', label: 'Tüm Tarifler', icon: BookOpen }, { id: 'uretim', label: 'Üretim', icon: Music },
  { id: 'yayin', label: 'Yayın', icon: Radio }, { id: 'finans', label: 'Finans', icon: Wallet },
  { id: 'not', label: 'Not', icon: FileText }, { id: 'ajan', label: 'Ajan', icon: Bot },
  { id: 'sistem', label: 'Sistem', icon: Settings },
];

const RECIPES = [
  { title: 'Yeni Single Nasıl Yayınlanır', category: 'yayin', steps: 8, time: '2 hafta' },
  { title: 'Maestro ile Türkü Fusion Üretimi', category: 'uretim', steps: 12, time: '3-5 saat' },
  { title: 'Aylık Finans Triage', category: 'finans', steps: 6, time: '45 dk' },
  { title: 'Araştırma Notu Yazma Protokolü', category: 'not', steps: 5, time: '30 dk' },
  { title: 'Yeni Ajan Eğitimi', category: 'ajan', steps: 7, time: '1 saat' },
  { title: 'Haftalık Sistem Sağlık Kontrolü', category: 'sistem', steps: 4, time: '15 dk' },
];

export default function CookbookModule() {
  const [tab, setTab] = useState<TabId>('tumu');
  const filtered = tab === 'tumu' ? RECIPES : RECIPES.filter(r => r.category === tab);

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bilgi ve Hafıza</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><BookOpen className="w-6 h-6 text-[hsl(var(--mihenk-green))]" /> Cookbook</h1>
        <p className="text-sm text-muted-foreground mt-1">İş tarifleri ve playbook arşivi</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => { const I = t.icon; return (<button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}><I className="w-3.5 h-3.5" />{t.label}</button>); })}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((r, i) => (
          <motion.div key={r.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="mihenk-card p-5 group hover:-translate-y-0.5 transition-all cursor-pointer">
            <h3 className="font-serif font-semibold text-sm mb-1">{r.title}</h3>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>{r.steps} adım</span><span>~{r.time}</span>
            </div>
            <span className="text-[11px] text-primary font-medium flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Başla <ArrowRight className="w-3 h-3" /></span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
