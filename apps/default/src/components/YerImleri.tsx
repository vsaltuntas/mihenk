import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bookmark, Plus, Link, Pin, BookOpen, Archive, Globe, Star, ExternalLink, Search } from 'lucide-react';
import { motion } from 'framer-motion';

type TabId = 'hizli' | 'pinli' | 'okunacak' | 'kaynaklar' | 'zolinker' | 'arsiv';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'hizli', label: 'Hızlı Link', icon: Link },
  { id: 'pinli', label: 'Pinli', icon: Pin },
  { id: 'okunacak', label: 'Okunacak', icon: BookOpen },
  { id: 'kaynaklar', label: 'Kaynaklar', icon: Globe },
  { id: 'zolinker', label: 'ZOLinker', icon: Star },
  { id: 'arsiv', label: 'Arşiv', icon: Archive },
];

const SAMPLE_BOOKMARKS = [
  { id: 1, title: 'Chartmetric API Docs', url: 'https://api.chartmetric.com', tags: ['müzik', 'api'], pinned: true },
  { id: 2, title: 'Suno AI Music', url: 'https://suno.com', tags: ['müzik', 'ai'], pinned: true },
  { id: 3, title: 'React 19 Release Notes', url: 'https://react.dev', tags: ['dev'], pinned: false },
  { id: 4, title: 'TRT Arşiv', url: 'https://arsiv.trt.net.tr', tags: ['türkü', 'arşiv'], pinned: false },
  { id: 5, title: 'D1 Cloudflare Docs', url: 'https://developers.cloudflare.com/d1', tags: ['dev', 'db'], pinned: false },
];

export default function YerImleri() {
  const [activeTab, setActiveTab] = useState<TabId>('hizli');
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_BOOKMARKS.filter(b => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTab === 'pinli') return b.pinned;
    return true;
  });

  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Yakalama</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" />
          Yer İmleri
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Linkleri hafızaya bağla, etiketle, güvenilirlik puanla</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map(tab => {
          const TIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>
              <TIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ara..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((bm, i) => (
          <motion.div
            key={bm.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="mihenk-card p-4 flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{bm.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{bm.url}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {bm.tags.map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
              ))}
              {bm.pinned && <Pin className="w-3 h-3 text-[hsl(var(--mihenk-gold))]" />}
              <a href={bm.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
