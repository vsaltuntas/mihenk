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
