import axios from 'axios';

const api = axios.create({ baseURL: '/api/taskade' });

export const PROJECT_IDS = {
  projects: 'qujHhVX1pJpC2Jh4',
  finance: 'w5EPpzmGJ3pnwZtS',
  crm: 'CYeN3eSk4BASymrF',
  notes: 'Ba6qULrBj9iCmoBw',
  wellness: 'dBt8bMYNG8aL41Fv',
  artists: 'yEjrmczcFwSrYQBn',
  tracks: 'JYDvWUVTRtjtN9Hx',
  gamification: 'ZHw56T7Z3B4WymwS',
  calendar: 'FwJpuE4BjZoB7zif',
} as const;

export const AGENT_ID = '01KMT63AYCHYKPGZNB12NPS9M4';

export async function fetchNodes(projectId: string) {
  const res = await api.get(`/projects/${projectId}/nodes`);
  return res.data?.payload?.nodes ?? [];
}

export async function createNode(projectId: string, data: Record<string, unknown>) {
  const res = await api.post(`/projects/${projectId}/nodes`, data);
  return res.data;
}

export async function updateNode(projectId: string, nodeId: string, data: Record<string, unknown>) {
  const res = await api.patch(`/projects/${projectId}/nodes/${nodeId}`, data);
  return res.data;
}

export async function deleteNode(projectId: string, nodeId: string) {
  const res = await api.delete(`/projects/${projectId}/nodes/${nodeId}`);
  return res.data;
}

export default api;
