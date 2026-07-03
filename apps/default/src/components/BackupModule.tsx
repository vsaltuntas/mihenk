import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Database, Download, Clock, Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { generateMihenkExport, downloadJson } from '@/lib/mihenk-export';

const NIGHTLY_FLOW_ID = '01KV8K6SZ40BA3BHNEXHTZSR3H';
const NIGHTLY_PROJECT_ID = 'paPGvkBbBZiw9763';

export default function BackupModule() {
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<{ time: string; count: number } | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const exp = await generateMihenkExport();
      const ts = new Date().toISOString().slice(0, 10);
      const totalRecs = exp.modules.reduce((s: number, m: any) => s + m.records.length, 0);
      downloadJson(exp, `mihenk-export-${ts}.json`);
      setLastExport({ time: new Date().toLocaleString('tr-TR'), count: totalRecs });
    } catch { /* silent */ }
    finally { setExporting(false); }
  };

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sistem</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Database className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" /> Backup & Yedekleme</h1>
        <p className="text-sm text-muted-foreground mt-1">Otomatik ve manuel yedekleme merkezi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nightly Auto */}
        <div className="mihenk-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[hsl(var(--mihenk-blue))]" />
            <h3 className="font-serif font-semibold text-sm">Otomatik Nightly Backup</h3>
            <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">Aktif</span>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Zamanlama:</span><span className="font-medium text-foreground">Her gece 03:00 (İstanbul)</span></div>
            <div className="flex justify-between"><span>Format:</span><span className="font-medium text-foreground">Markdown</span></div>
            <div className="flex justify-between"><span>Kapsam:</span><span className="font-medium text-foreground">9 Taskade projesi</span></div>
            <div className="flex justify-between"><span>Hedef:</span><span className="font-medium text-foreground">Nightly Backups projesi</span></div>
            <div className="flex justify-between"><span>Otomasyon:</span><span className="font-mono text-[10px] text-foreground">{NIGHTLY_FLOW_ID.slice(0, 12)}…</span></div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-[10px]">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className="text-muted-foreground">Otomasyon aktif — Taskade schedule ile çalışıyor</span>
            </div>
          </div>
        </div>

        {/* Manual JSON Export */}
        <div className="mihenk-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[hsl(var(--mihenk-gold))]" />
            <h3 className="font-serif font-semibold text-sm">Manuel JSON Export</h3>
          </div>
          <p className="text-xs text-muted-foreground">Tüm MİHENK verilerini schema_version, module_id, field_map, records, relations ve audit_events içeren JSON formatında indir.</p>
          <button onClick={handleExport} disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-50">
            {exporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {exporting ? 'Hazırlanıyor…' : 'JSON Export İndir'}
          </button>
          {lastExport && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              Son export: {lastExport.time} ({lastExport.count} kayıt)
            </div>
          )}
        </div>
      </div>

      {/* Backup Strategy */}
      <div className="mihenk-card p-5">
        <h3 className="font-serif font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Yedekleme Stratejisi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <p className="font-medium">📋 Markdown (Otomatik)</p>
            <p className="text-muted-foreground">Nightly 03:00 — okunabilir format, hızlı kontrol</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <p className="font-medium">📦 JSON (Manuel)</p>
            <p className="text-muted-foreground">İsteğe bağlı — tam schema, import edilebilir</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <p className="font-medium">🔄 Taskade Native</p>
            <p className="text-muted-foreground">Platform seviyesi — Taskade altyapı yedekleri</p>
          </div>
        </div>
      </div>
    </div>
  );
}
