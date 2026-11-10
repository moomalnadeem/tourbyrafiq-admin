import type { NextConfig } from 'next';

const cdnHost = process.env.CDN_HOSTNAME ?? '';

// Next.js dev mode (React Refresh) needs eval; production builds never allow it.
const devEval = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `img-src 'self' data: blob: https://${cdnHost}`,
      `script-src 'self' 'unsafe-inline'${devEval}`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self'", // the browser can only talk to this BFF — never to the API gateway
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const config: NextConfig = {
  output: 'standalone',
  basePath: process.env.ADMIN_BASE_PATH || undefined,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: cdnHost ? [{ protocol: 'https', hostname: cdnHost, pathname: '/storage/v1/object/public/**' }] : [],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default config;
// Admin is never indexed: see app/robots.ts and the X-Robots-Tag header added in middleware.
