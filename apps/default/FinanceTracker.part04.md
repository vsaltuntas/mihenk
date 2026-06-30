                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryMonthlyData.slice(0, 5).map((c, i) => (
                    <span key={c.category} className="text-[10px] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      {c.emoji} {c.category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ TRANSACTIONS ═══ */}
        {activeTab === 'transactions' && (
          <motion.div key="transactions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'ft-gelir', label: '💚 Gelir' },
                { id: 'ft-gider', label: '🔴 Gider' },
                { id: 'ft-trans', label: '🔄 Transfer' },
              ].map(f => (
                <button key={f.id} onClick={() => setTxFilter(f.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                    txFilter === f.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                  )}>
                  {f.label}
                </button>
              ))}
              <span className="text-xs text-muted-foreground ml-auto">{filteredTx.length} işlem</span>
            </div>

            <div className="bg-card rounded-2xl border border-border divide-y divide-border">
              {filteredTx.length === 0 ? (
                <p className="p-8 text-center text-muted-foreground text-sm">İşlem bulunamadı</p>
              ) : (
                filteredTx.map(r => <TxRow key={r.id} r={r} refetch={refetch} />)
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ WALLETS ═══ */}
        {activeTab === 'wallets' && (
          <motion.div key="wallets" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
            {(() => {
              const walletTotals = records.reduce((acc, r) => {
                const w = r.wallet || 'Diğer';
                if (!acc[w]) acc[w] = { income: 0, expense: 0 };
                if (r.type === 'income') acc[w].income += Number(r.amount || 0);
                else acc[w].expense += Number(r.amount || 0);
                return acc;
              }, {} as Record<string, { income: number; expense: number }>);
              const walletKeys = Object.keys(walletTotals);
              const hasWallets = walletKeys.length > 0;
              return hasWallets ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {walletKeys.map(w => {
                  const d = walletTotals[w]; const net = d.income - d.expense; const isPos = net >= 0;
                  return (
                    <div key={w} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-primary/10">🏦</div>
                        <div><h4 className="font-semibold text-sm">{w}</h4><p className="text-[10px] text-muted-foreground">İşlem bazlı özet</p></div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Gelir</span><span className="text-green-600 font-medium">₺{Math.round(d.income).toLocaleString('tr-TR')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Gider</span><span className="text-red-600 font-medium">₺{Math.round(d.expense).toLocaleString('tr-TR')}</span></div>
                        <div className="flex justify-between pt-1 border-t border-border"><span className="font-medium">Net</span><span className={cn('font-bold', isPos ? 'text-green-600' : 'text-red-600')}>₺{Math.round(net).toLocaleString('tr-TR')}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              ) : (
              <div className="text-center py-16">
                <CreditCard className="w-10 h-10 mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-muted-foreground text-sm">Cüzdan verisi bekliyor</p>
                <p className="text-[10px] text-muted-foreground mt-1">İşlem ekledikçe cüzdan özeti burada görünecek</p>
              </div>
              );
            })()}
          </motion.div>
        )}

        {/* ═══ BUDGET ═══ */}
        {activeTab === 'budget' && (
          <motion.div key="budget" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-5">
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Kategori Bütçe Durumu
              </h3>
              <div className="space-y-4">
                {Object.entries(catBreakdown).slice(0, 8).map(([cat, spent]) => {
                  const info = getCat(cat);
                  const budget = Math.round(spent * 1.3); // reference budget = 130% of actual
                  const pct = Math.min(Math.round((spent / budget) * 100), 100);
                  const isOver = spent > budget;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium flex items-center gap-1.5">
                          {info.emoji} {info.label}
                        </span>
                        <span className={cn('text-xs tabular-nums', isOver ? 'text-red-600 font-bold' : 'text-muted-foreground')}>
                          ₺{Math.round(spent).toLocaleString('tr-TR')} / ₺{budget.toLocaleString('tr-TR')}
                          {isOver && <AlertTriangle className="w-3 h-3 inline ml-1 text-red-500" />}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={cn('h-2 rounded-full transition-all duration-500', isOver ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-green-500')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(catBreakdown).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Gider verisi bulunamadı</p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <PiggyBank className="w-4 h-4 text-blue-500" /> Finansal Hedefler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Acil Durum Fonu', target: 150000, current: stats.net > 0 ? Math.min(stats.net * 2, 150000) : 0, emoji: '🛡️' },
                  { name: 'Yeni Ekipman', target: 50000, current: stats.net > 0 ? Math.min(stats.net * 0.8, 50000) : 0, emoji: '🎸' },
                  { name: 'Tatil Fonu', target: 30000, current: stats.net > 0 ? Math.min(stats.net * 0.4, 30000) : 0, emoji: '✈️' },
                  { name: 'Yatırım', target: 100000, current: stats.net > 0 ? Math.min(stats.net * 1.2, 100000) : 0, emoji: '📈' },
                ].map(goal => {
                  const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
                  return (
                    <div key={goal.name} className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{goal.emoji}</span>
                        <span className="text-sm font-medium">{goal.name}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                        <div className="h-2.5 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>₺{Math.round(goal.current).toLocaleString('tr-TR')}</span>
                        <span className="font-medium">%{pct}</span>
