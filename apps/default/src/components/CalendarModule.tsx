import { useState, useMemo, useCallback } from 'react';
import { mihenkAPI, useMihenkData } from '@/lib/mihenk-data';
import {
  Calendar, Plus, Clock, ChevronLeft, ChevronRight,
  MapPin, Filter, X, StickyNote, Pencil, Trash2, Save
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isToday,
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
  isSameMonth, isSameDay
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Constants ─── */

const EVENT_TYPES = [
  { id: 'ev-plan', label: 'Planlama', emoji: '📋', color: '#3B82F6', bg: 'bg-blue-500', light: 'bg-blue-100 text-blue-700' },
  { id: 'ev-deep', label: 'Deep Work', emoji: '🧠', color: '#8B5CF6', bg: 'bg-purple-500', light: 'bg-purple-100 text-purple-700' },
  { id: 'ev-fatura', label: 'Fatura', emoji: '💰', color: '#EF4444', bg: 'bg-red-500', light: 'bg-red-100 text-red-700' },
  { id: 'ev-well', label: 'Wellness', emoji: '🧘', color: '#10B981', bg: 'bg-green-500', light: 'bg-green-100 text-green-700' },
  { id: 'ev-toplanti', label: 'Toplantı', emoji: '🤝', color: '#F59E0B', bg: 'bg-amber-500', light: 'bg-amber-100 text-amber-700' },
  { id: 'ev-muzik', label: 'Müzik', emoji: '🎵', color: '#EC4899', bg: 'bg-pink-500', light: 'bg-pink-100 text-pink-700' },
  { id: 'ev-genel', label: 'Genel', emoji: '📌', color: '#6B7280', bg: 'bg-gray-500', light: 'bg-gray-100 text-gray-700' },
];

const EVENT_MAP = Object.fromEntries(EVENT_TYPES.map(t => [t.id, t]));

const QUICK_PRESETS = [
  { title: 'Sabah Rutini', type: 'ev-well', emoji: '🌅' },
  { title: 'Team Standup', type: 'ev-toplanti', emoji: '👥' },
  { title: 'Deep Work Bloku', type: 'ev-deep', emoji: '🧠' },
  { title: 'Fatura Ödeme', type: 'ev-fatura', emoji: '💳' },
  { title: 'Müzik Çalışması', type: 'ev-muzik', emoji: '🎸' },
];

/* ─── Main Component ─── */

export default function CalendarModule() {
  const { data: rawEvents, loading, refetch } = useMihenkData(mihenkAPI.getEvents, []);

  // Map MİHENK events to the shape UI expects
  const nodes = useMemo(() => (rawEvents ?? []).map(e => {
    // event_type from Taskade stores the raw field value (ev-genel, ev-muzik, etc.)
    const rawType = e.event_type || '';
    const etypeKey = rawType.startsWith('ev-') ? rawType : (rawType ? `ev-${rawType.toLowerCase()}` : 'ev-genel');
    return {
      id: e.id, parentId: null, completed: false,
      fieldValues: {
        '/text': e.title,
        '/attributes/@etype': etypeKey,
        '/attributes/@enote': e.notes || '',
        '/attributes/@eloc': e.location || '',
        '/due_date/start': e.start_date || '',
      }
    };
  }), [rawEvents]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ title: '', type: 'ev-genel', note: '', location: '', date: '' });
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', type: 'ev-genel', note: '', location: '', date: '' });

  // Navigation
  const goNext = () => setCurrentDate(d => viewMode === 'month' ? addMonths(d, 1) : addWeeks(d, 1));
  const goPrev = () => setCurrentDate(d => viewMode === 'month' ? subMonths(d, 1) : subWeeks(d, 1));
  const goToday = () => setCurrentDate(new Date());

  // Calendar days
  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, viewMode]);

  // Events grouped by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof nodes> = {};
    nodes.forEach(n => {
      const dueStart = n.fieldValues['/due_date/start'] as string;
      if (dueStart) {
        const key = dueStart.slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(n);
      }
    });
    return map;
  }, [nodes]);

  // Filtered events for a day
  const getEventsForDay = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[key] || [];
    if (activeFilters.size === 0) return dayEvents;
    return dayEvents.filter(e => activeFilters.has(e.fieldValues['/attributes/@etype'] as string));
  };

  // All events (for sidebar)
  const allEvents = useMemo(() => {
    let list = nodes;
    if (activeFilters.size > 0) {
      list = list.filter(e => activeFilters.has(e.fieldValues['/attributes/@etype'] as string));
    }
    return list;
  }, [nodes, activeFilters]);

  // Selected day events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return getEventsForDay(selectedDay);
  }, [selectedDay, getEventsForDay]);

  // Toggle filter
  const toggleFilter = (id: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Create event
  const handleAdd = async () => {
    if (!form.title.trim()) { toast.error('Başlık gerekli'); return; }
    try {
      const eventDate = form.date || (selectedDay ? selectedDay.toISOString() : new Date().toISOString());
      await mihenkAPI.createEvent({
        title: form.title,
        type: form.type,
        description: form.note || undefined,
        location: form.location || undefined,
        start_time: eventDate,
      });
      setShowAdd(false);
      setForm({ title: '', type: 'ev-genel', note: '', location: '', date: '' });
      refetch();
      toast.success('✅ Etkinlik eklendi!');
    } catch (e: unknown) {
      toast.error(`❌ Eklenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  };

  // Quick add
  const quickAdd = async (preset: typeof QUICK_PRESETS[0]) => {
    try {
      await mihenkAPI.createEvent({
        title: preset.title,
        type: preset.type,
        start_time: new Date().toISOString(),
      });
      refetch();
      toast.success(`✅ ${preset.emoji} ${preset.title} eklendi!`);
    } catch (e: unknown) {
      toast.error(`❌ Eklenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  };

  // Start editing an event
  const handleStartEdit = (ev: typeof nodes[0]) => {
    setEditingEvent(ev.id);
    setEditForm({
      title: ev.fieldValues['/text'] as string || '',
      type: ev.fieldValues['/attributes/@etype'] as string || 'ev-genel',
      note: ev.fieldValues['/attributes/@enote'] as string || '',
      location: ev.fieldValues['/attributes/@eloc'] as string || '',
      date: ev.fieldValues['/due_date/start'] as string || '',
    });
  };

  // Save edited event
  const handleSaveEdit = async () => {
    if (!editingEvent || !editForm.title.trim()) { toast.error('Başlık gerekli'); return; }
    try {
      await mihenkAPI.updateEvent(editingEvent, {
        title: editForm.title,
        type: editForm.type,
        location: editForm.location || '',
        description: editForm.note || '',
        date: editForm.date || undefined,
      });
      setEditingEvent(null);
      refetch();
      toast.success('✅ Etkinlik güncellendi!');
    } catch (e: unknown) {
      toast.error(`❌ Güncellenemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  };

  // Delete event
  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!confirm(`"${eventTitle}" etkinliğini silmek istediğinize emin misiniz?`)) return;
    try {
      await mihenkAPI.deleteEvent(eventId);
      refetch();
      toast.success('🗑️ Etkinlik silindi');
    } catch (e: unknown) {
      toast.error(`❌ Silinemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  };

  if (loading) {
    return (
      <div className="module-transition space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="h-[500px] shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="module-transition space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Takvim</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-xl p-1">
            {(['month', 'week'] as const).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  viewMode === m ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                )}
              >
                {m === 'month' ? 'Ay' : 'Hafta'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Etkinlik
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex gap-4">
        {/* Calendar Area */}
        <div className="flex-1 min-w-0">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold min-w-[160px] text-center">
                {viewMode === 'month'
                  ? format(currentDate, 'MMMM yyyy', { locale: tr })
                  : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: tr })} — ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: tr })}`
                }
              </h3>
              <button onClick={goNext} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={goToday} className="text-xs text-primary hover:underline ml-2">Bugün</button>
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {EVENT_TYPES.map(t => {
              const isActive = activeFilters.size === 0 || activeFilters.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleFilter(t.id)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all border',
                    isActive ? 'border-border bg-card opacity-100' : 'border-transparent opacity-40'
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full', t.bg)} />
                  <span>{t.label}</span>
                </button>
              );
            })}
            {activeFilters.size > 0 && (
              <button onClick={() => setActiveFilters(new Set())} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X className="w-3 h-3" /> Temizle
              </button>
            )}
          </div>

          {/* Calendar Grid */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2.5">{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className={cn('grid grid-cols-7', viewMode === 'week' ? '' : '')}>
              {calendarDays.map((day, i) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const todayMark = isToday(day);
                const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      'relative p-1.5 border-b border-r border-border text-left transition-colors',
                      viewMode === 'month' ? 'min-h-[80px]' : 'min-h-[120px]',
                      !isCurrentMonth && viewMode === 'month' && 'opacity-30',
                      isSelected && 'bg-primary/5 ring-1 ring-primary/30',
                      todayMark && 'bg-primary/5',
                      'hover:bg-muted/50'
                    )}
                  >
                    <span className={cn(
                      'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium',
                      todayMark && 'bg-primary text-primary-foreground',
                      isSelected && !todayMark && 'bg-accent'
                    )}>
                      {format(day, 'd')}
                    </span>

                    {/* Event dots / pills */}
                    {hasEvents && (
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => {
                          const type = EVENT_MAP[ev.fieldValues['/attributes/@etype'] as string];
                          return (
                            <div key={ev.id} className="flex items-center gap-1">
                              <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', type?.bg || 'bg-gray-400')} />
                              <span className="text-[9px] truncate text-foreground/80 leading-tight">
                                {ev.fieldValues['/text'] as string}
                              </span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 3} daha</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[260px] flex-shrink-0 space-y-4 hidden lg:block">
          {/* Selected Day Detail */}
          <AnimatePresence mode="wait">
            {selectedDay && (
              <motion.div
                key={selectedDay.toISOString()}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <h4 className="font-semibold text-sm mb-3">
                  {format(selectedDay, 'd MMMM yyyy, EEEE', { locale: tr })}
                </h4>
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-4">
                    <StickyNote className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
                    <p className="text-xs text-muted-foreground">Bu gün etkinlik yok</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map(ev => {
                      const type = EVENT_MAP[ev.fieldValues['/attributes/@etype'] as string];
                      const isEditing = editingEvent === ev.id;

                      if (isEditing) {
                        return (
                          <div key={ev.id} className="p-2.5 rounded-xl text-xs bg-muted border border-primary/30 space-y-2">
                            <input
                              value={editForm.title}
                              onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                              className="w-full bg-background rounded-lg px-2 py-1.5 text-xs outline-none border border-border"
                              autoFocus
                            />
                            <select
                              value={editForm.type}
                              onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}
                              className="w-full bg-background rounded-lg px-2 py-1.5 text-xs outline-none border border-border"
                            >
                              {EVENT_TYPES.map(t => (
                                <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                              ))}
                            </select>
                            <input
                              value={editForm.location}
                              onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                              placeholder="Konum..."
                              className="w-full bg-background rounded-lg px-2 py-1.5 text-xs outline-none border border-border"
                            />
                            <textarea
                              value={editForm.note}
                              onChange={e => setEditForm(p => ({ ...p, note: e.target.value }))}
                              placeholder="Not..."
                              className="w-full bg-background rounded-lg px-2 py-1.5 text-xs outline-none resize-none h-12 border border-border"
                            />
                            <div className="flex gap-1.5">
                              <button onClick={handleSaveEdit} className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground py-1.5 rounded-lg text-[10px] font-semibold">
                                <Save className="w-3 h-3" /> Kaydet
                              </button>
                              <button onClick={() => setEditingEvent(null)} className="px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-muted rounded-lg">
                                İptal
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={ev.id} className={cn('p-2.5 rounded-xl text-xs group relative', type?.light || 'bg-muted')}>
                          <div className="flex items-start justify-between gap-1">
                            <p className="font-semibold flex-1">{type?.emoji} {ev.fieldValues['/text'] as string}</p>
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => handleStartEdit(ev)}
                                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                                title="Düzenle"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(ev.id, ev.fieldValues['/text'] as string)}
                                className="p-1 rounded hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600"
                                title="Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {ev.fieldValues['/attributes/@eloc'] && (
                            <p className="flex items-center gap-1 mt-1 opacity-70">
                              <MapPin className="w-3 h-3" /> {ev.fieldValues['/attributes/@eloc'] as string}
                            </p>
                          )}
                          {ev.fieldValues['/attributes/@enote'] && (
                            <p className="mt-1 opacity-70">{ev.fieldValues['/attributes/@enote'] as string}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Add Presets */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Hızlı Ekle</h4>
            <div className="space-y-1.5">
              {QUICK_PRESETS.map(p => (
                <button
                  key={p.title}
                  onClick={() => quickAdd(p)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-muted transition-colors text-left"
                >
                  <span>{p.emoji}</span>
                  <span>{p.title}</span>
                  <Plus className="w-3 h-3 ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Mini Stats */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">İstatistikler</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Toplam Etkinlik</span>
                <span className="font-bold">{allEvents.length}</span>
              </div>
              {EVENT_TYPES.slice(0, 5).map(t => {
                const count = allEvents.filter(e => e.fieldValues['/attributes/@etype'] === t.id).length;
                if (count === 0) return null;
                return (
                  <div key={t.id} className="flex justify-between text-xs items-center">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <div className={cn('w-2 h-2 rounded-full', t.bg)} />
                      {t.label}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Yeni Etkinlik</h3>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Etkinlik adı..."
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border"
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Tür</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border"
                    >
                      {EVENT_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Tarih</label>
                    <input
                      type="date"
                      value={form.date || (selectedDay ? format(selectedDay, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))}
                      onChange={e => setForm(p => ({ ...p, date: e.target.value ? new Date(e.target.value + 'T12:00:00').toISOString() : '' }))}
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Konum</label>
                    <input
                      value={form.location}
                      onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      placeholder="Opsiyonel..."
                      className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none border border-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Not</label>
                  <textarea
                    value={form.note}
                    onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="Detaylar..."
                    className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none resize-none h-16 border border-border"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Ekle
                  </button>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
