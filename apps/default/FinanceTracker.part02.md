      };
    });
  }, [records, stats]);

  // Wallet trend data (last 6 months per wallet)
  const walletTrendData = useMemo(() => {
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const walletMonthlyMap: Record<string, Record<string, number>> = {};

    records.forEach(r => {
      const wallet = r.wallet || 'Diğer';
      const d = r.date || r.created_at || '';
      const monthKey = d.slice(0, 7);
      if (!monthKey) return;
      if (!walletMonthlyMap[wallet]) walletMonthlyMap[wallet] = {};
      const amt = r.type === 'income' ? Number(r.amount || 0) : -Number(r.amount || 0);
      walletMonthlyMap[wallet][monthKey] = (walletMonthlyMap[wallet][monthKey] || 0) + amt;
    });

    const sortedMonths = Array.from(new Set(records.map(r => (r.date || r.created_at || '').slice(0, 7)).filter(Boolean))).sort().slice(-6);
    if (sortedMonths.length === 0) return [];

    return Object.entries(walletMonthlyMap).map(([wallet, months]) => ({
      wallet,
      data: sortedMonths.map(key => ({
        name: monthNames[parseInt(key.split('-')[1], 10) - 1] || key,
        value: Math.round(months[key] || 0),
      })),
    }));
  }, [records]);

  // Category monthly trend for stacked bar
  const categoryMonthlyData = useMemo(() => {
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const catMonthlyMap: Record<string, Record<string, number>> = {};

    records.filter(r => r.type === 'expense').forEach(r => {
      const cat = r.category || 'other';
      const d = r.date || r.created_at || '';
      const monthKey = d.slice(0, 7);
      if (!monthKey) return;
      if (!catMonthlyMap[cat]) catMonthlyMap[cat] = {};
      catMonthlyMap[cat][monthKey] = (catMonthlyMap[cat][monthKey] || 0) + Number(r.amount || 0);
    });

    const sortedMonths = Array.from(new Set(
      records.filter(r => r.type === 'expense').map(r => (r.date || r.created_at || '').slice(0, 7)).filter(Boolean)
    )).sort().slice(-6);
    if (sortedMonths.length === 0) return [];

    return Object.entries(catMonthlyMap).map(([cat, months]) => {
      const info = getCat(cat);
      return {
        category: info.label,
        emoji: info.emoji,
        color: info.color,
        data: sortedMonths.map(key => ({
          name: monthNames[parseInt(key.split('-')[1], 10) - 1] || key,
          value: Math.round(months[key] || 0),
        })),
      };
    }).sort((a, b) => b.data.reduce((s, d) => s + d.value, 0) - a.data.reduce((s, d) => s + d.value, 0));
  }, [records]);

  if (loading) {
    return (
      <div className="module-transition space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
        <div className="h-[300px] shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="module-transition space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Finans</h2>
            {duplicates.length > 0 && (
              <button onClick={() => setShowDuplicates(true)}
                className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors border border-amber-300/50">
                <AlertTriangle className="w-3 h-3" /> {duplicates.length} olası kopya
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">MİHENK'ten gerçek zamanlı veri</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const csv = ['Tarih,Tür,Kategori,Açıklama,Tutar,Para Birimi,Cüzdan']
              .concat(records.map(r => [
                r.date || r.created_at?.slice(0,10) || '',
                r.type === 'income' ? 'Gelir' : r.type === 'expense' ? 'Gider' : 'Transfer',
                r.category || '',
                `"${r.description.replace(/"/g, '""')}"`,
                r.amount || 0,
                r.currency || '',
                r.wallet || '',
              ].join(',')))
              .join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finans-${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('CSV indirildi');
          }}
            className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors border border-border">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> İşlem Ekle
          </button>
          <button onClick={() => setShowAiAnaliz(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            <Sparkles className="w-4 h-4" /> AI Analiz
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
        {([
          { id: 'overview' as TabId, label: 'Genel Özet', icon: BarChart3 },
          { id: 'transactions' as TabId, label: 'Hareketler', icon: Receipt },
          { id: 'wallets' as TabId, label: 'Cüzdanlar', icon: CreditCard },
          { id: 'budget' as TabId, label: 'Bütçe & Hedef', icon: Target },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center',
              activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}>
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Net Akış', value: stats.net, icon: stats.net >= 0 ? TrendingUp : TrendingDown, color: stats.net >= 0 ? 'text-green-600' : 'text-red-600', prefix: '₺' },
                { label: 'Toplam Gelir', value: stats.gelir, icon: ArrowUpRight, color: 'text-green-600', prefix: '₺' },
