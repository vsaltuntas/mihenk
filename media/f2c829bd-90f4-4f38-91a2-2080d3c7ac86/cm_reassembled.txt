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
          <h3 className="font-bold text-lg flex items-center gap-2"><Disc3 className="w-5 h-5 text-purple-500" /> Yayın / Track Ekle</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <input autoFocus value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Track / Albüm Adı *" className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Sanatçı</label>
              <select value={form.artist} onChange={e => setForm(p => ({ ...p, artist: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border">
                <option value="">Seç...</option>
                {artists.map(a => <option key={a.id} value={a.fieldValues['/text'] as string}>{a.fieldValues['/text'] as string}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Tür</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border">
                {Object.entries(RELEASE_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))}
              placeholder="Genre" className="bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border" />
            <input value={form.bpm} onChange={e => setForm(p => ({ ...p, bpm: e.target.value }))} type="number"
              placeholder="BPM" className="bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border" />
            <input value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))}
              placeholder="Key/Makam" className="bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Pipeline</label>
              <select value={form.pipe} onChange={e => setForm(p => ({ ...p, pipe: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border">
                {Object.entries(TRACK_PIPE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Yayın Tarihi</label>
              <input type="date" value={form.releaseDate} onChange={e => setForm(p => ({ ...p, releaseDate: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {saving ? 'Ekleniyor...' : '+ Yayın Ekle'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Artist Detail ─── */

function ArtistDetail({ artist, tracks, onBack, onRefetchArtists, onRefetchTracks }: {
  artist: any; tracks: any[]; onBack: () => void; onRefetchArtists: () => void; onRefetchTracks: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [editForm, setEditForm] = useState({
    name: (artist.fieldValues['/text'] as string) || '',
    type: (artist.fieldValues['/attributes/@atype'] as string) || 'at-solo',
    genre: (artist.fieldValues['/attributes/@agenr'] as string) || '',
    origin: (artist.fieldValues['/attributes/@aorigj'] as string) || 'ao-gercek',
    sonic: (artist.fieldValues['/attributes/@asonc'] as string) || '',
    notes: (artist.fieldValues['/attributes/@abio'] as string) || '',
  });
  const [saving, setSaving] = useState(false);
  const [trackForm, setTrackForm] = useState({
    title: '', type: 'rt-single', genre: '', bpm: '', key: '', pipe: 'tp-taslak', releaseDate: '',
  });
  const [savingTrack, setSavingTrack] = useState(false);
  const [trackViewMode, setTrackViewMode] = useState<'flat' | 'album'>('album');

  const artistName = artist.fieldValues['/text'] as string;
  const artistMhkid = artist.fieldValues['/attributes/@mhkid'] as string;
  const artistTracks = tracks.filter(t => {
    const tart = t.fieldValues['/attributes/@tart'] as string;
    const tartid = t.fieldValues['/attributes/@tartid'] as string;
    return (tartid && artistMhkid && tartid === artistMhkid) || tart === artistName || tart === artist.id;
  });
  const atype = ARTIST_TYPE[editForm.type] || ARTIST_TYPE[artist.fieldValues['/attributes/@atype'] as string];
  const origin = ARTIST_ORIGIN[editForm.origin] || ARTIST_ORIGIN[artist.fieldValues['/attributes/@aorigj'] as string];
  const publishedTracks = artistTracks.filter(t => t.fieldValues['/attributes/@tpipe'] === 'tp-yayinda').length;
  const pipelineCount = artistTracks.length - publishedTracks;

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await mihenkAPI.updateArtist(artist.id, {
        name: editForm.name,
        type: editForm.type,
        origin: editForm.origin,
        genre: editForm.genre,
        sonic_dna: editForm.sonic,
        bio: editForm.notes,
      });
      toast.success('✅ Sanatçı güncellendi!');
      onRefetchArtists(); setEditing(false);
    } catch (e: unknown) {
      toast.error(`❌ Güncellenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSaving(false); }
  };

  const handleAddTrack = async () => {
    if (!trackForm.title.trim()) { toast.error('Track adı gerekli'); return; }
    setSavingTrack(true);
    try {
      await mihenkAPI.createTrack({
        title: trackForm.title,
        artist: artistName,
        artistMhkid: artistMhkid,
        genre: trackForm.genre,
        bpm: trackForm.bpm ? Number(trackForm.bpm) : undefined,
        key: trackForm.key,
        pipeline: 'tp-taslak',
      });
      toast.success('✅ Track eklendi!');
      onRefetchTracks(); setShowAddTrack(false);
      setTrackForm({ title: '', type: 'rt-single', genre: '', bpm: '', key: '', pipe: 'tp-taslak', releaseDate: '' });
    } catch (e: unknown) {
      toast.error(`❌ Track eklenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSavingTrack(false); }
  };

  const handleDeleteArtist = async () => {
    if (!confirm(`"${artistName}" sanatçısını silmek istediğinize emin misiniz?`)) return;
    try {
      await mihenkAPI.deleteArtist(artist.id);
      toast.success('✅ Sanatçı silindi');
      onRefetchArtists(); onBack();
    } catch (e: unknown) {
      toast.error(`❌ Silinemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Sanatçılar
        </button>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-sm font-medium truncate">{artistName}</span>
      </div>

      {/* ── Header Card ── */}
      <div className="bg-card rounded-2xl border border-border p-6">
        {!editing ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-4xl shadow-lg">
                  {atype?.emoji || '🎵'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{artistName}</h2>
                  <p className="text-sm text-muted-foreground">{editForm.genre || 'Genre belirtilmemiş'}</p>
                  <div className="flex gap-2 mt-2">
                    {atype && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{atype.emoji} {atype.label}</span>}
                    {origin && <span className={cn('text-xs px-2 py-0.5 rounded-full', origin.cls)}>{origin.label}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors">
                  <PenLine className="w-3.5 h-3.5" /> Düzenle
                </button>
                <button onClick={handleDeleteArtist}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Sil
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="text-center bg-muted/50 rounded-xl p-3">
                <p className="text-xl font-bold">{artistTracks.length}</p>
                <p className="text-[10px] text-muted-foreground">Track</p>
              </div>
              <div className="text-center bg-muted/50 rounded-xl p-3">
                <p className="text-xl font-bold text-green-500">{publishedTracks}</p>
                <p className="text-[10px] text-muted-foreground">Yayında</p>
              </div>
              <div className="text-center bg-muted/50 rounded-xl p-3">
                <p className="text-xl font-bold text-amber-500">{pipelineCount}</p>
                <p className="text-[10px] text-muted-foreground">Pipeline</p>
              </div>
            </div>

            {/* Sonic DNA & Notes */}
            {editForm.sonic && (
              <div className="mt-4 p-3 rounded-xl bg-muted/50">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">🎧 Sonic DNA</p>
                <p className="text-sm">{editForm.sonic}</p>
              </div>
            )}
            {editForm.notes && (
              <div className="mt-3 p-3 rounded-xl bg-muted/50">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">📝 Notlar</p>
                <p className="text-sm">{editForm.notes}</p>
              </div>
            )}
          </>
        ) : (
          /* ── Edit Form ── */
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg flex items-center gap-2"><PenLine className="w-5 h-5 text-primary" /> Sanatçıyı Düzenle</h3>
              <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Sanatçı Adı *" className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Tür</label>
                <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border">
                  {Object.entries(ARTIST_TYPE).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Köken</label>
                <select value={editForm.origin} onChange={e => setEditForm(p => ({ ...p, origin: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border">
                  {Object.entries(ARTIST_ORIGIN).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <input value={editForm.genre} onChange={e => setEditForm(p => ({ ...p, genre: e.target.value }))}
              placeholder="Genre" className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
            <input value={editForm.sonic} onChange={e => setEditForm(p => ({ ...p, sonic: e.target.value }))}
              placeholder="Sonic DNA" className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
            <textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notlar..." rows={2}
              className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border resize-none" />
            <div className="flex gap-2 pt-1">
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tracks Section ── */}
      <div className="bg-card rounded-2xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-purple-500" /> Trackler
            <span className="text-xs text-muted-foreground font-normal">({artistTracks.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <button onClick={() => setTrackViewMode('flat')}
                className={cn('px-2 py-1 rounded text-[10px] font-medium transition-colors', trackViewMode === 'flat' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <List className="w-3 h-3" />
              </button>
              <button onClick={() => setTrackViewMode('album')}
                className={cn('px-2 py-1 rounded text-[10px] font-medium transition-colors', trackViewMode === 'album' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <Layers className="w-3 h-3" />
              </button>
            </div>
            <button onClick={() => setShowAddTrack(true)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
              <Plus className="w-3.5 h-3.5" /> Track Ekle
            </button>
          </div>
        </div>

        {/* Inline Add Track Form */}
        <AnimatePresence>
          {showAddTrack && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border">
              <div className="p-4 bg-muted/30 space-y-3">
                <input autoFocus value={trackForm.title} onChange={e => setTrackForm(p => ({ ...p, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddTrack()}
                  placeholder="Track / Albüm Adı *" className="w-full bg-background rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={trackForm.type} onChange={e => setTrackForm(p => ({ ...p, type: e.target.value }))}
                    className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border">
                    {Object.entries(RELEASE_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <select value={trackForm.pipe} onChange={e => setTrackForm(p => ({ ...p, pipe: e.target.value }))}
                    className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border">
                    {Object.entries(TRACK_PIPE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input value={trackForm.genre} onChange={e => setTrackForm(p => ({ ...p, genre: e.target.value }))}
                    placeholder="Genre" className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border" />
                  <input value={trackForm.bpm} onChange={e => setTrackForm(p => ({ ...p, bpm: e.target.value }))} type="number"
                    placeholder="BPM" className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border" />
                  <input value={trackForm.key} onChange={e => setTrackForm(p => ({ ...p, key: e.target.value }))}
                    placeholder="Key/Makam" className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Yayın Tarihi</label>
                  <input type="date" value={trackForm.releaseDate} onChange={e => setTrackForm(p => ({ ...p, releaseDate: e.target.value }))}
                    className="w-full bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddTrack} disabled={savingTrack}
                    className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {savingTrack ? 'Ekleniyor...' : '🎵 Track Ekle'}
                  </button>
                  <button onClick={() => setShowAddTrack(false)} className="px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {artistTracks.length === 0 && !showAddTrack ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            <Disc3 className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>Bu sanatçıya ait track yok</p>
            <button onClick={() => setShowAddTrack(true)} className="mt-2 text-xs text-primary hover:underline">İlk track'i ekle</button>
          </div>
        ) : trackViewMode === 'album' ? (
          <AlbumGroup tracks={artistTracks} onRefetch={onRefetchTracks} />
        ) : (
          <div className="divide-y divide-border">
            {artistTracks.map(t => (
              <TrackCard key={t.id} track={t} onRefetch={onRefetchTracks} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */

export default function CatalogModule() {
  const { data: rawArtists, loading: loadArtists, refetch: refetchArtistsRaw } = useMihenkData(mihenkAPI.getArtists, []);
  const { data: rawTracks, loading: loadTracks, refetch: refetchTracksRaw } = useMihenkData(mihenkAPI.getTracks, []);

  // Map MİHENK artists to UI shape
  const artists = useMemo(() => (rawArtists ?? []).map(a => ({
    id: a.id, parentId: null, completed: false,
    fieldValues: {
      '/text': a.name,
      '/attributes/@atype': a.artist_type || 'at-solo',
      '/attributes/@agenr': a.genre || '',
      '/attributes/@aorigj': a.origin || 'ao-gercek',
      '/attributes/@asonc': a.sonic_dna || '',
      '/attributes/@anote': a.bio || '',
      '/attributes/@mhkid': a.mihenk_id || '',
    }
  })), [rawArtists]);

  // Map MİHENK tracks to UI shape — use artist name for matching
  const tracks = useMemo(() => (rawTracks ?? []).map(t => ({
    id: t.id, parentId: t.parentId, completed: false,
    fieldValues: {
      '/text': t.title,
      '/attributes/@tart': t.artist || '',
      '/attributes/@tartid': t.artist_mihenk_id || '',
      '/attributes/@talbm': t.album || '',
      '/attributes/@tgenr': t.genre || '',
      '/attributes/@tbpm': t.bpm ? String(t.bpm) : '',
      '/attributes/@tkey': t.key || '',
      '/attributes/@tpipe': t.pipeline || 'tp-taslak',
      '/attributes/@tdist': t.distribution || '',
      '/attributes/@mhkid': t.mihenk_id || '',
    }
  })), [rawTracks]);

  const refetchArtists = refetchArtistsRaw;
  const refetchTracks = refetchTracksRaw;

  const [activeTab, setActiveTab] = useState<CatalogTab>('artists');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);

  const loading = loadArtists || loadTracks;

  // Derived stats
  const stats = useMemo(() => {
    const totalTracks = tracks.length;
    const released = tracks.filter(t => t.fieldValues['/attributes/@tpipe'] === 'tp-yayinda').length;
    const pipeStats = Object.fromEntries(PIPE_COLS.map(k => [k, tracks.filter(t => t.fieldValues['/attributes/@tpipe'] === k).length]));
    return { artists: artists.length, albums: 0, totalTracks, released, pipeStats };
  }, [artists, tracks]);

  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return artists;
    const q = searchQuery.toLowerCase();
    return artists.filter(a => (a.fieldValues['/text'] as string || '').toLowerCase().includes(q));
  }, [artists, searchQuery]);

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    const q = searchQuery.toLowerCase();
    return tracks.filter(t => (t.fieldValues['/text'] as string || '').toLowerCase().includes(q));
  }, [tracks, searchQuery]);

  // Calendar: tracks with release dates
  const calendarTracks = useMemo(() =>
    tracks.filter(t => t.fieldValues['/attributes/@tdate'])
      .sort((a, b) => ((a.fieldValues['/attributes/@tdate'] as string) || '').localeCompare((b.fieldValues['/attributes/@tdate'] as string) || '')),
    [tracks]);

  if (loading) return (
    <div className="module-transition space-y-4">
      <div className="h-8 shimmer rounded-xl w-48" />
      <div className="grid grid-cols-4 gap-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 shimmer rounded-2xl" />)}</div>
      <div className="h-64 shimmer rounded-2xl" />
    </div>
  );

  // Show artist detail
  if (selectedArtist) {
    return (
      <div className="module-transition">
        <ArtistDetail artist={selectedArtist} tracks={tracks} onBack={() => setSelectedArtist(null)} onRefetchArtists={refetchArtists} onRefetchTracks={refetchTracks} />
      </div>
    );
  }

  return (
    <div className="module-transition space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Music className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Katalog</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Bağımsız müzik kataloğu</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const csv = ['ID,Sanatçı,Yayın,Pipeline,Genre,BPM,Key,Dağıtım,Release Date']
              .concat(tracks.map(t => [
                t.id,
                t.fieldValues['/attributes/@tart'] || '',
                t.fieldValues['/text'] || '',
                t.fieldValues['/attributes/@tpipe'] || '',
                t.fieldValues['/attributes/@tgenr'] || '',
                t.fieldValues['/attributes/@tbpm'] || '',
                t.fieldValues['/attributes/@tkey'] || '',
                t.fieldValues['/attributes/@tdist'] || '',
                t.fieldValues['/attributes/@tdate'] || '',
              ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')))
              .join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `katalog-${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('CSV indirildi');
          }}
            className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors border border-border">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          {activeTab === 'artists' && (
            <button onClick={() => setShowAddArtist(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
              <Plus className="w-4 h-4" /> Sanatçı Ekle
            </button>
          )}
          {(activeTab === 'releases' || activeTab === 'pipeline') && (
            <button onClick={() => setShowAddTrack(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
              <Plus className="w-4 h-4" /> Yayın Ekle
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Sanatçı', value: stats.artists, icon: Mic, color: 'text-pink-500', bg: 'from-pink-500/20 to-rose-500/10' },
          { label: 'Albüm', value: stats.albums, icon: Disc3, color: 'text-purple-500', bg: 'from-purple-500/20 to-violet-500/10' },
          { label: 'Track', value: stats.totalTracks, icon: Music, color: 'text-blue-500', bg: 'from-blue-500/20 to-indigo-500/10' },
          { label: 'Yayında', value: stats.released, icon: Radio, color: 'text-green-500', bg: 'from-green-500/20 to-emerald-500/10' },
        ].map(s => (
          <div key={s.label} className={cn('bg-gradient-to-br rounded-2xl border border-border p-4', s.bg)}>
            <s.icon className={cn('w-5 h-5 mb-1', s.color)} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Stat Cards Row 2 */}
      <div className="grid grid-cols-5 gap-2">
        {PIPE_COLS.map(k => {
          const pipe = TRACK_PIPE[k];
          return (
            <div key={k} className="bg-card rounded-xl border border-border p-3 text-center">
              <p className="text-lg font-bold">{stats.pipeStats[k] || 0}</p>
              <p className="text-[9px] text-muted-foreground">{pipe.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
        {([
          { id: 'artists' as CatalogTab, label: 'Sanatçılar', icon: Mic },
          { id: 'releases' as CatalogTab, label: 'Yayınlar', icon: Disc3 },
          { id: 'pipeline' as CatalogTab, label: 'Pipeline', icon: Flame },
          { id: 'calendar' as CatalogTab, label: 'Takvim', icon: Calendar },
        ]).map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center',
              activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ═══ ARTISTS TAB ═══ */}
        {activeTab === 'artists' && (
          <motion.div key="artists" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Search + Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Sanatçı ara..."
                  className="w-full bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none border border-border" />
              </div>
              <div className="flex items-center bg-muted rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filteredArtists.length === 0 ? (
              <div className="text-center py-16">
                <Mic className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">Henüz sanatçı eklenmemiş</p>
                <button onClick={() => setShowAddArtist(true)} className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium">
                  + İlk Sanatçıyı Ekle
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArtists.map(a => {
                  const atype = ARTIST_TYPE[a.fieldValues['/attributes/@atype'] as string];
                  const origin = ARTIST_ORIGIN[a.fieldValues['/attributes/@aorigj'] as string];
                  const aMhk = a.fieldValues['/attributes/@mhkid'] as string;
                  const aName = a.fieldValues['/text'] as string;
                  const artistTracks = tracks.filter(t => { const tid = t.fieldValues['/attributes/@tartid'] as string; const tn = t.fieldValues['/attributes/@tart'] as string; return (tid && aMhk && tid === aMhk) || tn === aName; });
                  return (
                    <motion.div key={a.id} whileHover={{ y: -2 }} onClick={() => setSelectedArtist(a)}
                      className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-2xl shadow-md">
                          {atype?.emoji || '🎵'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold group-hover:text-primary transition-colors truncate">{a.fieldValues['/text'] as string}</h4>
                          <p className="text-xs text-muted-foreground truncate">{a.fieldValues['/attributes/@agenr'] as string || 'Genre belirsiz'}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {origin && <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', origin.cls)}>{origin.label}</span>}
                        {atype && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{atype.label}</span>}
                        <span className="text-[10px] text-muted-foreground ml-auto">{artistTracks.length} track</span>
                      </div>
                      {a.fieldValues['/attributes/@asonc'] && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-1 italic">{a.fieldValues['/attributes/@asonc'] as string}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border divide-y divide-border">
                {filteredArtists.map(a => {
                  const atype = ARTIST_TYPE[a.fieldValues['/attributes/@atype'] as string];
                  const origin = ARTIST_ORIGIN[a.fieldValues['/attributes/@aorigj'] as string];
                  const aMhk2 = a.fieldValues['/attributes/@mhkid'] as string;
                  const aName2 = a.fieldValues['/text'] as string;
                  const artistTracks = tracks.filter(t => { const tid = t.fieldValues['/attributes/@tartid'] as string; const tn = t.fieldValues['/attributes/@tart'] as string; return (tid && aMhk2 && tid === aMhk2) || tn === aName2; });
                  return (
                    <button key={a.id} onClick={() => setSelectedArtist(a)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-lg flex-shrink-0">
                        {atype?.emoji || '🎵'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{a.fieldValues['/text'] as string}</p>
                        <p className="text-xs text-muted-foreground">{a.fieldValues['/attributes/@agenr'] as string} · {artistTracks.length} track</p>
                      </div>
                      {origin && <span className={cn('text-[10px] px-2 py-0.5 rounded-full flex-shrink-0', origin.cls)}>{origin.label}</span>}
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ RELEASES TAB ═══ */}
        {activeTab === 'releases' && (
          <motion.div key="releases" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Yayın ara..."
                className="w-full bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none border border-border" />
            </div>
            {filteredTracks.length === 0 ? (
              <div className="text-center py-16">
                <Disc3 className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground text-sm">Henüz yayın eklenmemiş</p>
                <button onClick={() => setShowAddTrack(true)} className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium">
                  + İlk Yayını Ekle
                </button>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border divide-y divide-border">
                {filteredTracks.map(t => {
                  const pipe = TRACK_PIPE[t.fieldValues['/attributes/@tpipe'] as string];
                  const rtype = RELEASE_TYPE[t.fieldValues['/attributes/@ttype'] as string];
                  return (
                    <div key={t.id} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <Disc3 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{t.fieldValues['/text'] as string}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{t.fieldValues['/attributes/@tart'] as string}</span>
                          {rtype && <span className="text-[10px] text-muted-foreground">· {rtype}</span>}
                          {t.fieldValues['/attributes/@tgenr'] && <span className="text-[10px] text-muted-foreground">· {t.fieldValues['/attributes/@tgenr'] as string}</span>}
                          {t.fieldValues['/attributes/@tbpm'] && <span className="text-[10px] text-muted-foreground">· {t.fieldValues['/attributes/@tbpm']} BPM</span>}
                        </div>
                      </div>
                      {t.fieldValues['/attributes/@tdate'] && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />{t.fieldValues['/attributes/@tdate'] as string}
                        </span>
                      )}
                      {pipe && <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', pipe.cls)}>{pipe.label}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ PIPELINE TAB ═══ */}
        {activeTab === 'pipeline' && (
          <motion.div key="pipeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {PIPE_COLS.map(pipeKey => {
                const pipe = TRACK_PIPE[pipeKey];
                const pipeTracks = tracks.filter(t => t.fieldValues['/attributes/@tpipe'] === pipeKey);
                return (
                  <div key={pipeKey} className="bg-card rounded-2xl border border-border p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold">{pipe.label}</span>
                      <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded-full">{pipeTracks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {pipeTracks.map(t => (
                        <div key={t.id} className="bg-muted/60 rounded-xl p-2.5">
                          <p className="text-xs font-medium line-clamp-1">{t.fieldValues['/text'] as string}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.fieldValues['/attributes/@tart'] as string}</p>
                          {t.fieldValues['/attributes/@tgenr'] && (
                            <p className="text-[9px] text-muted-foreground/60">{t.fieldValues['/attributes/@tgenr'] as string}</p>
                          )}
                        </div>
                      ))}
                      {pipeTracks.length === 0 && (
                        <p className="text-[10px] text-muted-foreground text-center py-3">Boş</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ CALENDAR TAB ═══ */}
        {activeTab === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Yayın Takvimi
              </h3>
              {calendarTracks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>Tarihli yayın bulunamadı</p>
                  <p className="text-xs mt-1">Track eklerken yayın tarihi belirtin</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calendarTracks.map(t => {
                    const pipe = TRACK_PIPE[t.fieldValues['/attributes/@tpipe'] as string];
                    const rtype = RELEASE_TYPE[t.fieldValues['/attributes/@ttype'] as string];
                    const date = new Date(t.fieldValues['/attributes/@tdate'] as string);
                    const isUpcoming = date >= new Date();
                    return (
                      <div key={t.id} className={cn('flex items-center gap-3 p-3 rounded-xl border', isUpcoming ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30')}>
                        <div className="text-center flex-shrink-0 w-14">
                          <p className="text-xs font-bold">{date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</p>
                          <p className="text-[9px] text-muted-foreground">{date.getFullYear()}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{t.fieldValues['/text'] as string}</p>
                          <p className="text-[10px] text-muted-foreground">{t.fieldValues['/attributes/@tart'] as string} · {rtype}</p>
                        </div>
                        {pipe && <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', pipe.cls)}>{pipe.label}</span>}
                        {isUpcoming && <span className="text-[9px] font-bold text-primary flex-shrink-0">YAKLAŞAN</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showAddArtist && <AddArtistModal onClose={() => setShowAddArtist(false)} onCreated={refetchArtists} />}
        {showAddTrack && <AddTrackModal artists={artists} onClose={() => setShowAddTrack(false)} onCreated={refetchTracks} />}
      </AnimatePresence>
    </div>
  );
}
