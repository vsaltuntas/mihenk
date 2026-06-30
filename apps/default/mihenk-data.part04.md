    if (data.title !== undefined) body['/text'] = data.title;
    if (data.artist !== undefined) body['/attributes/@tart'] = data.artist;
    if (data.artistMhkid !== undefined) body['/attributes/@tartid'] = data.artistMhkid;
    if (data.album !== undefined) body['/attributes/@talbm'] = data.album;
    if (data.genre !== undefined) body['/attributes/@tgenr'] = data.genre;
    if (data.bpm !== undefined) body['/attributes/@tbpm'] = data.bpm;
    if (data.key !== undefined) body['/attributes/@tkey'] = data.key;
    if (data.pipeline !== undefined) body['/attributes/@tpipe'] = data.pipeline;
    if (data.distribution !== undefined) body['/attributes/@tdist'] = data.distribution;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.albumler}/nodes/${nodeId}`, body);
    return res.data;
  },

  deleteTrack: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.albumler}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: CALENDAR EVENTS ─────────────────────────────
  createEvent: async (data: { title: string; type?: string; description?: string; location?: string; start_time?: string }) => {
    const mhkid = `mihenk_event_${Date.now().toString(36).toUpperCase()}`;
    const eventDate = data.start_time ? new Date(data.start_time).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const etype = data.type?.startsWith('ev-') ? data.type : `ev-${data.type || 'genel'}`;
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@etype': etype,
      '/attributes/@eloc': data.location || '',
      '/attributes/@enote': data.description || '',
      '/attributes/@edate': eventDate,
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.takvim}/nodes`, body);
    return res.data;
  },
  updateEvent: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.title !== undefined) body['/text'] = data.title;
    if (data.type !== undefined) body['/attributes/@etype'] = data.type;
    if (data.location !== undefined) body['/attributes/@eloc'] = data.location;
    if (data.description !== undefined) body['/attributes/@enote'] = data.description;
    if (data.date !== undefined) body['/attributes/@edate'] = data.date;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.takvim}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteEvent: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.takvim}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: CRM CONTACTS ─────────────────────────────
  createContact: async (data: { name: string; email?: string; phone?: string; company?: string; role?: string; relationship_type?: string; notes?: string }) => {
    const mhkid = `mihenk_contact_${Date.now().toString(36).toUpperCase()}`;
    const body: Record<string, unknown> = {
      '/text': data.name,
      '/attributes/@cemail': data.email || '',
      '/attributes/@cphone': data.phone || '',
      '/attributes/@ccomp': data.company || '',
      '/attributes/@crole': data.role || '',
      '/attributes/@ctype': data.relationship_type || 'personal',
      '/attributes/@cnote': data.notes || '',
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.kisiler}/nodes`, body);
    return res.data;
  },
  updateContact: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body['/text'] = data.name;
    if (data.email !== undefined) body['/attributes/@cemail'] = data.email;
    if (data.phone !== undefined) body['/attributes/@cphone'] = data.phone;
    if (data.company !== undefined) body['/attributes/@ccomp'] = data.company;
    if (data.role !== undefined) body['/attributes/@crole'] = data.role;
    if (data.notes !== undefined) body['/attributes/@cnote'] = data.notes;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.kisiler}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteContact: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.kisiler}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: WELLNESS / MOOD ─────────────────────────────
  createMood: async (data: { score?: number; energy?: number; sleep_hours?: number; water?: number; habits?: string; supplements?: string; notes?: string }) => {
    const today = new Date().toLocaleDateString('tr-TR');
    const body: Record<string, unknown> = {
      '/text': `Check-in ${today}`,
      '/attributes/@wmood': data.score ?? 5,
      '/attributes/@wenrg': data.energy ?? 5,
      '/attributes/@wslep': data.sleep_hours ?? 7,
      '/attributes/@wwatr': data.water ?? 0,
      '/attributes/@whabi': data.habits || '',
      '/attributes/@wtakv': data.supplements || '',
      '/attributes/@wnote': data.notes || '',
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.wellness}/nodes`, body);
    return res.data;
  },
  updateMood: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.score !== undefined) body['/attributes/@wmood'] = data.score;
    if (data.energy !== undefined) body['/attributes/@wenrg'] = data.energy;
    if (data.sleep_hours !== undefined) body['/attributes/@wslep'] = data.sleep_hours;
    if (data.water !== undefined) body['/attributes/@wwatr'] = data.water;
    if (data.notes !== undefined) body['/attributes/@wnote'] = data.notes;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.wellness}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteMood: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.wellness}/nodes/${nodeId}`);
    return res.data;
  },
};

// Backward compat exports
export const hayatosAPI = mihenkAPI;

/* ─── Utilities ─── */
export function ensureArray<T>(val: T[] | null | undefined | unknown): T[] {
  if (Array.isArray(val)) return val;
  return [];
}

type ApiCall<T> = () => Promise<T>;

export function useMihenkData<T>(fetcher: ApiCall<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetcher()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Veri yüklenemedi'); setData(null); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

// Backward compat
export const useHayatosData = useMihenkData;
