import { useState, useMemo } from 'react';
import { mihenkAPI, useMihenkData } from '@/lib/mihenk-data';
import { cn } from '@/lib/utils';
import {
  Music, Disc3, Mic, Plus, X, Search, LayoutGrid, List,
  ChevronLeft, ArrowRight, Calendar, Flame, Star, Radio, Clock,
  PenLine, Trash2, Layers, Download, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import TrackCard from './catalog/TrackCard';
import AlbumGroup from './catalog/AlbumGroup';

/* ─── Constants ─── */

const ARTIST_TYPE: Record<string, { label: string; emoji: string }> = {
  'at-solo': { label: 'Solo', emoji: '🎤' },
  'at-grup': { label: 'Grup', emoji: '🎸' },
  'at-ikili': { label: 'İkili', emoji: '👥' },
  'at-topluluk': { label: 'Topluluk', emoji: '🎭' },
  'at-orkestra': { label: 'Orkestra', emoji: '🎻' },
};

const ARTIST_ORIGIN: Record<string, { label: string; cls: string }> = {
  'ao-gercek': { label: '🌍 Gerçek', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  'ao-kurgusal': { label: '✨ Kurgusal', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

const TRACK_PIPE: Record<string, { label: string; cls: string; color: string }> = {
  'tp-taslak': { label: '📝 Taslak', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300', color: '#6B7280' },
  'tp-demo': { label: '🎙️ Demo', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', color: '#F59E0B' },
  'tp-kayit': { label: '🎚️ Kayıt', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', color: '#3B82F6' },
  'tp-mix': { label: '🎛️ Mix', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', color: '#8B5CF6' },
  'tp-master': { label: '💎 Master', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300', color: '#EC4899' },
  'tp-hazir': { label: '✅ Hazır', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', color: '#10B981' },
  'tp-dagitim': { label: '📦 Dağıtım', cls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300', color: '#06B6D4' },
  'tp-yayinda': { label: '🚀 Yayında', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', color: '#10B981' },
};

const RELEASE_TYPE: Record<string, string> = {
  'rt-single': '🎵 Single',
  'rt-ep': '💿 EP',
  'rt-album': '📀 Albüm',
  'rt-collab': '🤝 Collab',
};

type CatalogTab = 'artists' | 'releases' | 'pipeline' | 'calendar';

const PIPE_COLS = ['tp-taslak', 'tp-demo', 'tp-hazir', 'tp-dagitim', 'tp-yayinda'];

/* ─── Add Artist Modal ─── */

function AddArtistModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', type: 'at-solo', genre: '', origin: 'ao-gercek', sonic: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Sanatçı adı gerekli'); return; }
    setSaving(true);
    try {
      await mihenkAPI.createArtist({ name: form.name, type: form.type, origin: form.origin, genre: form.genre, sonic_dna: form.sonic, bio: form.notes });
      toast.success('✅ Sanatçı eklendi!');
      onCreated(); onClose();
    } catch (e: unknown) {
      toast.error(`❌ Eklenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg flex items-center gap-2"><Mic className="w-5 h-5 text-pink-500" /> Sanatçı Ekle</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <input autoFocus value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Sanatçı / Grup Adı *" className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Tür</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border">
                {Object.entries(ARTIST_TYPE).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Köken</label>
              <select value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border">
                {Object.entries(ARTIST_ORIGIN).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <input value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))}
            placeholder="Genre / Tür (ör: Anatolian Rock, Neo-Soul...)"
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          <input value={form.sonic} onChange={e => setForm(p => ({ ...p, sonic: e.target.value }))}
            placeholder="Sonic DNA / Sound Description"
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Notlar..." rows={2}
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border resize-none" />
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {saving ? 'Ekleniyor...' : '+ Sanatçı Ekle'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Add Track Modal ─── */

function AddTrackModal({ artists, onClose, onCreated }: { artists: any[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', artist: '', type: 'rt-single', genre: '', bpm: '', key: '', pipe: 'tp-taslak', releaseDate: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Track adı gerekli'); return; }
    if (!form.artist) { toast.error('Sanatçı seçimi gerekli'); return; }
    setSaving(true);
    try {
      const selectedArtist = artists.find(a => (a.fieldValues['/text'] as string) === form.artist);
      const artistMhkid = selectedArtist?.fieldValues['/attributes/@mhkid'] as string || '';
      await mihenkAPI.createTrack({
        title: form.title,
        artist: form.artist,
        artistMhkid,
        genre: form.genre,
        bpm: form.bpm ? Number(form.bpm) : undefined,
        key: form.key,
        pipeline: form.pipe,
      });
      toast.success('✅ Track eklendi!');
      onCreated(); onClose();
    } catch (e: unknown) {
      toast.error(`❌ Eklenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
