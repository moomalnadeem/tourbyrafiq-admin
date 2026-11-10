export const money = (v: string | number | null | undefined) =>
  Number(v ?? 0).toLocaleString('en-AE', { maximumFractionDigits: Number(v) % 1 ? 2 : 0 });

export const duration = (hours: number) => (hours >= 24 ? `${Math.round(hours / 24)} days` : `${hours % 1 ? hours : Math.round(hours)} hours`);

export const shortDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Flexible';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const titleCase = (s: string) => s.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
