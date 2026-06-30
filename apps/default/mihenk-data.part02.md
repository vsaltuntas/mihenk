const toAlbumTrack = (n: TaskadeNode): HayatAlbumTrack => ({ id: n.id, title: text(n), artist: field(n, '@tart'), album: field(n, '@talbm'), pipeline: field(n, '@tpipe'), bpm: fieldNum(n, '@tbpm'), key: field(n, '@tkey'), genre: field(n, '@tgenr'), distribution: field(n, '@tdist'), parentId: n.parentId, mihenk_id: field(n, '@mhkid'), artist_mihenk_id: field(n, '@tartid') });
const toEvent = (n: TaskadeNode): HayatEvent => ({ id: n.id, title: text(n), event_type: field(n, '@etype'), location: field(n, '@eloc'), notes: field(n, '@enote'), start_date: field(n, '@edate') || now().slice(0, 10), created_at: now(), mihenk_id: field(n, '@mhkid') });
const toMood = (n: TaskadeNode): HayatMood => ({ id: n.id, mood_score: fieldNum(n, '@wmood'), energy_level: fieldNum(n, '@wenrg'), sleep_hours: fieldNum(n, '@wslep'), water: fieldNum(n, '@wwatr'), habits: field(n, '@whabi'), supplements: field(n, '@wtakv'), notes: field(n, '@wnote'), created_at: now() });
const IPRIO: Record<string, string> = { 'ip-high': 'high', 'ip-medium': 'medium', 'ip-low': 'low' };
const toIdea = (n: TaskadeNode): HayatIdea => ({ id: n.id, title: text(n), category: ICAT[field(n, '@icat0')] ?? 'Diğer', status: ISTAT[field(n, '@istat')] ?? 'Yeni', priority: IPRIO[field(n, '@iprio')] ?? 'medium', description: field(n, '@inote'), created_at: now(), mihenk_id: field(n, '@mhkid') });

/* ─── Public API ─── */
export const mihenkAPI = {
  getProjects: async () => { const ns = await fetchProjectNodes(PROJECT_IDS.gorevler); return ns.filter(n => n.parentId === null).map(toProject); },
  getTasks: async () => { const ns = await fetchProjectNodes(PROJECT_IDS.gorevler); return ns.map(toTask); },
  getFinanceRecords: async () => (await fetchProjectNodes(PROJECT_IDS.finans)).map(toFinance),
  getNotes: async () => (await fetchProjectNodes(PROJECT_IDS.notlar)).map(toNote),
  getContacts: async () => (await fetchProjectNodes(PROJECT_IDS.kisiler)).map(toContact),
  getArtists: async () => (await fetchProjectNodes(PROJECT_IDS.sanatcilar)).map(toArtist),
  getAlbumTracks: async () => (await fetchProjectNodes(PROJECT_IDS.albumler)).map(toAlbumTrack),
  getEvents: async () => (await fetchProjectNodes(PROJECT_IDS.takvim)).map(toEvent),
  getMoods: async () => (await fetchProjectNodes(PROJECT_IDS.wellness)).map(toMood),
  getGamification: async (): Promise<HayatGamification> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.gamification);
    const n = ns[0];
    if (!n) return { xp: 0, level: 1, rank: 'Çırak', streak: 0 };
    return { xp: fieldNum(n, '@gxp'), level: fieldNum(n, '@glvl'), rank: field(n, '@grank') || 'Çırak', streak: fieldNum(n, '@gstrk') };
  },
  // Backward compat aliases
  getTracks: async () => (await fetchProjectNodes(PROJECT_IDS.albumler)).map(toAlbumTrack),
  getAlbums: async () => {
    const ns = await fetchProjectNodes(PROJECT_IDS.albumler);
    return ns.filter(n => n.parentId === null).map(toAlbumTrack);
  },
  getIdeas: async () => (await fetchProjectNodes(PROJECT_IDS.fikirler)).map(toIdea),
  // ─── MIHENK Provider Inventory ────────────
  getProviderInventory: async (): Promise<MIHENKProviderRecord[]> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkProviderInventory);
    return ns
      .filter(n => n.parentId !== null)
      .map(n => {
        const t = text(n);
        const json = parseInlineJSON(t);
        if (!json) return null;
        return { id: (json.id as string) || '', status: (json.status as string) || '', source: (json.source as string) || '', endpoints: (json.endpoints as string[]) || [], counts: (json.counts as Record<string, unknown>) || {}, mihenkTargets: (json.mihenkTargets as string[]) || [], nextFix: (json.nextFix as string) || '' } as MIHENKProviderRecord;
      })
      .filter((r): r is MIHENKProviderRecord => r !== null && r.id !== '');
  },

  // ─── MIHENK YouTube Kanallar ────────────
  getYouTubeChannels: async (): Promise<MIHENKYoutubeChannel[]> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkYoutubeKanallar);
    return ns
      .filter(n => n.parentId !== null)
      .map(n => {
        const t = text(n);
        const json = parseInlineJSON(t);
        if (!json) return null;
        return {
          channel_id: (json.channel_id as string) || '', title: (json.title as string) || '', handle: (json.handle as string) || '',
          subscribers: (json.subscribers as number) || 0, total_views: (json.total_views as number) || 0, declared_video_count: (json.declared_video_count as number) || 0,
          in_data_api: Boolean(json.in_data_api), in_analytics_api: Boolean(json.in_analytics_api),
          snapshot_date: (json.snapshot_date as string) || '', views_window: (json.views_window as number | null) ?? null,
          revenue_window: (json.revenue_window as number | null) ?? null, net_subs_window: (json.net_subs_window as number | null) ?? null,
          avg_cpm: (json.avg_cpm as number | null) ?? null, last_analytics_date: (json.last_analytics_date as string | null) ?? null,
          day_count: (json.day_count as number | null) ?? null,
        } as MIHENKYoutubeChannel;
      })
      .filter((r): r is MIHENKYoutubeChannel => r !== null && r.channel_id !== '');
  },

  // ─── MIHENK YouTube Videolar (batch manifests) ────
  getYouTubeVideoBatches: async (): Promise<MIHENKBatchManifest[]> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkYoutubeVideolar);
    return ns
      .filter(n => n.parentId !== null)
      .map(n => {
        const t = text(n);
        const json = parseInlineJSON(t);
        if (!json) return null;
        return {
          provider: (json.provider as string) || '', bridge_endpoint: (json.bridge_endpoint as string) || '', payload_path: (json.payload_path as string) || '',
          batch: (json.batch as number) || 1, record_count: (json.record_count as number) || 0, sha16: (json.sha16 as string) || '',
          status: (json.status as string) || '', note: (json.note as string) || '',
        } as MIHENKBatchManifest;
      })
      .filter((r): r is MIHENKBatchManifest => r !== null && r.batch > 0);
  },

  // ─── MIHENK YouTube Günlük Metrikler (batch manifests) ────
  getYouTubeDailyBatches: async (): Promise<MIHENKBatchManifest[]> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkYoutubeGunlukMetrikler);
    return ns
      .filter(n => n.parentId !== null)
      .map(n => {
        const t = text(n);
        const json = parseInlineJSON(t);
        if (!json) return null;
        return {
          provider: (json.provider as string) || '', bridge_endpoint: (json.bridge_endpoint as string) || '', payload_path: (json.payload_path as string) || '',
          batch: (json.batch as number) || 1, record_count: (json.record_count as number) || 0, sha16: (json.sha16 as string) || '',
          includes_revenue: Boolean(json.includes_revenue), status: (json.status as string) || '', note: (json.note as string) || '',
        } as MIHENKBatchManifest;
      })
      .filter((r): r is MIHENKBatchManifest => r !== null && r.batch > 0);
  },

  // ─── MIHENK Provider Sync Log ────────────
  getProviderSyncLog: async (): Promise<MIHENKSyncLogRecord | null> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkProviderSyncLog);
    const record = ns.filter(n => n.parentId !== null)[0];
    if (!record) return null;
    const t = text(record);
    const json = parseInlineJSON(t);
    if (!json) return null;
    return {
      status: (json.status as string) || '', freshness: (json.freshness as MIHENKSyncLogRecord['freshness']) || { stale: true, last_analytics_date: '', last_video_fetch_at: '', rule: '' },
      summary: (json.summary as MIHENKSyncLogRecord['summary']) || { channel_count: 0, video_count: 0, daily_row_count: 0, analytics_channel_count: 0, first_analytics_date: '', last_analytics_date: '', last_video_fetch_at: '', revenue_sum: 0, analytics_views_sum: 0, total_subscribers: 0, total_channel_views: 0 },
      counts: (json.counts as MIHENKSyncLogRecord['counts']) || { channels: 0, videos: 0, daily: 0 },
      source: (json.source as string) || '', note: (json.note as string) || '',
    } as MIHENKSyncLogRecord;
  },

  // Legacy data API stubs — channels now read from snapshot project
  getYouTubeVideos: async () => [] as any[],
  getMaestroProjects: async () => [] as any[],
  getMaestroPrompts: async () => [] as any[],
  getMaestroAnalyses: async () => [] as any[],
  getMaestroGenerations: async () => [] as any[],
  getMaestroDashboard: async () => ({} as any),
  getFinanceAccounts: async () => [] as any[],

  // ─── WRITE: NOTES ─────────────────────────────
  createNote: async (data: { title: string; content?: string; folder?: string; tags?: string; note_type?: string }) => {
    const mhkid = `mihenk_not_${Date.now().toString(36).toUpperCase()}`;
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@ncont': data.content || '',
      '/attributes/@ndeft': data.folder?.startsWith('nb-') ? data.folder : `nb-${data.folder || 'kisisel'}`,
      '/attributes/@ntype': data.note_type?.startsWith('nt-') ? data.note_type : `nt-${data.note_type || 'taslak'}`,
      '/attributes/@ntags': data.tags || '',
      '/attributes/@ndate': new Date().toISOString(),
      '/attributes/@npinned': '0',
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.notlar}/nodes`, body);
    return res.data;
  },
  updateNote: async (data: { id: string; title?: string; content?: string; folder?: string; tags?: string; note_type?: string; pinned?: boolean }) => {
    const body: Record<string, unknown> = {};
    if (data.title !== undefined) body['/text'] = data.title;
    if (data.content !== undefined) body['/attributes/@ncont'] = data.content;
    if (data.folder !== undefined) body['/attributes/@ndeft'] = data.folder.startsWith('nb-') ? data.folder : `nb-${data.folder}`;
    if (data.note_type !== undefined) body['/attributes/@ntype'] = data.note_type.startsWith('nt-') ? data.note_type : `nt-${data.note_type}`;
    if (data.tags !== undefined) body['/attributes/@ntags'] = data.tags;
    if (data.pinned !== undefined) body['/attributes/@npinned'] = data.pinned ? '1' : '0';
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.notlar}/nodes/${data.id}`, body);
    return res.data;
  },
  deleteNote: async (data: { id: string }) => {
