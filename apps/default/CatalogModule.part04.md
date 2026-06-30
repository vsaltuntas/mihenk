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
