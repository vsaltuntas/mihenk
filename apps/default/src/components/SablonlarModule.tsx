import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Copy, FolderKanban, FileText, CheckSquare, Mail, FileSignature, Wand2, Radio, BarChart3, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type TabId = 'proje' | 'not' | 'gorev' | 'mail' | 'sozlesme' | 'maestro' | 'yayin' | 'rapor';
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'proje', label: 'Proje', icon: FolderKanban },
  { id: 'not', label: 'Not', icon: FileText },
  { id: 'gorev', label: 'Görev', icon: CheckSquare },
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'sozlesme', label: 'Sözleşme', icon: FileSignature },
  { id: 'maestro', label: 'Maestro', icon: Wand2 },
  { id: 'yayin', label: 'Yayın', icon: Radio },
  { id: 'rapor', label: 'Rapor', icon: BarChart3 },
];

const SAMPLE_TEMPLATES: Record<string, { title: string; desc: string }[]> = {
  proje: [
    { title: 'Müzik Release Projesi', desc: 'Track listesi, metadata, dağıtım, tanıtım, timeline' },
    { title: 'YouTube Serisi', desc: 'Video planlama, senaryo, çekim, montaj, yayın' },
    { title: 'Genel Proje', desc: 'Boş proje iskeleti — spec, fazlar, görevler' },
  ],
  not: [
    { title: 'Araştırma Notu', desc: 'Kaynak, bulgular, sonuç formatı' },
    { title: 'Meeting Notu', desc: 'Gündem, kararlar, aksiyonlar' },
  ],
  gorev: [
    { title: 'Haftalık Sprint', desc: '5 günlük görev seti — öncelik + deadline' },
    { title: 'Release Checklist', desc: 'Metadata, mastering, dağıtım, tanıtım, sosyal medya' },
  ],
  mail: [
    { title: 'İş Teklifi Yanıtı', desc: 'Profesyonel teklif kabul/red şablonu' },
    { title: 'Follow-up Mail', desc: 'Takip maili — soft, medium, firm tonları' },
  ],
  sozlesme: [
    { title: 'Müzik Lisans Sözleşmesi', desc: 'Hak devri, royalty, süre, bölge maddeleri' },
  ],
  maestro: [
    { title: 'Türkü Fusion Prompt', desc: 'Geleneksel + modern sentez prompt şablonu' },
    { title: 'Ambient Production', desc: 'Atmospheric layered production prompt' },
  ],
  yayin: [
    { title: 'Single Release Plan', desc: 'Pre-save, teaser, release day, post-release' },
  ],
  rapor: [
    { title: 'Haftalık Özet', desc: 'Görev, finans, mood, üretim metrikleri' },
    { title: 'Aylık Yaşam Raporu', desc: 'Derinlemesine yaşam analizi' },
  ],
};

export default function SablonlarModule() {
  const [tab, setTab] = useState<TabId>('proje');
  const templates = SAMPLE_TEMPLATES[tab] || [];

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">İş Omurgası</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <Copy className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" />
          Şablonlar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Tekrarlayan iş ve üretim formatlarını tek yerde tut</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => { const I = t.icon; return (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
            <I className="w-3.5 h-3.5" />{t.label}
          </button>
        ); })}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {templates.map((t, i) => (
          <motion.div key={t.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="mihenk-card p-5 group hover:-translate-y-0.5 transition-all cursor-pointer">
            <h3 className="font-serif font-semibold text-sm mb-1">{t.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.desc}</p>
            <span className="text-[11px] text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Kullan <ArrowRight className="w-3 h-3" />
            </span>
          </motion.div>
        ))}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mihenk-card p-5 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
          <Plus className="w-6 h-6" />
          <span className="text-xs font-medium">Yeni Şablon</span>
        </motion.button>
      </div>
    </div>
  );
}
