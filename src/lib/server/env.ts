import 'server-only';

/**
 * Server-only environment. Nothing here is prefixed NEXT_PUBLIC_, so none of it can reach
 * the browser bundle. The backend URL and API key stay on the server.
 */
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

export const serverEnv = {
  get backendUrl() { return required('BACKEND_API_URL').replace(/\/$/, ''); },
  get apiKey() { return required('BACKEND_API_KEY'); },
  get portal() { return (process.env.AUTH_PORTAL ?? 'web') as 'web' | 'admin' | 'guide' | 'app'; },
  get cookieSecure() { return process.env.NODE_ENV === 'production'; },
  get timeoutMs() { return Number(process.env.BACKEND_TIMEOUT_MS ?? 12000); },
};
