import { Toaster } from 'sonner';
import { useAppStore, type ModuleId } from '@/lib/store';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import CommandPalette from '@/components/CommandPalette';
import FooterBar from '@/components/FooterBar';
import ModuleSkeleton from '@/components/ModuleSkeleton';

// ═══ BUGÜN (5/5) ═══
import Dashboard from '@/components/Dashboard';
import SabahBrifingi from '@/components/SabahBrifingi';
import BildirimMerkezi from '@/components/BildirimMerkezi';
import EnerjiModuModule from '@/components/EnerjiModu';

// ═══ YAKALAMA (5/5) ═══
import IdeasModule from '@/components/IdeasModule';
import SinyallerModule from '@/components/SinyallerModule';
import YerImleri from '@/components/YerImleri';
import HizliNot from '@/components/HizliNot';
import HizliGorev from '@/components/HizliGorev';

// ═══ İŞ OMURGASI (5/5) ═══
import ProjectHub from '@/components/ProjectHub';
import GorevlerModule from '@/components/GorevlerModule';
import CalendarModule from '@/components/CalendarModule';
import TekrarlayanModule from '@/components/TekrarlayanModule';
import SablonlarModule from '@/components/SablonlarModule';

// ═══ BİLGİ VE HAFIZA (6/6) ═══
import NotesModule from '@/components/NotesModule';
import BilgiHaritasi from '@/components/BilgiHaritasi';
import DosyalarModule from '@/components/DosyalarModule';
import DerinArastirma from '@/components/DerinArastirma';
import KarsilastirModule from '@/components/KarsilastirModule';
import CookbookModule from '@/components/CookbookModule';

// ═══ MÜZİK VE YAYIN (7/7) ═══
import CatalogModule from '@/components/CatalogModule';
import MaestroModule from '@/components/MaestroModule';
import UretimlerModule from '@/components/UretimlerModule';
import FabrikaModule from '@/components/FabrikaModule';
import YouTubeModule from '@/components/YouTubeModule';
import ChartmetricModule from '@/components/ChartmetricModule';
import ReleaseRadar from '@/components/ReleaseRadar';

// ═══ STÜDYO (7/7) ═══
import VerseLab from '@/components/VerseLab';
import LyricsLab from '@/components/LyricsLab';
import TurkuArsivi from '@/components/TurkuArsivi';
import StudyomModule from '@/components/StudyomModule';
import SesAnaliz from '@/components/SesAnaliz';
import MixRoom from '@/components/MixRoom';
import KlipStudio from '@/components/KlipStudio';

// ═══ İNSAN VE İŞ (5/5) ═══
import CrmModule from '@/components/CrmModule';
import InboxMail from '@/components/InboxMail';
import SozlesmelerModule from '@/components/SozlesmelerModule';
import FirsatlarModule from '@/components/FirsatlarModule';
import KonserTur from '@/components/KonserTur';

// ═══ YAŞAM (4/4) ═══
import FinanceTracker from '@/components/FinanceTracker';
import WellnessZone from '@/components/WellnessZone';
import AnalyticsHub from '@/components/AnalyticsHub';
import YasamRaporu from '@/components/YasamRaporu';

// ═══ AJANLAR (6/6) ═══
import AssistantChat from '@/components/AssistantChat';
import AjanKonseyi from '@/components/AjanKonseyi';
import Workforce from '@/components/Workforce';
import PipelineModule from '@/components/PipelineModule';
import OtomasyonlarModule from '@/components/OtomasyonlarModule';
import UygulamaAtolyesi from '@/components/UygulamaAtolyesi';

// ═══ SİSTEM (6/6) ═══
import ErisimModule from '@/components/ErisimModule';
import SistemNabzi from '@/components/SistemNabzi';
import BackupModule from '@/components/BackupModule';
import OnboardingModule from '@/components/OnboardingModule';
import AyarlarModule from '@/components/AyarlarModule';
import GuvenlikModule from '@/components/GuvenlikModule';

// ═══ MADEN (5/5) ═══
import MadenModule from '@/components/MadenModule';
import VeriKazisi from '@/components/VeriKazisi';
import CeliskiMotoru from '@/components/CeliskiMotoru';
import KanitKuyrugu from '@/components/KanitKuyrugu';
import KapaliOda from '@/components/KapaliOda';

// ═══ 57/57 MODULE MAP ═══
const MODULE_MAP: Record<ModuleId, React.FC> = {
  // Bugün
  gun_masasi: Dashboard,
  sabah_brifingi: SabahBrifingi,
  bildirim_merkezi: BildirimMerkezi,
  enerji_modu: EnerjiModuModule,
  sistem_nabzi_ozet: SistemNabzi,
  // Yakalama
  fikirler: IdeasModule,
  sinyaller: SinyallerModule,
  yer_imleri: YerImleri,
  hizli_not: HizliNot,
  hizli_gorev: HizliGorev,
  // İş Omurgası
  projeler: ProjectHub,
  gorevler: GorevlerModule,
  takvim: CalendarModule,
  tekrarlayan: TekrarlayanModule,
  sablonlar: SablonlarModule,
  // Bilgi ve Hafıza
  notlar: NotesModule,
  bilgi_haritasi: BilgiHaritasi,
  dosyalar: DosyalarModule,
  derin_arastirma: DerinArastirma,
  karsilastir: KarsilastirModule,
  cookbook: CookbookModule,
  // Müzik ve Yayın
  katalog: CatalogModule,
  maestro: MaestroModule,
  uretimler: UretimlerModule,
  fabrika: FabrikaModule,
  youtube: YouTubeModule,
  chartmetric: ChartmetricModule,
  release_radar: ReleaseRadar,
  // Stüdyo
  verselab: VerseLab,
  lyrics_lab: LyricsLab,
  turku_arsivi: TurkuArsivi,
  studyom: StudyomModule,
  ses_analiz: SesAnaliz,
  mix_room: MixRoom,
  klip_studio: KlipStudio,
  // İnsan ve İş
  kisiler: CrmModule,
  inbox_mail: InboxMail,
  sozlesmeler: SozlesmelerModule,
  firsatlar: FirsatlarModule,
  konser_tur: KonserTur,
  // Yaşam
  finans: FinanceTracker,
  zenzone: AnalyticsHub,
  wellness: WellnessZone,
  yasam_raporu: YasamRaporu,
  // Ajanlar
  mihenk_asistani: AssistantChat,
  ajan_konseyi: AjanKonseyi,
  workforce: Workforce,
  pipeline: PipelineModule,
  otomasyonlar: OtomasyonlarModule,
  uygulama_atolyesi: UygulamaAtolyesi,
  // Sistem
  erisim: ErisimModule,
  sistem_nabzi: SistemNabzi,
  backup: BackupModule,
  onboarding: OnboardingModule,
  ayarlar: AyarlarModule,
  guvenlik_mahremiyet: GuvenlikModule,
  // Maden
  maden: MadenModule,
  veri_kazisi: VeriKazisi,
  celiski_motoru: CeliskiMotoru,
  kanit_kuyrugu: KanitKuyrugu,
  kapali_oda: KapaliOda,
};

export default function App() {
  const { activeModule, sidebarOpen } = useAppStore();
  const ActiveComponent = MODULE_MAP[activeModule] || Dashboard;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      <CommandPalette />
      <Sidebar />
      <main
        className={cn(
          'transition-all duration-300 min-h-screen pb-14 md:pb-12',
          sidebarOpen ? 'md:ml-[260px]' : 'md:ml-[52px]',
          'ml-0'
        )}
      >
        <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <ActiveComponent />
        </div>
      </main>
      <FooterBar />
    </div>
  );
}
