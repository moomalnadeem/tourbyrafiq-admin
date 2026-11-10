import { NextRequest } from 'next/server';
import { json } from '@/lib/server/bff';
import { BackendError, backendRequest } from '@/lib/server/http';
import { clientContext, setSession, TokenBundle } from '@/lib/server/session';

export async function POST(req: NextRequest) {
  const { email, code, portal } = await req.json().catch(() => ({}));
  if (!['admin', 'guide'].includes(portal)) return json({ message: 'Invalid portal' }, 400);
  try {
    const t = await backendRequest<TokenBundle>('auth/otp/verify', { method: 'POST', body: { email, code, portal }, client: await clientContext() });
    await setSession(t);
    return json({ user: t.user });
  } catch (e) {
    return json({ message: e instanceof BackendError ? e.message : 'Could not verify code' }, e instanceof BackendError ? e.status : 500);
  }
}
