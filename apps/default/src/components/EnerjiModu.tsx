import { useAppStore, ENERGY_MODES, type EnergyMode } from '@/lib/store';
import { cn } from '@/lib/utils';
import { BatteryCharging, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const MODE_DETAILS: Record<EnergyMode, { desc: string; suggest: string[]; bg: string }> = {
  yaratici: {
    desc: 'Yaratıcı modda fikirler akıyor. Müzik üretimi, yazı, tasarım ve yeni projeler için ideal.',
    suggest: ['Maestro ile yeni müzik üret', 'VerseLab\'da söz yaz', 'Fikirlerden proje oluştur', 'Notlara yeni düşünceler ekle'],
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10',
  },
  operasyonel: {
    desc: 'Operasyonel modda iş yapma kapasitesi yüksek. Görevleri kapat, projeleri ilerlet.',
    suggest: ['Acil görevleri tamamla', 'Proje fazlarını güncelle', 'Finans kayıtlarını gir', 'Mail inbox temizle'],
    bg: 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10',
  },
  dusunsel: {
    desc: 'Düşünsel modda derinleş. Araştırma, analiz, strateji ve planlama için ideal.',
    suggest: ['Derin araştırma başlat', 'Bilgi haritasını incele', 'Karşılaştırma tablosu oluştur', 'Çelişki motorunu çalıştır'],
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10',
  },
  sessiz: {
    desc: 'Sessiz modda dikkat dağıtıcılar minimum. Odaklanmış derin çalışma.',
    suggest: ['ZenZone ile odaklan', 'Tek bir projeye odaklan', 'Bildirimleri kapat', 'Focus block başlat'],
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/20 dark:to-gray-900/10',
  },
  dinlenme: {
    desc: 'Dinlenme modunda sistemi gözlemle. Müdahale minimum, sadece kritik uyarılar.',
    suggest: ['Wellness check-in yap', 'Mood kaydet', 'Haftalık yaşam raporunu oku', 'Türkü arşivine göz at'],
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10',
  },
};

export default function EnerjiModuModule() {
  const { energyMode, setEnergyMode } = useAppStore();
  const current = ENERGY_MODES.find(m => m.id === energyMode)!;
  const details = MODE_DETAILS[energyMode];

  return (
    <div className="module-transition space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bugün</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <BatteryCharging className="w-6 h-6" />
          Enerji Modu
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Ekranları ve önerileri kapasite moduna göre değiştir</p>
      </div>

      <div className="grid sm:grid-cols-5 gap-3">
        {ENERGY_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => setEnergyMode(mode.id)}
            className={cn(
              "mihenk-card p-4 text-center transition-all",
              energyMode === mode.id
                ? "ring-2 ring-primary shadow-md -translate-y-1"
                : "opacity-60 hover:opacity-100"
            )}
          >
            <span className="text-2xl">{mode.icon}</span>
            <p className="text-xs font-semibold mt-2">{mode.label}</p>
          </button>
        ))}
      </div>

      <motion.div key={energyMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("mihenk-card p-6", details.bg)}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{current.icon}</span>
          <div>
            <h2 className="font-serif text-xl font-bold">{current.label} Mod</h2>
            <p className="text-sm text-muted-foreground">{details.desc}</p>
          </div>
        </div>
        <div>
          <h4 className="font-serif font-semibold text-sm mb-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-[hsl(var(--mihenk-gold))]" /> Önerilen Aksiyonlar
          </h4>
          <div className="grid sm:grid-cols-2 gap-2">
            {details.suggest.map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/60 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
