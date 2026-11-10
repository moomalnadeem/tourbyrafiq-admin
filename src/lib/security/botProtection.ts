/**
 * CENTRAL BOT PROTECTION (frontend edge). Mirrors backendApis/libs/common/src/security/bot-protection.ts.
 * `evaluateRequest()` runs in middleware.ts for every request, so the same rules guard every page
 * and every /api/* call before anything reaches the gateway. Search engines may crawl pages (SEO),
 * but never /api/*.
 */
export interface BotCheckResult { allowed: boolean; reason?: string; isGoodBot?: boolean }

const BAD_AGENT_PATTERNS: RegExp[] = [
  /curl\//i, /wget\//i, /python-requests/i, /python-urllib/i, /aiohttp/i, /httpx/i, /go-http-client/i, /java\//i,
  /libwww-perl/i, /scrapy/i, /okhttp/i, /node-fetch/i, /phantomjs/i, /headlesschrome/i, /selenium/i, /puppeteer/i,
  /playwright/i, /masscan/i, /nikto/i, /sqlmap/i, /nmap/i, /zgrab/i, /semrush/i, /ahrefs/i, /mj12bot/i, /dotbot/i,
];
const GOOD_BOT_PATTERNS: RegExp[] = [/googlebot/i, /bingbot/i, /duckduckbot/i, /applebot/i, /yandex/i];
const HONEYPOT_HEADER = 'x-hp-field';

export function evaluateRequest(input: { userAgent?: string | null; path: string; headers?: Headers }): BotCheckResult {
  const ua = (input.userAgent ?? '').trim();
  const isApi = input.path.startsWith('/api/');
  if (!ua || ua.length < 8) return { allowed: false, reason: 'missing-user-agent' };
  if (GOOD_BOT_PATTERNS.some((r) => r.test(ua))) return isApi ? { allowed: false, reason: 'crawler-on-api', isGoodBot: true } : { allowed: true, isGoodBot: true };
  if (BAD_AGENT_PATTERNS.some((r) => r.test(ua))) return { allowed: false, reason: 'blocked-user-agent' };
  if (input.headers?.get(HONEYPOT_HEADER)) return { allowed: false, reason: 'honeypot' };
  return { allowed: true };
}

/** Lightweight in-memory rate limiter for /api/* (per instance; use Redis/edge KV when scaling out). */
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 90, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}
