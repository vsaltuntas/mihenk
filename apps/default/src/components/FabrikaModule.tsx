/**
 * FABRİKA — Zaruret Records Creative Production Workbench
 * v0.4: Brand Kits readback FIX (saveProductionOutput now cross-writes to brand_kits)
 *        + Üretim Geçmişi tab for saved output readback
 *        + Success panel shows auto-created Brand Kit link
 * Codex Handoff #020 — P0 fix
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useFabrikaContext, FABRIKA_ACTIONS, FABRIKA_SECTIONS, FABRIKA_TEAM,
  EMPTY_BRAND_KIT, recommendRoles, generateOutputTemplate,
  loadBrandKits, saveBrandKits, loadProductionOutputs, saveProductionOutput, saveProductionOutputs,
  type FabrikaSection, type BrandKit, type FabrikaTeamRole,
  type ProductionStep, type ProductionBrief, type RoleMatch, type ProductionOutput,
} from '@/lib/fabrika-data';
import FabrikaChat from '@/components/FabrikaChat';
import type { HayatArtist, HayatAlbumTrack, HayatEvent, HayatFinanceRecord } from '@/lib/mihenk-data';
import {
  Factory, Sparkles, ChevronRight, ArrowRight, Play, Copy, Check,
  RefreshCw, Database, Clock, AlertTriangle, Info,
  Mic, Music, Disc, Youtube, Palette, PenTool, Image, Calendar,
  TrendingUp, Users, Bot, Search, X, ChevronDown, ChevronUp,
  ExternalLink, Plus, Wand2, Zap, Send, MessageCircle, Lightbulb,
  CheckCircle2, ArrowLeft, Save,
} from 'lucide-react';

/* ───────────────────────────────────────────────
   HELPERS
   ─────────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, message }: { icon: React.FC<{ className?: string }>; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-10 h-10 text-muted-foreground/30 mb-3" />
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm">{message}</p>
    </div>
  );
}

function SkeletonCard() {
  return <div className="animate-pulse bg-card/50 rounded-2xl border border-border p-5 h-40"><div className="h-4 bg-muted rounded w-2/3 mb-3" /><div className="h-3 bg-muted rounded w-full mb-2" /><div className="h-3 bg-muted rounded w-3/4" /></div>;
}

function SectionHeader({ icon: Icon, title, count }: { icon: React.FC<{ className?: string }>; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center"><Icon className="w-4 h-4 text-muted-foreground" /></div>
      <h2 className="text-sm font-semibold">{title}</h2>
      {count !== undefined && <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>}
    </div>
  );
}

function DraftBadge({ mode }: { mode: 'TASKADE_BACKED' | 'LOCAL_DRAFT' }) {
  const isTaskade = mode === 'TASKADE_BACKED';
  return (
    <span className={cn('inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full', isTaskade ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600')}>
      <span className={cn('w-1 h-1 rounded-full', isTaskade ? 'bg-green-500' : 'bg-amber-500')} />
      {isTaskade ? 'TASKADE' : 'LOCAL_DRAFT'}
    </span>
  );
}

function StatusDot({ status }: { status: 'AGENT_BRIDGE_PENDING' | 'ACTIVE' }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-medium',
      status === 'ACTIVE' ? 'text-green-500' : 'text-amber-500'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500')} />
      {status === 'ACTIVE' ? 'ACTIVE' : 'PENDING'}
    </span>
  );
}

const STEP_ORDER: ProductionStep[] = ['brief', 'role_select', 'generate', 'save'];
const STEP_LABELS: Record<ProductionStep, string> = { brief: 'Brief', role_select: 'Rol', generate: 'Üret', save: 'Kaydet' };

function StepIndicator({ currentStep }: { currentStep: ProductionStep }) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);
  return (
    <div className="flex items-center gap-2 mb-4">
      {STEP_ORDER.map((s, i) => {
        const isCurrent = i === currentIdx;
        const isPast = i < currentIdx;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
              isCurrent && 'bg-foreground text-background',
              isPast && 'bg-green-500 text-white',
              !isCurrent && !isPast && 'bg-muted text-muted-foreground'
            )}>{i + 1}</div>
            <span className={cn('text-[10px] hidden sm:inline', isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {STEP_LABELS[s]}
            </span>
            {i < 3 && <div className={cn('w-4 h-px', isPast ? 'bg-green-500' : 'bg-border')} />}
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────
   ÜRETİM SOHBETİ — 4-adımlı guided wizard
   No AnimatePresence wrapping — pure React for reliable input handling
   ─────────────────────────────────────────────── */
function UretimSohbeti({ ctx, onNavigate }: { ctx: ReturnType<typeof useFabrikaContext>; onNavigate: (s: FabrikaSection) => void }) {
  const [step, setStep] = useState<ProductionStep>('brief');
  const [briefText, setBriefText] = useState('');
  const [matches, setMatches] = useState<RoleMatch[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [output, setOutput] = useState<ProductionOutput | null>(null);
  const [outputContent, setOutputContent] = useState('');
  const [history, setHistory] = useState<ProductionOutput[]>([]);
  const [changeCount, setChangeCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setHistory(loadProductionOutputs()); }, []);

  // Sync uncontrolled -> state on every interaction
  const syncBrief = useCallback(() => {
    const v = textareaRef.current?.value ?? '';
    setBriefText(v);
    setChangeCount(c => c + 1);
  }, []);

  const briefTrimmed = briefText.trim();
  const canSubmit = briefTrimmed.length > 0;
  const hasArtists = ctx.artists.length > 0;
  const briefIsTruncated = briefText.length > 100;
  const selectedRole = selectedRoleId ? FABRIKA_TEAM.find(r => r.id === selectedRoleId) : null;

  const handleBriefSubmit = () => {
    const v = textareaRef.current?.value.trim() || briefTrimmed;
    if (!v) return;
    setBriefText(v);
    const results = recommendRoles(v);
    setMatches(results);
    setStep('role_select');
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRoleId(roleId);
    const brief: ProductionBrief = { text: briefText };
    const out = generateOutputTemplate(roleId, brief);
    setOutput(out);
    setOutputContent(out.content);
    setStep('generate');
  };

  const handleApprove = () => {
    if (!output) return;
    const approved = { ...output, content: outputContent, approved: true };
    saveProductionOutput(approved);
    setHistory(loadProductionOutputs());
    setStep('save');
  };

  const handleReset = () => {
    setStep('brief');
    setBriefText('');
    setMatches([]);
    setSelectedRoleId(null);
    setOutput(null);
    setOutputContent('');
    setChangeCount(0);
  };

  if (step === 'brief') {
    return (
      <div className="space-y-5">
        <SectionHeader icon={MessageCircle} title="Üretim Sohbeti" />
        <p className="text-xs text-muted-foreground">Brief → Rol → Üret → Kaydet</p>
        <StepIndicator currentStep={step} />
        <div className="bg-card/50 rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-semibold">Ne üretmek istiyorsun?</h4>
          </div>
          <textarea
            ref={textareaRef}
            tabIndex={0}
            className="w-full bg-background border border-border rounded-xl p-4 text-sm min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Brief yaz..."
            defaultValue={briefText}
            onChange={syncBrief}
            onInput={syncBrief}
            onKeyUp={syncBrief}
            onBlur={syncBrief}
          />
          <div className="text-[10px] text-muted-foreground flex gap-3">
            <span>Uzunluk: {briefText.length}</span>
            <span>Change: {changeCount}</span>
            <span>Disabled: {canSubmit ? 'hayır' : 'evet'}</span>
          </div>
          <button
            onClick={handleBriefSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-30"
          >
            <Send className="w-4 h-4" />Rol Önerisi Al
          </button>
        </div>
      </div>
    );
  }

      if (step === 'role_select') {
    return (
      <div className="space-y-5">
        <SectionHeader icon={MessageCircle} title="Üretim Sohbeti" />
        <p className="text-xs text-muted-foreground">Brief → Rol → Üret → Kaydet</p>
        <StepIndicator currentStep={step} />
        <div className="bg-card/50 rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Bot className="w-4 h-4 text-purple-500" /><h4 className="text-sm font-semibold">Önerilen Roller</h4></div>
            <button onClick={handleReset} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-3 h-3" />Geri</button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Brief: <span className="text-foreground italic">"{briefText.slice(0, 100)}{briefIsTruncated ? '...' : ''}"</span></p>
          <div className="space-y-2">
            {matches.map(m => {
              const isHigh = m.score > 2;
              const hasScore = m.score > 0;
              return (
                <button key={m.role.id} onClick={() => handleRoleSelect(m.role.id)} className="w-full text-left bg-background/60 rounded-xl p-4 border border-border/50 hover:border-purple-500/50 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{m.role.emoji}</span>
                      <div><h5 className="text-sm font-semibold">{m.role.name}</h5><p className="text-[10px] text-muted-foreground">{m.reason}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full', isHigh ? 'bg-green-100 dark:bg-green-900/20 text-green-700' : 'bg-muted text-muted-foreground')}>{hasScore ? `${m.score} eşleşme` : 'genel'}</span>
                      <StatusDot status={m.role.status} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'generate' && output && selectedRole) {
    return (
      <div className="space-y-5">
        <SectionHeader icon={MessageCircle} title="Üretim Sohbeti" />
        <p className="text-xs text-muted-foreground">Brief → Rol → Üret → Kaydet</p>
        <StepIndicator currentStep={step} />
        <div className="bg-card/50 rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><span className="text-xl">{selectedRole.emoji}</span><div><h4 className="text-sm font-semibold">{selectedRole.name} Çıktısı</h4><p className="text-[10px] text-muted-foreground">AGENT_BRIDGE_PENDING</p></div></div>
            <button onClick={() => setStep('role_select')} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="w-3 h-3" />Geri</button>
          </div>
          <div className="bg-background rounded-xl p-4 mb-4">
            <textarea className="w-full bg-transparent text-xs font-mono leading-relaxed min-h-[200px] resize-y focus:outline-none" value={outputContent} onChange={(e) => setOutputContent(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
            <Database className="w-3 h-3" /><span>Hedef: {output.targetProjectName}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleApprove} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium">Onayla ve Kaydet</button>
            <button onClick={() => navigator.clipboard.writeText(outputContent)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-xs"><Copy className="w-3.5 h-3.5" />Kopyala</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'save' && output) {
    const isBrandArchitect = output.roleId === 'brand_architect';
    return (
      <div className="space-y-5">
        <SectionHeader icon={MessageCircle} title="Üretim Sohbeti" />
        <p className="text-xs text-muted-foreground">Brief → Rol → Üret → Kaydet</p>
        <StepIndicator currentStep={step} />
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <h4 className="text-sm font-semibold mb-1">Üretim Kaydedildi!</h4>
          <p className="text-xs text-muted-foreground mb-2">{selectedRole?.name} çıktısı Üretim Geçmişi'ne eklendi.</p>
          {isBrandArchitect && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-2">
              ✅ Brand Kit otomatik oluşturuldu — Brand Kits sekmesinde görüntüleyebilirsin.
            </p>
          )}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <button onClick={handleReset} className="px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium">Yeni Üretim</button>
            <button onClick={() => onNavigate('uretim_gecmisi')} className="px-4 py-2.5 rounded-xl border border-border text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Üretim Geçmişi</button>
            {isBrandArchitect && (
              <button onClick={() => onNavigate('brand_kits')} className="px-4 py-2.5 rounded-xl border border-green-300 dark:border-green-800 text-xs flex items-center gap-1.5 text-green-600 dark:text-green-400"><Palette className="w-3.5 h-3.5" />Brand Kits'e Git</button>
            )}
            <button onClick={() => navigator.clipboard.writeText(output.content)} className="px-4 py-2.5 rounded-xl border border-border text-xs flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" />Kopyala</button>
          </div>
        </div>
      </div>
    );
  }

  // fallback
  return <div className="text-xs text-muted-foreground">Yükleniyor...</div>;
}

/* ───────────────────────────────────────────────
   ÜRETİM MASASI — Ana landing, hızlı aksiyon grid
   ─────────────────────────────────────────────── */
function UretimMasasi({ ctx, onNavigate }: { ctx: ReturnType<typeof useFabrikaContext>; onNavigate: (s: FabrikaSection) => void }) {
  const artistCount = Array.isArray(ctx.artists) ? ctx.artists.length : 0;
  const hasAnyArtists = artistCount > 0;
  const hasOverflow = artistCount > 8;
  const trackCount = Array.isArray(ctx.tracks) ? ctx.tracks.length : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-rose-500/5 rounded-2xl border border-border p-6 md:p-8">
        <div className="relative z-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Zaruret Records</p>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Yaratıcı Üretim Masası</h2>
          <p className="text-sm text-muted-foreground max-w-lg">
            Ne üretmek istersin? Sanatçı persona, brand kit, albüm konsepti, YouTube kanalı, şarkı sözü, Suno prompt...
            Hepsi bu masada başlar.
          </p>
          <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground/60">
            <span>{artistCount} sanatçı</span><span>·</span><span>{trackCount} track</span>
            <span>·</span><span>{ctx.events.length} etkinlik</span>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Quick Actions Grid — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FABRIKA_ACTIONS.map(action => {
          const IconComp = ICON_MAP[action.icon] || Sparkles;
          const isReady = true; // Tüm aksiyonlar her zaman tıklanabilir
          return (
            <button
              key={action.id}
              onClick={() => {
                // Aksiyon tıklandığında ilgili bölüme yönlendir
                if (action.id === 'create_artist') onNavigate('sanatcilar');
                else if (action.id === 'create_brand_kit') onNavigate('brand_kits');
                else if (action.id === 'create_album_concept') onNavigate('album_konseptleri');
                else if (action.id === 'create_channel_niche') onNavigate('kanal_niche');
                else if (action.id === 'write_lyrics') onNavigate('sarkilar');
                else if (action.id === 'create_suno_prompt') onNavigate('prompt_atolyesi');
                else if (action.id === 'design_cover_art') onNavigate('brand_kits');
                else if (action.id === 'create_release_plan') onNavigate('release_plani');
                else if (action.id === 'create_channel_strategy') onNavigate('kanal_niche');
              }}
              className="group relative bg-card/50 hover:bg-card rounded-2xl border border-border p-5 text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110', action.bg, action.color)}>
                <IconComp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold mb-1 group-hover:text-foreground transition-colors">{action.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                <span>Başlat</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Üretim Sohbeti — agentic chat panel */}
      <div className="bg-card/30 rounded-2xl border border-border p-5">
        <FabrikaChat />
      </div>

      {/* Context strip */}
      {hasAnyArtists && (
        <div className="bg-card/30 rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] text-muted-foreground">Bağlam: MİHENK Katalog</p>
            <DraftBadge mode="TASKADE_BACKED" />
          </div>
          <div className="flex flex-wrap gap-2">
            {ctx.artists.slice(0, 8).map(a => (
              <span key={a.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/50 text-xs font-medium">
                <Mic className="w-3 h-3 text-muted-foreground" />{a.name}
              </span>
            ))}
            {hasOverflow && <span className="text-xs text-muted-foreground self-center">+{artistCount - 8} daha</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ICON MAP ─── */
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  mic: Mic, music: Music, disc: Disc, youtube: Youtube, palette: Palette,
  calendar: Calendar, wallet: () => <Database className="w-5 h-5" />, library: () => <Database className="w-5 h-5" />,
  sparkles: Sparkles, bot: Bot, users: Users, factory: Factory,
  'pen-tool': PenTool, image: Image, 'trending-up': TrendingUp,
  'message-circle': MessageCircle, clock: Clock,
};

/* ───────────────────────────────────────────────
   SANATÇILAR — Gerçek veri, üretime bağlam
   ─────────────────────────────────────────────── */
function SanatcilarPanel({ artists, loading }: { artists: HayatArtist[]; loading: boolean }) {
  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>;
  const hasData = Array.isArray(artists) && artists.length > 0;
  if (!hasData) return <EmptyState icon={Mic} title="Henüz sanatçı yok" message="MİHENK Katalog'a bir sanatçı ekleyerek başlayabilirsin." />;
  return (
    <div className="space-y-4">
      <SectionHeader icon={Mic} title="MİHENK Katalog Sanatçıları" count={artists.length} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {artists.map(a => (
          <div key={a.id} className="bg-card/50 rounded-2xl border border-border p-5 hover:border-border/80 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center"><Mic className="w-5 h-5 text-violet-500" /></div>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{a.artist_type}</span>
            </div>
            <h3 className="text-sm font-semibold mb-1">{a.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {a.genre && <span className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-md">{a.genre}</span>}
              {a.origin && <span className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-md">{a.origin}</span>}
            </div>
            {a.sonic_dna && <p className="text-[11px] text-muted-foreground mt-3 line-clamp-2">{a.sonic_dna}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   BRAND KITS — Birinci sınıf yüzey, yapılandırılmış form
   ─────────────────────────────────────────────── */
function BrandKitsPanel() {
  const [kits, setKits] = useState<BrandKit[]>(() => loadBrandKits());
  const [editing, setEditing] = useState<BrandKit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleNew = () => {
    setEditing({ ...EMPTY_BRAND_KIT, id: `bk_${Date.now().toString(36)}`, createdAt: new Date().toISOString() });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!editing) return;
    let updated: BrandKit[];
    const exists = kits.findIndex(k => k.id === editing.id);
    if (exists >= 0) {
      updated = [...kits]; updated[exists] = editing;
    } else {
      updated = [editing, ...kits];
    }
    setKits(updated);
    saveBrandKits(updated);
    setEditing(null); setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = kits.filter(k => k.id !== id);
    setKits(updated);
    saveBrandKits(updated);
  };

  const hasKits = kits.length > 0;

  const copyHandoff = (kit: BrandKit) => {
    const text = `BRAND KIT: ${kit.artistOrProject}\nVisual: ${kit.visualConcept}\nColors: ${kit.colorPalette.join(', ')}\nLogo: ${kit.logoDirection}\nTypography: ${kit.typography}\nTone: ${kit.toneOfVoice}\nKey words: ${kit.keyVocabulary}\nAvoid: ${kit.avoidWords}\nAI Disclosure: ${kit.aiDisclosureFormat}\nCover Art: ${kit.coverArtFamilies}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(kit.id); setTimeout(() => setCopied(null), 2000); });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Palette} title="Brand Kit Atölyesi" count={kits.length} />
        <button onClick={handleNew} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-3.5 h-3.5" />Yeni Brand Kit
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-card/50 rounded-2xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold">{editing.id.includes('new') ? 'Yeni Brand Kit' : 'Brand Kit Düzenle'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Artist / Proje" value={editing.artistOrProject} onChange={v => setEditing({ ...editing, artistOrProject: v })} />
              <Field label="Visual Concept" value={editing.visualConcept} onChange={v => setEditing({ ...editing, visualConcept: v })} />
              <Field label="Logo Direction" value={editing.logoDirection} onChange={v => setEditing({ ...editing, logoDirection: v })} />
              <Field label="Typography" value={editing.typography} onChange={v => setEditing({ ...editing, typography: v })} />
              <Field label="Tone of Voice" value={editing.toneOfVoice} onChange={v => setEditing({ ...editing, toneOfVoice: v })} />
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Color Palette (virgülle)</label>
                <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs" value={editing.colorPalette.join(', ')} onChange={e => setEditing({ ...editing, colorPalette: e.target.value.split(',').map(s => s.trim()) })} />
                <div className="flex gap-1 mt-1.5">{editing.colorPalette.filter(Boolean).map((c, i) => <div key={i} className="w-5 h-5 rounded border border-border" style={{ backgroundColor: c }} title={c} />)}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Key Vocabulary" value={editing.keyVocabulary} onChange={v => setEditing({ ...editing, keyVocabulary: v })} />
              <Field label="Avoid Words" value={editing.avoidWords} onChange={v => setEditing({ ...editing, avoidWords: v })} />
              <Field label="AI Disclosure Format" value={editing.aiDisclosureFormat} onChange={v => setEditing({ ...editing, aiDisclosureFormat: v })} />
              <Field label="Cover Art Families" value={editing.coverArtFamilies} onChange={v => setEditing({ ...editing, coverArtFamilies: v })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium">Kaydet</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 rounded-lg border border-border text-xs">İptal</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Kits */}
      {kits.length === 0 && !showForm && (
        <EmptyState icon={Palette} title="Henüz brand kit yok" message="Yeni Brand Kit butonuyla oluştur veya Üretim Sohbeti'nden brand kit brief'i gönder." />
      )}
      {hasKits && <div className="flex items-center gap-2 mt-2"><DraftBadge mode="LOCAL_DRAFT" /><span className="text-[9px] text-muted-foreground">Kayıtlar sadece bu oturumda geçerli</span></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {kits.map(kit => (
          <div key={kit.id} className="bg-card/50 rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold">{kit.artistOrProject || 'İsimsiz Kit'}</h3>
              <div className="flex gap-1">
                <button onClick={() => copyHandoff(kit)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Copy handoff">
                  {copied === kit.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <button onClick={() => { setEditing(kit); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><PenTool className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button onClick={() => handleDelete(kit.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><X className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
            <div className="flex gap-1.5 mb-2">{kit.colorPalette.filter(Boolean).map((c, i) => <div key={i} className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: c }} />)}</div>
            <p className="text-xs text-muted-foreground line-clamp-2">{kit.visualConcept || 'Henüz visual concept yok.'}</p>
            {kit.toneOfVoice && <span className="inline-block mt-2 text-[10px] bg-muted/50 px-2 py-0.5 rounded-full">{kit.toneOfVoice}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground mb-1 block">{label}</label>
      <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

/* ───────────────────────────────────────────────
   ŞARKILAR — Gerçek track verisi
   ─────────────────────────────────────────────── */
function SarkilarPanel({ tracks, loading }: { tracks: HayatAlbumTrack[]; loading: boolean }) {
  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>;
  const hasData = Array.isArray(tracks) && tracks.length > 0;
  if (!hasData) return <EmptyState icon={Music} title="Henüz track yok" message="MİHENK Katalog'a track ekleyerek başlayabilirsin." />;
  return (
    <div className="space-y-4">
      <SectionHeader icon={Music} title="MİHENK Katalog Şarkılar & Trackler" count={tracks.length} />
      <div className="bg-card/50 rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-muted/30"><tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Title</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Artist</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">BPM</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Key</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Genre</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Pipeline</th>
          </tr></thead><tbody className="divide-y divide-border/30">
            {tracks.map(t => (<tr key={t.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-medium">{t.title}</td>
              <td className="px-4 py-3 text-xs">{t.artist}</td>
              <td className="px-4 py-3 text-xs tabular-nums">{t.bpm || '—'}</td>
              <td className="px-4 py-3 text-xs tabular-nums">{t.key || '—'}</td>
              <td className="px-4 py-3 text-xs">{t.genre || '—'}</td>
              <td className="px-4 py-3 text-xs"><PipelineBadge pipeline={t.pipeline} /></td>
            </tr>))}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}

function PipelineBadge({ pipeline }: { pipeline: string }) {
  const m: Record<string, string> = { 'tp-taslak': 'Taslak', 'tp-demo': 'Demo', 'tp-kayit': 'Kayıt', 'tp-miks': 'Miks', 'tp-mastering': 'Mastering', 'tp-yayin': 'Yayında' };
  return <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">{m[pipeline] || pipeline}</span>;
}

/* ───────────────────────────────────────────────
   ALBÜM KONSEPTLERİ — Yaratıcı çalışma alanı
   ─────────────────────────────────────────────── */
function AlbumKonseptleriPanel({ albums, tracks }: { albums: HayatAlbumTrack[]; tracks: HayatAlbumTrack[] }) {
  const [concepts, setConcepts] = useState<{ id: string; title: string; description: string; trackCount: number; genre: string }[]>([]);
  const [draft, setDraft] = useState({ title: '', description: '', trackCount: 6, genre: '' });

  const add = () => {
    if (!draft.title) return;
    setConcepts([{ id: `ac_${Date.now().toString(36)}`, ...draft }, ...concepts]);
    setDraft({ title: '', description: '', trackCount: 6, genre: '' });
  };

  return (
    <div className="space-y-4">
      <SectionHeader icon={Disc} title="Albüm Konsept Atölyesi" />
      <p className="text-xs text-muted-foreground -mt-2 mb-3">Albüm/EP/Single konsepti kur, tracklist planla, sonic ark tasarla.</p>

      {/* Quick Creator */}
      <div className="bg-card/50 rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1"><Wand2 className="w-4 h-4 text-amber-500" /><h4 className="text-sm font-semibold">Hızlı Konsept Kur</h4></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Konsept adı (örn: Anatolian Noir)" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Genre (örn: Dark Synthwave)" value={draft.genre} onChange={e => setDraft({ ...draft, genre: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Kısa açıklama" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
          <select className="bg-background border border-border rounded-lg px-3 py-2 text-xs" value={draft.trackCount} onChange={e => setDraft({ ...draft, trackCount: Number(e.target.value) })}>
            {[1, 3, 4, 6, 8, 10, 12, 16].map(n => <option key={n} value={n}>{n} track</option>)}
          </select>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium"><Plus className="w-3.5 h-3.5" />Konsept Ekle</button>
      </div>

      {/* Concepts */}
      {(() => { const hasConcepts = concepts.length > 0; return hasConcepts ? <DraftBadge mode="LOCAL_DRAFT" /> : null; })()}
      {concepts.length === 0 && <EmptyState icon={Disc} title="Henüz konsept yok" message="Yukarıdaki form ile ilk albüm konseptini oluştur veya Üretim Sohbeti'nden brief gönder." />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {concepts.map(c => (
          <div key={c.id} className="bg-card/50 rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between mb-2"><h3 className="text-sm font-semibold">{c.title}</h3><span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{c.trackCount} track</span></div>
            {c.genre && <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md mb-2 inline-block">{c.genre}</span>}
            <p className="text-xs text-muted-foreground">{c.description || 'Açıklama yok.'}</p>
            <button onClick={() => setConcepts(concepts.filter(x => x.id !== c.id))} className="mt-3 text-[10px] text-red-400 hover:text-red-500"><X className="w-3 h-3 inline mr-1" />Sil</button>
          </div>
        ))}
      </div>

      {/* Context: existing albums */}
      {(() => { const hasAlbums = albums.length > 0; return hasAlbums; })() && (
        <div className="bg-card/30 rounded-2xl border border-border/50 p-4 mt-4">
          <p className="text-[11px] text-muted-foreground mb-2">Bağlam: Mevcut Albümler</p>
          <div className="flex flex-wrap gap-2">
            {albums.slice(0, 6).map(a => <span key={a.id} className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-md">{a.album || a.title} — {a.artist}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   KANAL & NICHE
   ─────────────────────────────────────────────── */
function KanalNichePanel() {
  const [ideas, setIdeas] = useState<{ id: string; name: string; niche: string; pillars: string }[]>([]);
  const [draft, setDraft] = useState({ name: '', niche: '', pillars: '' });
  const add = () => { if (!draft.name) return; setIdeas([{ id: `ch_${Date.now().toString(36)}`, ...draft }, ...ideas]); setDraft({ name: '', niche: '', pillars: '' }); };

  return (
    <div className="space-y-4">
      <SectionHeader icon={Youtube} title="Kanal & Niche Stratejisi" />
      <p className="text-xs text-muted-foreground -mt-2 mb-3">YouTube kanal konsepti bul, niche analizi yap, içerik sütunları tanımla.</p>
      <div className="bg-card/50 rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1"><Search className="w-4 h-4 text-red-500" /><h4 className="text-sm font-semibold">Kanal Fikri Üret</h4></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Kanal adı" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Niche (örn: Dark Ambient Stories)" value={draft.niche} onChange={e => setDraft({ ...draft, niche: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs sm:col-span-2" placeholder="İçerik sütunları (virgülle)" value={draft.pillars} onChange={e => setDraft({ ...draft, pillars: e.target.value })} />
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-medium"><Plus className="w-3.5 h-3.5" />Fikir Ekle</button>
      </div>
      {(() => { const hasIdeas = ideas.length > 0; return hasIdeas ? <DraftBadge mode="LOCAL_DRAFT" /> : null; })()}
      {ideas.length === 0 && <EmptyState icon={Youtube} title="Henüz kanal fikri yok" message="Form ile üret veya Üretim Sohbeti'nden brief gönder." />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ideas.map(i => (
          <div key={i.id} className="bg-card/50 rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-1">{i.name}</h3>
            <span className="text-[10px] bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">{i.niche}</span>
            <div className="flex flex-wrap gap-1.5 mt-2">{i.pillars.split(',').filter(Boolean).map((p, j) => <span key={j} className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-md">{p.trim()}</span>)}</div>
            <button onClick={() => setIdeas(ideas.filter(x => x.id !== i.id))} className="mt-3 text-[10px] text-red-400"><X className="w-3 h-3 inline mr-1" />Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   PROMPT ATÖLYESİ
   ─────────────────────────────────────────────── */
function PromptAtolyesiPanel({ tracks }: { tracks: HayatAlbumTrack[] }) {
  const [prompts, setPrompts] = useState<{ id: string; title: string; genre: string; bpm: string; key: string; mood: string; prompt: string }[]>([]);
  const [draft, setDraft] = useState({ title: '', genre: '', bpm: '', key: '', mood: '' });
  const [copied, setCopied] = useState<string | null>(null);

  const generate = () => {
    if (!draft.title) return;
    const p = `[Style: ${draft.genre || 'cinematic electronic'}] [BPM: ${draft.bpm || '120'}] [Key: ${draft.key || 'Am'}]\n[Mood: ${draft.mood || 'dark, atmospheric'}]\n\n[Intro] — ambient texture, building tension\n[Verse 1] — minimalist beat enters, vocal whisper\n[Chorus] — full production, layered synths, driving bass\n[Verse 2] — variation, countermelody\n[Chorus] — repeat with intensity\n[Bridge] — breakdown, stripped back\n[Final Chorus] — maximum energy, climax\n[Outro] — fade to texture\n\nInstrumentation: analog synths, deep 808, reverb-drenched pads, processed vocals`;
    setPrompts([{ id: `sp_${Date.now().toString(36)}`, ...draft, prompt: p }, ...prompts]);
    setDraft({ title: '', genre: '', bpm: '', key: '', mood: '' });
  };

  const copyPrompt = (id: string, prompt: string) => { navigator.clipboard.writeText(prompt).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000); }); };

  return (
    <div className="space-y-4">
      <SectionHeader icon={Sparkles} title="Suno Prompt Atölyesi" />
      <p className="text-xs text-muted-foreground -mt-2 mb-3">Structure tag, style descriptor, BPM/key/mood parametreleriyle Suno v4 prompt üret.</p>
      <div className="bg-card/50 rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-purple-500" /><h4 className="text-sm font-semibold">Prompt Üretici</h4></div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Şarkı adı" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Genre" value={draft.genre} onChange={e => setDraft({ ...draft, genre: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="BPM" value={draft.bpm} onChange={e => setDraft({ ...draft, bpm: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Key" value={draft.key} onChange={e => setDraft({ ...draft, key: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Mood" value={draft.mood} onChange={e => setDraft({ ...draft, mood: e.target.value })} />
        </div>
        <button onClick={generate} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-500 text-white text-xs font-medium"><Wand2 className="w-3.5 h-3.5" />Prompt Üret</button>
      </div>
      {(() => { const hasPrompts = prompts.length > 0; return hasPrompts ? <DraftBadge mode="LOCAL_DRAFT" /> : null; })()}
      {prompts.length === 0 && <EmptyState icon={Sparkles} title="Henüz prompt yok" message="Form ile üret veya Üretim Sohbeti'nden brief gönder." />}
      <div className="space-y-3">
        {prompts.map(p => (
          <div key={p.id} className="bg-card/50 rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="text-sm font-semibold">{p.title}</h3><div className="flex gap-1.5 mt-1">{p.genre && <span className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-md">{p.genre}</span>}{p.bpm && <span className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-md">{p.bpm} BPM</span>}{p.key && <span className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-md">{p.key}</span>}</div></div>
              <button onClick={() => copyPrompt(p.id, p.prompt)} className="p-1.5 rounded-lg hover:bg-muted">
                {copied === p.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
            <pre className="text-[11px] text-muted-foreground bg-background rounded-xl p-3 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto font-mono leading-relaxed">{p.prompt}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   RELEASE PLANI
   ─────────────────────────────────────────────── */
function ReleasePlaniPanel({ events, tracks }: { events: HayatEvent[]; tracks: HayatAlbumTrack[] }) {
  const [plans, setPlans] = useState<{ id: string; title: string; phase: string; date: string; notes: string }[]>([]);
  const [draft, setDraft] = useState({ title: '', phase: 'pre_release', date: '', notes: '' });
  const phases = [{ key: 'pre_release', label: 'Pre-Release', emoji: '📢' }, { key: 'release_day', label: 'Release Day', emoji: '🚀' }, { key: 'post_week1', label: 'Week 1', emoji: '📈' }, { key: 'post_month1', label: 'Month 1', emoji: '📊' }, { key: 'post_month3', label: 'Month 3', emoji: '🏆' }];
  const add = () => { if (!draft.title) return; setPlans([{ id: `rp_${Date.now().toString(36)}`, ...draft }, ...plans]); setDraft({ title: '', phase: 'pre_release', date: '', notes: '' }); };

  return (
    <div className="space-y-4">
      <SectionHeader icon={Calendar} title="Release Planı" />
      <p className="text-xs text-muted-foreground -mt-2 mb-3">Pre-release timeline, dağıtım stratejisi, pitching planı.</p>
      <div className="bg-card/50 rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1"><Play className="w-4 h-4 text-emerald-500" /><h4 className="text-sm font-semibold">Release Adımı Ekle</h4></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Adım başlığı" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
          <select className="bg-background border border-border rounded-lg px-3 py-2 text-xs" value={draft.phase} onChange={e => setDraft({ ...draft, phase: e.target.value })}>{phases.map(p => <option key={p.key} value={p.key}>{p.emoji} {p.label}</option>)}</select>
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" type="date" value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} />
          <input className="bg-background border border-border rounded-lg px-3 py-2 text-xs" placeholder="Notlar" value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} />
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium"><Plus className="w-3.5 h-3.5" />Adım Ekle</button>
      </div>
      {(() => { const hasPlans = plans.length > 0; return hasPlans ? <DraftBadge mode="LOCAL_DRAFT" /> : null; })()}
      {plans.length === 0 && <EmptyState icon={Calendar} title="Henüz plan yok" message="Form ile ekle veya Üretim Sohbeti'nden brief gönder." />}
      <div className="space-y-2">
        {['pre_release', 'release_day', 'post_week1', 'post_month1', 'post_month3'].map(phaseKey => {
          const items = plans.filter(p => p.phase === phaseKey);
          const phaseInfo = phases.find(p => p.key === phaseKey)!;
          if (items.length === 0) return null;
          return (<div key={phaseKey} className="bg-card/30 rounded-2xl border border-border/50 p-4"><h4 className="text-xs font-semibold text-muted-foreground mb-2">{phaseInfo.emoji} {phaseInfo.label}</h4><div className="space-y-2">{items.map(item => (<div key={item.id} className="flex items-center gap-3 bg-background/60 rounded-xl p-3"><div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" /><div className="flex-1"><span className="text-sm font-medium">{item.title}</span>{item.notes && <p className="text-[10px] text-muted-foreground">{item.notes}</p>}</div>{item.date && <span className="text-[10px] text-muted-foreground tabular-nums">{item.date}</span>}<button onClick={() => setPlans(plans.filter(x => x.id !== item.id))} className="text-[10px] text-red-400"><X className="w-3 h-3" /></button></div>))}</div></div>);
        })}
      </div>
    </div>);
}

/* ───────────────────────────────────────────────
   ÜRETİM GEÇMİŞİ — Tüm kaydedilmiş üretim çıktıları
   ─────────────────────────────────────────────── */
function UretimGecmisiPanel({ onNavigate }: { onNavigate: (s: FabrikaSection) => void }) {
  const [outputs, setOutputs] = useState<ProductionOutput[]>(() => loadProductionOutputs());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleDelete = (idx: number) => {
    const updated = outputs.filter((_, i) => i !== idx);
    setOutputs(updated);
    saveProductionOutputs(updated);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const getRoleInfo = (roleId: string) => FABRIKA_TEAM.find(r => r.id === roleId);

  const hasOutputs = outputs.length > 0;

  return (
    <div className="space-y-4">
      <SectionHeader icon={Clock} title="Üretim Geçmişi" count={outputs.length} />
      <p className="text-xs text-muted-foreground -mt-2 mb-3">
        Üretim Sohbeti'nden onaylanıp kaydedilen tüm çıktılar burada görünür.
      </p>

      {!hasOutputs && (
        <EmptyState
          icon={Clock}
          title="Henüz kayıtlı üretim yok"
          message="Üretim Sohbeti'nden bir brief gönder, rol seç, çıktı üret ve 'Onayla ve Kaydet' butonuyla kaydet."
        />
      )}

      {hasOutputs && (
        <div className="space-y-3">
          {outputs.map((out, idx) => {
            const role = getRoleInfo(out.roleId);
            const isExpanded = expanded === `${idx}`;
            const isBrandKit = out.roleId === 'brand_architect';
            const dateStr = out.createdAt ? new Date(out.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
            const contentPreview = out.content.slice(0, 120).replace(/\n/g, ' ');

            return (
              <div key={`${out.createdAt}-${idx}`} className="bg-card/50 rounded-2xl border border-border p-5 transition-all hover:border-border/80">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{role?.emoji || '📄'}</span>
                    <div>
                      <h3 className="text-sm font-semibold">{role?.name || out.roleId}</h3>
                      <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isBrandKit && (
                      <button
                        onClick={() => onNavigate('brand_kits')}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                      >
                        <Palette className="w-3 h-3" />Brand Kit
                      </button>
                    )}
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full', out.approved ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600')}>
                      {out.approved ? 'Onaylı' : 'Taslak'}
                    </span>
                  </div>
                </div>

                {/* Brief */}
                <p className="text-xs text-muted-foreground mb-2 italic">
                  Brief: "{out.brief.text.slice(0, 80)}{out.brief.text.length > 80 ? '...' : ''}"
                </p>

                {/* Content preview / full */}
                {!isExpanded && (
                  <p className="text-xs text-muted-foreground/70 line-clamp-2">{contentPreview}...</p>
                )}

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <pre className="text-[11px] text-muted-foreground bg-background rounded-xl p-4 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto font-mono leading-relaxed mt-2 mb-3">
                        {out.content}
                      </pre>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Database className="w-3 h-3" />
                        <span>Hedef: {out.targetProjectName}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : `${idx}`)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isExpanded ? <><ChevronUp className="w-3 h-3" />Kapat</> : <><ChevronDown className="w-3 h-3" />Tam Çıktı</>}
                  </button>
                  <button
                    onClick={() => handleCopy(out.content, `${idx}`)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === `${idx}` ? <><Check className="w-3 h-3 text-green-500" />Kopyalandı</> : <><Copy className="w-3 h-3" />Kopyala</>}
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-500 transition-colors ml-auto"
                  >
                    <X className="w-3 h-3" />Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DraftBadge mode="LOCAL_DRAFT" />
      <p className="text-[9px] text-muted-foreground">
        Üretim kayıtları tarayıcının yerel belleğinde (localStorage) saklanır. Brand Architect üretimleri otomatik olarak Brand Kits sekmesine de eklenir.
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────────
   EKİP — Role cards, AGENT_BRIDGE_PENDING
   ─────────────────────────────────────────────── */
function EkipPanel() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeBrief, setActiveBrief] = useState<string | null>(null);
  const [briefInput, setBriefInput] = useState('');
  const copyHandoff = (role: FabrikaTeamRole) => { navigator.clipboard.writeText(role.handoffPrompt).then(() => { setCopied(role.id); setTimeout(() => setCopied(null), 2000); }); };

  return (
    <div className="space-y-4">
      <SectionHeader icon={Users} title="FABRİKA Üretim Ekibi" />
      <p className="text-xs text-muted-foreground -mt-2 mb-4">Her role brief göndererek FABRİKA asistanıyla üretim başlat. Agent sistemi aktif olduğunda roller doğrudan bağlanacak.</p>

      {/* Active brief chat */}
      <AnimatePresence>
        {activeBrief && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-card/30 rounded-2xl border border-amber-500/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-amber-500">🏭 Brief Üretimi</h4>
              <button onClick={() => setActiveBrief(null)} className="p-1 rounded hover:bg-muted"><X className="w-3.5 h-3.5" /></button>
            </div>
            <FabrikaChat initialBrief={activeBrief} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FABRIKA_TEAM.map(role => {
          const isExpanded = expandedRole === role.id;
          const hasCopied = copied === role.id;
          return (
            <div key={role.id} className="bg-card/50 rounded-2xl border border-border p-5 hover:border-border/80 transition-all">
              <div className="flex items-start justify-between mb-3"><span className="text-2xl">{role.emoji}</span><StatusDot status={role.status} /></div>
              <h3 className="text-sm font-semibold mb-1">{role.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{role.description}</p>

              {/* Brief gönder */}
              <div className="flex gap-1.5 mb-3">
                <input
                  className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  placeholder={`${role.name}'e brief yaz...`}
                  value={expandedRole === role.id ? briefInput : ''}
                  onChange={e => { setExpandedRole(role.id); setBriefInput(e.target.value); }}
                  onFocus={() => setExpandedRole(role.id)}
                />
                <button
                  onClick={() => {
                    const brief = briefInput.trim() || role.handoffPrompt;
                    setActiveBrief(`[${role.name} rolüyle] ${brief}`);
                    setBriefInput('');
                    setExpandedRole(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-medium hover:bg-amber-600 transition-colors"
                  title="Brief gönder"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-background rounded-xl p-3 mb-3"><pre className="text-[10px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">{role.handoffPrompt}</pre></div>
                    <div className="flex gap-2">
                      <button onClick={() => copyHandoff(role)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-muted hover:bg-muted/80 transition-colors">{hasCopied ? <><Check className="w-3 h-3 text-green-500" />Kopyalandı</> : <><Copy className="w-3 h-3" />Prompt Kopyala</>}</button>
                      <button onClick={() => { setActiveBrief(`[${role.name} rolüyle] ${role.handoffPrompt}`); setExpandedRole(null); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"><Sparkles className="w-3 h-3" />Varsayılan Brief</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => { setExpandedRole(isExpanded ? null : role.id); setBriefInput(''); }} className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors">{isExpanded ? <><ChevronUp className="w-3 h-3" />Kapat</> : <><ChevronDown className="w-3 h-3" />Detaylar</>}</button>
            </div>);
        })}
      </div>
    </div>);
}

/* ───────────────────────────────────────────────
   SOURCE HEALTH DRAWER (ikincil panel)
   ─────────────────────────────────────────────── */
function SourceHealthDrawer({ ctx }: { ctx: ReturnType<typeof useFabrikaContext> }) {
  const [open, setOpen] = useState(false);
  const readyCount = [ctx.artists, ctx.tracks, ctx.albums, ctx.events, ctx.finances].filter(arr => Array.isArray(arr) && arr.length > 0).length;

  return (
    <div className="border-t border-border/30 pt-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors w-full">
        <Database className="w-3 h-3" /><span>Kaynak Durumu</span>
        <span className="bg-muted px-1.5 py-0.5 rounded-full text-[9px]">{readyCount}/5 bağlı</span>
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="pt-3 space-y-1.5">
              {[
                { label: 'Sanatçılar (Katalog)', id: 'yEjrmczcFwSrYQBn', count: ctx.artists.length },
                { label: 'Trackler (Katalog)', id: 'JYDvWUVTRtjtN9Hx', count: ctx.tracks.length },
                { label: 'Albümler', id: 'JYDvWUVTRtjtN9Hx', count: ctx.albums.length },
                { label: 'Takvim', id: 'FwJpuE4BjZoB7zif', count: ctx.events.length },
                { label: 'Finans', id: 'w5EPpzmGJ3pnwZtS', count: ctx.finances.length },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 text-[10px]">
                  <span className={cn('w-1.5 h-1.5 rounded-full', (() => { const hasData = s.count > 0; return hasData; })() ? 'bg-green-500' : 'bg-muted-foreground/30')} />
                  <span className="flex-1">{s.label}</span>
                  <span className="text-muted-foreground tabular-nums">{s.count} kayıt</span>
                  <code className="text-[9px] bg-muted/50 px-1 py-0.5 rounded">{s.id}</code>
                </div>))}
              {ctx.error && <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{ctx.error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>);
}

/* ───────────────────────────────────────────────
   MAIN FABRİKA MODULE
   ─────────────────────────────────────────────── */
export default function FabrikaModule() {
  const [section, setSection] = useState<FabrikaSection>('uretim_sohbeti');
  const ctx = useFabrikaContext();

  const renderSection = () => {
    switch (section) {
      case 'uretim_sohbeti': return <UretimSohbeti ctx={ctx} onNavigate={setSection} />;
      case 'uretim_masasi': return <UretimMasasi ctx={ctx} onNavigate={setSection} />;
      case 'uretim_gecmisi': return <UretimGecmisiPanel onNavigate={setSection} />;
      case 'sanatcilar': return <SanatcilarPanel artists={ctx.artists} loading={ctx.loading} />;
      case 'brand_kits': return <BrandKitsPanel />;
      case 'sarkilar': return <SarkilarPanel tracks={ctx.tracks} loading={ctx.loading} />;
      case 'album_konseptleri': return <AlbumKonseptleriPanel albums={ctx.albums} tracks={ctx.tracks} />;
      case 'kanal_niche': return <KanalNichePanel />;
      case 'prompt_atolyesi': return <PromptAtolyesiPanel tracks={ctx.tracks} />;
      case 'release_plani': return <ReleasePlaniPanel events={ctx.events} tracks={ctx.tracks} />;
      case 'ekip': return <EkipPanel />;
      default: return <UretimSohbeti ctx={ctx} onNavigate={setSection} />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <Factory className="w-5 h-5 text-amber-500" />
        </div>
        <div><h1 className="text-xl font-bold tracking-tight">FABRİKA</h1><p className="text-xs text-muted-foreground">Zaruret Records · Yaratıcı Üretim Masası</p></div>
        <span className="ml-auto text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-full font-mono">v0.4.0</span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {FABRIKA_SECTIONS.map(sec => {
          const isActive = section === sec.id;
          const IconC = ICON_MAP[sec.icon] || Sparkles;
          return (<button key={sec.id} onClick={() => setSection(sec.id)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200', isActive ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><IconC className="w-3.5 h-3.5" />{sec.label}</button>);
        })}
      </div>
      <div key={section}>{renderSection()}</div>
      <SourceHealthDrawer ctx={ctx} />
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-2">
        <span>Codex #020</span><span>·</span><span>v0.4.0</span><span>·</span><span>AGENT_BRIDGE_PENDING</span><span>·</span><span>Zaruret Records</span>
      </div>
    </div>);
}




