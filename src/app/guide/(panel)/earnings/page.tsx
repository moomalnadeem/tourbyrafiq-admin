'use client';
import { Price, StatusPill, toneFor } from '@/components/atoms';
import { useApi } from '@/components/organisms/useApi';
import { Card, KpiTile, PageTitle } from '@/components/organisms/Widgets';
import { money, shortDate } from '@/lib/utils/format';

/** Guide panel · Earnings & payouts. */
export default function Earnings() {
  const { data: e } = useApi<any>('guide/earnings');
  return (
    <>
      <PageTitle title="Earnings" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <KpiTile label="Earned" value={`AED ${money(e?.gross ?? 0)}`} icon="tag" sub={`${e?.completedTours ?? 0} completed tours`} />
        <KpiTile label="Paid out" value={`AED ${money(e?.paid ?? 0)}`} icon="check" />
        <KpiTile label="Balance" value={`AED ${money(e?.balance ?? 0)}`} icon="gift" />
      </div>
      <Card style={{ display: 'grid', gap: 10 }}>
        <strong>Payouts</strong>
        {(e?.payouts ?? []).map((p: any) => <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderTop: '1px solid var(--c-line)', paddingTop: 10 }}><span>{shortDate(p.periodStart)} – {shortDate(p.periodEnd)}</span><span style={{ display: 'flex', gap: 10 }}><StatusPill tone={toneFor(p.status)}>{p.status.toLowerCase()}</StatusPill><Price amount={p.amount} size="sm" /></span></div>)}
        {e && !e.payouts?.length && <p style={{ color: 'var(--c-muted)' }}>No payouts yet.</p>}
      </Card>
    </>
  );
}
