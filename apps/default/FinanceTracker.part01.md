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

  const records = ensureArray(rawRecords);
  const accounts = ensureArray(rawAccounts);

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
