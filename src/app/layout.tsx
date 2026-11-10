import type { Metadata, Viewport } from 'next';
import { Figtree, Playfair_Display } from 'next/font/google';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/organisms/Toaster';
import '@/styles/globals.css';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = { title: { default: 'Admin · Tours By Rafiq', template: '%s · Admin · Tours By Rafiq' }, robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#1e1714' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${figtree.variable} ${playfair.variable}`}><body style={{ paddingBottom: 0 }}><ToastProvider>{children}</ToastProvider></body></html>;
}
