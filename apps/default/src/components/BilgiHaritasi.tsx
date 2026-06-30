import { useMemo, useState } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  GitBranch, AlertTriangle, Database,
  RefreshCw, AlertCircle, FileText, Lightbulb,
  ArrowRight, Info,
} from 'lucide-react';
import { motion } from 'framer-motion';

type TabId = 'graph' | 'kumeler' | 'iliskiler' | 'yetim';
const TABS: { id: TabId; label: string }[] = [
  { id: 'graph', label: 'Graph' },
  { id: 'kumeler', label: 'Kümeler' },
  { id: 'iliskiler', label: 'İlişkiler' },
  { id: 'yetim', label: 'Yetim Düğümler' },
];

export default function BilgiHaritasi() {
  const [tab, setTab] = useState<TabId>('graph');
  const { setActiveModule } = useAppStore();
  const { data: notes, loading: lN, error: eN } = useMihenkData(mihenkAPI.getNotes);
  const { data: ideas, loading: lI, error: eI } = useMihenkData(mihenkAPI.getIdeas);
  const { data: projects, loading: lP, error: eP } = useMihenkData(mihenkAPI.getProjects);
  const anyLoading = lN || lI || lP;
  const errors = [eN && 'Notlar', eI && 'Fikirler', eP && 'Projeler'].filter(Boolean) as string[];
  const [lastRefresh] = useState(() => new Date());

  const noteArr = useMemo(() => ensureArray(notes), [notes]);
  const ideaArr = useMemo(() => ensureArray(ideas), [ideas]);
  const projArr = useMemo(() => ensureArray(projects), [projects]);

  const nodes = useMemo(() => {
    const all: { id: string; label: string; type: 'Not' | 'Fikir' | 'Proje'; mod: string }[] = [];
    noteArr.forEach(n => all.push({ id: `n-${n.id}`, label: n.title, type: 'Not', mod: 'notlar' }));
    ideaArr.forEach(i => all.push({ id: `i-${i.id}`, label: i.title, type: 'Fikir', mod: 'fikirler' }));
    projArr.forEach(p => all.push({ id: `p-${p.id}`, label: p.name, type: 'Proje', mod: 'projeler' }));
    return all;
  }, [noteArr, ideaArr, projArr]);

  const clusters = useMemo(() => [
    { type: 'Not' as const, count: noteArr.length, color: 'bg-[hsl(var(--mihenk-blue))]' },
    { type: 'Fikir' as const, count: ideaArr.length, color: 'bg-[hsl(var(--mihenk-gold))]' },
    { type: 'Proje' as const, count: projArr.length, color: 'bg-[hsl(var(--mihenk-red))]' },
  ], [noteArr, ideaArr, projArr]);

  const orphans = useMemo(() => nodes.filter(n => n.type !== 'Proje'), [nodes]);
  const isEmpty = nodes.length === 0 && !anyLoading;

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bilgi ve Hafıza</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" /> Bilgi Haritası
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Not, fikir ve proje ilişkilerini keşfet</p>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <Database className="w-3 h-3" />
          Not: {noteArr.length} · Fikir: {ideaArr.length} · Proje: {projArr.length} · Toplam: {nodes.length}
          <span className="ml-auto flex items-center gap-1">
            <RefreshCw className={cn("w-3 h-3", anyLoading && "animate-spin")} />
            {lastRefresh.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {anyLoading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Düğümler yükleniyor…</div>}
      {errors.length > 0 && <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-xs text-red-700 dark:text-red-400"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.join(', ')} yüklenemedi.</div>}

      {isEmpty && (
        <div className="mihenk-card p-12 text-center">
          <GitBranch className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="font-serif font-semibold text-lg mb-1">Henüz Düğüm Yok</h3>
          <p className="text-sm text-muted-foreground">Not, fikir veya proje ekledikçe harita oluşacak.</p>
        </div>
      )}

      {!isEmpty && (<>
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>
          ))}
        </div>

        {tab === 'graph' && (
          <div className="mihenk-card p-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 mb-4">
              <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">GRAPH_PENDING</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Gerçek graph engine henüz entegre değil. Aşağıda gerçek düğüm listesi gösterilmektedir. İlişki kenarları gelecek sürümde eklenecek.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              {clusters.map(c => <div key={c.type} className="flex items-center gap-2"><div className={cn("w-3 h-3 rounded-full", c.color)} /><span className="text-[10px]">{c.type} ({c.count})</span></div>)}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
              {nodes.slice(0, 50).map((node, i) => (
                <motion.button key={node.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }} onClick={() => setActiveModule(node.mod as any)} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left group">
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", node.type === 'Not' ? "bg-[hsl(var(--mihenk-blue))]" : node.type === 'Fikir' ? "bg-[hsl(var(--mihenk-gold))]" : "bg-[hsl(var(--mihenk-red))]")} />
                  <span className="text-xs truncate flex-1">{node.label}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full shrink-0", node.type === 'Not' ? "badge-blue" : node.type === 'Fikir' ? "badge-gold" : "badge-red")}>{node.type}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {tab === 'kumeler' && (
          <div className="space-y-3">
            {clusters.map(c => (
              <div key={c.type} className="mihenk-card p-4">
                <div className="flex items-center gap-2 mb-2"><div className={cn("w-3 h-3 rounded-full", c.color)} /><h4 className="font-serif font-semibold text-sm">{c.type} Kümesi</h4><span className="text-[10px] text-muted-foreground ml-auto">{c.count} düğüm</span></div>
                <div className="space-y-1">
                  {nodes.filter(n => n.type === c.type).slice(0, 10).map(n => (
                    <button key={n.id} onClick={() => setActiveModule(n.mod as any)} className="flex items-center gap-2 w-full p-1.5 rounded hover:bg-muted/50 text-xs text-left group">
                      <span className="truncate flex-1">{n.label}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition" />
                    </button>
                  ))}
                  {c.count === 0 && <p className="text-xs text-muted-foreground italic py-2">Bu kümede düğüm yok</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'iliskiler' && (
          <div className="mihenk-card p-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 mb-4">
              <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">GRAPH_PENDING</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Düğümler arası ilişki kenarları henüz hesaplanmıyor. NLP bazlı benzerlik analizi gelecek sürümde.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Mevcut düğüm sayısı: {nodes.length}</p>
          </div>
        )}

        {tab === 'yetim' && (
          <div className="mihenk-card p-4">
            <h4 className="font-serif font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[hsl(var(--mihenk-gold))]" /> Bağlantısız Düğümler</h4>
            <p className="text-[10px] text-muted-foreground mb-3">Graph engine olmadığı için tüm not/fikir düğümleri şu an "yetim" kabul edilir.</p>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {orphans.slice(0, 30).map(n => (
                <button key={n.id} onClick={() => setActiveModule(n.mod as any)} className="flex items-center gap-2 w-full p-2 rounded hover:bg-muted/50 text-xs text-left group">
                  {n.type === 'Not' ? <FileText className="w-3 h-3 text-[hsl(var(--mihenk-blue))]" /> : <Lightbulb className="w-3 h-3 text-[hsl(var(--mihenk-gold))]" />}
                  <span className="truncate flex-1">{n.label}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition" />
                </button>
              ))}
              {orphans.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">Yetim düğüm yok</p>}
            </div>
          </div>
        )}
      </>)}
    </div>
  );
}
