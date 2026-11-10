'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ButtonLink, Icon, type IconName } from '@/components/atoms';
import { money } from '@/lib/utils/format';

const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, padding: 20 };

/** Page heading row with breadcrumb + primary actions (Figma admin header). */
export function PageTitle({ title, crumb, actions, description }: { title: string; crumb?: string; actions?: ReactNode; description?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 12.5, color: 'var(--c-muted)' }}><Link href="/">Admin</Link> › <span style={{ color: 'var(--c-brand)' }}>{crumb ?? title}</span></nav>
        <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 'clamp(26px, 3vw, 34px)' }}>{title}</h1>
        {description && <p style={{ color: 'var(--c-muted)', fontSize: 14 }}>{description}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

export function KpiTile({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: IconName }) {
  return (
    <div style={{ ...card, display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-muted)', fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', fontWeight: 600 }}>{label}<Icon name={icon} size={17} style={{ color: 'var(--c-brand)' }} /></div>
      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 30 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--c-muted)' }}>{sub}</div>}
    </div>
  );
}

/** Revenue & bookings bar chart (AD1) — dependency-free SVG, accessible table fallback. */
export function RevenueChart({ series }: { series: { day: string; revenue: number; bookings: number }[] }) {
  const max = Math.max(1, ...series.map((d) => d.revenue));
  const maxB = Math.max(1, ...series.map((d) => d.bookings));
  const w = 100 / Math.max(1, series.length);
  return (
    <figure style={{ ...card, margin: 0, display: 'grid', gap: 14 }}>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--f-serif)', fontSize: 20 }}>Revenue & bookings</span>
        <strong>AED {money(series.reduce((a, d) => a + d.revenue, 0))}</strong>
      </figcaption>
      {series.length ? (
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: 220 }} role="img" aria-label="Daily revenue and bookings for the selected period">
          {series.map((d, i) => (
            <g key={d.day}>
              <rect x={i * w + w * 0.18} y={40 - (d.revenue / max) * 36} width={w * 0.3} height={(d.revenue / max) * 36} fill="#9d613d" rx={0.4}><title>{`${new Date(d.day).toDateString()}: AED ${money(d.revenue)}`}</title></rect>
              <rect x={i * w + w * 0.52} y={40 - (d.bookings / maxB) * 30} width={w * 0.3} height={(d.bookings / maxB) * 30} fill="#e3cfae" rx={0.4}><title>{`${d.bookings} bookings`}</title></rect>
            </g>
          ))}
        </svg>
      ) : <p style={{ color: 'var(--c-muted)', padding: '48px 0', textAlign: 'center' }}>No bookings in this period yet.</p>}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--c-muted)' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#9d613d', borderRadius: 2 }} /> Revenue</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#e3cfae', borderRadius: 2 }} /> Bookings</span>
      </div>
    </figure>
  );
}

export function AttentionCard({ title, badge, rows, cta }: { title: string; badge: string; rows: [string, number | string][]; cta: { href: string; label: string } }) {
  return (
    <div style={{ ...card, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}><strong style={{ fontFamily: 'var(--f-serif)', fontSize: 19, fontWeight: 400 }}>{title}</strong><span style={{ fontSize: 11.5, background: 'var(--c-warn-bg)', color: 'var(--c-warn)', padding: '3px 10px', borderRadius: 999 }}>{badge}</span></div>
      {rows.map(([l, v]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}><span>{l}</span><strong>{v}</strong></div>)}
      <div><ButtonLink href={cta.href} size="sm" variant="outline" icon="arrow-up-right">{cta.label}</ButtonLink></div>
    </div>
  );
}

export const Card = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) => <div style={{ ...card, ...style }}>{children}</div>;
