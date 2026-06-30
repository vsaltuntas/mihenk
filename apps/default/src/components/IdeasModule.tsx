import { useState, useMemo } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import { cn } from '@/lib/utils';
import { Lightbulb, Plus, Search, X, Star, Zap, ArrowRight, Tag, Pencil, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  exploring: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  planned: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  in_progress: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  done: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
};

const CARD_GRADIENTS = [
  'from-yellow-500/20 to-amber-500/10',
  'from-purple-500/20 to-pink-500/10',
  'from-cyan-500/20 to-blue-500/10',
  'from-green-500/20 to-emerald-500/10',
  'from-rose-500/20 to-red-500/10',
  'from-indigo-500/20 to-violet-500/10',
];

export default function IdeasModule() {
  const { data: rawIdeas, loading, refetch } = useMihenkData(mihenkAPI.getIdeas, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'medium' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', priority: 'medium' });

  const ideas = ensureArray(rawIdeas);

  const CATEGORY_MAP: Record<string, string> = { 'Müzik': 'ic-muzik', 'İçerik': 'ic-icerik', 'Ürün': 'ic-urun', 'İş': 'ic-is', 'Kişisel': 'ic-kisisel', 'Teknik': 'ic-teknik', 'Diğer': 'ic-diger' };
  const REVERSE_CAT: Record<string, string> = Object.fromEntries(Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k]));

  const handleStartEdit = (idea: typeof ideas[0]) => {
    setEditingId(idea.id);
    const catKey = Object.entries(CATEGORY_MAP).find(([, v]) => v === idea.category)?.[1] ? idea.category : (CATEGORY_MAP[idea.category] || 'ic-diger');
    setEditForm({ title: idea.title, description: idea.description || '', category: catKey, priority: idea.priority || 'medium' });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.title.trim()) { toast.error('Başlık gerekli'); return; }
    setSaving(true);
    try {
      await mihenkAPI.updateIdea(editingId, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
      });
      setEditingId(null);
      refetch();
      toast.success('✅ Fikir güncellendi!');
    } catch (e: unknown) {
      toast.error(`❌ Güncellenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSaving(false); }
  };

  const handleDeleteIdea = async (id: string, title: string) => {
    if (!confirm(`"${title}" fikrini silmek istediğinize emin misiniz?`)) return;
    try {
      await mihenkAPI.deleteIdea(id);
      refetch();
      toast.success('🗑️ Fikir silindi');
    } catch (e: unknown) {
      toast.error(`❌ Silinemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return ideas;
    const q = searchQuery.toLowerCase();
    return ideas.filter(i =>
      i.title.toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q) ||
      (i.category || '').toLowerCase().includes(q)
    );
  }, [ideas, searchQuery]);

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Fikir başlığı gerekli'); return; }
    setSaving(true);
    try {
      await mihenkAPI.createIdea({
        title: form.title,
        description: form.description || undefined,
        category: form.category || undefined,
        priority: form.priority,
      });
      setShowAdd(false);
      setForm({ title: '', description: '', category: '', priority: 'medium' });
      refetch();
      toast.success('✅ Fikir kaydedildi!');
    } catch (e: unknown) {
      toast.error(`❌ Kayıt başarısız: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="module-transition space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-36 shimmer rounded-2xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="module-transition space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Fikirler</h2>
            <p className="text-xs text-muted-foreground">{ideas.length} fikir kaydı</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> Yeni Fikir
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Fikir ara..." className="w-full bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none border border-border" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Ideas Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground text-sm">Henüz fikir kaydedilmemiş</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 text-xs text-primary hover:underline">+ İlk fikri ekle</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((idea, i) => {
            const isEditing = editingId === idea.id;
            if (isEditing) {
              return (
                <motion.div key={idea.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-2xl border-2 border-primary/30 bg-card p-5 space-y-3">
                  <input autoFocus value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none border border-border" />
                  <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Açıklama..." rows={2}
                    className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none border border-border resize-none" />
                  <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none border border-border">
                    <option value="ic-diger">Diğer</option>
                    <option value="ic-muzik">🎵 Müzik</option>
                    <option value="ic-icerik">📝 İçerik</option>
                    <option value="ic-urun">📦 Ürün</option>
                    <option value="ic-is">💼 İş</option>
                    <option value="ic-kisisel">👤 Kişisel</option>
                    <option value="ic-teknik">⚙️ Teknik</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground py-2 rounded-xl text-xs font-semibold disabled:opacity-60">
                      <Save className="w-3.5 h-3.5" /> Kaydet
                    </button>
                    <button onClick={() => setEditingId(null)} className="px-3 py-2 text-xs text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
                  </div>
                </motion.div>
              );
            }
            return (
              <motion.div key={idea.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className={cn(
                  'bg-gradient-to-br rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group relative',
                  CARD_GRADIENTS[i % CARD_GRADIENTS.length]
                )}>
                {/* Edit/Delete buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStartEdit(idea)} className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10" title="Düzenle">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteIdea(idea.id, idea.title)} className="p-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600" title="Sil">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  {idea.priority && (
                    <span className={cn('text-[9px] font-medium px-2 py-0.5 rounded-full', PRIORITY_COLORS[idea.priority] || PRIORITY_COLORS.medium)}>
                      {idea.priority === 'high' ? '🔥 Yüksek' : idea.priority === 'low' ? '🟢 Düşük' : '🟡 Orta'}
                    </span>
                  )}
                  {idea.status && (
                    <span className={cn('text-[9px] font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[idea.status] || STATUS_COLORS.new)}>
                      {idea.status}
                    </span>
                  )}
                  {idea.category && (
                    <span className="text-[9px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" /> {idea.category}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm mb-1 line-clamp-2">{idea.title}</h3>
                {idea.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{idea.description}</p>
                )}
                <p className="text-[10px] text-muted-foreground">{idea.created_at?.slice(0, 10)}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Idea Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" /> Yeni Fikir
                </h3>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input autoFocus value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreate()}
                  placeholder="Fikir başlığı *" className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Açıklama / detaylar..." rows={3}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Kategori</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border">
                      <option value="ic-diger">Diğer</option>
                      <option value="ic-muzik">🎵 Müzik</option>
                      <option value="ic-icerik">📝 İçerik</option>
                      <option value="ic-urun">📦 Ürün</option>
                      <option value="ic-is">💼 İş</option>
                      <option value="ic-kisisel">👤 Kişisel</option>
                      <option value="ic-teknik">⚙️ Teknik</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Öncelik</label>
                    <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border">
                      <option value="low">🟢 Düşük</option>
                      <option value="medium">🟡 Orta</option>
                      <option value="high">🔥 Yüksek</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={handleCreate} disabled={saving}
                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Fikir Ekle'}
                  </button>
                  <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
