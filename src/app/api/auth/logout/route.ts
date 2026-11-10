import { json } from '@/lib/server/bff';
import { backendRequest } from '@/lib/server/http';
import { clearSession, getRefreshToken } from '@/lib/server/session';

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) await backendRequest('auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => undefined);
  await clearSession();
  return json({ ok: true });
}
