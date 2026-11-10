import { NextRequest } from 'next/server';
import { proxy, ProxyRule } from '@/lib/server/bff';

/**
 * Admin BFF allow-list. Admin/staff routes and guide-panel routes only — public website routes are
 * not exposed here. Role/permission checks are enforced again by the gateway on every call.
 */
const RULES: ProxyRule[] = [
  { method: 'GET', pattern: /^auth\/me$/, auth: 'required' },
  ...(['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const).map((method) => ({ method, pattern: /^(admin|guide)\/[\w\-/]+$/, auth: 'required' as const })),
  { method: 'POST', pattern: /^media$/, auth: 'required' },
  { method: 'GET', pattern: /^media\/[\w-]+\/signed-url$/, auth: 'required' },
  { method: 'GET', pattern: /^bookings\/TBR-\d{5}$/, auth: 'required' },
  { method: 'GET', pattern: /^catalog\/(emirates|categories|destinations)$/ },
  { method: 'GET', pattern: /^catalog\/tours\/[\w-]+\/availability$/, auth: 'required' },
];

type Ctx = { params: Promise<{ path: string[] }> };
const handler = async (req: NextRequest, { params }: Ctx) => proxy(req, (await params).path, RULES);
export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
