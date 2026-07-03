import { create } from 'zustand';

/* ═══ 57 MİHENK Module IDs ═══ */
export type ModuleId =
  | 'gun_masasi' | 'sabah_brifingi' | 'bildirim_merkezi' | 'enerji_modu' | 'sistem_nabzi_ozet'
  | 'fikirler' | 'sinyaller' | 'yer_imleri' | 'hizli_not' | 'hizli_gorev'
  | 'projeler' | 'gorevler' | 'takvim' | 'tekrarlayan' | 'sablonlar'
  | 'notlar' | 'bilgi_haritasi' | 'dosyalar' | 'derin_arastirma' | 'karsilastir' | 'cookbook'
  | 'katalog' | 'maestro' | 'uretimler' | 'youtube' | 'chartmetric' | 'release_radar' | 'fabrika'
  | 'verselab' | 'lyrics_lab' | 'turku_arsivi' | 'studyom' | 'ses_analiz' | 'mix_room' | 'klip_studio'
  | 'kisiler' | 'inbox_mail' | 'sozlesmeler' | 'firsatlar' | 'konser_tur'
  | 'finans' | 'zenzone' | 'wellness' | 'yasam_raporu'
  | 'mihenk_asistani' | 'ajan_konseyi' | 'workforce' | 'pipeline' | 'otomasyonlar' | 'uygulama_atolyesi'
  | 'erisim' | 'sistem_nabzi' | 'backup' | 'onboarding' | 'ayarlar' | 'guvenlik_mahremiyet'
  | 'maden' | 'veri_kazisi' | 'celiski_motoru' | 'kanit_kuyrugu' | 'kapali_oda';

export type EnergyMode = 'yaratici' | 'operasyonel' | 'dusunsel' | 'sessiz' | 'dinlenme';

export const ENERGY_MODES: { id: EnergyMode; label: string; icon: string; color: string }[] = [
  { id: 'yaratici', label: 'Yaratıcı', icon: '🎨', color: '#D4A853' },
  { id: 'operasyonel', label: 'Operasyonel', icon: '⚡', color: '#C43E3E' },
  { id: 'dusunsel', label: 'Düşünsel', icon: '🧠', color: '#3B7DD8' },
  { id: 'sessiz', label: 'Sessiz', icon: '🌙', color: '#6B7280' },
  { id: 'dinlenme', label: 'Dinlenme', icon: '🍃', color: '#4CAF7D' },
];

export interface MenuGroup {
  id: string;
  label: string;
  icon: string;
  modules: { id: ModuleId; label: string; icon: string }[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'bugun', label: 'Bugün', icon: 'sun',
    modules: [
      { id: 'gun_masasi', label: 'Gün Masası', icon: 'layout-dashboard' },
      { id: 'sabah_brifingi', label: 'Sabah Brifingi', icon: 'sunrise' },
      { id: 'bildirim_merkezi', label: 'Bildirimler', icon: 'bell' },
      { id: 'enerji_modu', label: 'Enerji Modu', icon: 'battery-charging' },
      { id: 'sistem_nabzi_ozet', label: 'Sistem Nabzı', icon: 'activity' },
    ],
  },
  {
    id: 'yakalama', label: 'Yakalama', icon: 'zap',
    modules: [
      { id: 'fikirler', label: 'Fikirler', icon: 'lightbulb' },
      { id: 'sinyaller', label: 'Sinyaller', icon: 'radio' },
      { id: 'yer_imleri', label: 'Yer İmleri', icon: 'bookmark' },
      { id: 'hizli_not', label: 'Hızlı Not', icon: 'sticky-note' },
      { id: 'hizli_gorev', label: 'Hızlı Görev', icon: 'circle-plus' },
    ],
  },
  {
    id: 'is_omurgasi', label: 'İş Omurgası', icon: 'briefcase',
    modules: [
      { id: 'projeler', label: 'Projeler', icon: 'folder-kanban' },
      { id: 'gorevler', label: 'Görevler', icon: 'check-square' },
      { id: 'takvim', label: 'Takvim', icon: 'calendar' },
      { id: 'tekrarlayan', label: 'Tekrarlayan', icon: 'repeat' },
      { id: 'sablonlar', label: 'Şablonlar', icon: 'copy' },
    ],
  },
  {
    id: 'bilgi_hafiza', label: 'Bilgi ve Hafıza', icon: 'brain',
    modules: [
      { id: 'notlar', label: 'Notlar', icon: 'file-text' },
      { id: 'bilgi_haritasi', label: 'Bilgi Haritası', icon: 'git-branch' },
      { id: 'dosyalar', label: 'Dosyalar', icon: 'hard-drive' },
      { id: 'derin_arastirma', label: 'Derin Araştırma', icon: 'search' },
      { id: 'karsilastir', label: 'Karşılaştır', icon: 'columns' },
      { id: 'cookbook', label: 'Cookbook', icon: 'book-open' },
    ],
  },
  {
    id: 'muzik_yayin', label: 'Müzik ve Yayın', icon: 'music',
    modules: [
      { id: 'katalog', label: 'Katalog', icon: 'disc' },
      { id: 'youtube', label: 'YouTube', icon: 'youtube' },
      { id: 'maestro', label: 'Maestro', icon: 'wand-2' },
      { id: 'uretimler', label: 'Üretimler', icon: 'headphones' },
      { id: 'fabrika', label: 'FABRİKA', icon: 'factory' },
      { id: 'chartmetric', label: 'Chartmetric', icon: 'trending-up' },
      { id: 'release_radar', label: 'Release Radar', icon: 'radar' },
    ],
  },
  {
    id: 'studyo', label: 'Stüdyo', icon: 'mic',
    modules: [
      { id: 'verselab', label: 'VerseLab', icon: 'pen-tool' },
      { id: 'lyrics_lab', label: 'Lyrics Lab', icon: 'type' },
      { id: 'turku_arsivi', label: 'Türkü Arşivi', icon: 'library' },
      { id: 'studyom', label: 'Stüdyom', icon: 'monitor-speaker' },
      { id: 'ses_analiz', label: 'Ses Analiz', icon: 'audio-waveform' },
      { id: 'mix_room', label: 'Mix Room', icon: 'sliders-horizontal' },
      { id: 'klip_studio', label: 'Klip Studio', icon: 'clapperboard' },
    ],
  },
  {
    id: 'insan_is', label: 'İnsan ve İş', icon: 'users',
    modules: [
      { id: 'kisiler', label: 'Kişiler', icon: 'contact' },
      { id: 'inbox_mail', label: 'Inbox Mail', icon: 'mail' },
      { id: 'sozlesmeler', label: 'Sözleşmeler', icon: 'file-signature' },
      { id: 'firsatlar', label: 'Fırsatlar', icon: 'target' },
      { id: 'konser_tur', label: 'Konser & Tur', icon: 'map-pin' },
    ],
  },
  {
    id: 'yasam', label: 'Yaşam', icon: 'heart',
    modules: [
      { id: 'finans', label: 'Finans', icon: 'wallet' },
      { id: 'zenzone', label: 'ZenZone', icon: 'flame' },
      { id: 'wellness', label: 'Wellness', icon: 'smile' },
      { id: 'yasam_raporu', label: 'Yaşam Raporu', icon: 'bar-chart-3' },
    ],
  },
  {
    id: 'ajanlar_otomasyon', label: 'Ajanlar', icon: 'bot',
    modules: [
      { id: 'mihenk_asistani', label: 'MİHENK Asistanı', icon: 'message-circle' },
      { id: 'ajan_konseyi', label: 'Ajan Konseyi', icon: 'shield' },
      { id: 'workforce', label: 'Workforce', icon: 'network' },
      { id: 'pipeline', label: 'Pipeline', icon: 'git-pull-request' },
      { id: 'otomasyonlar', label: 'Otomasyonlar', icon: 'cog' },
      { id: 'uygulama_atolyesi', label: 'Uygulama Atölyesi', icon: 'hammer' },
    ],
  },
  {
    id: 'sistem_guven', label: 'Sistem', icon: 'shield-check',
    modules: [
      { id: 'erisim', label: 'Erişim', icon: 'lock' },
      { id: 'sistem_nabzi', label: 'Sistem Nabzı', icon: 'heart-pulse' },
      { id: 'backup', label: 'Backup', icon: 'database' },
      { id: 'onboarding', label: 'Onboarding', icon: 'rocket' },
      { id: 'ayarlar', label: 'Ayarlar', icon: 'settings' },
      { id: 'guvenlik_mahremiyet', label: 'Güvenlik', icon: 'eye-off' },
    ],
  },
  {
    id: 'maden', label: 'Maden', icon: 'pickaxe',
    modules: [
      { id: 'maden', label: 'Maden', icon: 'mountain' },
      { id: 'veri_kazisi', label: 'Veri Kazısı', icon: 'scan-search' },
      { id: 'celiski_motoru', label: 'Çelişki Motoru', icon: 'scale' },
      { id: 'kanit_kuyrugu', label: 'Kanıt Kuyruğu', icon: 'shield-question' },
      { id: 'kapali_oda', label: 'Kapalı Oda', icon: 'lock-keyhole' },
    ],
  },
];

/* ═══ App State ═══ */
interface AppState {
  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  inspectorOpen: boolean;
  setInspectorOpen: (open: boolean) => void;
  toggleInspector: () => void;
  energyMode: EnergyMode;
  setEnergyMode: (m: EnergyMode) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'gun_masasi',
  setActiveModule: (m) => set({ activeModule: m }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  inspectorOpen: false,
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
  energyMode: 'operasyonel',
  setEnergyMode: (m) => set({ energyMode: m }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
