import { useState, useMemo } from 'react';
import { mihenkAPI, useMihenkData } from '@/lib/mihenk-data';
import { Users, Plus, Mail, Phone, Building2, X, ChevronLeft, Search, ArrowRight, UserCheck, Network, Briefcase, Star, Pencil, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Constants ─── */

type CrmTab = 'all' | 'network' | 'team' | 'companies';

const TYPE_MAP: Record<string, { icon: string; label: string; cls: string; tab: CrmTab }> = {
  'ct-kisi': { icon: '👤', label: 'Kişi', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', tab: 'network' },
  'ct-ekip': { icon: '🤝', label: 'Ekip', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', tab: 'team' },
  'ct-sirket': { icon: '🏢', label: 'Şirket', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', tab: 'companies' },
  'ct-sanatci': { icon: '🎵', label: 'Sanatçı', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300', tab: 'network' },
  'ct-partner': { icon: '🤝', label: 'Partner', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', tab: 'network' },
};

const INTERACTION_MAP: Record<string, { label: string; cls: string }> = {
  'ic-aktif': { label: '🟢 Aktif', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  'ic-bekle': { label: '🟡 Beklemede', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'ic-takip': { label: '🔔 Takip Gerekli', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  'ic-pasif': { label: '⚫ Pasif', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const AVATAR_COLORS = [
  'from-purple-400 to-pink-500',
  'from-blue-400 to-cyan-500',
  'from-green-400 to-emerald-500',
  'from-amber-400 to-orange-500',
  'from-red-400 to-rose-500',
  'from-indigo-400 to-violet-500',
];

/* ─── Add Contact Modal ─── */

function AddContactModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', type: 'ct-kisi', email: '', phone: '', company: '', role: '', interaction: 'ic-aktif', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Ad Soyad gerekli'); return; }
    setSaving(true);
    try {
      await mihenkAPI.createContact({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        role: form.role || undefined,
        relationship_type: form.type === 'ct-ekip' ? 'team' : form.type === 'ct-sirket' ? 'company' : 'personal',
        notes: form.notes || undefined,
      });
      toast.success('✅ Kişi eklendi!');
      onCreated(); onClose();
    } catch (e: unknown) {
      toast.error(`❌ Kayıt başarısız: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}`);
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">Kişi / Kuruluş Ekle</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <input autoFocus value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Ad Soyad / Şirket Adı *"
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Tür</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border">
                {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Etkileşim</label>
              <select value={form.interaction} onChange={e => setForm(p => ({ ...p, interaction: e.target.value }))}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-xs outline-none border border-border">
                {Object.entries(INTERACTION_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="E-posta" type="email"
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="Telefon"
              className="bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
            <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
              placeholder="Şirket / Kurum"
              className="bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          </div>
          <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            placeholder="Rol / Ünvan"
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Notlar..." rows={2}
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border resize-none" />
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {saving ? 'Ekleniyor...' : '+ Kişi Ekle'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Contact Detail ─── */

function ContactDetail({ contact, onBack, onRefresh }: { contact: any; onBack: () => void; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [ef, setEf] = useState({ name: '', email: '', phone: '', company: '', role: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setEditing(true);
    setEf({
      name: contact.fieldValues['/text'] as string || '',
      email: contact.fieldValues['/attributes/@cemail'] as string || '',
      phone: contact.fieldValues['/attributes/@cphone'] as string || '',
      company: contact.fieldValues['/attributes/@ccomp'] as string || '',
      role: contact.fieldValues['/attributes/@crole'] as string || '',
      notes: contact.fieldValues['/attributes/@cnotes'] as string || '',
    });
  };

  const saveEdit = async () => {
    if (!ef.name.trim()) { toast.error('Ad gerekli'); return; }
    setSaving(true);
    try {
      await mihenkAPI.updateContact(contact.id, {
        name: ef.name, email: ef.email, phone: ef.phone,
        company: ef.company, role: ef.role, notes: ef.notes,
      });
      contact.fieldValues['/text'] = ef.name;
      contact.fieldValues['/attributes/@cemail'] = ef.email;
      contact.fieldValues['/attributes/@cphone'] = ef.phone;
      contact.fieldValues['/attributes/@ccomp'] = ef.company;
      contact.fieldValues['/attributes/@crole'] = ef.role;
      contact.fieldValues['/attributes/@cnotes'] = ef.notes;
      setEditing(false);
      onRefresh();
      toast.success('✅ Kişi güncellendi!');
    } catch (e: unknown) {
      toast.error(`❌ Güncellenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    const name = contact.fieldValues['/text'] as string;
    if (!confirm(`"${name}" kişisini silmek istediğinize emin misiniz?`)) return;
    try {
      await mihenkAPI.deleteContact(contact.id);
      toast.success('🗑️ Kişi silindi');
      onRefresh();
      onBack();
    } catch (e: unknown) {
      toast.error(`❌ Silinemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  };
  const typeInfo = TYPE_MAP[contact.fieldValues['/attributes/@ctype'] as string] || TYPE_MAP['ct-kisi'];
  const interaction = INTERACTION_MAP[contact.fieldValues['/attributes/@cinter'] as string];
  const colorIdx = contact.id.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Kişiler
        </button>
        <div className="flex items-center gap-2">
          <button onClick={startEdit} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Düzenle
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Sil
          </button>
        </div>
      </div>

      {editing && (
        <div className="bg-card rounded-2xl border-2 border-primary/30 p-5 space-y-3">
          <h4 className="text-sm font-semibold">Kişiyi Düzenle</h4>
          <input autoFocus value={ef.name} onChange={e => setEf(p => ({ ...p, name: e.target.value }))} placeholder="Ad Soyad *" className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          <div className="grid grid-cols-2 gap-3">
            <input value={ef.email} onChange={e => setEf(p => ({ ...p, email: e.target.value }))} placeholder="E-posta" className="bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
            <input value={ef.phone} onChange={e => setEf(p => ({ ...p, phone: e.target.value }))} placeholder="Telefon" className="bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={ef.company} onChange={e => setEf(p => ({ ...p, company: e.target.value }))} placeholder="Şirket" className="bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
            <input value={ef.role} onChange={e => setEf(p => ({ ...p, role: e.target.value }))} placeholder="Rol" className="bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border" />
          </div>
          <textarea value={ef.notes} onChange={e => setEf(p => ({ ...p, notes: e.target.value }))} placeholder="Notlar..." rows={2} className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border resize-none" />
          <div className="flex gap-2">
            <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-60">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 text-xs text-muted-foreground hover:bg-muted rounded-xl">İptal</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className={cn('w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-lg text-white font-bold', AVATAR_COLORS[colorIdx])}>
            {(contact.fieldValues['/text'] as string || '?')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{contact.fieldValues['/text'] as string}</h2>
            {contact.fieldValues['/attributes/@crole'] && (
              <p className="text-sm text-muted-foreground">{contact.fieldValues['/attributes/@crole'] as string}</p>
            )}
            {contact.fieldValues['/attributes/@ccomp'] && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" />{contact.fieldValues['/attributes/@ccomp'] as string}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', typeInfo.cls)}>{typeInfo.icon} {typeInfo.label}</span>
              {interaction && <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', interaction.cls)}>{interaction.label}</span>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {contact.fieldValues['/attributes/@cemail'] && (
            <a href={`mailto:${contact.fieldValues['/attributes/@cemail']}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm">{contact.fieldValues['/attributes/@cemail'] as string}</span>
            </a>
          )}
          {contact.fieldValues['/attributes/@cphone'] && (
            <a href={`tel:${contact.fieldValues['/attributes/@cphone']}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{contact.fieldValues['/attributes/@cphone'] as string}</span>
            </a>
          )}
          {contact.fieldValues['/attributes/@cnote'] && (
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notlar</p>
              <p className="text-sm">{contact.fieldValues['/attributes/@cnote'] as string}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Contact Card ─── */

function ContactCard({ contact, onClick }: { contact: any; onClick: () => void }) {
  const typeInfo = TYPE_MAP[contact.fieldValues['/attributes/@ctype'] as string] || TYPE_MAP['ct-kisi'];
  const interaction = INTERACTION_MAP[contact.fieldValues['/attributes/@cinter'] as string];
  const colorIdx = contact.id.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all cursor-pointer group">
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl text-white font-bold flex-shrink-0 shadow-md', AVATAR_COLORS[colorIdx])}>
          {(contact.fieldValues['/text'] as string || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm group-hover:text-primary transition-colors truncate">{contact.fieldValues['/text'] as string}</h4>
          {contact.fieldValues['/attributes/@crole'] && (
            <p className="text-[11px] text-muted-foreground truncate">{contact.fieldValues['/attributes/@crole'] as string}</p>
          )}
          {contact.fieldValues['/attributes/@ccomp'] && (
            <p className="text-[10px] text-muted-foreground/60 truncate flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5" />{contact.fieldValues['/attributes/@ccomp'] as string}
            </p>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary flex-shrink-0" />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full', typeInfo.cls)}>{typeInfo.icon} {typeInfo.label}</span>
        {interaction && <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full', interaction.cls)}>{interaction.label}</span>}
      </div>

      {(contact.fieldValues['/attributes/@cemail'] || contact.fieldValues['/attributes/@cphone']) && (
        <div className="mt-3 pt-2 border-t border-border/50 space-y-1">
          {contact.fieldValues['/attributes/@cemail'] && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />{contact.fieldValues['/attributes/@cemail'] as string}
            </p>
          )}
          {contact.fieldValues['/attributes/@cphone'] && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3 h-3 flex-shrink-0" />{contact.fieldValues['/attributes/@cphone'] as string}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Component ─── */

export default function CrmModule() {
  const { data: rawContacts, loading, refetch } = useMihenkData(mihenkAPI.getContacts, []);
  const [activeTab, setActiveTab] = useState<CrmTab>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [interactionFilter, setInteractionFilter] = useState<string>('all');

  // Map MİHENK contacts to the shape the UI expects
  const topLevel = useMemo(() => (rawContacts ?? []).map(c => ({
    id: c.id,
    parentId: null,
    completed: false,
    fieldValues: {
      '/text': c.name,
      '/attributes/@ctype': c.relationship_type === 'team' ? 'ct-ekip' : c.relationship_type === 'company' ? 'ct-sirket' : 'ct-kisi',
      '/attributes/@cemail': c.email || '',
      '/attributes/@cphone': c.phone || '',
      '/attributes/@ccomp': c.company || '',
      '/attributes/@crole': c.role || '',
      '/attributes/@cnotes': c.notes || '',
      '/attributes/@cinter': 'ic-aktif',
    }
  })), [rawContacts]);

  // Stats
  const stats = useMemo(() => ({
    total: topLevel.length,
    team: topLevel.filter(n => n.fieldValues['/attributes/@ctype'] === 'ct-ekip').length,
    network: topLevel.filter(n => ['ct-kisi', 'ct-sanatci', 'ct-partner'].includes(n.fieldValues['/attributes/@ctype'] as string)).length,
    followup: 0,
    companies: topLevel.filter(n => n.fieldValues['/attributes/@ctype'] === 'ct-sirket').length,
  }), [topLevel]);

  // Filtered
  const filteredContacts = useMemo(() => {
    let result = topLevel;

    // Tab filter
    if (activeTab === 'network') result = result.filter(n => ['ct-kisi', 'ct-sanatci', 'ct-partner'].includes(n.fieldValues['/attributes/@ctype'] as string));
    else if (activeTab === 'team') result = result.filter(n => n.fieldValues['/attributes/@ctype'] === 'ct-ekip');
    else if (activeTab === 'companies') result = result.filter(n => n.fieldValues['/attributes/@ctype'] === 'ct-sirket');

    // Interaction filter
    if (interactionFilter !== 'all') result = result.filter(n => n.fieldValues['/attributes/@cinter'] === interactionFilter);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        (n.fieldValues['/text'] as string || '').toLowerCase().includes(q) ||
        (n.fieldValues['/attributes/@crole'] as string || '').toLowerCase().includes(q) ||
        (n.fieldValues['/attributes/@ccomp'] as string || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [topLevel, activeTab, interactionFilter, searchQuery]);

  if (loading) return (
    <div className="module-transition">
      <div className="h-8 shimmer rounded-xl w-48 mb-4" />
      <div className="grid grid-cols-5 gap-3 mb-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 shimmer rounded-2xl" />)}</div>
      <div className="grid grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}</div>
    </div>
  );

  // Detail view
  if (selectedContact) {
    return (
      <div className="module-transition">
        <AnimatePresence>
          <ContactDetail contact={selectedContact} onBack={() => setSelectedContact(null)} onRefresh={() => { refetch(); setSelectedContact(null); }} />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="module-transition space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">İlişkiler & Ekip</h2>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> Kişi Ekle
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Toplam Kişi', value: stats.total, icon: Users, color: 'text-blue-500', bg: 'from-blue-500/20 to-indigo-500/10' },
          { label: 'Ekip', value: stats.team, icon: UserCheck, color: 'text-green-500', bg: 'from-green-500/20 to-emerald-500/10' },
          { label: 'Network', value: stats.network, icon: Network, color: 'text-purple-500', bg: 'from-purple-500/20 to-violet-500/10' },
          { label: 'Takip Gereken', value: stats.followup, icon: Star, color: 'text-amber-500', bg: 'from-amber-500/20 to-orange-500/10' },
          { label: 'Kurum', value: stats.companies, icon: Briefcase, color: 'text-cyan-500', bg: 'from-cyan-500/20 to-teal-500/10' },
        ].map(s => (
          <div key={s.label} className={cn('bg-gradient-to-br rounded-2xl border border-border p-4', s.bg)}>
            <s.icon className={cn('w-5 h-5 mb-1', s.color)} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
        {([
          { id: 'all' as CrmTab, label: 'Tümü' },
          { id: 'network' as CrmTab, label: 'Network' },
          { id: 'team' as CrmTab, label: 'Ekip' },
          { id: 'companies' as CrmTab, label: 'Kurumlar' },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors',
              activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Kişi, şirket, rol ara..."
            className="w-full bg-card rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none border border-border" />
        </div>
        <select value={interactionFilter} onChange={e => setInteractionFilter(e.target.value)}
          className="bg-card rounded-xl px-3 py-2.5 text-sm outline-none border border-border text-muted-foreground">
          <option value="all">Tüm Etkileşimler</option>
          {Object.entries(INTERACTION_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Contact Grid */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-sm">Kişi bulunamadı</p>
              <button onClick={() => setShowAdd(true)} className="mt-3 text-xs text-primary hover:underline">+ Kişi ekle</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map(n => (
                <ContactCard key={n.id} contact={n} onClick={() => setSelectedContact(n)} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && <AddContactModal onClose={() => setShowAdd(false)} onCreated={refetch} />}
      </AnimatePresence>
    </div>
  );
}
