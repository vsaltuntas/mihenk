import { useState } from 'react';
import { Disc3, Calendar, PenLine, X, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mihenkAPI } from '@/lib/mihenk-data';
import { toast } from 'sonner';

const TRACK_PIPE: Record<string, { label: string; cls: string }> = {
  'tp-taslak': { label: '📝 Taslak', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
  'tp-demo': { label: '🎙️ Demo', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  'tp-kayit': { label: '🎚️ Kayıt', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  'tp-mix': { label: '🎛️ Mix', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  'tp-master': { label: '💎 Master', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  'tp-hazir': { label: '✅ Hazır', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  'tp-dagitim': { label: '📦 Dağıtım', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  'tp-yayinda': { label: '🚀 Yayında', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

const RELEASE_TYPE: Record<string, string> = {
  'rt-single': 'Single',
  'rt-ep': 'EP',
  'rt-album': 'Albüm',
  'rt-feat': 'feat.',
  'rt-remix': 'Remix',
  'rt-cover': 'Cover',
  'rt-live': 'Canlı',
};

interface TrackCardProps {
  track: any;
  onRefetch: () => void;
}

export default function TrackCard({ track, onRefetch }: TrackCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: (track.fieldValues['/text'] as string) || '',
    genre: (track.fieldValues['/attributes/@tgenr'] as string) || '',
    bpm: String(track.fieldValues['/attributes/@tbpm'] || ''),
    key: (track.fieldValues['/attributes/@tkey'] as string) || '',
    pipeline: (track.fieldValues['/attributes/@tpipe'] as string) || 'tp-taslak',
    album: (track.fieldValues['/attributes/@talbm'] as string) || '',
    distribution: (track.fieldValues['/attributes/@tdist'] as string) || '',
  });

  const pipe = TRACK_PIPE[track.fieldValues['/attributes/@tpipe'] as string];
  const rtype = RELEASE_TYPE[track.fieldValues['/attributes/@ttype'] as string];

  const handleSave = async () => {
    setSaving(true);
    try {
      await mihenkAPI.updateTrack(track.id, {
        title: form.title,
        genre: form.genre,
        bpm: form.bpm ? Number(form.bpm) : 0,
        key: form.key,
        pipeline: form.pipeline,
        album: form.album,
        distribution: form.distribution,
      });
      toast.success('✅ Track güncellendi');
      onRefetch();
      setEditing(false);
    } catch (e: unknown) {
      toast.error(`❌ Güncellenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`"${track.fieldValues['/text']}" track'ini silmek istediğinize emin misiniz?`)) return;
    try {
      await mihenkAPI.deleteTrack(track.id);
      toast.success('Track silindi');
      onRefetch();
    } catch { toast.error('Silinemedi'); }
  };

  const handlePipelineQuickChange = async (newPipe: string) => {
    try {
      await mihenkAPI.updateTrack(track.id, { pipeline: newPipe });
      toast.success(`Pipeline → ${TRACK_PIPE[newPipe]?.label}`);
      onRefetch();
    } catch { toast.error('Pipeline değiştirilemedi'); }
  };

  if (editing) {
    return (
      <div className="p-4 bg-muted/20 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Track Düzenle</h4>
          <div className="flex gap-1.5">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50">
              <Check className="w-3 h-3" />{saving ? '...' : 'Kaydet'}
            </button>
            <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="Track adı" className="w-full bg-background rounded-xl px-3 py-2 text-sm outline-none border border-border" />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.album} onChange={e => setForm(p => ({ ...p, album: e.target.value }))}
            placeholder="Albüm adı" className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border" />
          <select value={form.pipeline} onChange={e => setForm(p => ({ ...p, pipeline: e.target.value }))}
            className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border">
            {Object.entries(TRACK_PIPE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input value={form.genre} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))}
            placeholder="Genre" className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border" />
          <input value={form.bpm} onChange={e => setForm(p => ({ ...p, bpm: e.target.value }))} type="number"
            placeholder="BPM" className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border" />
          <input value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))}
            placeholder="Key/Makam" className="bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border" />
        </div>
        <input value={form.distribution} onChange={e => setForm(p => ({ ...p, distribution: e.target.value }))}
          placeholder="Dağıtım platformları (Spotify, Apple Music...)" className="w-full bg-background rounded-xl px-3 py-2 text-xs outline-none border border-border" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
        <Disc3 className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{track.fieldValues['/text'] as string}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {rtype && <span className="text-[10px] text-muted-foreground">{rtype}</span>}
          {track.fieldValues['/attributes/@tgenr'] && <span className="text-[10px] text-muted-foreground">· {track.fieldValues['/attributes/@tgenr'] as string}</span>}
          {track.fieldValues['/attributes/@tbpm'] && <span className="text-[10px] text-muted-foreground">· {track.fieldValues['/attributes/@tbpm']} BPM</span>}
          {track.fieldValues['/attributes/@tkey'] && <span className="text-[10px] text-muted-foreground">· {track.fieldValues['/attributes/@tkey'] as string}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {track.fieldValues['/attributes/@tdate'] && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />{track.fieldValues['/attributes/@tdate'] as string}
          </span>
        )}
        {pipe && (
          <select
            value={track.fieldValues['/attributes/@tpipe'] as string}
            onChange={e => handlePipelineQuickChange(e.target.value)}
            onClick={e => e.stopPropagation()}
            className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer appearance-none bg-transparent', pipe.cls)}
            title="Pipeline değiştir"
          >
            {Object.entries(TRACK_PIPE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        )}
        <button onClick={() => setEditing(true)}
          className="p-1 rounded-lg text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all"
          title="Düzenle">
          <PenLine className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleDelete}
          className="p-1 rounded-lg text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all"
          title="Sil">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export { TRACK_PIPE, RELEASE_TYPE };
