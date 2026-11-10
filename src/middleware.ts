import { NextRequest, NextResponse } from 'next/server';
import { evaluateRequest, rateLimit } from '@/lib/security/botProtection';

const PUBLIC = ['/robots.txt', '/login', '/guide/login', '/api/auth/otp', '/api/auth/verify'];

/** Admin edge guard: bot rules → rate limit → same-origin writes → session required everywhere else. */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const verdict = evaluateRequest({ userAgent: req.headers.get('user-agent'), path: pathname, headers: req.headers });
  // Admin is private: block crawlers entirely, not only on /api.
  if (!verdict.allowed || verdict.isGoodBot) return new NextResponse('Forbidden', { status: 403 });

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
  if (pathname.startsWith('/api/') && !rateLimit(`${ip}:admin`, pathname.startsWith('/api/auth') ? 15 : 240)) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
  if (pathname.startsWith('/api/') && req.method !== 'GET') {
    const origin = req.headers.get('origin');
    if (origin && new URL(origin).host !== req.headers.get('host')) return NextResponse.json({ message: 'Cross-site request blocked' }, { status: 403 });
  }

  const signedIn = req.cookies.has('tga_at') || req.cookies.has('tga_rt');
  if (!signedIn && !PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ message: 'Sign in required' }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith('/guide') ? '/guide/login' : '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'] };
