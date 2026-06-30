/**
 * FABRİKA — Zaruret Records Creative Production Workbench
 * 
 * Veri katmanı: MİHENK projelerinden gerçek veri okur.
 * Brand Kit ve Ekip tanımları burada yaşar.
 * 
 * Codex Handoff #019 — Task: 413c18fc-8fe4-449a-92e2-b6a473bb9923
 */

import { useState, useEffect, useCallback } from 'react';
import { mihenkAPI } from '@/lib/mihenk-data';
import type { HayatArtist, HayatAlbumTrack, HayatEvent, HayatFinanceRecord } from '@/lib/mihenk-data';

/* ──────────────── PROJE ID'LERİ ──────────────── */
export const FABRIKA_PROJECTS = {
  artists: 'yEjrmczcFwSrYQBn',
  tracks: 'JYDvWUVTRtjtN9Hx',
  calendar: 'FwJpuE4BjZoB7zif',
  finance: 'w5EPpzmGJ3pnwZtS',
} as const;

/* ──────────────── BRAND KIT ──────────────── */
export interface BrandKit {
  id: string;
  artistOrProject: string;
  visualConcept: string;
  colorPalette: string[];
  logoDirection: string;
  typography: string;
  toneOfVoice: string;
  keyVocabulary: string;
  avoidWords: string;
  aiDisclosureFormat: string;
  coverArtFamilies: string;
  createdAt: string;
}

export const EMPTY_BRAND_KIT: BrandKit = {
  id: '',
  artistOrProject: '',
  visualConcept: '',
  colorPalette: ['#000000', '#ffffff'],
  logoDirection: '',
  typography: '',
  toneOfVoice: '',
  keyVocabulary: '',
  avoidWords: '',
  aiDisclosureFormat: '',
  coverArtFamilies: '',
  createdAt: '',
};

/* ──────────────── TEAM ──────────────── */
export interface FabrikaTeamRole {
  id: string;
  name: string;
  emoji: string;
  description: string;
  handoffPrompt: string;
  status: 'AGENT_BRIDGE_PENDING' | 'ACTIVE';
  agentId?: string;
}

export const FABRIKA_TEAM: FabrikaTeamRole[] = [
  {
    id: 'brand_architect',
    name: 'Brand Architect',
    emoji: '🏛️',
    description: 'Artist persona, brand identity, visual world kurar. Tone of voice, renk paleti, logo yönü belirler.',
    handoffPrompt: 'You are a Brand Architect for Zaruret Records. Given an artist name and genre, create a complete brand identity: visual concept, color palette (3-5 hex codes), logo direction, typography pairing, tone of voice guidelines, key vocabulary (5-8 words), avoid words (5-8 words), AI disclosure format, and cover art family concepts. Output structured JSON.',
    status: 'ACTIVE',
    agentId: '01KVAMD3H5B2J3SQQ1DP0G188H',
  },
  {
    id: 'lyricist',
    name: 'Lyricist / Songwriter',
    emoji: '✍️',
    description: 'Türkçe/İngilizce şarkı sözü yazar. Verse, chorus, bridge yapısı kurar. Sonic DNA ile uyumlu çalışır.',
    handoffPrompt: 'You are a Lyricist for Zaruret Records. Given an artist persona (sonic DNA, genre, tone), write original lyrics in Turkish or English. Structure: verse 1, chorus, verse 2, chorus, bridge, final chorus. Match the artist\'s tone of voice. Include rhyme scheme notes.',
    status: 'ACTIVE',
    agentId: '01KVAMD3H5B2J3SQQ1DP0G188H',
  },
  {
    id: 'suno_engineer',
    name: 'Suno Prompt Engineer',
    emoji: '🎛️',
    description: 'Genre, BPM, key, mood parametreleriyle Suno AI prompt üretir. Structure tag mastery.',
    handoffPrompt: 'You are a Suno Prompt Engineer for Zaruret Records. Given a song concept (genre, BPM, key, mood, sonic DNA), craft an optimized Suno v4 prompt. Use proper structure tags [Verse], [Chorus], [Bridge]. Include style descriptors, instrumentation hints, and vocal direction. Output the exact prompt ready to paste into Suno.',
    status: 'ACTIVE',
    agentId: '01KVAMD3H5B2J3SQQ1DP0G188H',
  },
  {
    id: 'channel_strategist',
    name: 'Channel Strategist',
    emoji: '📺',
    description: 'YouTube kanal konsepti, niche analizi, içerik takvimi, SEO stratejisi kurar.',
    handoffPrompt: 'You are a Channel Strategist for Zaruret Records. Given an artist persona and genre, design a YouTube channel strategy: channel name options, niche positioning, content pillars (3-5), first 10 video ideas, SEO keyword clusters, thumbnail style direction, and release cadence recommendation.',
    status: 'ACTIVE',
    agentId: '01KVAMD3H5B2J3SQQ1DP0G188H',
  },
  {
    id: 'visual_director',
    name: 'Visual Director',
    emoji: '🎨',
    description: 'Kapak tasarımı, visual world, klip estetiği, sosyal medya görsel dilini yönetir.',
    handoffPrompt: 'You are a Visual Director for Zaruret Records. Given a brand kit (color palette, typography, visual concept), design: cover art direction for single/EP/album, music video aesthetic brief, social media visual language, and a cohesive visual world description. Include reference aesthetics.',
    status: 'ACTIVE',
    agentId: '01KVAMD3H5B2J3SQQ1DP0G188H',
  },
  {
    id: 'label_manager',
    name: 'Label Manager',
    emoji: '📋',
    description: 'Release planı, dağıtım stratejisi, bütçe, takvim, ekip koordinasyonu yapar.',
    handoffPrompt: 'You are a Label Manager for Zaruret Records. Given an artist and album/single concept, create a release plan: pre-release timeline (teaser, pre-save, premiere), distribution platforms, playlist pitching strategy, PR angles, budget estimate categories, and 90-day post-release timeline.',
    status: 'ACTIVE',
    agentId: '01KVAMD3H5B2J3SQQ1DP0G188H',
  },
  {
    id: 'research_analyst',
    name: 'Research Analyst',
    emoji: '🔍',
    description: 'Tür analizi, rakip araştırması, trend tracking, Chartmetric verisi yorumlar.',
    handoffPrompt: 'You are a Research Analyst for Zaruret Records. Given a genre, region, and target audience, research: current genre trends, top 5 comparable artists, underserved niches, playlist ecosystem overview, and strategic recommendations for market entry.',
    status: 'ACTIVE',
    agentId: '01KVAMD3H5B2J3SQQ1DP0G188H',
  },
];

/* ──────────────── QUICK ACTIONS (Üretim Masası) ──────────────── */
export interface FabrikaQuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  teamRoleId?: string;
}

export const FABRIKA_ACTIONS: FabrikaQuickAction[] = [
  {
    id: 'create_artist',
    label: 'Yeni Sanatçı Üret',
    description: 'Kurgusal veya gerçek artist persona kur. Sonic DNA, genre, origin tanımla.',
    icon: 'mic',
    color: 'text-violet-500',
    bg: 'bg-violet-100 dark:bg-violet-900/20',
    teamRoleId: 'brand_architect',
  },
  {
    id: 'create_brand_kit',
    label: 'Brand Kit Üret',
    description: 'Görsel kimlik, renk paleti, tone of voice, AI disclosure formatı.',
    icon: 'palette',
    color: 'text-rose-500',
    bg: 'bg-rose-100 dark:bg-rose-900/20',
    teamRoleId: 'brand_architect',
  },
  {
    id: 'create_album_concept',
    label: 'Albüm Konsepti Kur',
    description: 'EP/Albüm/Single konsepti, tracklist, sonic ark, kapak yönü.',
    icon: 'disc',
    color: 'text-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/20',
  },
  {
    id: 'create_channel_niche',
    label: 'Kanal / Niche Bul',
    description: 'YouTube kanal konsepti, içerik sütunları, hedef kitle analizi.',
    icon: 'youtube',
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/20',
    teamRoleId: 'channel_strategist',
  },
  {
    id: 'write_lyrics',
    label: 'Şarkı Sözü Yaz',
    description: 'Verse, chorus, bridge. Sanatçı sonic DNA\'sına uygun.',
    icon: 'pen-tool',
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    teamRoleId: 'lyricist',
  },
  {
    id: 'create_suno_prompt',
    label: 'Suno Prompt Üret',
    description: 'Structure tag, style descriptor, BPM/key/mood optimize.',
    icon: 'sparkles',
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    teamRoleId: 'suno_engineer',
  },
  {
    id: 'design_cover_art',
    label: 'Kapak / Visual World Tasarla',
    description: 'Cover art direction, klip estetiği, sosyal medya görsel dili.',
    icon: 'image',
    color: 'text-pink-500',
    bg: 'bg-pink-100 dark:bg-pink-900/20',
    teamRoleId: 'visual_director',
  },
  {
    id: 'create_release_plan',
    label: 'Release Planı Oluştur',
    description: 'Pre-release timeline, dağıtım, pitching, 90 günlük plan.',
    icon: 'calendar',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/20',
    teamRoleId: 'label_manager',
  },
  {
    id: 'create_channel_strategy',
    label: 'Kanal Stratejisi Hazırla',
    description: 'İçerik takvimi, SEO, thumbnail dili, release cadence.',
    icon: 'trending-up',
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    teamRoleId: 'channel_strategist',
  },
];

/* ──────────────── DATA FETCH HOOK ──────────────── */
export interface FabrikaContext {
  artists: HayatArtist[];
  tracks: HayatAlbumTrack[];
  albums: HayatAlbumTrack[];
  events: HayatEvent[];
  finances: HayatFinanceRecord[];
  loadedAt: Date | null;
  loading: boolean;
  error: string | null;
}

export function useFabrikaContext(): FabrikaContext & { refetch: () => void } {
  const [ctx, setCtx] = useState<FabrikaContext>({
    artists: [], tracks: [], albums: [], events: [], finances: [],
    loadedAt: null, loading: true, error: null,
  });

  const load = useCallback(async () => {
    setCtx(p => ({ ...p, loading: true, error: null }));
    try {
      const [artists, tracks, albums, events, finances] = await Promise.all([
        mihenkAPI.getArtists(),
        mihenkAPI.getAlbumTracks(),
        mihenkAPI.getAlbums(),
        mihenkAPI.getEvents(),
        mihenkAPI.getFinanceRecords(),
      ]);
      setCtx({ artists, tracks, albums, events, finances, loadedAt: new Date(), loading: false, error: null });
    } catch (e: unknown) {
      setCtx(p => ({
        ...p, loading: false,
        error: e instanceof Error ? e.message : 'Veri yüklenemedi',
      }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { ...ctx, refetch: load };
}

/* ──────────────── NAVIGATION ──────────────── */
export type FabrikaSection =
  | 'uretim_sohbeti'
  | 'uretim_masasi'
  | 'uretim_gecmisi'
  | 'sanatcilar'
  | 'brand_kits'
  | 'sarkilar'
  | 'album_konseptleri'
  | 'kanal_niche'
  | 'prompt_atolyesi'
  | 'release_plani'
  | 'ekip';

export const FABRIKA_SECTIONS: { id: FabrikaSection; label: string; icon: string }[] = [
  { id: 'uretim_sohbeti', label: 'Üretim Sohbeti', icon: 'message-circle' },
  { id: 'uretim_masasi', label: 'Üretim Masası', icon: 'factory' },
  { id: 'uretim_gecmisi', label: 'Üretim Geçmişi', icon: 'clock' },
  { id: 'sanatcilar', label: 'Sanatçılar', icon: 'mic' },
  { id: 'brand_kits', label: 'Brand Kits', icon: 'palette' },
  { id: 'sarkilar', label: 'Şarkılar', icon: 'music' },
  { id: 'album_konseptleri', label: 'Albüm Konseptleri', icon: 'disc' },
  { id: 'kanal_niche', label: 'Kanal & Niche', icon: 'youtube' },
  { id: 'prompt_atolyesi', label: 'Prompt Atölyesi', icon: 'sparkles' },
  { id: 'release_plani', label: 'Release Planı', icon: 'calendar' },
  { id: 'ekip', label: 'Ekip', icon: 'users' },
];

/* ──────────────── PRODUCTION CHAT ──────────────── */
export type ProductionStep = 'brief' | 'role_select' | 'generate' | 'save';

export interface ProductionBrief {
  text: string;
  contextArtistId?: string;
  contextTrackId?: string;
  contextGenre?: string;
}

export interface RoleMatch {
  role: FabrikaTeamRole;
  score: number;
  reason: string;
}

export interface ProductionOutput {
  roleId: string;
  brief: ProductionBrief;
  content: string;
  targetProjectId: string;
  targetProjectName: string;
  approved: boolean;
  createdAt: string;
}

/** Keyword → role mapping for brief analysis */
const ROLE_KEYWORDS: Record<string, string[]> = {
  brand_architect: ['brand', 'identity', 'logo', 'renk', 'palet', 'typography', 'tone of voice', 'visual', 'persona', 'karakter', 'sanatçı kimliği', 'görsel kimlik'],
  lyricist: ['söz', 'lyrics', 'şarkı sözü', 'verse', 'chorus', 'yaz', 'write song', 'track sözü', 'dize', 'nakarat'],
  suno_engineer: ['suno', 'prompt', 'ai music', 'generate music', 'style', 'bpm', 'key', 'structure tag', 'üret', 'müzik üret'],
  channel_strategist: ['youtube', 'kanal', 'channel', 'niche', 'içerik', 'content', 'strateg', 'strateji', 'video', 'seo', 'thumbnail', 'abone'],
  visual_director: ['kapak', 'cover', 'visual', 'görsel', 'tasarım', 'design', 'klip', 'aesthetic', 'artwork', 'poster'],
  label_manager: ['release', 'yayın', 'dağıtım', 'distribution', 'pitching', 'plan', 'timeline', 'tarih', 'lansman', 'bütçe'],
  research_analyst: ['araştır', 'research', 'analiz', 'trend', 'rakip', 'competitor', 'market', 'pazar', 'genre analysis', 'chartmetric'],
};

export function recommendRoles(brief: string): RoleMatch[] {
  const lower = brief.toLowerCase();
  const matches: RoleMatch[] = [];

  for (const teamRole of FABRIKA_TEAM) {
    const keywords = ROLE_KEYWORDS[teamRole.id] || [];
    let score = 0;
    const matchedWords: string[] = [];
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) { score += 1; matchedWords.push(kw); }
    }
    if (score > 0) {
      matches.push({
        role: teamRole,
        score,
        reason: `Eşleşen: ${matchedWords.slice(0, 3).join(', ')}`,
      });
    }
  }

  // If no keyword match, return top 3 generic roles
  if (matches.length === 0) {
    return FABRIKA_TEAM.slice(0, 3).map((r) => ({
      role: r,
      score: 0,
      reason: 'Genel öneri — brief daha spesifik olabilir.',
    }));
  }

  return matches.sort((a, b) => b.score - a.score);
}

export function generateOutputTemplate(roleId: string, brief: ProductionBrief): ProductionOutput {
  const role = FABRIKA_TEAM.find(r => r.id === roleId)!;
  const header = `// FABRİKA Üretim Çıktısı\n// Rol: ${role.name} ${role.emoji}\n// Brief: ${brief.text}\n// Durum: AGENT_BRIDGE_PENDING (şablon çıktı)\n// Tarih: ${new Date().toISOString()}\n\n`;
  
  const templates: Record<string, string> = {
    brand_architect: `${header}ARTIST PERSONA\nAd: [sanatçı adı]\nTür: [solo/grup/proje]\nOrigin: [kurgusal/gerçek]\n\nBRAND IDENTITY\nVisual Concept: ${brief.text}\nColor Palette: #[primary], #[secondary], #[accent], #[neutral], #[dark]\nLogo Direction: [minimalist/typographic/symbolic]\nTypography: [heading font] + [body font]\n\nTONE OF VOICE\nStyle: [tanımla]\nKey Vocabulary: [5-8 kelime]\nAvoid Words: [5-8 kelime]\n\nAI DISCLOSURE\nFormat: [AI ile üretildi bildirimi]\n\nCOVER ART FAMILIES\n1. [aile 1 açıklama]\n2. [aile 2 açıklama]\n3. [aile 3 açıklama]`,
    lyricist: `${header}ŞARKI SÖZÜ\n\n[Verse 1]\n...\n\n[Chorus]\n...\n\n[Verse 2]\n...\n\n[Chorus]\n...\n\n[Bridge]\n...\n\n[Final Chorus]\n...\n\nRhyme Scheme: [ABAB / AABB]\nLanguage: [Türkçe / İngilizce]\nSonic DNA Uyumu: ${brief.contextGenre || 'belirtilmedi'}`,
    suno_engineer: `${header}SUNO PROMPT v4\n\n[Style: ${brief.contextGenre || 'cinematic electronic'}]\n[BPM: 120]\n[Key: Am]\n[Mood: dark, atmospheric]\n\n[Intro] — ambient texture\n[Verse 1] — minimalist beat\n[Chorus] — full production\n[Verse 2] — variation\n[Chorus]\n[Bridge] — breakdown\n[Final Chorus] — climax\n[Outro] — fade\n\nInstrumentation: analog synths, deep 808, reverb pads`,
    channel_strategist: `${header}YOUTUBE KANAL STRATEJİSİ\n\nKanal Adı: [öneri]\nNiche: ${brief.text}\n\nCONTENT PILLARS\n1. [sütun 1]\n2. [sütun 2]\n3. [sütun 3]\n\nİLK 10 VİDEO\n1. [video fikri]\n2. [video fikri]\n...\n\nSEO KELİME KÜMESİ\n- [primary kw]\n- [secondary kw]\n\nTHUMBNAIL DİLİ: [style]\nRELEASE CADENCE: [haftalık/2 haftada/günlük]`,
    visual_director: `${header}GÖRSEL DÜNYA TASARIMI\n\nCOVER ART DIRECTION\nSingle: [açıklama]\nEP/Album: [açıklama]\n\nMUSIC VIDEO AESTHETIC\n[klip estetiği brief]\n\nSOCIAL MEDIA VISUAL LANGUAGE\n[görsel dil]\n\nREFERENCE AESTHETICS\n- [referans 1]\n- [referans 2]`,
    label_manager: `${header}RELEASE PLANI\n\nPre-Release (4 hafta):\n- [adım]\n\nRelease Day:\n- [adım]\n\nWeek 1:\n- [adım]\n\nMonth 1:\n- [adım]\n\nMonth 3:\n- [adım]\n\nDAĞITIM: [platformlar]\nPLAYLIST PITCHING: [listeler]\nBÜTÇE KALEMLERİ: [tahmin]`,
    research_analyst: `${header}PAZAR ARAŞTIRMASI\n\nGenre: ${brief.contextGenre || 'belirtilmedi'}\nRegion: [bölge]\n\nTRENDS\n- [trend 1]\n- [trend 2]\n\nCOMPARABLE ARTISTS (Top 5)\n1. [artist]\n2. [artist]\n...\n\nUNDERSERVED NICHES\n- [niche]\n\nSTRATEJİK ÖNERİ: [öneri]`,
  };

  const targetMap: Record<string, { projectId: string; name: string }> = {
    brand_architect: { projectId: 'LOCAL_BRAND_KITS', name: 'Brand Kits (local)' },
    lyricist: { projectId: 'JYDvWUVTRtjtN9Hx', name: 'MİHENK Katalog Tracks' },
    suno_engineer: { projectId: 'LOCAL_SUNO_PROMPTS', name: 'Suno Prompts (local)' },
    channel_strategist: { projectId: 'LOCAL_CHANNELS', name: 'YouTube Kanalları (local)' },
    visual_director: { projectId: 'LOCAL_BRAND_KITS', name: 'Brand Kits (local)' },
    label_manager: { projectId: 'FwJpuE4BjZoB7zif', name: 'MİHENK Takvim' },
    research_analyst: { projectId: 'LOCAL_RESEARCH', name: 'Araştırma (local)' },
  };

  return {
    roleId,
    brief,
    content: templates[roleId] || `${header}[Bu rol için şablon henüz tanımlanmadı.]`,
    targetProjectId: targetMap[roleId]?.projectId || 'LOCAL',
    targetProjectName: targetMap[roleId]?.name || 'Local',
    approved: false,
    createdAt: new Date().toISOString(),
  };
}

/* ──────────────── BRAND KIT LOCAL STORAGE ──────────────── */
const BK_STORAGE_KEY = 'fabrika_brand_kits';

export function loadBrandKits(): BrandKit[] {
  try {
    const raw = localStorage.getItem(BK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveBrandKits(kits: BrandKit[]): void {
  localStorage.setItem(BK_STORAGE_KEY, JSON.stringify(kits));
}

/* ──────────────── PRODUCTION OUTPUT LOCAL STORAGE ──────────────── */
const PO_STORAGE_KEY = 'fabrika_production_outputs';

export function loadProductionOutputs(): ProductionOutput[] {
  try {
    const raw = localStorage.getItem(PO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveProductionOutputs(outputs: ProductionOutput[]): void {
  localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(outputs));
}

/**
 * Parse Brand Architect output text into a structured BrandKit.
 * Extracts fields from the template output using line-by-line parsing.
 * Falls back to brief text for any field that can't be parsed.
 */
export function parseBrandKitFromOutput(content: string, brief: string): BrandKit {
  const lines = content.split('\n');
  const extract = (label: string): string => {
    const line = lines.find(l => l.toLowerCase().includes(label.toLowerCase() + ':'));
    if (!line) return '';
    const colonIdx = line.indexOf(':');
    return colonIdx >= 0 ? line.slice(colonIdx + 1).trim() : '';
  };

  const extractSection = (startLabel: string, endLabels: string[]): string => {
    const startIdx = lines.findIndex(l => l.toLowerCase().includes(startLabel.toLowerCase()));
    if (startIdx < 0) return '';
    const collected: string[] = [];
    for (let i = startIdx + 1; i < lines.length; i++) {
      const lower = lines[i].toLowerCase();
      const isEnd = endLabels.some(e => lower.includes(e.toLowerCase()));
      if (isEnd) break;
      const trimmed = lines[i].replace(/^[\s\-\d.]+/, '').trim();
      if (trimmed) collected.push(trimmed);
    }
    return collected.join(', ');
  };

  // Extract color palette: look for hex codes
  const hexMatches = content.match(/#[0-9a-fA-F]{3,8}/g) || [];
  const palette = hexMatches.length > 0 ? hexMatches.slice(0, 6) : ['#000000', '#ffffff'];

  // Extract artist name from output
  const artistName = extract('Ad') || extract('Artist') || extract('Proje') || brief.slice(0, 60);

  return {
    id: `bk_auto_${Date.now().toString(36)}`,
    artistOrProject: artistName,
    visualConcept: extract('Visual Concept') || extract('Concept') || '',
    colorPalette: palette,
    logoDirection: extract('Logo Direction') || extract('Logo') || '',
    typography: extract('Typography') || extract('Font') || '',
    toneOfVoice: extract('Style') || extract('Tone') || '',
    keyVocabulary: extract('Key Vocabulary') || extractSection('Key Vocabulary', ['Avoid', 'AI Disclosure', 'Cover']),
    avoidWords: extract('Avoid Words') || extractSection('Avoid Words', ['AI Disclosure', 'Cover Art']),
    aiDisclosureFormat: extract('AI Disclosure') || extract('Format') || '',
    coverArtFamilies: extractSection('Cover Art', []),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Save a production output AND auto-create a Brand Kit entry
 * when the output role is brand_architect.
 * This bridges the readback gap: Üretim Sohbeti → Brand Kits tab.
 */
export function saveProductionOutput(output: ProductionOutput): void {
  // 1. Always save to production outputs
  const outputs = loadProductionOutputs();
  outputs.unshift(output);
  saveProductionOutputs(outputs);

  // 2. If brand_architect → also create a BrandKit entry
  if (output.roleId === 'brand_architect' && output.approved) {
    const kit = parseBrandKitFromOutput(output.content, output.brief.text);
    const kits = loadBrandKits();
    kits.unshift(kit);
    saveBrandKits(kits);
  }
}
