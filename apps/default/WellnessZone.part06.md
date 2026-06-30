                            <button onClick={handleSaveEditMood} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[10px] font-semibold">
                              <Save className="w-3 h-3" /> Kaydet
                            </button>
                            <button onClick={() => setEditingMoodId(null)} className="px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-muted rounded-lg">İptal</button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={n.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors group">
                        <span className="text-3xl">{MOOD_EMOJIS[mood - 1]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{n.fieldValues['/text'] as string}</p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                            <span>🌙 {n.fieldValues['/attributes/@wslep']}s</span>
                            <span>💧 {n.fieldValues['/attributes/@wwatr']}b</span>
                            <span>⚡ {n.fieldValues['/attributes/@wenrg']}/10</span>
                          </div>
                          {n.fieldValues['/attributes/@wnote'] && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                              {n.fieldValues['/attributes/@wnote'] as string}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEditMood(n)} className="p-1.5 rounded-lg hover:bg-muted" title="Düzenle">
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDeleteMood(n.id, n.fieldValues['/text'] as string)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20" title="Sil">
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold">{mood}</span>
                            <span className="text-xs text-muted-foreground">/10</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
