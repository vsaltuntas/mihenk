            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Motivasyon Quote */}
            <div className="text-center py-2">
              <p className="text-sm italic text-muted-foreground">"{quote.text}"</p>
              <p className="text-xs text-muted-foreground/60 mt-1">— {quote.author}</p>
            </div>

            {/* Timer Card */}
            <div className={cn(
              'relative rounded-2xl border border-border overflow-hidden',
              'bg-gradient-to-br', TIMER_PRESETS[activePreset].color
            )}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative z-10 p-8 text-center text-white">
                {/* Preset Label */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {(() => {
                    const Icon = TIMER_PRESETS[activePreset].icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    {TIMER_PRESETS[activePreset].label}
                  </span>
                </div>

                {/* Circular Progress Ring */}
                <div className="relative w-56 h-56 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                    <circle
                      cx="100" cy="100" r="90" fill="none"
                      stroke="white" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 90}
                      strokeDashoffset={2 * Math.PI * 90 * (1 - timer.progress)}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-mono font-bold tracking-tight tabular-nums">
                      {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
                    </span>
                    {timer.isRunning && (
                      <span className="text-xs mt-2 opacity-70 animate-pulse">Odaklan...</span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => timer.reset()}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={timer.toggle}
                    className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                  >
                    {timer.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => {
                      const next = (activePreset + 1) % TIMER_PRESETS.length;
                      setActivePreset(next);
                      timer.reset(TIMER_PRESETS[next].minutes);
                    }}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <Coffee className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {TIMER_PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => { setActivePreset(i); timer.reset(p.minutes); }}
                  className={cn(
                    'py-2.5 rounded-xl text-xs font-medium transition-all border',
                    activePreset === i
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <p.icon className="w-4 h-4" />
                    <span>{p.label}</span>
                    <span className="text-[10px] opacity-60">{p.minutes}dk</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Smile, label: 'Mood Ort.', value: averages.mood, color: 'text-amber-500', suffix: '/10' },
                { icon: Zap, label: 'Enerji Ort.', value: averages.energy, color: 'text-yellow-500', suffix: '/10' },
                { icon: Moon, label: 'Uyku Ort.', value: averages.sleep, color: 'text-indigo-500', suffix: 's' },
                { icon: Flame, label: 'Check-in', value: averages.count, color: 'text-rose-500', suffix: '' },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
                  <s.icon className={cn('w-4 h-4 mx-auto mb-1', s.color)} />
                  <p className="text-lg font-bold">{s.value}<span className="text-xs text-muted-foreground">{s.suffix}</span></p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════ CHECK-IN TAB ═══════════ */}
        {activeTab === 'checkin' && (
          <motion.div
            key="checkin"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Günlük Check-in</h3>
                  <p className="text-sm text-muted-foreground">{today}</p>
                </div>
                <div className="text-5xl transition-all duration-300">{MOOD_EMOJIS[form.mood - 1]}</div>
              </div>

              {/* Mood Slider */}
              <div className="space-y-5">
                {[
                  { key: 'mood' as const, icon: Smile, label: 'Mood', color: 'text-amber-500', max: 10 },
                  { key: 'energy' as const, icon: Zap, label: 'Enerji', color: 'text-yellow-500', max: 10 },
                  { key: 'sleep' as const, icon: Moon, label: 'Uyku (saat)', color: 'text-indigo-500', max: 12 },
                  { key: 'water' as const, icon: Droplets, label: 'Su (bardak)', color: 'text-blue-500', max: 15 },
                ].map(s => (
                  <div key={s.key} className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className={cn('w-4 h-4', s.color)} />
                      <span className="text-sm font-medium">{s.label}</span>
                      <span className="ml-auto text-lg font-bold tabular-nums">{form[s.key]}</span>
                    </div>
                    <input
                      type="range" min={1} max={s.max} value={form[s.key]}
                      onChange={e => setForm(p => ({ ...p, [s.key]: Number(e.target.value) }))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
