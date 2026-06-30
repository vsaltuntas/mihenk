                { label: 'Toplam Gider', value: stats.gider, icon: ArrowDownRight, color: 'text-red-600', prefix: '₺' },
                { label: 'Tasarruf Oranı', value: stats.savingsRate, icon: PiggyBank, color: stats.savingsRate >= 0 ? 'text-blue-600' : 'text-red-600', prefix: '%' },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <s.icon className={cn('w-4 h-4', s.color)} />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <p className={cn('text-xl font-bold tabular-nums', s.color)}>
                    {s.prefix === '₺' ? `₺${Math.round(s.value).toLocaleString('tr-TR')}` : `%${s.value}`}
                  </p>
                </div>
              ))}
            </div>

            {/* Cash Flow Chart */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-4">Nakit Akışı</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip />
                    <Area type="monotone" dataKey="gelir" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="gider" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Pie Chart */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-sm mb-4">Gider Dağılımı</h3>
                {pieData.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">Gider kaydı bulunamadı</p>
                ) : (
                  <>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                            {pieData.map((d, i) => <Cell key={i} fill={d.color || PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => `₺${Math.round(v).toLocaleString('tr-TR')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pieData.slice(0, 6).map((d, i) => (
                        <span key={d.name} className="text-[10px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color || PIE_COLORS[i % PIE_COLORS.length] }} />
                          {d.emoji} {d.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Top Expenses */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-sm mb-4">En Büyük Giderler</h3>
                <div className="space-y-3">
                  {records
                    .filter(r => r.type === 'expense')
                    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
                    .slice(0, 5)
                    .map(r => {
                      const cat = getCat(r.category);
                      const amt = Number(r.amount || 0);
                      const curSym = getCurSymbol(r.currency);
                      const pct = stats.gider > 0 ? Math.round((amt / stats.gider) * 100) : 0;
                      return (
                        <div key={r.id} className="flex items-center gap-3">
                          <span className="text-lg">{cat.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{r.description}</p>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                              <div className="h-1.5 rounded-full bg-red-400 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-red-600 tabular-nums">{curSym}{Math.round(amt).toLocaleString('tr-TR')}</span>
                        </div>
                      );
                    })}
                  {records.filter(r => r.type === 'expense').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Gider kaydı yok</p>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Net Trend (Last 6 months) */}
            {walletTrendData.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-sm mb-4">Cüzdan Net Trend (6 Ay)</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={walletTrendData[0]?.data || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <Tooltip />
                      {walletTrendData.slice(0, 4).map((w, i) => (
                        <Area
                          key={w.wallet}
                          type="monotone"
                          dataKey="value"
                          data={w.data}
                          stroke={TR_COLORS[i % TR_COLORS.length]}
                          fill={TR_COLORS[i % TR_COLORS.length]}
                          fillOpacity={0.1}
                          strokeWidth={2}
                          name={w.wallet}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {walletTrendData.slice(0, 4).map((w, i) => (
                    <span key={w.wallet} className="text-[10px] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TR_COLORS[i % TR_COLORS.length] }} />
                      {w.wallet}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category Monthly Stacked Trend */}
            {categoryMonthlyData.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-sm mb-4">Kategori Aylık Trend (Gider)</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={categoryMonthlyData[0]?.data || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <Tooltip />
                      {categoryMonthlyData.slice(0, 5).map((c, i) => (
                        <Area
                          key={c.category}
                          type="monotone"
                          dataKey="value"
                          data={c.data}
                          stroke={c.color}
                          fill={c.color}
                          fillOpacity={0.15}
                          strokeWidth={2}
                          name={`${c.emoji} ${c.category}`}
