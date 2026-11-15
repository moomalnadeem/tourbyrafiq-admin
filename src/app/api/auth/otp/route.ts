import { NextRequest } from 'next/server';
import { json, portalRole } from '@/lib/server/bff';
import { BackendError, backendRequest } from '@/lib/server/http';
import { clientContext } from '@/lib/server/session';

const PORTALS = ['admin', 'guide'];

export async function POST(req: NextRequest) {
  const { email, portal, accountType } = await req.json().catch(() => ({}));
  if (!PORTALS.includes(portal)) return json({ message: 'Invalid portal' }, 400);
  const role = portalRole(portal, accountType);
  if (portal === 'admin' && !role) return json({ message: 'Please select your role' }, 400);
  try {
    return json(await backendRequest('auth/otp/request', { method: 'POST', body: { email, portal, ...(role ? { accountType: role } : {}) }, client: await clientContext() }));
  } catch (e) {
    return json({ message: e instanceof BackendError ? e.message : 'Could not send code' }, e instanceof BackendError ? e.status : 500);
  }
}
