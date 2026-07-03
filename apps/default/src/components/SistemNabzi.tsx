import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { HeartPulse, Database, CheckCircle, AlertTriangle, XCircle, Shield, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Download } from 'lucide-react';
import { PROJECT_IDS } from '@/lib/mihenk-data';
import { generateMihenkExport, downloadJson } from '@/lib/mihenk-export';

const API = '/api/taskade';
interface PH { projectId: string; mod: string; total: number; hasF: boolean; filled: number; empty: number; malformed: number; rate: number; rels: number; probs: string[]; st: 'healthy'|'warning'|'error'; }
const REG = [
  { id: PROJECT_IDS.gorevler, m: 'Projeler & Görevler', i: '📋' },
  { id: PROJECT_IDS.finans, m: 'Finans İşlemleri', i: '💰' },
  { id: PROJECT_IDS.notlar, m: 'Notlar', i: '📝' },
  { id: PROJECT_IDS.kisiler, m: 'Kişiler / CRM', i: '👥' },
  { id: PROJECT_IDS.sanatcilar, m: 'Katalog — Sanatçılar', i: '🎵' },
  { id: PROJECT_IDS.albumler, m: 'Katalog — Albüm & Track', i: '💿' },
  { id: PROJECT_IDS.takvim, m: 'Takvim Etkinlikleri', i: '📅' },
  { id: PROJECT_IDS.wellness, m: 'Wellness & Mood', i: '❤️' },
  { id: PROJECT_IDS.gamification, m: 'Gamification State', i: '🎮' },
];
async function auditP(pid: string): Promise<PH> {
  const r = REG.find(p => p.id === pid)!;
  try {
    const res = await axios.get(`${API}/projects/${pid}/nodes`);
    const ns: any[] = res.data?.payload?.nodes ?? [];
    const hasF = ns.length === 0 || ns.some((n: any) => n.fieldValues?.['/attributes/@mhkid'] !== undefined);
    let filled = 0, empty = 0, malformed = 0, rels = 0; const probs: string[] = [];
    const VALID_RE = /^mihenk_[a-z]+_/;
    for (const n of ns) {
      const mhk = n.fieldValues?.['/attributes/@mhkid'];
      const t = (n.fieldValues?.['/text'] as string) || '(başlıksız)';
      if (mhk && typeof mhk === 'string' && mhk.trim().length > 0) {
        if (VALID_RE.test(mhk)) { filled++; } else { malformed++; probs.push(`"${t}" — bozuk format: ${mhk}`); }
      } else { empty++; if (ns.length > 0) probs.push(`"${t}" — @mhkid eksik`); }
      if (n.fieldValues?.['/attributes/@tartid']) rels++;
    }
    const rate = ns.length > 0 ? Math.round((filled / ns.length) * 100) : 100;
    const st: PH['st'] = ns.length === 0 ? 'warning' : (rate === 100 && malformed === 0) ? 'healthy' : (rate >= 50 && malformed === 0) ? 'warning' : 'error';
    return { projectId: pid, mod: r.m, total: ns.length, hasF, filled, empty, malformed, rate, rels, probs: probs.slice(0, 8), st };
  } catch { return { projectId: pid, mod: r.m, total: 0, hasF: false, filled: 0, empty: 0, malformed: 0, rate: 0, rels: 0, probs: ['API hatası'], st: 'error' }; }
}
const SI = ({ s }: { s: PH['st'] }) => s === 'healthy' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : s === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <XCircle className="w-4 h-4 text-red-500" />;

export default function SistemNabzi() {
  const [results, setResults] = useState<PH[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastT, setLastT] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<{ time: string; count: number } | null>(null);
  const [exporting, setExporting] = useState(false);
  const run = async () => { setLoading(true); const all = await Promise.all(REG.map(p => auditP(p.id))); setResults(all); setLastT(new Date().toLocaleString('tr-TR')); setLoading(false); };
  useEffect(() => { run(); }, []);
  const sm = useMemo(() => { const t = results.reduce((s, r) => s + r.total, 0); const f = results.reduce((s, r) => s + r.filled, 0); const rl = results.reduce((s, r) => s + r.rels, 0); const h = results.filter(r => r.st === 'healthy').length; return { t, f, rl, h, rate: t > 0 ? Math.round((f / t) * 100) : 0 }; }, [results]);
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sistem</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><HeartPulse className="w-6 h-6 text-[hsl(var(--mihenk-green))]" /> MİHENK Veri Sağlığı</h1>
        <p className="text-sm text-muted-foreground mt-1">Tüm Taskade projelerinin @mhkid kapsamı, ilişki bütünlüğü ve veri kalitesi</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="mihenk-card p-4 text-center"><Database className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--mihenk-blue))]" /><p className="text-2xl font-bold font-serif">{loading ? '…' : sm.t}</p><p className="text-[10px] text-muted-foreground">Toplam Kayıt</p></div>
        <div className="mihenk-card p-4 text-center"><Shield className="w-5 h-5 mx-auto mb-1 text-emerald-500" /><p className="text-2xl font-bold font-serif">{loading ? '…' : `${sm.rate}%`}</p><p className="text-[10px] text-muted-foreground">@mhkid Kapsam</p></div>
        <div className="mihenk-card p-4 text-center"><CheckCircle className="w-5 h-5 mx-auto mb-1 text-[hsl(var(--mihenk-gold))]" /><p className="text-2xl font-bold font-serif">{loading ? '…' : sm.rl}</p><p className="text-[10px] text-muted-foreground">İlişki Sayısı</p></div>
        <div className="mihenk-card p-4 text-center">{sm.h === results.length ? <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-amber-500" />}<p className="text-2xl font-bold font-serif">{loading ? '…' : `${sm.h}/${results.length}`}</p><p className="text-[10px] text-muted-foreground">Sağlıklı Proje</p></div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={run} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-50"><RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />{loading ? 'Taranıyor…' : 'Yeniden Tara'}</button>
        <button onClick={async () => { setExporting(true); const exp = await generateMihenkExport(); const ts = new Date().toISOString().slice(0,10); const totalRecs = exp.modules.reduce((s: number, m: any) => s + m.records.length, 0); downloadJson(exp, `mihenk-export-${ts}.json`); setLastExport({ time: new Date().toLocaleString('tr-TR'), count: totalRecs }); setExporting(false); }} disabled={exporting} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition disabled:opacity-50"><Download className={cn("w-3.5 h-3.5", exporting && "animate-pulse")} />{exporting ? 'Hazırlanıyor…' : 'JSON Export (Manuel)'}</button>
        {lastT && <span className="text-[10px] text-muted-foreground">Son tarama: {lastT}</span>}
      </div>
      <div className="mihenk-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-border/50 bg-muted/30"><th className="text-left px-4 py-3 font-medium text-muted-foreground">Proje</th><th className="text-center px-3 py-3 font-medium text-muted-foreground">Kayıt</th><th className="text-center px-3 py-3 font-medium text-muted-foreground">@mhkid</th><th className="text-center px-3 py-3 font-medium text-muted-foreground">Doluluk</th><th className="text-center px-3 py-3 font-medium text-muted-foreground">Eksik</th><th className="text-center px-3 py-3 font-medium text-muted-foreground">Bozuk</th><th className="text-center px-3 py-3 font-medium text-muted-foreground">İlişki</th><th className="text-center px-3 py-3 font-medium text-muted-foreground">Durum</th></tr></thead><tbody>{loading ? <tr><td colSpan={8} className="text-center py-8 text-muted-foreground"><RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin opacity-40" />Taranıyor…</td></tr> : results.map(r => { const rg = REG.find(p => p.id === r.projectId); return (<tr key={r.projectId} className="border-b border-border/20 hover:bg-muted/20 transition-colors"><td className="px-4 py-3"><div className="flex items-center gap-2"><span>{rg?.i}</span><div><p className="font-medium">{r.mod}</p><p className="text-[10px] text-muted-foreground font-mono">{r.projectId}</p></div></div></td><td className="text-center px-3 py-3 font-mono">{r.total}</td><td className="text-center px-3 py-3">{r.hasF ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-red-500 mx-auto" />}</td><td className="text-center px-3 py-3"><div className="flex items-center gap-1.5 justify-center"><div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden"><div className={cn("h-full rounded-full", r.rate === 100 ? "bg-emerald-500" : r.rate >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${r.rate}%` }} /></div><span className="font-mono text-[10px]">{r.rate}%</span></div></td><td className="text-center px-3 py-3 font-mono">{r.empty > 0 ? <span className="text-amber-500">{r.empty}</span> : <span className="text-muted-foreground">0</span>}</td><td className="text-center px-3 py-3 font-mono">{r.malformed > 0 ? <span className="text-red-500">{r.malformed}</span> : <span className="text-muted-foreground">0</span>}</td><td className="text-center px-3 py-3 font-mono">{r.rels}</td><td className="text-center px-3 py-3"><SI s={r.st} /></td></tr>); })}</tbody></table></div></div>
      {!loading && results.some(r => r.probs.length > 0) && <div className="mihenk-card p-4"><h3 className="font-serif font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Problemli Kayıtlar</h3><div className="space-y-2">{results.filter(r => r.probs.length > 0).map(r => <div key={r.projectId} className="bg-muted/30 rounded-lg p-3"><p className="text-xs font-medium mb-1.5">{REG.find(p => p.id === r.projectId)?.i} {r.mod}</p>{r.probs.map((p, i) => <p key={i} className="text-[11px] text-muted-foreground ml-4">• {p}</p>)}</div>)}</div></div>}
      <div className="mihenk-card p-4 bg-muted/20"><h3 className="font-serif font-semibold text-xs mb-2">📡 Veri Kaynağı & Backup</h3><div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground"><div><span className="font-medium text-foreground">Aktif Kaynak:</span> Taskade API</div><div><span className="font-medium text-foreground">Schema:</span> MİHENK v1.0</div><div><span className="font-medium text-foreground">ID Formatı:</span> mihenk_&#123;module&#125;_&#123;id&#125;</div><div><span className="font-medium text-foreground">Otomatik Backup:</span> Nightly 03:00 İstanbul (Markdown)</div><div><span className="font-medium text-foreground">Manuel JSON Export:</span> Buton ile indir</div><div>{lastExport ? <><span className="font-medium text-foreground">Son JSON Export:</span> {lastExport.time} ({lastExport.count} kayıt)</> : <><span className="font-medium text-foreground">Son JSON Export:</span> <span className="text-amber-500">henüz yapılmadı</span></>}</div></div></div>
    </div>
  );
}
