import { useState, useEffect } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import type { MIHENKYoutubeChannel, MIHENKBatchManifest, MIHENKSyncLogRecord } from '@/lib/mihenk-data';
import { cn } from '@/lib/utils';
import {
  Youtube, Play, Eye, ThumbsUp, Users, Video, Search,
  AlertTriangle, Database, Key, ServerCrash, CheckCircle2, XCircle, Clock,
  DollarSign, BarChart3, TrendingUp, Activity, Radio, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types ─── */
type HealthStatus = 'ok' | 'pending' | 'error';
interface SourceCheck { label: string; status: HealthStatus; detail: string; icon: typeof Key; }
type YTTab = 'channels' | 'videos' | 'analytics';

/* ─── Provider Badge ─── */
function ProviderBadge({ status }: { status: string }) {
  const isStale = status === 'available_stale';
  const isReady = status === 'READY';
  const Icon = isReady ? CheckCircle2 : isStale ? Clock : Clock;
  const label = isReady ? 'READY' : isStale ? 'STALE' : status;
  const cls = isReady ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    : isStale ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', cls)}>
      <Icon className="w-3 h-3" />{label}
    </span>
  );
}

/* ─── Source Health Panel ─── */
function SourceHealthPanel({ checks }: { checks: SourceCheck[] }) {
  return (
    <div className="bg-card/50 rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <ServerCrash className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Kaynak Sağlık Durumu</h3>
      </div>
      <div className="space-y-2">
        {checks.map((c) => {
          const color = c.status === 'ok' ? 'text-green-500' : c.status === 'pending' ? 'text-amber-500' : 'text-red-500';
          const SIcon = c.status === 'ok' ? CheckCircle2 : c.status === 'pending' ? Clock : XCircle;
          return (
            <div key={c.label} className="flex items-start gap-3 bg-background/60 rounded-xl p-3 border border-border/50">
              <SIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <c.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{c.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{c.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Freshness Banner ─── */
function FreshnessBanner({ syncLog }: { syncLog: MIHENKSyncLogRecord | null }) {
  if (!syncLog) return null;
  const { freshness, summary } = syncLog;
  const isStale = freshness?.stale;
  return (
    <div className={cn('bg-gradient-to-br rounded-2xl border p-4 flex items-start gap-3',
      isStale ? 'from-amber-500/10 to-orange-500/5 border-amber-500/30' : 'from-green-500/10 to-emerald-500/5 border-green-500/30')}>
      <AlertTriangle className={cn('w-5 h-5 mt-0.5 flex-shrink-0', isStale ? 'text-amber-500' : 'text-green-500')} />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm">{isStale ? 'Veri Güncel Değil (STALE)' : 'Veriler Güncel'}</h3>
        <p className="text-[10px] text-muted-foreground mt-1">
          Son analitik: {freshness?.last_analytics_date || '—'} · Son video çekimi: {freshness?.last_video_fetch_at?.slice(0, 16) || '—'} · Revenue: ${summary?.revenue_sum?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}
        </p>
        {isStale && <p className="text-[10px] text-muted-foreground mt-0.5 italic">{freshness?.rule}</p>}
      </div>
    </div>
  );
}

/* ─── Batch Card ─── */
function BatchCard({ b, type }: { b: MIHENKBatchManifest; type: 'video' | 'daily' }) {
  const Icon = type === 'video' ? Video : DollarSign;
  const color = type === 'video' ? 'text-blue-500' : 'text-green-500';
  const borderC = type === 'video' ? 'border-blue-500/30' : 'border-green-500/30';
  return (
    <div className={cn('bg-card/50 rounded-xl border p-3', borderC)}>
      <div className="flex items-center gap-2">
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', type === 'video' ? 'bg-blue-500/10' : 'bg-green-500/10')}>
          <Icon className={cn('w-3.5 h-3.5', color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold">Batch #{b.batch} · {b.record_count} kayıt</p>
          <p className="text-[9px] text-muted-foreground">sha16: {b.sha16?.slice(0, 8)}</p>
        </div>
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">{b.status}</span>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function YouTubeEmptyState() {
  const checks: SourceCheck[] = [
    { label: 'YouTube Data API v3 Token', status: 'pending', detail: 'Space Settings → Secrets → "YOUTUBE_DATA_API_KEY" ekleyin. İleride OAuth2 planlanıyor.', icon: Key },
    { label: 'Taskade Project (YouTube DB)', status: 'pending', detail: 'Kanal/video verileri için Taskade project oluşturulmadı. Veri depolama katmanı eksik.', icon: Database },
    { label: 'API Getter Bağlantısı', status: 'pending', detail: 'getYouTubeChannels() ve getYouTubeVideos() boş array döndürüyor (stub).', icon: ServerCrash },
  ];
  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-center py-10 bg-gradient-to-br from-red-500/5 to-rose-500/5 rounded-2xl border border-dashed border-red-500/20">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Youtube className="w-8 h-8 text-red-500/40" />
        </div>
        <h3 className="text-base font-semibold mb-1">YouTube Verisi Henüz Bağlanmadı</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          YouTube Data API v3 token ve veri depolama katmanı kurulumu bekleniyor.
          Sahte veri gösterilmiyor — metrikler gerçek bağlantı sonrası aktif olacak.
        </p>
      </motion.div>
      <SourceHealthPanel checks={checks} />
      <div className="bg-card/50 rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Aktivasyon İçin Gerekenler
        </h3>
        <ol className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">1</span>
            <span><strong className="text-foreground">YouTube Data API v3</strong> — Google Cloud Console → API key → <code className="text-[10px] bg-muted px-1 rounded">YOUTUBE_DATA_API_KEY</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">2</span>
            <span><strong className="text-foreground">Taskade Project</strong> — channel_name, subscriber_count, video_count custom fields</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">3</span>
            <span><strong className="text-foreground">Automation Flow</strong> — YouTube API → Taskade project webhook workflow</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

/* ─── Format helpers ─── */
const fmt = (n: number | null | undefined): string => n == null ? '—' : n.toLocaleString('tr-TR');
const fmtUSD = (n: number | null | undefined): string => n == null ? '—' : `${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ─── Main Component ─── */
export default function YouTubeModule() {
  const { data: channels, loading: lc, error: ec } = useMihenkData(mihenkAPI.getYouTubeChannels, []);
  const { data: videoBatches, loading: lvb } = useMihenkData(mihenkAPI.getYouTubeVideoBatches, []);
  const { data: dailyBatches, loading: ldb } = useMihenkData(mihenkAPI.getYouTubeDailyBatches, []);
  const { data: syncLog, loading: lsl } = useMihenkData(mihenkAPI.getProviderSyncLog, []);
  const [activeTab, setActiveTab] = useState<YTTab>('channels');
  const [searchQuery, setSearchQuery] = useState('');

  const loading = lc || lvb || ldb || lsl;
  const allChannels = ensureArray(channels);
  const allVideoBatches = ensureArray(videoBatches);
  const allDailyBatches = ensureArray(dailyBatches);
  const hasData = allChannels.length > 0;
  const providerStatus = hasData ? 'available_stale' : 'PROVIDER_PENDING';
  const totalSubs = allChannels.reduce((s: number, c: any) => s + (c.subscribers || 0), 0);
  const totalViews = allChannels.reduce((s: number, c: any) => s + (c.total_views || 0), 0);
  const totalRevenue = allChannels.reduce((s: number, c: any) => s + ((c.revenue_window) || 0), 0);
  const totalAnalyticsViews = allChannels.reduce((s: number, c: any) => s + ((c.views_window) || 0), 0);
  const analyticsCount = allChannels.filter((c: any) => c.in_analytics_api).length;

  if (loading) {
    return (
      <div className="module-transition space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
        <div className="h-[300px] shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="module-transition space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
          <Youtube className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">YouTube</h2>
            <ProviderBadge status={providerStatus} />
            {ec && <span className="text-[10px] text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3" />Hata</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            {hasData ? `${allChannels.length} kanal · ${analyticsCount} analitik aktif · Zo bridge snapshot` : 'Veri bağlantısı bekleniyor'}
          </p>
        </div>
      </div>

      {/* Freshness Banner */}
      {syncLog && syncLog.freshness?.stale && <FreshnessBanner syncLog={syncLog} />}

      {/* Empty state or data */}
      {!hasData && <YouTubeEmptyState />}

      {hasData && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Kanallar', value: fmt(allChannels.length), icon: Users, color: 'text-red-500', bg: 'from-red-500/15 to-rose-500/5' },
              { label: 'Toplam Abone', value: fmt(totalSubs), icon: TrendingUp, color: 'text-blue-500', bg: 'from-blue-500/15 to-cyan-500/5' },
              { label: 'Toplam İzlenme', value: fmt(totalViews), icon: Eye, color: 'text-purple-500', bg: 'from-purple-500/15 to-violet-500/5' },
              { label: '28g İzlenme', value: fmt(totalAnalyticsViews), icon: Activity, color: 'text-green-500', bg: 'from-green-500/15 to-emerald-500/5' },
              { label: '28g Gelir', value: fmtUSD(totalRevenue), icon: DollarSign, color: 'text-amber-500', bg: 'from-amber-500/15 to-orange-500/5' },
            ].map(s => (
              <div key={s.label} className={cn('bg-gradient-to-br rounded-2xl border border-border p-4', s.bg)}>
                <s.icon className={cn('w-5 h-5 mb-1', s.color)} />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {([
              { id: 'channels' as YTTab, label: 'Kanallar', icon: Users },
              { id: 'videos' as YTTab, label: 'Video Batch', icon: Video },
              { id: 'analytics' as YTTab, label: 'Metrik Batch', icon: BarChart3 },
            ]).map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center',
                  activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {activeTab === 'channels' && (
              <motion.div key="ch" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allChannels.map((ch: any, i: number) => (
                  <div key={ch.channel_id || i} className={cn('bg-gradient-to-br rounded-2xl border border-border p-5 hover:shadow-lg transition-all', i % 3 === 0 ? 'from-red-500/20 to-rose-500/10' : i % 3 === 1 ? 'from-blue-500/20 to-cyan-500/10' : 'from-purple-500/20 to-violet-500/10')}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-lg font-bold">{ch.title?.[0]?.toUpperCase() || '📺'}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{ch.title}</h3>
                        <p className="text-[10px] text-muted-foreground">{ch.handle || ''}</p>
                      </div>
                      {ch.in_analytics_api && <BarChart3 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center bg-background/50 rounded-xl p-2"><p className="text-sm font-bold">{fmt(ch.subscribers)}</p><p className="text-[9px] text-muted-foreground">Abone</p></div>
                      <div className="text-center bg-background/50 rounded-xl p-2"><p className="text-sm font-bold">{fmt(ch.total_views)}</p><p className="text-[9px] text-muted-foreground">İzlenme</p></div>
                      <div className="text-center bg-background/50 rounded-xl p-2"><p className="text-sm font-bold">{fmtUSD(ch.revenue_window)}</p><p className="text-[9px] text-muted-foreground">28g Gelir</p></div>
                      <div className="text-center bg-background/50 rounded-xl p-2"><p className="text-sm font-bold">{ch.avg_cpm != null ? `${ch.avg_cpm.toFixed(2)}` : '—'}</p><p className="text-[9px] text-muted-foreground">CPM</p></div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            {activeTab === 'videos' && (
              <motion.div key="vid" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                {allVideoBatches.length === 0 && (
                  <div className="text-center py-8 bg-card/50 rounded-2xl border border-border">
                    <Video className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Video batch manifest henüz seed edilmedi.</p>
                  </div>
                )}
                {allVideoBatches.map((b: MIHENKBatchManifest) => <BatchCard key={`vb-${b.batch}`} b={b} type="video" />)}
                {allVideoBatches.length > 0 && (
                  <div className="bg-card/50 rounded-2xl border border-border p-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Database className="w-4 h-4 flex-shrink-0" />
                    <span><strong className="text-foreground">{allVideoBatches.reduce((s, b) => s + b.record_count, 0)} video</strong> · {allVideoBatches.length} batch · Zo bridge snapshot</span>
                  </div>
                )}
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div key="dly" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                {allDailyBatches.length === 0 && (
                  <div className="text-center py-8 bg-card/50 rounded-2xl border border-border">
                    <BarChart3 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Günlük metrik batch manifest henüz seed edilmedi.</p>
                  </div>
                )}
                {allDailyBatches.map((b: MIHENKBatchManifest) => <BatchCard key={`db-${b.batch}`} b={b} type="daily" />)}
                {allDailyBatches.length > 0 && (
                  <div className="bg-card/50 rounded-2xl border border-border p-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong className="text-foreground">{allDailyBatches.reduce((s, b) => s + b.record_count, 0)} günlük metrik</strong> · {allDailyBatches.length} batch · Gelir: {allDailyBatches.every(b => b.includes_revenue) ? '✅' : '⚠️'}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
