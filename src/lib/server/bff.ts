import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { BackendError, backendRequest } from './http';
import { clientContext, getAccessToken, getRefreshToken, refreshSession } from './session';

export interface ProxyRule { method: string; pattern: RegExp; auth?: 'required' | 'optional' }

/**
 * Generic BFF proxy used by app/api/[...path]/route.ts. Only allow-listed method+path pairs are
 * forwarded; everything else is a 404, so the browser can never reach arbitrary gateway routes.
 * Uses the single central `backendRequest()` for every call.
 */
export async function proxy(req: NextRequest, segments: string[], rules: ProxyRule[]) {
  const path = segments.join('/');
  if (!/^[a-zA-Z0-9/_\-.]+$/.test(path) || path.includes('..')) return json({ message: 'Not found' }, 404);
  const rule = rules.find((r) => r.method === req.method && r.pattern.test(path));
  if (!rule) return json({ message: 'Not found' }, 404);

  let token = await getAccessToken();
  if (!token && (await getRefreshToken())) token = await refreshSession();
  if (rule.auth === 'required' && !token) return json({ message: 'Sign in required' }, 401);

  const isMultipart = (req.headers.get('content-type') ?? '').startsWith('multipart/form-data');
  let rawBody: ArrayBuffer | undefined; let body: unknown;
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    if (isMultipart) {
      const len = Number(req.headers.get('content-length') ?? 0);
      if (len > 11 * 1024 * 1024) return json({ message: 'File too large' }, 413);
      rawBody = await req.arrayBuffer();
    } else {
      body = await req.json().catch(() => ({}));
    }
  }

  try {
    const ctx = await clientContext();
    const exec = (t: string | null) => backendRequest(path, {
      method: req.method as any, query: req.nextUrl.searchParams, body, rawBody,
      contentType: isMultipart ? req.headers.get('content-type') : undefined, accessToken: t, client: ctx,
    });
    try {
      return json(await exec(token));
    } catch (e) {
      if (e instanceof BackendError && e.status === 401 && token) {
        const fresh = await refreshSession();
        if (fresh) return json(await exec(fresh));
      }
      throw e;
    }
  } catch (e) {
    if (e instanceof BackendError) return json({ message: e.message }, e.status);
    return json({ message: 'Something went wrong' }, 500);
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data ?? {}, { status, headers: { 'Cache-Control': 'no-store' } });
}
