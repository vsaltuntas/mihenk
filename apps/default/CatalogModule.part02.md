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
