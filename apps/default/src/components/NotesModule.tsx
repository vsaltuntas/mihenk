import { useState, useMemo, useCallback } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import { FileText, Plus, Search, Star, Trash2, ChevronRight, Hash, Edit3, X, Save, Clock, FolderOpen, StickyNote, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';

const NOTEBOOKS = [
  { id: 'all', label: 'Tümü', emoji: '📚' },
  { id: 'nb-kisisel', label: 'Kişisel', emoji: '📔' },
  { id: 'nb-is', label: 'İş', emoji: '💼' },
  { id: 'nb-fikir', label: 'Fikirler', emoji: '💡' },
  { id: 'nb-muzik', label: 'Müzik', emoji: '🎵' },
  { id: 'nb-toplanti', label: 'Toplantı', emoji: '📋' },
  { id: 'nb-yildiz', label: 'Yıldızlı', emoji: '⭐' },
];
const NB_LABEL: Record<string, string> = { 'nb-kisisel': '📔 Kişisel', 'nb-is': '💼 İş', 'nb-fikir': '💡 Fikirler', 'nb-muzik': '🎵 Müzik', 'nb-toplanti': '📋 Toplantı' };

interface NoteItem {
  id: string; title: string; content: string; notebook: string;
  note_type: string; tags: string; created_at: string; is_starred: boolean;
}

export default function NotesModule() {
  const { data: raw, loading, refetch } = useMihenkData(mihenkAPI.getNotes, []);
  const notes = useMemo<NoteItem[]>(() =>
    ensureArray(raw).map(n => ({
      id: n.id, title: n.title || 'Başlıksız', content: n.content || '',
      notebook: n.notebook || 'nb-kisisel', note_type: n.note_type || 'nt-taslak',
      tags: n.tags || '', created_at: n.created_at, is_starred: (n.tags || '').includes('⭐'),
    })), [raw]);

  const [activeNb, setActiveNb] = useState('all');
  const [selId, setSelId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [nbOpen, setNbOpen] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formNb, setFormNb] = useState('nb-kisisel');
  const [formTags, setFormTags] = useState('');

  const filtered = useMemo(() => {
    let list = notes;
    if (activeNb === 'nb-yildiz') list = list.filter(n => n.is_starred);
    else if (activeNb !== 'all') list = list.filter(n => n.notebook === activeNb);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.toLowerCase().includes(q)); }
    return list;
  }, [notes, activeNb, search]);

  const selected = useMemo(() => selId ? notes.find(n => n.id === selId) ?? null : null, [notes, selId]);
  const nbCounts = useMemo(() => {
    const c: Record<string, number> = { all: notes.length, 'nb-yildiz': notes.filter(n => n.is_starred).length };
    notes.forEach(n => { c[n.notebook] = (c[n.notebook] || 0) + 1; }); return c;
  }, [notes]);

  const handleCreate = useCallback(async () => {
    if (!formTitle.trim()) { toast.error('Başlık gerekli'); return; }
    try { await mihenkAPI.createNote({ title: formTitle, content: formContent, folder: formNb, tags: formTags }); setCreating(false); setFormTitle(''); setFormContent(''); setFormTags(''); refetch(); toast.success('Not oluşturuldu'); }
    catch { toast.error('Oluşturulamadı'); }
  }, [formTitle, formContent, formNb, formTags, refetch]);

  const startEdit = useCallback(() => {
    if (!selected) return;
    setFormTitle(selected.title); setFormContent(selected.content); setFormNb(selected.notebook); setFormTags(selected.tags.replace('⭐', '').trim()); setEditing(true);
  }, [selected]);

  const handleSave = useCallback(async () => {
    if (!selected) return;
    try { await mihenkAPI.updateNote({ id: selected.id, title: formTitle, content: formContent, folder: formNb, tags: formTags }); setEditing(false); refetch(); toast.success('Kaydedildi'); }
    catch { toast.error('Kaydedilemedi'); }
  }, [selected, formTitle, formContent, formNb, formTags, refetch]);

  const handleDelete = useCallback(async (id: string) => {
    try { await mihenkAPI.deleteNote({ id }); if (selId === id) setSelId(null); refetch(); toast.success('Silindi'); }
    catch { toast.error('Silinemedi'); }
  }, [selId, refetch]);

  const toggleStar = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id); if (!note) return;
    const newTags = note.is_starred ? note.tags.replace('⭐', '').trim() : `${note.tags} ⭐`.trim();
    try { await mihenkAPI.updateNote({ id, tags: newTags }); refetch(); toast.success(note.is_starred ? 'Yıldız kaldırıldı' : '⭐ Yıldızlandı'); }
    catch { toast.error('Güncellenemedi'); }
  }, [notes, refetch]);

  if (loading) return <div className="module-transition"><div className="h-[calc(100vh-10rem)] shimmer rounded-2xl" /></div>;

  return (
    <div className="module-transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold font-serif">Notlar</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{notes.length}</span>
        </div>
        <button onClick={() => { setCreating(true); setSelId(null); setEditing(false); setFormTitle(''); setFormContent(''); setFormNb('nb-kisisel'); setFormTags(''); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> Yeni Not
        </button>
      </div>

      <div className="flex gap-0 h-[calc(100vh-12rem)] rounded-2xl border border-border overflow-hidden bg-card">
        {/* Notebooks */}
        <div className={cn('border-r border-border bg-muted/30 shrink-0 transition-all overflow-y-auto hidden md:block', nbOpen ? 'w-[170px]' : 'w-0 border-r-0')}>
          {nbOpen && <div className="p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 mb-2">Defterler</p>
            {NOTEBOOKS.map(nb => (
              <button key={nb.id} onClick={() => { setActiveNb(nb.id); setSelId(null); }}
                className={cn('w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition', activeNb === nb.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground')}>
                <span className="flex items-center gap-2"><span>{nb.emoji}</span>{nb.label}</span>
                <span className={cn('text-[10px]', activeNb === nb.id ? 'opacity-80' : 'text-muted-foreground')}>{nbCounts[nb.id] || 0}</span>
              </button>
            ))}
          </div>}
        </div>

        {/* Note List */}
        <div className="w-full md:w-[260px] shrink-0 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <button onClick={() => setNbOpen(p => !p)} className="p-1.5 rounded-lg hover:bg-muted transition hidden md:block"><FolderOpen className="w-3.5 h-3.5 text-muted-foreground" /></button>
              <div className="flex items-center gap-2 flex-1 bg-muted rounded-lg px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara…" className="bg-transparent text-xs outline-none w-full placeholder:text-muted-foreground" />
                {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-muted-foreground" /></button>}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6"><StickyNote className="w-10 h-10 text-muted-foreground/20 mb-2" /><p className="text-xs text-muted-foreground">{search ? 'Sonuç yok' : 'Not yok'}</p></div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {filtered.map(note => (
                  <button key={note.id} onClick={() => { setSelId(note.id); setEditing(false); setCreating(false); }}
                    className={cn('w-full text-left p-3 rounded-xl transition', selId === note.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent')}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold line-clamp-1 flex-1">{note.title}</h4>
                      {note.is_starred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0 mt-0.5" />}
                    </div>
                    {note.content && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{note.content}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground"><Clock className="w-2.5 h-2.5" />{NB_LABEL[note.notebook] || note.notebook}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 flex-col min-w-0 hidden md:flex">
          {creating ? <NoteForm title={formTitle} setTitle={setFormTitle} content={formContent} setContent={setFormContent} nb={formNb} setNb={setFormNb} tags={formTags} setTags={setFormTags} onSave={handleCreate} onCancel={() => setCreating(false)} label="Yeni Not" saveLabel="Oluştur" />
          : selected ? (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground">{NB_LABEL[selected.notebook] || selected.notebook}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium truncate">{selected.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleStar(selected.id)} className="p-2 rounded-lg hover:bg-muted transition"><Star className={cn('w-4 h-4', selected.is_starred ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground')} /></button>
                  <button onClick={editing ? handleSave : startEdit} className="p-2 rounded-lg hover:bg-muted transition">{editing ? <Save className="w-4 h-4 text-green-600" /> : <Edit3 className="w-4 h-4 text-muted-foreground" />}</button>
                  <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg hover:bg-muted transition"><Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {editing ? <NoteForm title={formTitle} setTitle={setFormTitle} content={formContent} setContent={setFormContent} nb={formNb} setNb={setFormNb} tags={formTags} setTags={setFormTags} onSave={handleSave} onCancel={() => setEditing(false)} label="Düzenle" saveLabel="Kaydet" />
                : <NoteView title={selected.title} content={selected.content} tags={selected.tags} onEdit={startEdit} />}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <BookOpen className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-semibold font-serif mb-1">Not Seçin</h3>
              <p className="text-sm text-muted-foreground mb-4">Sol panelden bir not seçin veya yeni oluşturun</p>
              <button onClick={() => { setCreating(true); setFormTitle(''); setFormContent(''); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90"><Plus className="w-4 h-4" /> Yeni Not</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Sub-components */
function NoteForm({ title, setTitle, content, setContent, nb, setNb, tags, setTags, onSave, onCancel, label, saveLabel }: {
  title: string; setTitle: (v: string) => void; content: string; setContent: (v: string) => void;
  nb: string; setNb: (v: string) => void; tags: string; setTags: (v: string) => void;
  onSave: () => void; onCancel: () => void; label: string; saveLabel: string;
}) {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h3 className="text-lg font-bold font-serif mb-4">{label}</h3>
      <div className="space-y-4 max-w-2xl">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Başlık…" className="w-full text-xl font-bold bg-transparent outline-none placeholder:text-muted-foreground/50 border-b border-border pb-3" autoFocus />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Defter</label>
            <select value={nb} onChange={e => setNb(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none border border-border">
              {NOTEBOOKS.filter(n => n.id !== 'all' && n.id !== 'nb-yildiz').map(n => <option key={n.id} value={n.id}>{n.emoji} {n.label}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Etiketler</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="virgülle ayır" className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none border border-border" />
          </div>
        </div>
        <TextareaAutosize value={content} onChange={e => setContent(e.target.value)} placeholder="Markdown ile yaz…" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm outline-none resize-none font-mono leading-relaxed border border-border" minRows={10} />
        <div className="flex gap-3">
          <button onClick={onSave} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 flex items-center gap-2"><Save className="w-4 h-4" /> {saveLabel}</button>
          <button onClick={onCancel} className="text-sm text-muted-foreground px-4 py-2.5 hover:bg-muted rounded-xl">İptal</button>
        </div>
      </div>
    </div>
  );
}

function NoteView({ title, content, tags, onEdit }: { title: string; content: string; tags: string; onEdit: () => void }) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold font-serif mb-2">{title}</h1>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tags.split(/[,\s]+/).filter(t => t && t !== '⭐').map((tag, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium flex items-center gap-1"><Hash className="w-2.5 h-2.5" />{tag}</span>
        ))}
      </div>
      {content ? (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">İçerik yok</p>
          <button onClick={onEdit} className="text-xs text-primary mt-2 hover:underline">Düzenlemeye başla →</button>
        </div>
      )}
    </div>
  );
}
