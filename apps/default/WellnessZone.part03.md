        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ═══════════ WELLNESS CENTER TAB ═══════════ */}
        {activeTab === 'wellness' && (
          <motion.div key="wellness" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-5">
            {/* Bugünkü Skor */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Bugünkü Wellness Skoru</p>
                  <p className="text-5xl font-bold mt-1 text-emerald-600">%{dailyScore}</p>
                  <p className="text-sm text-muted-foreground mt-1">{today}</p>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#10B981" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - dailyScore / 100)}
                      className="transition-all duration-700" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="w-7 h-7 text-emerald-500" />
                  </div>
                </div>
              </div>
              {/* AI Wellness Koçu */}
              <div className="mt-4 p-3 bg-white/10 dark:bg-black/20 rounded-xl">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">🤖 AI WELLNESS KOÇU</p>
                <p className="text-xs text-muted-foreground">
                  {dailyScore === 0 && 'Güne henüz başlamadın. Takviye ve alışkanlıklarını tamamlayarak skoru yükselt!'}
                  {dailyScore > 0 && dailyScore < 30 && 'İyi başlangıç! Su içmeyi ve alışkanlıklarını tamamlamayı unutma.'}
                  {dailyScore >= 30 && dailyScore < 60 && 'Yolun ortasındasın, devam et! Biraz daha ve harika bir gün olacak.'}
                  {dailyScore >= 60 && dailyScore < 90 && 'Mükemmel ilerliyorsun! Bugünü güçlü bitir.'}
                  {dailyScore >= 90 && 'Harika! Bugün wellness hedeflerini neredeyse tamamen tamamladın. 🎉'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Takviyeler */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">💊 Takviyeler
                    <span className="text-xs text-muted-foreground font-normal">
                      {supplements.filter(s => s.done).length}/{supplements.length}
                    </span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {supplements.map(s => (
                    <button key={s.id} onClick={() => setSupplements(p => p.map(x => x.id === s.id ? { ...x, done: !x.done } : x))}
                      className={cn('w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border text-left',
                        s.done ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-muted/50 border-border hover:bg-muted')}>
                      <span className="text-lg">{s.emoji}</span>
                      <div className="flex-1">
                        <p className={cn('text-sm font-medium', s.done && 'line-through opacity-50')}>{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.dose}</p>
                      </div>
                      {s.done && <span className="text-green-500 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input value={newSupplement.name} onChange={e => setNewSupplement(p => ({ ...p, name: e.target.value }))}
                      placeholder="Takviye adı" className="flex-1 bg-muted rounded-lg px-2.5 py-2 text-xs outline-none border border-border" />
                    <input value={newSupplement.dose} onChange={e => setNewSupplement(p => ({ ...p, dose: e.target.value }))}
                      placeholder="Doz" className="w-20 bg-muted rounded-lg px-2.5 py-2 text-xs outline-none border border-border" />
                    <button onClick={() => {
                      if (!newSupplement.name.trim()) return;
                      setSupplements(p => [...p, { id: Date.now(), name: newSupplement.name, dose: newSupplement.dose || '-', done: false, emoji: '💊' }]);
                      setNewSupplement({ name: '', dose: '' });
                    }} className="bg-primary text-primary-foreground px-2.5 py-2 rounded-lg text-xs font-medium">+</button>
                  </div>
                </div>
              </div>

              {/* Alışkanlıklar */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">🔥 Alışkanlıklar
                    <span className="text-xs text-muted-foreground font-normal">
                      {habits.filter(h => h.done).length}/{habits.length}
                    </span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {habits.map(h => (
                    <button key={h.id} onClick={() => setHabits(p => p.map(x => x.id === h.id ? { ...x, done: !x.done } : x))}
                      className={cn('w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border text-left',
                        h.done ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-muted/50 border-border hover:bg-muted')}>
                      <span className="text-lg">{h.emoji}</span>
                      <div className="flex-1">
                        <p className={cn('text-sm font-medium', h.done && 'line-through opacity-50')}>{h.name}</p>
                        <p className="text-[10px] text-amber-600">🔥 {h.streak} gün streak</p>
                      </div>
                      {h.done && <span className="text-amber-500 text-xs font-bold">✓</span>}
                    </button>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newHabit.trim()) {
                          setHabits(p => [...p, { id: Date.now(), name: newHabit, done: false, emoji: '⚡', streak: 0 }]);
                          setNewHabit('');
                        }
                      }}
                      placeholder="Yeni alışkanlık... (Enter)" className="flex-1 bg-muted rounded-lg px-2.5 py-2 text-xs outline-none border border-border" />
                  </div>
                </div>
              </div>
            </div>

            {/* Su Tüketimi */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  💧 Su Tüketimi
                  <span className="text-xs text-muted-foreground font-normal">{waterCount}/{WATER_GOAL} bardak</span>
                </h3>
                <div className="text-xs font-bold text-blue-500">%{Math.round((waterCount / WATER_GOAL) * 100)}</div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-muted rounded-full h-3">
                  <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-300"
                    style={{ width: `${Math.min((waterCount / WATER_GOAL) * 100, 100)}%` }} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setWaterCount(c => Math.max(0, c - 1))}
                    className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-sm flex items-center justify-center font-bold">-</button>
                  <button onClick={() => setWaterCount(c => Math.min(WATER_GOAL + 5, c + 1))}
                    className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm flex items-center justify-center font-bold">+</button>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {Array.from({ length: WATER_GOAL }, (_, i) => (
                  <button key={i} onClick={() => setWaterCount(i + 1)}
                    className={cn('aspect-square rounded-lg text-lg transition-all hover:scale-110 flex items-center justify-center',
                      i < waterCount ? 'opacity-100' : 'opacity-20')}>
                    💧
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ FOCUS TAB ═══════════ */}
        {activeTab === 'focus' && (
          <motion.div
            key="focus"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
