import { useState, useEffect, useCallback } from 'react';
import { fetchNodes } from '@/lib/api';

export interface ProjectNode {
  id: string;
  fieldValues: Record<string, unknown>;
  parentId: string | null;
}

export function useProjectData(projectId: string) {
  const [nodes, setNodes] = useState<ProjectNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNodes(projectId);
      setNodes(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { nodes, loading, error, refetch };
}
