import 'server-only';
import { cookies, headers } from 'next/headers';
import { backendRequest } from './http';
import { serverEnv } from './env';

export const ACCESS_COOKIE = 'tga_at';
export const REFRESH_COOKIE = 'tga_rt';
export const PROFILE_COOKIE = 'tga_user'; // non-sensitive display info for the UI

export interface SessionUser { id: string; email: string; name?: string | null; role: string; avatarUrl?: string | null }
export interface TokenBundle { accessToken: string; refreshToken: string; refreshExpiresInDays: number; user: SessionUser }

/** httpOnly + Secure + SameSite=Lax cookies — tokens are never readable by page JavaScript. */
export async function setSession(t: TokenBundle) {
  const jar = await cookies();
  const base = { httpOnly: true, secure: serverEnv.cookieSecure, sameSite: 'lax' as const, path: '/' };
  jar.set(ACCESS_COOKIE, t.accessToken, { ...base, maxAge: 15 * 60 });
  jar.set(REFRESH_COOKIE, t.refreshToken, { ...base, path: '/', maxAge: t.refreshExpiresInDays * 86400 });
  jar.set(PROFILE_COOKIE, JSON.stringify({ name: t.user.name, email: t.user.email, role: t.user.role, avatarUrl: t.user.avatarUrl }), {
    ...base, httpOnly: false, maxAge: t.refreshExpiresInDays * 86400,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(PROFILE_COOKIE);
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

/** End-user context forwarded to the gateway (IP + UA) for bot and rate rules. */
export async function clientContext() {
  const h = await headers();
  return {
    ip: (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip'),
    userAgent: h.get('user-agent'),
    requestId: h.get('x-request-id'),
  };
}

/** Rotate tokens using the refresh cookie. Returns the new access token or null. */
export async function refreshSession(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const t = await backendRequest<TokenBundle>('auth/refresh', { method: 'POST', body: { refreshToken }, client: await clientContext() });
    await setSession(t);
    return t.accessToken;
  } catch {
    await clearSession();
    return null;
  }
}

export async function getProfileHint(): Promise<Pick<SessionUser, 'name' | 'email' | 'role' | 'avatarUrl'> | null> {
  const raw = (await cookies()).get(PROFILE_COOKIE)?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
