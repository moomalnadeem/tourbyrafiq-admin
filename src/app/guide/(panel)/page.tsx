'use client';
import Link from 'next/link';
import { DataTable } from '@/components/organisms/DataTable';
import { useApi } from '@/components/organisms/useApi';
import { KpiTile, PageTitle } from '@/components/organisms/Widgets';
import { money } from '@/lib/utils/format';

/** Guide panel · Dashboard. */
export default function GuideHome() {
  const { data: e } = useApi<any>('guide/earnings');
  const { data: o } = useApi<any>('guide/orders?limit=1');
  return (
    <>
      <PageTitle title="Welcome back" crumb="Dashboard" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <KpiTile label="Open orders" value={String(o?.total ?? '—')} icon="ticket" />
        <KpiTile label="Completed tours" value={String(e?.completedTours ?? '—')} icon="check" />
        <KpiTile label="Balance" value={`AED ${money(e?.balance ?? 0)}`} icon="tag" sub={`AED ${money(e?.paid ?? 0)} paid out`} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 26 }}>Upcoming orders</h2><Link href="/guide/orders" style={{ color: 'var(--c-brand)', fontWeight: 600 }}>All orders ↗</Link></div>
      <DataTable path="guide/orders" columns={[{ key: 'reference', label: 'Booking' }, { key: 'contactName', label: 'Lead guest' }, { key: 'items.0.title', label: 'Tour' }, { key: 'items.0.date', label: 'Date', render: 'date' }, { key: 'pickupLocation', label: 'Pickup' }, { key: 'status', label: 'Status', render: 'status' }]} />
    </>
  );
}
