import { useState, useMemo, useCallback } from 'react';
import { mihenkAPI, useMihenkData, ensureArray } from '@/lib/mihenk-data';
import type { HayatFinanceRecord } from '@/lib/mihenk-data';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Plus,
  ArrowUpRight, ArrowDownRight, X, CreditCard, Trash2,
  Target, BarChart3, Receipt, AlertTriangle, Sparkles, Bot,
  PenLine, Check, Download
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Constants ─── */

const CAT_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  yemek: { label: 'Yemek', emoji: '🍔', color: '#F97316' },
  ulaşım: { label: 'Ulaşım', emoji: '🚗', color: '#3B82F6' },
  kira: { label: 'Kira', emoji: '🏠', color: '#8B5CF6' },
  fatura: { label: 'Fatura', emoji: '💡', color: '#EAB308' },
  sağlık: { label: 'Sağlık', emoji: '🏥', color: '#EC4899' },
  eğlence: { label: 'Eğlence', emoji: '🎬', color: '#06B6D4' },
  maaş: { label: 'Maaş', emoji: '💰', color: '#10B981' },
  freelance: { label: 'Freelance', emoji: '💻', color: '#14B8A6' },
  youtube: { label: 'YouTube', emoji: '📺', color: '#EF4444' },
  müzik: { label: 'Müzik', emoji: '🎵', color: '#A855F7' },
  alışveriş: { label: 'Alışveriş', emoji: '🛒', color: '#F59E0B' },
  eğitim: { label: 'Eğitim', emoji: '📚', color: '#6366F1' },
  abonelik: { label: 'Abonelik', emoji: '📦', color: '#0EA5E9' },
  tasarruf: { label: 'Tasarruf', emoji: '🏦', color: '#22C55E' },
  diğer: { label: 'Diğer', emoji: '📌', color: '#6B7280' },
  other: { label: 'Diğer', emoji: '📌', color: '#6B7280' },
  food: { label: 'Yemek', emoji: '🍔', color: '#F97316' },
  transport: { label: 'Ulaşım', emoji: '🚗', color: '#3B82F6' },
  rent: { label: 'Kira', emoji: '🏠', color: '#8B5CF6' },
  entertainment: { label: 'Eğlence', emoji: '🎬', color: '#06B6D4' },
  salary: { label: 'Maaş', emoji: '💰', color: '#10B981' },
  health: { label: 'Sağlık', emoji: '🏥', color: '#EC4899' },
  shopping: { label: 'Alışveriş', emoji: '🛒', color: '#F59E0B' },
  education: { label: 'Eğitim', emoji: '📚', color: '#6366F1' },
  subscription: { label: 'Abonelik', emoji: '📦', color: '#0EA5E9' },
  music: { label: 'Müzik', emoji: '🎵', color: '#A855F7' },
};

const PIE_COLORS = ['#F97316', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#EC4899', '#06B6D4', '#EAB308', '#14B8A6', '#6366F1'];

const TR_COLORS = ['#10B981', '#EF4444', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#F97316'];

function getCat(category: string) {
  const lower = (category || '').toLowerCase();
  return CAT_MAP[lower] || { label: category || 'Diğer', emoji: '📌', color: '#6B7280' };
}

function getCurSymbol(currency: string) {
  const c = (currency || '').toLowerCase();
  if (c === 'usd') return '$';
  if (c === 'eur') return '€';
  return '₺';
}

type TabId = 'overview' | 'transactions' | 'wallets' | 'budget';

/* ─── Main Component ─── */

export default function FinanceTracker() {
  const { data: rawRecords, loading, refetch } = useMihenkData(mihenkAPI.getFinanceRecords, []);
  const { data: rawAccounts } = useMihenkData(mihenkAPI.getFinanceAccounts, []);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showAdd, setShowAdd] = useState(false);
  const [showAiAnaliz, setShowAiAnaliz] = useState(false);
  const [txFilter, setTxFilter] = useState<string>('all');
  const [addForm, setAddForm] = useState({ description: '', amount: '', type: 'expense', category: 'other', date: new Date().toISOString().slice(0, 10) });
  const [addSaving, setAddSaving] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);

  const records = ensureArray(rawRecords);
  const accounts = ensureArray(rawAccounts);

  // Duplicate detection
  const duplicates = useMemo(() => {
    const seen = new Map<string, HayatFinanceRecord[]>();
    records.forEach(r => {
      const key = `${r.date || ''}|${r.description?.toLowerCase().trim()}|${r.amount}|${r.type}`;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key)!.push(r);
    });
    const dups: HayatFinanceRecord[][] = [];
    seen.forEach(v => { if (v.length > 1) dups.push(v); });
    return dups;
  }, [records]);

  const stats = useMemo(() => {
    const gelir = records.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
    const gider = records.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0);
    const net = gelir - gider;
    const savingsRate = gelir > 0 ? Math.round((net / gelir) * 100) : 0;
    return { gelir, gider, net, savingsRate, totalTx: records.length };
  }, [records]);

  const catBreakdown = useMemo(() => {
    return records
      .filter(r => r.type === 'expense')
      .reduce((acc, r) => {
        const cat = r.category || 'other';
        acc[cat] = (acc[cat] || 0) + Number(r.amount || 0);
        return acc;
      }, {} as Record<string, number>);
  }, [records]);

  const pieData = useMemo(() => {
    return Object.entries(catBreakdown)
      .map(([k, v]) => {
        const info = getCat(k);
        return { name: info.label, emoji: info.emoji, value: v, color: info.color };
      })
      .sort((a, b) => b.value - a.value);
  }, [catBreakdown]);

  const filteredTx = useMemo(() => {
    if (txFilter === 'all') return records;
    const typeMap: Record<string, string> = { 'ft-gelir': 'income', 'ft-gider': 'expense', 'ft-trans': 'transfer' };
    return records.filter(r => r.type === typeMap[txFilter]);
  }, [records, txFilter]);

  const cashFlowData = useMemo(() => {
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const monthlyMap: Record<string, { gelir: number; gider: number }> = {};

    records.forEach(r => {
      const d = r.date || r.created_at || '';
      const monthKey = d.slice(0, 7); // YYYY-MM
      if (!monthKey) return;
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { gelir: 0, gider: 0 };
      const amt = Number(r.amount || 0);
      if (r.type === 'income') monthlyMap[monthKey].gelir += amt;
      else if (r.type === 'expense') monthlyMap[monthKey].gider += amt;
    });

    const sortedMonths = Object.keys(monthlyMap).sort();
    const lastMonths = sortedMonths.slice(-12);

    if (lastMonths.length === 0) {
      return [{ name: 'Toplam', gelir: stats.gelir, gider: stats.gider }];
    }

    return lastMonths.map(key => {
      const monthIdx = parseInt(key.split('-')[1], 10) - 1;
      return {
        name: monthNames[monthIdx] || key,
        gelir: Math.round(monthlyMap[key].gelir),
        gider: Math.round(monthlyMap[key].gider),
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


