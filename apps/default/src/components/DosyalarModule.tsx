import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HardDrive, FolderOpen, Clock, FolderKanban, Disc, FileSignature, Music, Image, Archive, Search, File } from 'lucide-react';

type TabId = 'tumu' | 'son' | 'projeler' | 'katalog' | 'audio' | 'gorseller' | 'arsiv';
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'tumu', label: 'Tüm Dosyalar', icon: FolderOpen },
  { id: 'son', label: 'Son Eklenen', icon: Clock },
  { id: 'projeler', label: 'Projeler', icon: FolderKanban },
  { id: 'katalog', label: 'Katalog', icon: Disc },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'gorseller', label: 'Görseller', icon: Image },
  { id: 'arsiv', label: 'Arşiv', icon: Archive },
];

const SAMPLE_FILES = [
  { name: 'release_metadata_2026.xlsx', type: 'doc', size: '245 KB', date: '2026-06-15' },
  { name: 'master_final_v3.wav', type: 'audio', size: '48 MB', date: '2026-06-14' },
  { name: 'cover_art_single.png', type: 'image', size: '2.1 MB', date: '2026-06-12' },
  { name: 'sozlesme_lisans_draft.pdf', type: 'doc', size: '380 KB', date: '2026-06-10' },
  { name: 'stem_vocals_dry.wav', type: 'audio', size: '32 MB', date: '2026-06-08' },
];

export default function DosyalarModule() {
  const [tab, setTab] = useState<TabId>('tumu');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bilgi ve Hafıza</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><HardDrive className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" /> Dosyalar</h1>
        <p className="text-sm text-muted-foreground mt-1">Belgeleri, görselleri, sesleri ve proje dosyalarını yönet</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => { const I = t.icon; return (<button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}><I className="w-3.5 h-3.5" />{t.label}</button>); })}
      </div>
      <div className="mihenk-card divide-y divide-border">
        {SAMPLE_FILES.map(f => (
          <div key={f.name} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
            <File className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{f.name}</p></div>
            <span className="text-[10px] text-muted-foreground">{f.size}</span>
            <span className="text-[10px] text-muted-foreground">{f.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
