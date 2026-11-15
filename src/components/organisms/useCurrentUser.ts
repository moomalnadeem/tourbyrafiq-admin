'use client';
import { useEffect, useState } from 'react';

export interface CurrentUser { name?: string; email?: string; role?: string }

/** Signed-in admin's display info (from the non-sensitive tga_user cookie). UX only — the gateway enforces access. */
export function useCurrentUser(): CurrentUser {
  const [u, setU] = useState<CurrentUser>({});
  useEffect(() => {
    const raw = document.cookie.split('; ').find((c) => c.startsWith('tga_user='))?.slice(9);
    try { setU(raw ? JSON.parse(decodeURIComponent(raw)) : {}); } catch { setU({}); }
  }, []);
  return u;
}
