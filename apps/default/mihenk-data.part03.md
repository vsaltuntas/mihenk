    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.notlar}/nodes/${data.id}`);
    return res.data;
  },

  // ─── WRITE: FINANCE ─────────────────────────────
  createFinanceRecord: async (data: { description: string; amount: number; type?: string; category?: string; currency?: string; wallet?: string }) => {
    const mhkid = `mihenk_finans_${Date.now().toString(36).toUpperCase()}`;
    const body: Record<string, unknown> = {
      '/text': data.description,
      '/attributes/@ftype': data.type?.startsWith('ft-') ? data.type : `ft-${data.type || 'gider'}`,
      '/attributes/@fcat': data.category?.startsWith('fc-') ? data.category : `fc-${data.category || 'diger'}`,
      '/attributes/@famt': data.amount || 0,
      '/attributes/@fcur': data.currency?.startsWith('cur-') ? data.currency : `cur-${(data.currency || 'try').toLowerCase()}`,
      '/attributes/@fwall': data.wallet?.startsWith('w-') ? data.wallet : `w-${data.wallet || 'tombank'}`,
      '/attributes/@fnote': data.description,
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.finans}/nodes`, body);
    return res.data;
  },
  updateFinanceRecord: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.description !== undefined) { body['/text'] = data.description; body['/attributes/@fnote'] = data.description; }
    if (data.type !== undefined) body['/attributes/@ftype'] = (data.type as string).startsWith('ft-') ? data.type : `ft-${data.type}`;
    if (data.category !== undefined) body['/attributes/@fcat'] = (data.category as string).startsWith('fc-') ? data.category : `fc-${data.category}`;
    if (data.amount !== undefined) body['/attributes/@famt'] = data.amount;
    if (data.currency !== undefined) body['/attributes/@fcur'] = (data.currency as string).startsWith('cur-') ? data.currency : `cur-${(data.currency as string).toLowerCase()}`;
    if (data.wallet !== undefined) body['/attributes/@fwall'] = (data.wallet as string).startsWith('w-') ? data.wallet : `w-${data.wallet}`;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.finans}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteFinanceRecord: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.finans}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: TASKS ─────────────────────────────
  createTask: async (data: { title: string; status?: string; priority?: string; description?: string; tags?: string; parentId?: string }) => {
    const mhkid = `mihenk_gorev_${Date.now().toString(36).toUpperCase()}`;
    const statusMap: Record<string, string> = { idea: 'stat-fikir', todo: 'stat-plan', in_progress: 'stat-uret', done: 'stat-yayin', archived: 'stat-arsiv' };
    const prioMap: Record<string, string> = { urgent: 'pr-acil', high: 'pr-yuksek', medium: 'pr-normal', low: 'pr-dusuk' };
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@statu': statusMap[data.status || 'todo'] || 'stat-plan',
      '/attributes/@prior': prioMap[data.priority || 'medium'] || 'pr-normal',
      '/attributes/@notla': data.description || '',
      '/attributes/@kategori': data.tags || '',
      '/attributes/@mhkid': mhkid,
    };
    if (data.parentId) body.parentId = data.parentId;
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.gorevler}/nodes`, body);
    return res.data;
  },
  updateTask: async (data: { id: string; title?: string; status?: string; priority?: string; description?: string; tags?: string }) => {
    const body: Record<string, unknown> = {};
    const statusMap: Record<string, string> = { idea: 'stat-fikir', todo: 'stat-plan', in_progress: 'stat-uret', done: 'stat-yayin', archived: 'stat-arsiv' };
    const prioMap: Record<string, string> = { urgent: 'pr-acil', high: 'pr-yuksek', medium: 'pr-normal', low: 'pr-dusuk' };
    if (data.title !== undefined) body['/text'] = data.title;
    if (data.status !== undefined) body['/attributes/@statu'] = statusMap[data.status] || data.status;
    if (data.priority !== undefined) body['/attributes/@prior'] = prioMap[data.priority] || data.priority;
    if (data.description !== undefined) body['/attributes/@notla'] = data.description;
    if (data.tags !== undefined) body['/attributes/@kategori'] = data.tags;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.gorevler}/nodes/${data.id}`, body);
    return res.data;
  },
  deleteTask: async (data: { id: string }) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.gorevler}/nodes/${data.id}`);
    return res.data;
  },

  // ─── WRITE: IDEAS ─────────────────────────────
  createIdea: async (data: { title: string; category?: string; description?: string; priority?: string }) => {
    const mhkid = `mihenk_fikir_${Date.now().toString(36).toUpperCase()}`;
    const prioMap: Record<string, string> = { high: 'ip-high', medium: 'ip-medium', low: 'ip-low' };
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@icat0': data.category?.startsWith('ic-') ? data.category : `ic-${data.category || 'diger'}`,
      '/attributes/@istat': 'is-yeni',
      '/attributes/@iprio': prioMap[data.priority || 'medium'] || 'ip-medium',
      '/attributes/@inote': data.description || '',
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.fikirler}/nodes`, body);
    return res.data;
  },
  updateIdea: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.title !== undefined) body['/text'] = data.title;
    if (data.category !== undefined) body['/attributes/@icat0'] = (data.category as string).startsWith('ic-') ? data.category : `ic-${data.category}`;
    if (data.status !== undefined) body['/attributes/@istat'] = (data.status as string).startsWith('is-') ? data.status : `is-${data.status}`;
    if (data.description !== undefined) body['/attributes/@inote'] = data.description;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.fikirler}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteIdea: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.fikirler}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: CATALOG ─────────────────────────────
  createArtist: async (data: { name: string; type?: string; origin?: string; genre?: string; sonic_dna?: string; bio?: string }) => {
    const mhkid = `mihenk_katalog_${Date.now().toString(36).toUpperCase()}`;
    const atype = data.type?.startsWith('at-') ? data.type : `at-${data.type || 'solo'}`;
    const aorigin = data.origin?.startsWith('ao-') ? data.origin : `ao-${data.origin || 'gercek'}`;
    const body: Record<string, unknown> = {
      '/text': data.name,
      '/attributes/@atype': atype,
      '/attributes/@aorigj': aorigin,
      '/attributes/@agenr': data.genre || '',
      '/attributes/@asoni': data.sonic_dna || '',
      '/attributes/@abio': data.bio || '',
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.sanatcilar}/nodes`, body);
    return res.data;
  },

  updateArtist: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body['/text'] = data.name;
    if (data.type !== undefined) body['/attributes/@atype'] = data.type;
    if (data.origin !== undefined) body['/attributes/@aorigj'] = data.origin;
    if (data.genre !== undefined) body['/attributes/@agenr'] = data.genre;
    if (data.sonic_dna !== undefined) body['/attributes/@asoni'] = data.sonic_dna;
    if (data.bio !== undefined) body['/attributes/@abio'] = data.bio;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.sanatcilar}/nodes/${nodeId}`, body);
    return res.data;
  },

  deleteArtist: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.sanatcilar}/nodes/${nodeId}`);
    return res.data;
  },

  createTrack: async (data: { title: string; artist: string; artistMhkid?: string; album?: string; genre?: string; bpm?: number; key?: string; pipeline?: string; distribution?: string; parentId?: string }) => {
    const mhkid = `mihenk_katalog_${Date.now().toString(36).toUpperCase()}`;
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@tart': data.artist,
      '/attributes/@tartid': data.artistMhkid || '',
      '/attributes/@talbm': data.album || '',
      '/attributes/@tgenr': data.genre || '',
      '/attributes/@tbpm': data.bpm || 0,
      '/attributes/@tkey': data.key || '',
      '/attributes/@tpipe': data.pipeline || 'tp-taslak',
      '/attributes/@tdist': data.distribution || '',
      '/attributes/@mhkid': mhkid,
    };
    if (data.parentId) body.parentId = data.parentId;
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.albumler}/nodes`, body);
    return res.data;
  },

  updateTrack: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
