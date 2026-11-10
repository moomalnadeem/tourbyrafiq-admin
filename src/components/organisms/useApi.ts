'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/client';

/** Small reusable data hook for admin screens (GET + reload). */
export function useApi<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);
  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true); setError(null);
    try { setData(await apiFetch<T>(path)); } catch (e: any) { setError(e.message); if (e.status === 401) window.location.href = '/login'; } finally { setLoading(false); }
  }, [path]);
  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: load, setData };
}
