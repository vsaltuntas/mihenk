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
