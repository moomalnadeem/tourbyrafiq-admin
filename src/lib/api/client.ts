'use client';

/**
 * Browser-side API helper. It ONLY calls same-origin /api/* route handlers (the BFF).
 * There is no backend URL anywhere in client code.
 */
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

export async function apiFetch<T = any>(path: string, init: { method?: string; body?: unknown; formData?: FormData } = {}): Promise<T> {
  const res = await fetch(`/api/${path.replace(/^\//, '')}`, {
    method: init.method ?? (init.body || init.formData ? 'POST' : 'GET'),
    headers: init.formData ? undefined : { 'Content-Type': 'application/json' },
    body: init.formData ?? (init.body !== undefined ? JSON.stringify(init.body) : undefined),
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.message ?? 'Something went wrong');
  return data as T;
}
