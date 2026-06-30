                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Derinlemesine Analiz</h4>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const insights: string[] = [];
                      if (stats.savingsRate < 10) insights.push('🔴 Tasarruf oranı kritik seviyede. Acil gider kontrolü gerekli.');
                      else if (stats.savingsRate < 20) insights.push('🟡 Tasarruf oranı hedefin altına düştü. Displineğerli harcama planı önerilir.');
                      else insights.push('🟢 Tasarruf oranı sağlıklı. Yatırım fırsatlarını değerlendirebilirsiniz.');

                      const topCat = Object.entries(catBreakdown).sort((a,b) => b[1] - a[1])[0];
                      if (topCat) insights.push(`💡 En büyük gider kalemi: <strong>${getCat(topCat[0]).label}</strong> (₺${Math.round(topCat[1]).toLocaleString('tr-TR')}). Buradan optimizasyon düşünün.`);

                      const walletCount = new Set(records.map(r => r.wallet)).size;
                      if (walletCount === 1) insights.push('💳 Tek cüzdan kullanılıyor. Kaynakları dağıtarak risk yönetimi yapın.');

                      const usdTx = records.filter(r => r.currency === 'USD').length;
                      if (usdTx > 0) insights.push(`💵 ${usdTx} işlem USD. Kur riski için TL karşılığını takip edin.`);

                      return insights;
                    })().map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-background rounded-lg border border-border/30">
                        <span className="text-primary mt-0.5">→</span>
                        <span dangerouslySetInnerHTML={{ __html: insight }} />
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => setShowAiAnaliz(false)}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90">
                  Anladım
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      {/* ═══ DUPLICATE MODAL ═══ */}
      {showDuplicates && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowDuplicates(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Olası Kopya Kayıtlar</h3>
              <button onClick={() => setShowDuplicates(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Aynı tarih, açıklama, tutar ve türe sahip <strong>{duplicates.length}</strong> grup bulundu. İnceleyip temizleyin.</p>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {duplicates.map((group, gi) => (
                <div key={gi} className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="font-medium text-sm mb-3 flex items-center gap-2">
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded text-[10px]">
                      Grup {gi + 1} — {group.length} kopya
                    </span>
                  </p>
                  <div className="space-y-2">
                    {group.map((r, ri) => (
                      <div key={r.id} className="flex items-center gap-2 p-2 bg-background rounded-lg border border-border/50 group">
                        <span className="text-xl shrink-0">{getCat(r.category).emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{r.description}</p>
                          <p className="text-[10px] text-muted-foreground">{getCat(r.category).label} • {r.wallet} • {r.date || r.created_at?.slice(0,10)}</p>
                        </div>
                        <span className={cn('font-bold text-sm tabular-nums', r.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                          {r.type === 'expense' ? '-' : '+'}{getCurSymbol(r.currency)}{Math.round(Number(r.amount || 0)).toLocaleString('tr-TR')}
                        </span>
                        {ri > 0 && (
                          <button onClick={async () => {
                            try { await mihenkAPI.deleteFinanceRecord(r.id); refetch(); toast.success('Kopya silindi'); }
                            catch { toast.error('Silinemedi'); }
                          }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                            title="Bu kopyayı sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowDuplicates(false)}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 mt-4">
              Kapat
            </button>
          </motion.div>
        </motion.div>
      )}

      </AnimatePresence>
    </div>
  );
}

/* ─── Editable Transaction Row ─── */
function TxRow({ r, refetch }: { r: HayatFinanceRecord; refetch: () => void }) {
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(r.description);
  const [amt, setAmt] = useState(String(r.amount || 0));
  const [saving, setSaving] = useState(false);
  const cat = getCat(r.category);
  const curSym = getCurSymbol(r.currency);
  const amount = Number(r.amount || 0);
  const isExpense = r.type === 'expense';
  const textColor = r.type === 'income' ? 'text-green-600' : r.type === 'expense' ? 'text-red-600' : 'text-blue-600';

  const handleSave = async () => {
    setSaving(true);
    try {
      await mihenkAPI.updateFinanceRecord(r.id, { description: desc, amount: Number(amt) });
      toast.success('Güncellendi'); setEditing(false); refetch();
    } catch { toast.error('Güncellenemedi'); }
    finally { setSaving(false); }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/30">
        <span className="text-xl shrink-0">{cat.emoji}</span>
        <input value={desc} onChange={e => setDesc(e.target.value)} className="flex-1 bg-background rounded-lg px-2 py-1.5 text-sm border border-border outline-none min-w-0" />
        <input value={amt} onChange={e => setAmt(e.target.value)} type="number" className="w-24 bg-background rounded-lg px-2 py-1.5 text-sm border border-border outline-none tabular-nums" />
        <button onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={() => { setEditing(false); setDesc(r.description); setAmt(String(r.amount || 0)); }} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
      <span className="text-2xl">{cat.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{r.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{cat.label}</span>
          <span className="text-[10px] text-muted-foreground">•</span>
          <span className="text-[10px] text-muted-foreground">{r.wallet}</span>
        </div>
      </div>
      <span className={cn('font-bold text-sm tabular-nums', textColor)}>
        {isExpense ? '-' : '+'}{curSym}{Math.round(amount).toLocaleString('tr-TR')}
      </span>
      <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-muted transition opacity-0 group-hover:opacity-100">
        <PenLine className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
      </button>
      <button onClick={async () => { try { await mihenkAPI.deleteFinanceRecord(r.id); refetch(); toast.success('Silindi'); } catch { toast.error('Silinemedi'); } }}
        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition opacity-0 group-hover:opacity-100">
        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
      </button>
    </div>
  );
}
