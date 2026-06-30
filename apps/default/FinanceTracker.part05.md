                        <span>₺{goal.target.toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> Aylık Projeksiyon
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Tahmini Gelir', value: stats.gelir, color: 'text-green-700', bg: 'bg-green-50 dark:bg-green-900/10' },
                  { label: 'Tahmini Gider', value: stats.gider, color: 'text-red-700', bg: 'bg-red-50 dark:bg-red-900/10' },
                  { label: 'Tahmini Net', value: stats.net, color: stats.net >= 0 ? 'text-blue-700' : 'text-red-700', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                ].map(s => (
                  <div key={s.label} className={cn('text-center rounded-xl p-3', s.bg)}>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className={cn('text-lg font-bold tabular-nums', s.color)}>₺{Math.round(s.value).toLocaleString('tr-TR')}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ ADD TRANSACTION MODAL ═══ */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Yeni İşlem</h3>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input autoFocus value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Açıklama..." className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Tutar (₺)</label>
                    <input type="number" value={addForm.amount} onChange={e => setAddForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0" className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Tür</label>
                    <select value={addForm.type} onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border">
                      <option value="expense">🔴 Gider</option>
                      <option value="income">💚 Gelir</option>
                      <option value="transfer">🔄 Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Kategori</label>
                    <input value={addForm.category} onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}
                      placeholder="yemek, ulaşım..." className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Tarih</label>
                    <input type="date" value={addForm.date} onChange={e => setAddForm(p => ({ ...p, date: e.target.value }))}
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button disabled={addSaving} onClick={async () => {
                    if (!addForm.description.trim() || !addForm.amount) { toast.error('Açıklama ve tutar gerekli'); return; }
                    setAddSaving(true);
                    try {
                      const amt = Number(addForm.amount);
                      await mihenkAPI.createFinanceRecord({
                        amount: addForm.type === 'expense' ? -Math.abs(amt) : Math.abs(amt),
                        type: addForm.type,
                        category: addForm.category || 'other',
                        description: addForm.description,
                        date: addForm.date,
                      });
                      setShowAdd(false);
                      setAddForm({ description: '', amount: '', type: 'expense', category: 'other', date: new Date().toISOString().slice(0, 10) });
                      refetch();
                      toast.success('✅ İşlem eklendi!');
                    } catch (e: unknown) {
                      toast.error(`❌ Eklenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
                    } finally { setAddSaving(false); }
                  }}
                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> {addSaving ? 'Kaydediliyor...' : 'İşlem Ekle'}
                  </button>
                  <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ AI ANALİZ MODAL ═══ */}
      <AnimatePresence>
        {showAiAnaliz && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAiAnaliz(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg mx-4 shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg flex items-center gap-2"><Bot className="w-5 h-5 text-purple-500" /> AI Finansal Analiz</h3>
                <button onClick={() => setShowAiAnaliz(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold">Finansal Durum Analizi</span>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-start gap-2">
                      <span className={stats.net >= 0 ? 'text-green-500 mt-0.5' : 'text-red-500 mt-0.5'}>
                        {stats.net >= 0 ? '✓' : '⚠'}
                      </span>
                      <p>Net akışınız <strong>{stats.net >= 0 ? 'pozitif' : 'negatif'}</strong> — {stats.net >= 0 ? 'bütçenizi iyi yönetiyorsunuz.' : 'giderleri azaltmanız öneriliyor.'}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">ℹ</span>
                      <p>Tasarruf oranınız <strong>%{stats.savingsRate}</strong> — {stats.savingsRate >= 20 ? 'hedef aralığında.' : 'ideal hedef %20 üzeri.'}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">⚡</span>
                      <p>Toplam <strong>{stats.totalTx} işlem</strong> MİHENK'ten çekildi.</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Risk Seviyesi', value: stats.savingsRate < 10 ? 'Yüksek' : stats.savingsRate < 20 ? 'Orta' : 'Düşük', color: stats.savingsRate < 10 ? 'text-red-500' : stats.savingsRate < 20 ? 'text-amber-500' : 'text-green-500' },
                    { label: 'Bütçe Skoru', value: `${Math.min(100, Math.max(0, stats.savingsRate * 3))}`, color: 'text-blue-500' },
                    { label: 'Öneri', value: stats.net >= 0 ? 'Yatırım' : 'Tasarruf', color: 'text-purple-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-muted/50 rounded-xl p-3 text-center">
                      <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Detailed insights */}
