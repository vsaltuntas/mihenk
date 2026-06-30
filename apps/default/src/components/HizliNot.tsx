import { useState, useCallback } from 'react';
import { mihenkAPI } from '@/lib/mihenk-data';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { StickyNote, Send, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

type RecentCreate = { title: string; time: Date; success: boolean; error?: string };

export default function HizliNot() {
  const { setActiveModule } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [recentCreates, setRecentCreates] = useState<RecentCreate[]>([]);

  const save = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed) { toast.error('Başlık gerekli'); return; }
    setSaving(true);
    try {
      await mihenkAPI.createNote({ title: trimmed, content: content.trim() });
      toast.success(`Not kaydedildi: "${trimmed}"`);
      setRecentCreates(prev => [{ title: trimmed, time: new Date(), success: true }, ...prev.slice(0, 4)]);
      setTitle(''); setContent('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      toast.error(`Not kaydedilemedi: ${msg}`);
      setRecentCreates(prev => [{ title: trimmed, time: new Date(), success: false, error: msg }, ...prev.slice(0, 4)]);
    }
    setSaving(false);
  }, [title, content]);

  return (
    <div className="module-transition space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Yakalama</p>
        <h1 className="mihenk-module-title flex items-center gap-2">
          <StickyNote className="w-6 h-6 text-[hsl(var(--mihenk-gold))]" />
          Hızlı Not
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Aklına geleni hemen yakala → Not Projesi (Ba6qULrBj9iCmoBw)</p>
      </div>

      <div className="mihenk-card p-6 space-y-4 max-w-2xl">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Not başlığı..."
          className="w-full text-lg font-serif font-semibold bg-transparent outline-none placeholder:text-muted-foreground"
          onKeyDown={e => e.key === 'Enter' && content && save()}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="İçerik yaz..."
          rows={6}
          className="w-full text-sm bg-transparent outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
        />
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            <Send className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button onClick={() => setActiveModule('notlar')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Tüm Notlar <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Recent creates */}
      {recentCreates.length > 0 && (
        <div className="max-w-2xl space-y-2">
          <h4 className="text-xs text-muted-foreground font-medium">Son Kaydedilenler</h4>
          {recentCreates.map((rc, i) => (
            <div key={i} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-xs", rc.success ? "bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30" : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30")}>
              {rc.success ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <span className="flex-1 truncate">{rc.title}</span>
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {rc.time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              {rc.success && <button onClick={() => setActiveModule('notlar')} className="text-primary hover:underline">Notlarda Gör</button>}
              {!rc.success && <span className="text-red-500 truncate max-w-[120px]">{rc.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
