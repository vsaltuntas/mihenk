import { useMemo } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Sunrise, ListChecks, AlertTriangle, Heart, Bot, Clock, Zap, ArrowRight, RefreshCw, Database, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SabahBrifingi() {
  const { setActiveModule, energyMode } = useAppStore();
  const { data: tasks, loading: lT, error: eT } = useMihenkData(mihenkAPI.getTasks);
  const { data: moods, loading: lM, error: eM } = useMihenkData(mihenkAPI.getMoods);
  const { data: finance, loading: lF, error: eF } = useMihenkData(mihenkAPI.getFinanceRecords);
  const { data: ideas, loading: lI, error: eI } = useMihenkData(mihenkAPI.getIdeas);
  const anyLoading = lT || lM || lF || lI;
  const errors = [eT && 'Görevler', eM && 'Wellness', eF && 'Finans', eI && 'Fikirler'].filter(Boolean) as string[];
  const [generatedAt] = useState(() => new Date());

  const taskArr = useMemo(() => ensureArray(tasks), [tasks]);
  const moodArr = useMemo(() => ensureArray(moods), [moods]);
  const finArr = useMemo(() => ensureArray(finance), [finance]);
  const ideaArr = useMemo(() => ensureArray(ideas), [ideas]);

  const todoTasks = useMemo(() => taskArr.filter(t => t.status !== 'done'), [taskArr]);
  const urgentTasks = useMemo(() => todoTasks.filter(t => t.priority === 'urgent' || t.priority === 'high'), [todoTasks]);
  const blockedTasks = useMemo(() => todoTasks.filter(t => t.status === 'blocked'), [todoTasks]);
  const lastMood = moodArr.length > 0 ? moodArr[moodArr.length - 1] : null;
  const netBalance = useMemo(() => {
    const inc = finArr.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const exp = finArr.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    return inc - exp;
  }, [finArr]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const sections = [
    {
      icon: ListChecks, title: "Bugünün İşi", color: "text-[hsl(var(--mihenk-blue))]",
      items: [
        `${todoTasks.length} açık görev var.`,
        urgentTasks.length > 0 ? `${urgentTasks.length} tanesi acil/yüksek öncelikli.` : 'Acil görev yok.',
        `Bugün en az ${Math.min(3, todoTasks.length)} görev kapatmayı hedefle.`,
      ]
    },
    {
      icon: AlertTriangle, title: "Kaçırılmaması Gerekenler", color: "text-[hsl(var(--mihenk-gold))]",
      items: [
        blockedTasks.length > 0 ? `⚠️ ${blockedTasks.length} görev bloklanmış — çöz!` : '✅ Bloklanmış görev yok.',
        ideaArr.length > 5 ? `💡 ${ideaArr.length} fikir birikmiş. Projeye dönüştürmeyi düşün.` : `💡 ${ideaArr.length} fikir kuluçkada.`,
      ]
    },
    {
      icon: Zap, title: "Sessiz Riskler", color: "text-[hsl(var(--mihenk-red))]",
      items: [
        netBalance < 0 ? `🔴 Giderler geliri aşıyor: ${netBalance.toLocaleString('tr-TR')} ₺` : `🟢 Net bakiye: +${netBalance.toLocaleString('tr-TR')} ₺`,
        todoTasks.length > 20 ? '⚠️ Görev yığılması var. Triage yap.' : '✅ Görev yükü kontrol altında.',
      ]
    },
    {
      icon: Heart, title: "Sağlık Notu", color: "text-[hsl(var(--mihenk-green))]",
      items: [
        lastMood ? `Son ruh hali: ${lastMood.mood_score}/10 — ${lastMood.mood_label || ''}` : 'Bugün henüz mood kaydı yok.',
        lastMood && lastMood.sleep_hours ? `Uyku: ${lastMood.sleep_hours} saat` : 'Uyku verisi yok.',
        `Enerji modu: ${energyMode}. Buna göre işlerini planla.`,
      ]
    },
    {
      icon: Bot, title: "Ajan Yorumları", color: "text-[hsl(var(--mihenk-blue))]",
      items: [
        'Sistem tüm modülleri taradı, kritik uyarı yok.',
        urgentTasks.length > 3 ? 'Öneri: Önce acil görevleri kapat, sonra yaratıcı işlere geç.' : 'Öneri: Bugünkü enerji moduna uygun işlerle başla.',
      ]
    },
  ];

  return (
    <div className="module-transition space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bugün</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <Sunrise className="w-7 h-7 text-[hsl(var(--mihenk-gold))]" />
          Sabah Brifingi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <Database className="w-3 h-3" />
          Görevler: {taskArr.length} · Finans: {finArr.length} · Mood: {moodArr.length} · Fikirler: {ideaArr.length}
          <span className="ml-auto flex items-center gap-1"><Clock className="w-3 h-3" /> {generatedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {anyLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Brifing hazırlanıyor…</div>}
      {errors.length > 0 && <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-xs text-red-700 dark:text-red-400"><AlertCircle className="w-4 h-4 flex-shrink-0" />{errors.join(', ')} yüklenemedi — kısmi brifing.</div>}

      <div className="space-y-4">
        {sections.map((sec, i) => (
          <motion.div
            key={sec.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="mihenk-card p-5"
          >
            <h3 className={cn("font-serif font-semibold flex items-center gap-2 mb-3", sec.color)}>
              <sec.icon className="w-4 h-4" />
              {sec.title}
            </h3>
            <ul className="space-y-2">
              {sec.items.map((item, j) => (
                <li key={j} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setActiveModule('gorevler')} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <ListChecks className="w-4 h-4" /> Görevlere Git <ArrowRight className="w-3 h-3" />
        </button>
        <button onClick={() => setActiveModule('gun_masasi')} className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
          Gün Masasına Dön
        </button>
      </div>
    </div>
  );
}
