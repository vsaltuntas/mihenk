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
