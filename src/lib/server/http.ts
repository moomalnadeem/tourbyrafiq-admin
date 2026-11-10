import 'server-only';
import { serverEnv } from './env';

/**
 * CENTRAL BACKEND REQUEST FUNCTION (server-side only).
 * Every call from this Next.js app to the API gateway goes through `backendRequest()`:
 * server components, server actions and the /api/* BFF route handlers. It attaches the API key,
 * the user's token, the end user's IP + user-agent (for the gateway's bot/rate rules), applies a
 * timeout, and normalises errors. The browser never learns the backend URL.
 */
export class BackendError extends Error {
  constructor(public status: number, message: string, public body?: unknown) { super(message); }
}

export interface BackendRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  rawBody?: BodyInit;
  contentType?: string | null;
  accessToken?: string | null;
  query?: Record<string, string | number | boolean | undefined | null> | URLSearchParams;
  client?: { ip?: string | null; userAgent?: string | null; requestId?: string | null };
  /** Next.js cache: seconds to revalidate (GET only). 0 = no-store. */
  revalidate?: number;
  tags?: string[];
}

export async function backendRequest<T = unknown>(path: string, opts: BackendRequestOptions = {}): Promise<T> {
  const url = new URL(`${serverEnv.backendUrl}/v1/${path.replace(/^\//, '')}`);
  if (opts.query) {
    const entries = opts.query instanceof URLSearchParams ? opts.query.entries() : Object.entries(opts.query);
    for (const [k, v] of entries) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-api-key': serverEnv.apiKey,
    'User-Agent': 'tourguide-bff/1.0 (Mozilla/5.0 compatible; Next.js)',
    'x-client-user-agent': (opts.client?.userAgent ?? 'Mozilla/5.0 (server-render) Next.js').slice(0, 400),
  };
  if (opts.client?.ip) headers['x-client-ip'] = opts.client.ip;
  if (opts.client?.requestId) headers['x-request-id'] = opts.client.requestId;
  if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`;
  let body: BodyInit | undefined;
  if (opts.rawBody !== undefined) {
    body = opts.rawBody;
    if (opts.contentType) headers['Content-Type'] = opts.contentType;
  } else if (opts.body !== undefined) {
    body = JSON.stringify(opts.body);
    headers['Content-Type'] = 'application/json';
  }

  const method = opts.method ?? 'GET';
  const cacheable = method === 'GET' && !opts.accessToken && (opts.revalidate ?? 0) > 0;

  let res: Response;
  try {
    res = await fetch(url, {
      method, headers, body,
      signal: AbortSignal.timeout(serverEnv.timeoutMs),
      ...(cacheable ? { next: { revalidate: opts.revalidate, tags: opts.tags } } : { cache: 'no-store' as const }),
    });
  } catch (e: any) {
    throw new BackendError(e?.name === 'TimeoutError' ? 504 : 502, 'Service temporarily unavailable');
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const message = (data as any)?.message;
    throw new BackendError(res.status, Array.isArray(message) ? message.join(', ') : message ?? res.statusText, data);
  }
  return data as T;
}

function safeJson(t: string) {
  try { return JSON.parse(t); } catch { return t; }
}
