                    />
                  </div>
                ))}
              </div>

              {/* Habits */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Bugün tamamlanan alışkanlıklar
                </label>
                <input
                  value={form.habits}
                  onChange={e => setForm(p => ({ ...p, habits: e.target.value }))}
                  placeholder="Spor, meditasyon, okuma..."
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border"
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Günlük not
                </label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="Bugün nasıl hissediyorsun? ✍️"
                  className="w-full bg-muted rounded-xl p-3 text-sm outline-none resize-none h-20 border border-border"
                />
              </div>

              <button
                onClick={handleCheckin}
                className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Check-in Yap (+25 XP)
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════ HISTORY TAB ═══════════ */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Mood/Energy Trend Chart */}
            {moodTrendData.length > 1 && (
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <h3 className="font-semibold text-sm">Son Check-in Trendi</h3>
                  <div className="flex-1" />
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Mood</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Enerji</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Uyku</span>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="mood" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="Mood" />
                      <Line type="monotone" dataKey="enerji" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Enerji" />
                      <Line type="monotone" dataKey="uyku" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Uyku" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 30-Day Mood Heatmap */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">30 Günlük Mood Haritası</h3>
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {heatmapData.map((d, i) => (
                  <div key={i} className="group relative">
                    <div
                      className={cn(
                        'w-full aspect-square rounded-md transition-transform hover:scale-110 cursor-pointer',
                        d.mood > 0 ? HEATMAP_COLORS[d.mood] : 'bg-muted'
                      )}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover border border-border rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      <p className="font-medium">{d.date} ({d.label})</p>
                      {d.mood > 0 ? (
                        <p>{MOOD_EMOJIS[d.mood - 1]} Mood: {d.mood}/10</p>
                      ) : (
                        <p className="text-muted-foreground">Check-in yok</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-muted-foreground">Düşük</span>
                {[1, 3, 5, 7, 9].map(v => (
                  <div key={v} className={cn('w-3 h-3 rounded-sm', HEATMAP_COLORS[v])} />
                ))}
                <span className="text-[10px] text-muted-foreground">Yüksek</span>
              </div>
            </div>

            {/* Check-in List */}
            <div className="bg-card rounded-2xl border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">Geçmiş Check-in'ler</h3>
                <span className="text-xs text-muted-foreground">{nodes.filter(n => n.parentId === null).length} kayıt</span>
              </div>
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {nodes.filter(n => n.parentId === null).length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground text-sm">Henüz check-in yok. Bugün ilkini yap! 🌟</p>
                ) : (
                  nodes.filter(n => n.parentId === null).map(n => {
                    const mood = Number(n.fieldValues['/attributes/@wmood']) || 5;
                    const isEditing = editingMoodId === n.id;

                    if (isEditing) {
                      return (
                        <div key={n.id} className="p-4 space-y-3 bg-muted/30 border-l-2 border-primary">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground">Mood ({editMoodForm.mood}/10)</label>
                              <input type="range" min={1} max={10} value={editMoodForm.mood} onChange={e => setEditMoodForm(p => ({ ...p, mood: +e.target.value }))} className="w-full" />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground">Enerji ({editMoodForm.energy}/10)</label>
                              <input type="range" min={1} max={10} value={editMoodForm.energy} onChange={e => setEditMoodForm(p => ({ ...p, energy: +e.target.value }))} className="w-full" />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground">Uyku ({editMoodForm.sleep}s)</label>
                              <input type="range" min={0} max={12} step={0.5} value={editMoodForm.sleep} onChange={e => setEditMoodForm(p => ({ ...p, sleep: +e.target.value }))} className="w-full" />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-muted-foreground">Su ({editMoodForm.water}b)</label>
                              <input type="range" min={0} max={15} value={editMoodForm.water} onChange={e => setEditMoodForm(p => ({ ...p, water: +e.target.value }))} className="w-full" />
                            </div>
                          </div>
                          <input value={editMoodForm.note} onChange={e => setEditMoodForm(p => ({ ...p, note: e.target.value }))} placeholder="Not..." className="w-full bg-background rounded-lg px-3 py-2 text-xs outline-none border border-border" />
                          <div className="flex gap-2">
