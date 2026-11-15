'use client';
import { useEffect, useState } from 'react';
import type { IconName } from '@/components/atoms';
import { apiFetch } from '@/lib/api/client';
import { KpiTile, type KpiTone } from './Widgets';

/**
 * One report card. Either
 *  - `query`: counted exactly by the list API (`?<query>&limit=1` → total), '' = everything, or
 *  - `compute`: worked out from the latest 100 rows (for things the API can't filter on).
 */
export interface CardSpec {
  label: string; icon: IconName; tone?: KpiTone; sub?: string;
  query?: string;
  compute?: (items: any[]) => number | string;
  format?: (n: number) => string;
}

const nf = new Intl.NumberFormat('en-AE');
export const aed = (n: number) => `AED ${nf.format(Math.round(n))}`;

/** Report cards shown on top of every admin list. Reload by changing `reloadKey`. */
export function ReportCards({ path, cards, reloadKey }: { path: string; cards: CardSpec[]; reloadKey?: unknown }) {
  const [values, setValues] = useState<(string | undefined)[]>([]);
  const [sample, setSample] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const base = path.split('?')[0];
    const baseQuery = path.includes('?') ? path.split('?')[1] : '';
    const withQ = (q: string) => `${base}?${[baseQuery, q, 'limit=1'].filter(Boolean).join('&')}`;
    const needItems = cards.some((c) => c.compute);
    (async () => {
      const items: any[] = needItems ? await apiFetch<any>(`${base}?${[baseQuery, 'limit=100'].filter(Boolean).join('&')}`).then((d) => (Array.isArray(d) ? d : d?.items ?? [])).catch(() => []) : [];
      const out = await Promise.all(cards.map(async (c) => {
        try {
          if (c.compute) { const v = c.compute(items); return typeof v === 'number' ? (c.format ?? nf.format)(v) : v; }
          const d = await apiFetch<any>(withQ(c.query ?? ''));
          const n = Array.isArray(d) ? d.length : Number(d?.total ?? 0);
          return (c.format ?? nf.format)(n);
        } catch { return '—'; }
      }));
      if (alive) { setValues(out); setSample(needItems ? items.length : null); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, reloadKey]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
      {cards.map((c, i) => (
        <KpiTile key={c.label} label={c.label} icon={c.icon} tone={c.tone}
          value={values[i] ?? '…'}
          sub={c.sub ?? (c.compute && sample !== null && sample >= 100 ? 'From the latest 100' : undefined)} />
      ))}
    </div>
  );
}

/** Common cards: total + one card per status (exact counts via the status filter). */
export function statusCards(statuses: string[], opts: { totalLabel?: string; param?: string } = {}): CardSpec[] {
  const tones: KpiTone[] = ['emerald', 'amber', 'sky', 'violet', 'rose', 'teal'];
  const icon = (s: string): IconName => /CANCEL|REJECT|FAIL|SUSPEND|ARCHIV|UNPUB/.test(s) ? 'close' : /PENDING|REQUEST|DRAFT|NEW|AWAIT|REVIEW/.test(s) ? 'clock' : /PAID|PUBLISH|APPROV|ACTIVE|CONFIRM|COMPLETE|PROCESSED|CLOSED|RESOLVED/.test(s) ? 'check' : 'tag';
  const toneOf = (s: string, i: number): KpiTone => /CANCEL|REJECT|FAIL|SUSPEND/.test(s) ? 'rose' : /PENDING|REQUEST|DRAFT|NEW|AWAIT|REVIEW/.test(s) ? 'amber' : /PAID|PUBLISH|APPROV|ACTIVE|CONFIRM|COMPLETE|PROCESSED/.test(s) ? 'emerald' : tones[i % tones.length];
  return [
    { label: opts.totalLabel ?? 'Total', icon: 'layers', tone: 'indigo', query: '' },
    ...statuses.slice(0, 4).map((s, i) => ({
      label: s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      icon: icon(s), tone: toneOf(s, i), query: `${opts.param ?? 'status'}=${s}`,
    })),
  ];
}
