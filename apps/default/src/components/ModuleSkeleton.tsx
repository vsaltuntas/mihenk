import { cn } from '@/lib/utils';
import { MENU_GROUPS, type ModuleId } from '@/lib/store';
import { Construction } from 'lucide-react';

function getModuleInfo(id: ModuleId) {
  for (const g of MENU_GROUPS) {
    const m = g.modules.find(x => x.id === id);
    if (m) return { ...m, groupLabel: g.label };
  }
  return { id, label: id, icon: 'box', groupLabel: '' };
}

const TABS: Partial<Record<ModuleId, string[]>> = {
  gun_masasi: ['Bugün','Öncelikler','Riskler','Bekleyen Onaylar','Ajan Önerileri','Gün Sonu'],
  sabah_brifingi: ['Bugünün İşi','Kaçırılmaması Gerekenler','Sessiz Riskler','Sağlık Notu'],
  bildirim_merkezi: ['Tümü','Proje','Mail','Finans','Üretim','Sistem','İnsan Onayı'],
  enerji_modu: ['Yaratıcı','Operasyonel','Düşünsel','Sessiz','Dinlenme'],
  fikirler: ['Yakala','Kümeler','Kuluçka','Araştırma','Projeye Aday','Arşiv'],
  sinyaller: ['Tümü','Okunmamış','Bugün','Not','Fikir','Üretim','Mail','Sistem'],
  yer_imleri: ['Hızlı Link','Pinli','Okunacak','Kaynaklar','ZOLinker','Arşiv'],
  projeler: ['Genel','Görevler','Spec','Fazlar','Zaman Çizelgesi','Dosyalar','Finans','İnsanlar'],
  gorevler: ['Inbox','Bugün','Yaklaşan','Geciken','Projeye Göre','Kanban','Tamamlanan'],
  takvim: ['Gün','Hafta','Ay','Agenda','Deadline','Yayın Takvimi','Focus Blocks'],
  tekrarlayan: ['Aktif','Planlanan','Geçmiş Run','Hatalı','Duraklatılmış'],
  sablonlar: ['Proje','Not','Görev','Mail','Sözleşme','Maestro','Yayın','Rapor'],
  notlar: ['Tüm Notlar','Yıldızlı','Defterler','Etiketler','Backlinks','Graph','Taslaklar'],
  bilgi_haritasi: ['Graph','Kümeler','İlişkiler','Yetim Düğümler','Çelişkiler','Kanıt Kuyruğu'],
  dosyalar: ['Tüm Dosyalar','Son Eklenen','Projeler','Katalog','Audio','Görseller','Arşiv'],
  derin_arastirma: ['Araştırma Briefi','Kaynaklar','Bulgular','Karşıt Kanıt','Özet','Karar'],
  karsilastir: ['Alternatifler','Kriterler','Puanlama','Risk','Sonuç'],
  cookbook: ['Tüm Tarifler','Üretim','Yayın','Finans','Not','Ajan','Sistem'],
  katalog: ['Sanatçılar','Albümler','Trackler','Release','Galeri','Dağıtım','Haklar','Analytics'],
  maestro: ['Prompt Builder','Stil','Üretimler','Varyasyonlar','Analiz','ELO','Provider'],
  uretimler: ['Tüm Üretimler','Favoriler','Rating','Provider','Projeye Göre','Katalog Bağlı'],
  youtube: ['Kanallar','Videolar','Analytics','Gelir','İçerik Takvimi','Yorumlar'],
  chartmetric: ['Radar','Artist Search','Track Signals','Charts','Karşılaştırma'],
  release_radar: ['Yaklaşan','Hazır','Eksik Metadata','Dağıtımda','Yayında'],
  verselab: ['Editor','Konsept','Corpus','Analiz','Varyasyon','Export'],
  lyrics_lab: ['Taslaklar','A/B','ELO','Ritim','Duygu','Final'],
  turku_arsivi: ['Türküler','Bölge','Makam/Usul','Varyantlar','Kaynaklar','Repertuvar'],
  studyom: ['Jobs','Stem','Transkript','Output Ref','Import','Worker Durumu'],
  ses_analiz: ['Upload','Waveform','BPM','Key','Loudness','Stem','Rapor'],
  mix_room: ['Sessions','Compare','Listener Notes','Render Queue','Artifacts','Worker'],
  klip_studio: ['Storyboard','Sahne','Asset','Render','YouTube','Katalog'],
  kisiler: ['Tüm Kişiler','Yakınlar','İş','Müzik','Kurumlar','Follow-up','Timeline'],
  inbox_mail: ['Inbox','Bekleyen','Önemli','Yanıt Taslakları','Göreve Çevrilen','Arşiv'],
  sozlesmeler: ['Aktif','Yenileme','Riskli','Taraflar','Maddeler','Dosyalar'],
  firsatlar: ['Pipeline','Lead','Görüşme','Teklif','Kazandı','Kaybetti'],
  konser_tur: ['Etkinlikler','Venue','Setlist','Bütçe','Ekip','Checklist','Takvim'],
  finans: ['Özet','Ledger','Bütçe','Gelir','Gider','Royalty','Vergi','Projeksiyon'],
  zenzone: ['Focus','Reset','Nefes','Günlük Ritüel','Geçmiş'],
  wellness: ['Check-in','Mood','Uyku','Alışkanlık','Trend','Notlar'],
  yasam_raporu: ['Haftalık','Aylık','Enerji','Para','Üretim','İlişkiler','Öğrenilenler'],
  mihenk_asistani: ['Sohbet','Sayfa Bağlamı','Öneriler','Çıktılar','Maliyet','Hafıza'],
  ajan_konseyi: ['Ajanlar','Roller','Run Geçmişi','Yetkiler','Maliyet','Feedback'],
  workforce: ['Ekip','Hiyerarşi','Çalışan İşler','Bekleyenler','Çıktılar','Maliyet'],
  pipeline: ['Queue','Kanban','Running','Failed','Done','Log'],
  otomasyonlar: ['Aktif','Zamanlanmış','Webhook','Hatalı','Run Geçmişi','Maliyet'],
  uygulama_atolyesi: ['Brief','Çıktı Tipi','Önizleme','Run Monitor','Owner Review'],
  erisim: ['Kullanıcılar','Roller','Scope','Oturumlar','Davetler','Audit'],
  sistem_nabzi: ['Modüller','Provider','API','DB','Ajan Run','Proof','Güvenlik'],
  backup: ['Snapshot','Restore','Dış Yedek','Shamir','Test','Log'],
  onboarding: ['Başlangıç','Bağlantılar','Veri İçe Aktar','Ajanlar','Güvenlik'],
  ayarlar: ['Genel','Tema','Bildirim','Ajanlar','Provider','Veri','Mahremiyet'],
  guvenlik_mahremiyet: ['Mahremiyet','Kapalı Oda','Üçüncü Kişi','Onay Kuyruğu','Redaksiyon'],
  maden: ['Kazı','Kaynaklar','Pattern','Çelişki','Kanıt','Aktarım'],
  celiski_motoru: ['Yeni','Yanlış Pozitif','Volkan Teyidi','Kalibrasyon','Kapananlar'],
  kanit_kuyrugu: ['Aday','Teyit Bekliyor','Doğrulandı','Reddedildi','Eskidi'],
  kapali_oda: ['Hassas Çıkarımlar','Finans Ekleri','Üçüncü Kişi','Acımasızlık','Ertelenenler'],
};

export default function ModuleSkeleton({ moduleId }: { moduleId: ModuleId }) {
  const info = getModuleInfo(moduleId);
  const tabs = TABS[moduleId] || [];

  return (
    <div className="module-transition space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{info.groupLabel}</p>
        <h1 className="mihenk-module-title">{info.label}</h1>
      </div>

      {tabs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab, i) => (
            <button key={tab} className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>{tab}</button>
          ))}
        </div>
      )}

      <div className="mihenk-card p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Construction className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-lg font-semibold">{info.label}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu modül MİHENK tasarım dokümanına göre inşa edilecek.
          </p>
          <div className="w-full max-w-xl mt-6 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-lg shimmer shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 shimmer rounded w-2/3" />
                  <div className="h-2.5 shimmer rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
