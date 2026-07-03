import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Mail, Inbox, Clock, Star, FileText, CheckSquare, Archive } from 'lucide-react';

type TabId = 'inbox' | 'bekleyen' | 'onemli' | 'yanit' | 'goreve' | 'arsiv';
const TABS: { id: TabId; label: string }[] = [
  { id: 'inbox', label: 'Inbox' }, { id: 'bekleyen', label: 'Bekleyen' }, { id: 'onemli', label: 'Önemli' },
  { id: 'yanit', label: 'Yanıt Taslakları' }, { id: 'goreve', label: 'Göreve Çevrilen' }, { id: 'arsiv', label: 'Arşiv' },
];

const SAMPLE_MAILS = [
  { from: 'TRT Müzik', subject: 'Program Daveti — Haziran 2026', time: '2 saat önce', star: true, status: 'unread' },
  { from: 'Spotify for Artists', subject: 'Monthly Streaming Report', time: 'Dün', star: false, status: 'read' },
  { from: 'Lisans Kontrat', subject: 'Sözleşme Revizyonu v3', time: '3 gün önce', star: true, status: 'read' },
];

export default function InboxMail() {
  const [tab, setTab] = useState<TabId>('inbox');
  return (
    <div className="module-transition space-y-5">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">İnsan ve İş</p>
        <h1 className="mihenk-module-title flex items-center gap-2"><Mail className="w-6 h-6 text-[hsl(var(--mihenk-blue))]" /> Inbox Mail</h1>
        <p className="text-sm text-muted-foreground mt-1">Mail triage ve aksiyon çıkarma</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{t.label}</button>))}
      </div>
      <div className="mihenk-card divide-y divide-border">
        {SAMPLE_MAILS.map(m => (
          <div key={m.subject} className={cn("flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors", m.status === 'unread' && "bg-primary/[0.02]")}>
            {m.star && <Star className="w-3.5 h-3.5 text-[hsl(var(--mihenk-gold))] fill-[hsl(var(--mihenk-gold))]" />}
            {!m.star && <Mail className="w-3.5 h-3.5 text-muted-foreground" />}
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm truncate", m.status === 'unread' && "font-semibold")}>{m.subject}</p>
              <p className="text-[10px] text-muted-foreground">{m.from}</p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{m.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
