import Link from 'next/link';
import s from './Logo.module.css';

/** Brand logo rendered through the Figma logo mask so it can be brand-coloured or white. */
export function Logo({ width = 136, color, href = '/' }: { width?: number; color?: string; href?: string | null }) {
  const el = <span className={s.logo} style={{ width, height: width * 0.4124, ['--logo-color' as any]: color }} role="img" aria-label="Tours By Rafiq" />;
  return href ? <Link href={href} aria-label="Tours By Rafiq — home">{el}</Link> : el;
}
