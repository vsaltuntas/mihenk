  const handleDeleteMood = useCallback(async (id: string, label: string) => {
    if (!confirm(`"${label}" kaydını silmek istediğinize emin misiniz?`)) return;
    try {
      await mihenkAPI.deleteMood(id);
      refetch();
      toast.success('🗑️ Check-in silindi');
    } catch (e: unknown) {
      toast.error(`❌ Silinemedi: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  }, [refetch]);

  const handleExportWellness = () => {
    const csv = ['Tarih,Mood,Enerji,UykuSaat,SuBardak,Not,Aliskanliklar']
      .concat(nodes.filter(n => n.parentId === null).map(n => [
        n.fieldValues['/attributes/@wdate'] || n.fieldValues['/attributes/@edate'] || '',
        n.fieldValues['/attributes/@wmood'] || '',
        n.fieldValues['/attributes/@wenrg'] || '',
        n.fieldValues['/attributes/@wslep'] || '',
        n.fieldValues['/attributes/@wwatr'] || '',
        String(n.fieldValues['/attributes/@wnote'] || '').replace(/"/g, '""'),
        String(n.fieldValues['/attributes/@whabi'] || '').replace(/"/g, '""'),
      ].map(v => `"${v}"`).join(',')))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV indirildi');
  };

  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Daily wellness score
  const dailyScore = useMemo(() => {
    const suppDone = supplements.filter(s => s.done).length;
    const habitsDone = habits.filter(h => h.done).length;
    const waterPct = Math.min(waterCount / WATER_GOAL, 1);
    const total = (suppDone / supplements.length) * 30 + (habitsDone / habits.length) * 50 + waterPct * 20;
    return Math.round(total);
  }, [supplements, habits, waterCount]);
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  // Build 30-day mood heatmap data
  const heatmapData = useMemo(() => {
    const days: { date: string; mood: number; label: string }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      const dayLabel = d.toLocaleDateString('tr-TR', { weekday: 'short' });

      // Find matching check-in
      const match = nodes.find(n => {
        const text = (n.fieldValues['/text'] as string) || '';
        return text.includes(d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }));
      });

      days.push({
        date: dateStr,
        mood: match ? Number(match.fieldValues['/attributes/@wmood']) || 0 : 0,
        label: dayLabel,
      });
    }
    return days;
  }, [nodes]);

  // Averages
  const averages = useMemo(() => {
    const checkins = nodes.filter(n => n.parentId === null);
    if (checkins.length === 0) return { mood: 0, energy: 0, sleep: 0, water: 0, count: 0 };
    const sum = checkins.reduce(
      (acc, n) => ({
        mood: acc.mood + (Number(n.fieldValues['/attributes/@wmood']) || 0),
        energy: acc.energy + (Number(n.fieldValues['/attributes/@wenrg']) || 0),
        sleep: acc.sleep + (Number(n.fieldValues['/attributes/@wslep']) || 0),
        water: acc.water + (Number(n.fieldValues['/attributes/@wwatr']) || 0),
      }),
      { mood: 0, energy: 0, sleep: 0, water: 0 }
    );
    const c = checkins.length;
    return {
      mood: (sum.mood / c).toFixed(1),
      energy: (sum.energy / c).toFixed(1),
      sleep: (sum.sleep / c).toFixed(1),
      water: (sum.water / c).toFixed(1),
      count: c,
    };
  }, [nodes]);

  // Trend data: last 14 mood entries
  const moodTrendData = useMemo(() => {
    const sorted = [...moods].sort((a, b) => (a.date || a.created_at || '').localeCompare(b.date || b.created_at || ''));
    return sorted.slice(-14).map(m => ({
      date: (m.date || m.created_at || '').slice(5, 10).replace('-', '/'),
      mood: Number(m.mood_score) || 0,
      enerji: Number(m.energy_level) || 0,
      uyku: Number(m.sleep_hours) || 0,
    }));
  }, [moods]);

  const handleCheckin = useCallback(async () => {
    try {
      await mihenkAPI.createMood({
        score: form.mood,
        energy: form.energy,
        sleep_hours: form.sleep,
        notes: form.note || `Ruh: ${form.mood}/10, Su: ${form.water}, Enerji: ${form.energy}/10`,
      });
      toast.success('✅ +25 XP — Check-in kaydedildi!');
      setActiveTab('history');
    } catch (e: unknown) {
      toast.error(`❌ Check-in başarısız: ${e instanceof Error ? e.message : 'Hata'}`);
    }
  }, [form]);

  if (loading) {
    return (
      <div className="module-transition space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        <div className="h-[400px] shimmer rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="module-transition space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-rose-500" />
          <h2 className="text-2xl font-bold">ZenZone</h2>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {([
            { id: 'wellness', label: 'Wellness', icon: Heart },
            { id: 'focus', label: 'Focus', icon: Timer },
            { id: 'checkin', label: 'Check-in', icon: Smile },
            { id: 'history', label: 'Geçmiş', icon: CalendarDays },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
