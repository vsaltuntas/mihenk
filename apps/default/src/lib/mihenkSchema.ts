/**
 * MİHENK — Architecture Schema v1.0
 * Kişisel Hakikat, Üretim ve Yaşam İşletim Sistemi
 *
 * Bu dosya MİHENK'in mimari anayasasıdır.
 * Taskade'den bağımsızdır. Taşınabilir. Canonical.
 *
 * İlkeler:
 * 1. mihenk_id canonical'dir — platform ID'si değişebilir
 * 2. Sözleşmeler platformdan bağımsızdır
 * 3. Her kayıt export edilebilir, import edilebilir
 * 4. Her önemli olay audit trail bırakır
 */

import { ulid } from 'ulidx';

// ── 1. MIHENK ID SYSTEM ──

export type MihenkId = `mihenk_${string}_${string}`;

export function generateMihenkId(module: MihenkModuleKey): MihenkId {
  return `mihenk_${module}_${ulid()}` as MihenkId;
}

export function parseMihenkId(id: string): { prefix: 'mihenk'; module: string; ulid: string } | null {
  const parts = id.split('_');
  if (parts.length < 3 || parts[0] !== 'mihenk') return null;
  return { prefix: 'mihenk', module: parts[1], ulid: parts.slice(2).join('_') };
}

export function isValidMihenkId(id: string): id is MihenkId {
  return parseMihenkId(id) !== null;
}

// ── 2. MODULE REGISTRY ──

export type MihenkModuleKey =
  | 'gun_masasi' | 'sabah_brifingi' | 'bildirim_merkezi' | 'enerji_modu' | 'sistem_nabzi_ozet'
  | 'fikirler' | 'sinyaller' | 'yer_imleri' | 'hizli_not' | 'hizli_gorev'
  | 'projeler' | 'gorevler' | 'takvim' | 'tekrarlayan' | 'sablonlar'
  | 'notlar' | 'bilgi_haritasi' | 'dosyalar' | 'derin_arastirma' | 'karsilastir' | 'cookbook'
  | 'katalog' | 'maestro' | 'uretimler' | 'youtube' | 'chartmetric' | 'release_radar'
  | 'verselab' | 'lyrics_lab' | 'turku_arsivi' | 'studyom' | 'ses_analiz' | 'mix_room' | 'klip_studio'
  | 'kisiler' | 'inbox_mail' | 'sozlesmeler' | 'firsatlar' | 'konser_tur'
  | 'finans' | 'zenzone' | 'wellness' | 'yasam_raporu'
  | 'mihenk_asistani' | 'ajan_konseyi' | 'workforce' | 'pipeline' | 'otomasyonlar' | 'uygulama_atolyesi'
  | 'erisim' | 'sistem_nabzi' | 'backup' | 'onboarding' | 'ayarlar' | 'guvenlik_mahremiyet'
  | 'maden' | 'veri_kazisi' | 'celiski_motoru' | 'kanit_kuyrugu' | 'kapali_oda';

export type ModuleStatus = 'active' | 'planned';

export interface ModuleRegistryEntry {

export const MODULE_REGISTRY: Record<MihenkModuleKey, ModuleRegistryEntry> = {
  gun_masasi:        { key: 'gun_masasi',        label: 'Gün Masası',      group: 'bugun',        status: 'planned', futureTable: 'mihenk_dashboard',       taskadeProjectId: null },
  sabah_brifingi:    { key: 'sabah_brifingi',    label: 'Sabah Brifingi',  group: 'bugun',        status: 'planned', futureTable: 'mihenk_briefings',      taskadeProjectId: null },
  bildirim_merkezi:  { key: 'bildirim_merkezi',  label: 'Bildirimler',     group: 'bugun',        status: 'planned', futureTable: 'mihenk_notifications',  taskadeProjectId: null },
  enerji_modu:       { key: 'enerji_modu',       label: 'Enerji Modu',     group: 'bugun',        status: 'planned', futureTable: 'mihenk_energy_modes',   taskadeProjectId: null },
  sistem_nabzi_ozet: { key: 'sistem_nabzi_ozet', label: 'Sistem Nabzı',    group: 'bugun',        status: 'planned', futureTable: 'mihenk_system_health',  taskadeProjectId: null },
  fikirler:    { key: 'fikirler',    label: 'Fikirler',    group: 'yakalama',    status: 'active',  futureTable: 'mihenk_ideas',       taskadeProjectId: null },
  sinyaller:   { key: 'sinyaller',   label: 'Sinyaller',   group: 'yakalama',    status: 'planned', futureTable: 'mihenk_signals',     taskadeProjectId: null },
  yer_imleri:  { key: 'yer_imleri',  label: 'Yer İmleri',  group: 'yakalama',    status: 'planned', futureTable: 'mihenk_bookmarks',   taskadeProjectId: null },
  hizli_not:   { key: 'hizli_not',   label: 'Hızlı Not',   group: 'yakalama',    status: 'planned', futureTable: 'mihenk_quick_notes', taskadeProjectId: null },
  hizli_gorev: { key: 'hizli_gorev', label: 'Hızlı Görev', group: 'yakalama',    status: 'planned', futureTable: 'mihenk_quick_tasks', taskadeProjectId: null },
  projeler:    { key: 'projeler',    label: 'Projeler',    group: 'is_omurgasi', status: 'active',  futureTable: 'mihenk_projects',    taskadeProjectId: 'qujHhVX1pJpC2Jh4' },
  gorevler:    { key: 'gorevler',    label: 'Görevler',    group: 'is_omurgasi', status: 'active',  futureTable: 'mihenk_tasks',       taskadeProjectId: 'qujHhVX1pJpC2Jh4' },
  takvim:      { key: 'takvim',      label: 'Takvim',      group: 'is_omurgasi', status: 'planned', futureTable: 'mihenk_calendar',    taskadeProjectId: 'FwJpuE4BjZoB7zif' },
  tekrarlayan: { key: 'tekrarlayan', label: 'Tekrarlayan', group: 'is_omurgasi', status: 'planned', futureTable: 'mihenk_recurring',   taskadeProjectId: null },
  sablonlar:   { key: 'sablonlar',   label: 'Şablonlar',   group: 'is_omurgasi', status: 'planned', futureTable: 'mihenk_templates',   taskadeProjectId: null },
  notlar:          { key: 'notlar',          label: 'Notlar',          group: 'bilgi_hafiza', status: 'active',  futureTable: 'mihenk_notes',        taskadeProjectId: 'Ba6qULrBj9iCmoBw' },
  bilgi_haritasi:  { key: 'bilgi_haritasi',  label: 'Bilgi Haritası',  group: 'bilgi_hafiza', status: 'planned', futureTable: 'mihenk_knowledge',    taskadeProjectId: null },
  dosyalar:        { key: 'dosyalar',        label: 'Dosyalar',        group: 'bilgi_hafiza', status: 'planned', futureTable: 'mihenk_files',        taskadeProjectId: null },
  derin_arastirma: { key: 'derin_arastirma', label: 'Derin Araştırma', group: 'bilgi_hafiza', status: 'planned', futureTable: 'mihenk_research',     taskadeProjectId: null },
  karsilastir:     { key: 'karsilastir',     label: 'Karşılaştır',     group: 'bilgi_hafiza', status: 'planned', futureTable: 'mihenk_comparisons',  taskadeProjectId: null },
  cookbook:         { key: 'cookbook',         label: 'Cookbook',         group: 'bilgi_hafiza', status: 'planned', futureTable: 'mihenk_cookbook',      taskadeProjectId: null },
  katalog:       { key: 'katalog',       label: 'Katalog',       group: 'muzik_yayin', status: 'active',  futureTable: 'mihenk_catalog',      taskadeProjectId: 'yEjrmczcFwSrYQBn' },
  maestro:       { key: 'maestro',       label: 'Maestro',       group: 'muzik_yayin', status: 'planned', futureTable: 'mihenk_maestro',      taskadeProjectId: null },
  uretimler:     { key: 'uretimler',     label: 'Üretimler',     group: 'muzik_yayin', status: 'planned', futureTable: 'mihenk_productions',  taskadeProjectId: null },
  youtube:       { key: 'youtube',       label: 'YouTube',       group: 'muzik_yayin', status: 'planned', futureTable: 'mihenk_youtube',      taskadeProjectId: null },
  chartmetric:   { key: 'chartmetric',   label: 'Chartmetric',   group: 'muzik_yayin', status: 'planned', futureTable: 'mihenk_chartmetric',  taskadeProjectId: null },
  release_radar: { key: 'release_radar', label: 'Release Radar', group: 'muzik_yayin', status: 'planned', futureTable: 'mihenk_releases',     taskadeProjectId: null },
  verselab:     { key: 'verselab',     label: 'VerseLab',     group: 'studyo', status: 'planned', futureTable: 'mihenk_verselab',       taskadeProjectId: null },
  lyrics_lab:   { key: 'lyrics_lab',   label: 'LyricsLab',    group: 'studyo', status: 'planned', futureTable: 'mihenk_lyrics',         taskadeProjectId: null },
  turku_arsivi: { key: 'turku_arsivi', label: 'Türkü Arşivi', group: 'studyo', status: 'planned', futureTable: 'mihenk_turku',          taskadeProjectId: null },
  studyom:      { key: 'studyom',      label: 'Stüdyom',      group: 'studyo', status: 'planned', futureTable: 'mihenk_studio',         taskadeProjectId: null },
  ses_analiz:   { key: 'ses_analiz',   label: 'Ses Analiz',   group: 'studyo', status: 'planned', futureTable: 'mihenk_audio_analysis', taskadeProjectId: null },
  mix_room:     { key: 'mix_room',     label: 'Mix Room',     group: 'studyo', status: 'planned', futureTable: 'mihenk_mixroom',        taskadeProjectId: null },
  klip_studio:  { key: 'klip_studio',  label: 'Klip Stüdyo',  group: 'studyo', status: 'planned', futureTable: 'mihenk_clips',          taskadeProjectId: null },
  kisiler:     { key: 'kisiler',     label: 'Kişiler',     group: 'insan_is', status: 'active',  futureTable: 'mihenk_contacts',      taskadeProjectId: 'CYeN3eSk4BASymrF' },
  inbox_mail:  { key: 'inbox_mail',  label: 'Inbox Mail',  group: 'insan_is', status: 'planned', futureTable: 'mihenk_inbox',         taskadeProjectId: null },
  sozlesmeler: { key: 'sozlesmeler', label: 'Sözleşmeler', group: 'insan_is', status: 'planned', futureTable: 'mihenk_contracts',     taskadeProjectId: null },
  firsatlar:   { key: 'firsatlar',   label: 'Fırsatlar',   group: 'insan_is', status: 'planned', futureTable: 'mihenk_opportunities', taskadeProjectId: null },
  konser_tur:  { key: 'konser_tur',  label: 'Konser/Tur',  group: 'insan_is', status: 'planned', futureTable: 'mihenk_tours',         taskadeProjectId: null },
  finans:       { key: 'finans',       label: 'Finans',       group: 'yasam', status: 'active',  futureTable: 'mihenk_finance',      taskadeProjectId: 'w5EPpzmGJ3pnwZtS' },
  zenzone:      { key: 'zenzone',      label: 'ZenZone',      group: 'yasam', status: 'planned', futureTable: 'mihenk_analytics',    taskadeProjectId: null },
  wellness:     { key: 'wellness',     label: 'Wellness',     group: 'yasam', status: 'planned', futureTable: 'mihenk_wellness',     taskadeProjectId: 'dBt8bMYNG8aL41Fv' },
  yasam_raporu: { key: 'yasam_raporu', label: 'Yaşam Raporu', group: 'yasam', status: 'planned', futureTable: 'mihenk_life_reports', taskadeProjectId: null },
  mihenk_asistani:   { key: 'mihenk_asistani',   label: 'MİHENK Asistanı',  group: 'ajanlar', status: 'planned', futureTable: 'mihenk_assistant',     taskadeProjectId: null },
  ajan_konseyi:      { key: 'ajan_konseyi',      label: 'Ajan Konseyi',     group: 'ajanlar', status: 'planned', futureTable: 'mihenk_agent_council', taskadeProjectId: null },
  workforce:         { key: 'workforce',         label: 'Workforce',        group: 'ajanlar', status: 'planned', futureTable: 'mihenk_workforce',     taskadeProjectId: null },
  pipeline:          { key: 'pipeline',          label: 'Pipeline',         group: 'ajanlar', status: 'planned', futureTable: 'mihenk_pipeline',      taskadeProjectId: null },
  otomasyonlar:      { key: 'otomasyonlar',      label: 'Otomasyonlar',     group: 'ajanlar', status: 'planned', futureTable: 'mihenk_automations',   taskadeProjectId: null },
  uygulama_atolyesi: { key: 'uygulama_atolyesi', label: 'Uygulama Atölyesi',group: 'ajanlar', status: 'planned', futureTable: 'mihenk_app_workshop',  taskadeProjectId: null },
  erisim:              { key: 'erisim',              label: 'Erişim',       group: 'sistem', status: 'planned', futureTable: 'mihenk_access',     taskadeProjectId: null },
  sistem_nabzi:        { key: 'sistem_nabzi',        label: 'Sistem Nabzı', group: 'sistem', status: 'planned', futureTable: 'mihenk_health',     taskadeProjectId: null },
  backup:              { key: 'backup',              label: 'Backup',       group: 'sistem', status: 'planned', futureTable: 'mihenk_backups',    taskadeProjectId: null },
  onboarding:          { key: 'onboarding',          label: 'Onboarding',   group: 'sistem', status: 'planned', futureTable: 'mihenk_onboarding', taskadeProjectId: null },
  ayarlar:             { key: 'ayarlar',             label: 'Ayarlar',      group: 'sistem', status: 'planned', futureTable: 'mihenk_settings',   taskadeProjectId: null },
  guvenlik_mahremiyet: { key: 'guvenlik_mahremiyet', label: 'Güvenlik',     group: 'sistem', status: 'planned', futureTable: 'mihenk_security',   taskadeProjectId: null },
  maden:          { key: 'maden',          label: 'Maden',          group: 'maden', status: 'planned', futureTable: 'mihenk_mine',           taskadeProjectId: null },
  veri_kazisi:    { key: 'veri_kazisi',    label: 'Veri Kazısı',    group: 'maden', status: 'planned', futureTable: 'mihenk_data_mining',    taskadeProjectId: null },
  celiski_motoru: { key: 'celiski_motoru', label: 'Çelişki Motoru', group: 'maden', status: 'planned', futureTable: 'mihenk_contradictions', taskadeProjectId: null },
  kanit_kuyrugu:  { key: 'kanit_kuyrugu',  label: 'Kanıt Kuyruğu', group: 'maden', status: 'planned', futureTable: 'mihenk_evidence',       taskadeProjectId: null },
  kapali_oda:     { key: 'kapali_oda',     label: 'Kapalı Oda',     group: 'maden', status: 'planned', futureTable: 'mihenk_private_room',   taskadeProjectId: null },
};

export function getActiveModules(): ModuleRegistryEntry[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.status === 'active');
}

  key: MihenkModuleKey;
  label: string;
  group: string;
  status: ModuleStatus;

// ── 3. FIELD TYPES (Platform-agnostic) ──

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum' | 'mihenk_ref' | 'string[]' | 'mihenk_ref[]';

export interface FieldContract {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  default?: unknown;
  options?: string[];
  refModule?: MihenkModuleKey;
  taskadeFieldId?: string;
  futureColumn?: string;
}

export interface ModuleContract {
  module: MihenkModuleKey;
  version: string;
  fields: FieldContract[];
}

// ── 4. DATA CONTRACTS — 6 Active Modules ──

export const CONTRACTS: Record<string, ModuleContract> = {
  projeler: {
    module: 'projeler', version: '1.0',
    fields: [
      { key: 'mihenk_id', label: 'MİHENK ID', type: 'string', required: true, taskadeFieldId: '@mhkid', futureColumn: 'mihenk_id' },
      { key: 'title', label: 'Başlık', type: 'string', required: true, futureColumn: 'title' },
      { key: 'status', label: 'Durum', type: 'enum', required: true, default: 'fikir', options: ['fikir','planlama','uretim','yayinda','arsiv'], taskadeFieldId: '@statu', futureColumn: 'status' },
      { key: 'channel', label: 'Kanal', type: 'enum', required: false, options: ['nikbinler','anatolian_lab','personal','other'], taskadeFieldId: '@kanal', futureColumn: 'channel' },
      { key: 'priority', label: 'Öncelik', type: 'enum', required: false, default: 'normal', options: ['acil','yuksek','normal','dusuk'], taskadeFieldId: '@prior', futureColumn: 'priority' },
      { key: 'category', label: 'Kategori', type: 'string', required: false, taskadeFieldId: '@kategori', futureColumn: 'category' },
      { key: 'notes', label: 'Notlar', type: 'string', required: false, taskadeFieldId: '@notla', futureColumn: 'notes' },
      { key: 'related_ids', label: 'İlişkiler', type: 'mihenk_ref[]', required: false, futureColumn: 'related_ids' },
      { key: 'created_at', label: 'Oluşturulma', type: 'datetime', required: true, futureColumn: 'created_at' },
      { key: 'updated_at', label: 'Güncellenme', type: 'datetime', required: true, futureColumn: 'updated_at' },
    ],
  },
  gorevler: {
    module: 'gorevler', version: '1.0',
    fields: [
      { key: 'mihenk_id', label: 'MİHENK ID', type: 'string', required: true, taskadeFieldId: '@mhkid', futureColumn: 'mihenk_id' },
      { key: 'title', label: 'Başlık', type: 'string', required: true, futureColumn: 'title' },
      { key: 'completed', label: 'Tamamlandı', type: 'boolean', required: true, default: false, futureColumn: 'completed' },
      { key: 'project_ref', label: 'Proje', type: 'mihenk_ref', required: false, refModule: 'projeler', futureColumn: 'project_id' },
      { key: 'priority', label: 'Öncelik', type: 'enum', required: false, default: 'normal', options: ['acil','yuksek','normal','dusuk'], futureColumn: 'priority' },
      { key: 'due_date', label: 'Son Tarih', type: 'date', required: false, futureColumn: 'due_date' },
      { key: 'tags', label: 'Etiketler', type: 'string[]', required: false, futureColumn: 'tags' },
      { key: 'created_at', label: 'Oluşturulma', type: 'datetime', required: true, futureColumn: 'created_at' },
      { key: 'updated_at', label: 'Güncellenme', type: 'datetime', required: true, futureColumn: 'updated_at' },
    ],
  },
  notlar: {
    module: 'notlar', version: '1.0',
    fields: [
      { key: 'mihenk_id', label: 'MİHENK ID', type: 'string', required: true, taskadeFieldId: '@mhkid', futureColumn: 'mihenk_id' },
      { key: 'title', label: 'Başlık', type: 'string', required: true, futureColumn: 'title' },
      { key: 'content', label: 'İçerik', type: 'string', required: false, taskadeFieldId: '@ncont', futureColumn: 'content' },
      { key: 'notebook', label: 'Defter', type: 'enum', required: false, default: 'kisisel', options: ['kisisel','is','fikir','muzik','toplanti','yildiz'], taskadeFieldId: '@ndeft', futureColumn: 'notebook' },
      { key: 'note_type', label: 'Tür', type: 'enum', required: false, default: 'taslak', options: ['taslak','gunluk','toplanti','fikir','referans','sozlesme'], taskadeFieldId: '@ntype', futureColumn: 'note_type' },
      { key: 'tags', label: 'Etiketler', type: 'string[]', required: false, taskadeFieldId: '@ntags', futureColumn: 'tags' },
      { key: 'related_ids', label: 'İlişkiler', type: 'mihenk_ref[]', required: false, futureColumn: 'related_ids' },
      { key: 'created_at', label: 'Oluşturulma', type: 'datetime', required: true, futureColumn: 'created_at' },
      { key: 'updated_at', label: 'Güncellenme', type: 'datetime', required: true, futureColumn: 'updated_at' },
    ],
  },
  katalog: {
    module: 'katalog', version: '1.0',
    fields: [
      { key: 'mihenk_id', label: 'MİHENK ID', type: 'string', required: true, taskadeFieldId: '@mhkid', futureColumn: 'mihenk_id' },
      { key: 'title', label: 'Ad', type: 'string', required: true, futureColumn: 'title' },
      { key: 'entity_type', label: 'Varlık Tipi', type: 'enum', required: true, options: ['artist','album','track'], futureColumn: 'entity_type' },
      { key: 'artist_type', label: 'Sanatçı Tipi', type: 'enum', required: false, options: ['solo','grup','ikili','topluluk','orkestra'], taskadeFieldId: '@atype', futureColumn: 'artist_type' },
      { key: 'origin', label: 'Köken', type: 'enum', required: false, options: ['gercek','kurgusal'], taskadeFieldId: '@aorigj', futureColumn: 'origin' },
      { key: 'genre', label: 'Tür/Genre', type: 'string', required: false, taskadeFieldId: '@agenr', futureColumn: 'genre' },
      { key: 'bio', label: 'Biyografi', type: 'string', required: false, taskadeFieldId: '@abio', futureColumn: 'bio' },
      { key: 'sonic_dna', label: 'Sonic DNA', type: 'string', required: false, taskadeFieldId: '@asonc', futureColumn: 'sonic_dna' },
      { key: 'bpm', label: 'BPM', type: 'number', required: false, taskadeFieldId: '@tbpm', futureColumn: 'bpm' },
      { key: 'key_signature', label: 'Key/Makam', type: 'string', required: false, taskadeFieldId: '@tkey', futureColumn: 'key_signature' },
      { key: 'pipeline', label: 'Pipeline', type: 'enum', required: false, options: ['taslak','demo','hazir','dagitim','yayinda'], taskadeFieldId: '@tpipe', futureColumn: 'pipeline_status' },
      { key: 'parent_ref', label: 'Üst Kayıt', type: 'mihenk_ref', required: false, refModule: 'katalog', futureColumn: 'parent_id' },
      { key: 'created_at', label: 'Oluşturulma', type: 'datetime', required: true, futureColumn: 'created_at' },
      { key: 'updated_at', label: 'Güncellenme', type: 'datetime', required: true, futureColumn: 'updated_at' },
    ],
  },
  finans: {
    module: 'finans', version: '1.0',
    fields: [
      { key: 'mihenk_id', label: 'MİHENK ID', type: 'string', required: true, taskadeFieldId: '@mhkid', futureColumn: 'mihenk_id' },
      { key: 'title', label: 'Başlık', type: 'string', required: true, futureColumn: 'title' },
      { key: 'tx_type', label: 'Tür', type: 'enum', required: true, options: ['gelir','gider','transfer'], taskadeFieldId: '@ftype', futureColumn: 'tx_type' },
      { key: 'category', label: 'Kategori', type: 'enum', required: false, options: ['yemek','ulasim','kira','fatura','saglik','eglence','maas','freelance','youtube','muzik','alisveris','egitim','abone','tasarruf','diger'], taskadeFieldId: '@fcat', futureColumn: 'category' },
      { key: 'amount', label: 'Tutar', type: 'number', required: true, taskadeFieldId: '@famt', futureColumn: 'amount' },
      { key: 'currency', label: 'Para Birimi', type: 'enum', required: true, default: 'TRY', options: ['TRY','USD','EUR'], taskadeFieldId: '@fcur', futureColumn: 'currency' },
      { key: 'wallet', label: 'Cüzdan', type: 'enum', required: false, options: ['tombank','adsense','ziraat','isbank','wise'], taskadeFieldId: '@fwall', futureColumn: 'wallet' },
      { key: 'description', label: 'Açıklama', type: 'string', required: false, taskadeFieldId: '@fnote', futureColumn: 'description' },
      { key: 'project_ref', label: 'Proje', type: 'mihenk_ref', required: false, refModule: 'projeler', futureColumn: 'project_id' },
      { key: 'created_at', label: 'Oluşturulma', type: 'datetime', required: true, futureColumn: 'created_at' },
      { key: 'updated_at', label: 'Güncellenme', type: 'datetime', required: true, futureColumn: 'updated_at' },
    ],
  },
  fikirler: {
    module: 'fikirler', version: '1.0',
    fields: [
      { key: 'mihenk_id', label: 'MİHENK ID', type: 'string', required: true, taskadeFieldId: '@mhkid', futureColumn: 'mihenk_id' },
      { key: 'title', label: 'Başlık', type: 'string', required: true, futureColumn: 'title' },
      { key: 'description', label: 'Açıklama', type: 'string', required: false, futureColumn: 'description' },
      { key: 'status', label: 'Durum', type: 'enum', required: true, default: 'yakalandi', options: ['yakalandi','kulucka','arastirma','projeye_aday','arsiv','red'], futureColumn: 'status' },
      { key: 'source', label: 'Kaynak', type: 'string', required: false, futureColumn: 'source' },
      { key: 'tags', label: 'Etiketler', type: 'string[]', required: false, futureColumn: 'tags' },
      { key: 'project_ref', label: 'Bağlı Proje', type: 'mihenk_ref', required: false, refModule: 'projeler', futureColumn: 'project_id' },
      { key: 'related_ids', label: 'İlişkiler', type: 'mihenk_ref[]', required: false, futureColumn: 'related_ids' },
      { key: 'created_at', label: 'Oluşturulma', type: 'datetime', required: true, futureColumn: 'created_at' },
      { key: 'updated_at', label: 'Güncellenme', type: 'datetime', required: true, futureColumn: 'updated_at' },
    ],
  },
};

  futureTable: string;
  taskadeProjectId: string | null;
}


// ── 5. RELATIONS ──

export type RelationType = 'parent_of' | 'child_of' | 'belongs_to' | 'references' | 'derived_from' | 'funds' | 'assigned_to';

export interface MihenkRelation {
  from_id: MihenkId;
  to_id: MihenkId;
  type: RelationType;
  created_at: string;
}

// ── 6. AUDIT EVENTS ──

export type AuditAction = 'created' | 'updated' | 'deleted' | 'linked' | 'unlinked' | 'status_changed' | 'exported' | 'imported' | 'agent_action';

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  module: MihenkModuleKey;
  action: AuditAction;
  mihenk_id: MihenkId;
  actor: 'user' | 'agent' | 'system' | 'automation';
  summary: string;
  diff?: { field: string; old: unknown; new: unknown }[];
  platform: 'taskade' | 'supabase' | 'zo' | 'local';
}

export function createAuditEvent(
  module: MihenkModuleKey, action: AuditAction, mihenkId: MihenkId, summary: string,
  options?: Partial<Pick<AuditEvent, 'actor' | 'diff' | 'platform'>>
): AuditEvent {
  return {
    event_id: ulid(), timestamp: new Date().toISOString(), module, action,
    mihenk_id: mihenkId, actor: options?.actor ?? 'user', summary,
    diff: options?.diff, platform: options?.platform ?? 'taskade',
  };
}

// ── 7. EXPORT / IMPORT FORMAT ──

export interface MihenkExportEnvelope {
  mihenk_version: '1.0';
  exported_at: string;
  source: 'taskade' | 'supabase' | 'zo' | 'local';
  module: MihenkModuleKey;
  record_count: number;
  records: MihenkExportRecord[];
  relations: MihenkRelation[];
  audit_trail: AuditEvent[];
}

export interface MihenkExportRecord {
  mihenk_id: MihenkId;
  platform_ids: { taskade_task_id?: string; taskade_project_id?: string; supabase_row_id?: string };
  module: MihenkModuleKey;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function createExportEnvelope(
  module: MihenkModuleKey, records: MihenkExportRecord[],
  relations: MihenkRelation[] = [], auditTrail: AuditEvent[] = []
): MihenkExportEnvelope {
  return {
    mihenk_version: '1.0', exported_at: new Date().toISOString(), source: 'taskade',
    module, record_count: records.length, records, relations, audit_trail: auditTrail,
  };
}

// ── 8. PORTABILITY HELPERS ──

export function getTaskadeFieldMapping(module: MihenkModuleKey): Record<string, string> {
  const contract = CONTRACTS[module];
  if (!contract) return {};
  const mapping: Record<string, string> = {};
  for (const field of contract.fields) {
    if (field.taskadeFieldId) mapping[field.taskadeFieldId] = field.key;
  }
  return mapping;
}

export function getSupabaseColumnMapping(module: MihenkModuleKey): Record<string, string> {
  const contract = CONTRACTS[module];
  if (!contract) return {};
  const mapping: Record<string, string> = {};
  for (const field of contract.fields) {
    if (field.futureColumn) mapping[field.key] = field.futureColumn;
  }
  return mapping;
}

export function validateRecord(module: MihenkModuleKey, data: Record<string, unknown>): string[] {
  const contract = CONTRACTS[module];
  if (!contract) return [`No contract found for module: ${module}`];
  const errors: string[] = [];
  for (const field of contract.fields) {
    if (field.required && (data[field.key] === undefined || data[field.key] === null || data[field.key] === '')) {
      errors.push(`Required field missing: ${field.key} (${field.label})`);
    }
    if (data[field.key] != null) {
      if (field.type === 'enum' && field.options && !field.options.includes(data[field.key] as string)) {
        errors.push(`Invalid enum for ${field.key}: "${data[field.key]}". Valid: ${field.options.join(', ')}`);
      }
      if (field.type === 'number' && typeof data[field.key] !== 'number') {
        errors.push(`Field ${field.key} must be number, got ${typeof data[field.key]}`);
      }
      if (field.type === 'mihenk_ref' && !isValidMihenkId(data[field.key] as string)) {
        errors.push(`Field ${field.key} must be valid MİHENK ID`);
      }
    }
  }
  return errors;
}
