import type { SVGProps } from 'react';

/** Single icon atom (currentColor). Paths for search/heart/clock/users/arrows/chevron come from Figma. */
const PATHS: Record<string, { vb: number; d: string[]; fill?: boolean }> = {
  search: { vb: 20, d: ['M15 9.17A5.83 5.83 0 1 1 3.33 9.17a5.83 5.83 0 0 1 11.67 0Z', 'M16.67 16.67 13.75 13.75'] },
  heart: { vb: 18, d: ['M13.35 10.2c1.05-1.05 2.03-2.25 2.03-3.83a3.68 3.68 0 0 0-3.68-3.67c-1.2 0-2.03.38-3 1.35-.98-.97-1.8-1.35-3-1.35a3.68 3.68 0 0 0-3.68 3.67c0 1.58.98 2.78 2.03 3.83l4.65 4.65 4.65-4.65Z'] },
  clock: { vb: 14, d: ['M12.25 7A5.25 5.25 0 1 1 1.75 7a5.25 5.25 0 0 1 10.5 0Z', 'M7 4.08V7l1.75 1.17'] },
  users: { vb: 14, d: ['M7.29 4.67a2.04 2.04 0 1 1-4.08 0 2.04 2.04 0 0 1 4.08 0Z', 'M1.75 11.67a3.5 3.5 0 0 1 7 0M9.33 2.63a2.04 2.04 0 0 1 0 4.08M12.25 11.67a3.5 3.5 0 0 0-2.33-3.27'] },
  'arrow-up-right': { vb: 14, d: ['M4.08 9.92 9.92 4.08M9.92 9.33V4.08H4.67'] },
  'chevron-left': { vb: 18, d: ['M11.25 4.5 6.75 9l4.5 4.5'] },
  'chevron-right': { vb: 18, d: ['M6.75 4.5 11.25 9l-4.5 4.5'] },
  'chevron-down': { vb: 14, d: ['M3.5 5.25 7 8.75l3.5-3.5'] },
  close: { vb: 24, d: ['M6 6l12 12M18 6 6 18'] },
  menu: { vb: 24, d: ['M4 7h16M4 12h16M4 17h16'] },
  pin: { vb: 24, d: ['M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z', 'M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'] },
  calendar: { vb: 24, d: ['M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z', 'M4 10h16M8 3v4M16 3v4'] },
  star: { vb: 24, d: ['m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z'], fill: true },
  check: { vb: 24, d: ['m5 12.5 4.5 4.5L19 7.5'] },
  plus: { vb: 24, d: ['M12 5v14M5 12h14'] },
  minus: { vb: 24, d: ['M5 12h14'] },
  bell: { vb: 24, d: ['M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Z', 'M10 20a2 2 0 0 0 4 0'] },
  home: { vb: 24, d: ['M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8Z'] },
  compass: { vb: 24, d: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm15.5 8.5-2 5-5 2 2-5 5-2Z'] },
  tag: { vb: 24, d: ['M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z', 'M8 8.01V8'] },
  user: { vb: 24, d: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'] },
  ticket: { vb: 24, d: ['M3 9a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4V9Z', 'M14 7v12'] },
  filter: { vb: 24, d: ['M4 6h16M7 12h10M10 18h4'] },
  trash: { vb: 24, d: ['M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13'] },
  copy: { vb: 24, d: ['M9 9h11v11H9z', 'M5 15H4V4h11v1'] },
  mail: { vb: 24, d: ['M4 6h16v12H4z', 'm4 7 8 6 8-6'] },
  phone: { vb: 24, d: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z'] },
  shield: { vb: 24, d: ['M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z', 'm9 12 2 2 4-4'] },
  globe: { vb: 24, d: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z'] },
  logout: { vb: 24, d: ['M15 4h4v16h-4', 'M10 8l-4 4 4 4M6 12h10'] },
  upload: { vb: 24, d: ['M12 16V4M7 9l5-5 5 5', 'M4 16v4h16v-4'] },
  car: { vb: 24, d: ['M5 16V11l2-5h10l2 5v5', 'M3 16h18v3H3z', 'M7 19v2M17 19v2'] },
  bed: { vb: 24, d: ['M3 18V7M3 13h18v5M21 18v-4a3 3 0 0 0-3-3h-7v2'] },
  gift: { vb: 24, d: ['M4 10h16v10H4z', 'M3 7h18v3H3zM12 7v13', 'M12 7c-2-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3-2-5 1'] },
  chat: { vb: 24, d: ['M4 5h16v11H8l-4 4V5Z'] },
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, strokeWidth = 1.6, title, ...rest }: { name: IconName; size?: number; strokeWidth?: number; title?: string } & SVGProps<SVGSVGElement>) {
  const p = PATHS[name];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${p.vb} ${p.vb}`} fill={p.fill ? 'currentColor' : 'none'} stroke={p.fill ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth * (p.vb / 24)} strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} {...rest}>
      {title ? <title>{title}</title> : null}
      {p.d.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
