'use client';
import Link from 'next/link';
import { ButtonLink } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { useApi } from '@/components/organisms/useApi';
import { AttentionCard, KpiTile, PageTitle, RevenueChart } from '@/components/organisms/Widgets';
import { money } from '@/lib/utils/format';

/** AD1 · Dashboard. */
export default function Dashboard() {
  const { data: st } = useApi<any>('admin/dashboard/stats?days=30');
  const hour = new Date().getHours();
  return (
    <>
      <PageTitle title={`Good ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}`} crumb="Dashboard"
        description={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' · Dubai (GST)'}
        actions={<><ButtonLink href="/bookings" variant="outline" iconLeft="plus">New booking</ButtonLink><ButtonLink href="/catalog/tours/new" iconLeft="plus">Add tour</ButtonLink></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <KpiTile label="Revenue · 30 days" value={`AED ${money(st?.revenue ?? 0)}`} icon="tag" sub="Paid bookings" />
        <KpiTile label="Bookings" value={String(st?.bookings ?? '—')} icon="ticket" sub={`${st?.bookingsToday ?? 0} today`} />
        <KpiTile label="Active guides" value={String(st?.activeGuides ?? '—')} icon="users" sub={`${st?.pendingGuides ?? 0} pending approval`} />
        <KpiTile label="Avg rating" value={st?.avgRating ? String(st.avgRating) : '—'} icon="star" sub={`${st?.reviewCount ?? 0} reviews`} />
      </div>
      <RevenueChart series={st?.series ?? []} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <AttentionCard title="Needs attention" badge="Urgent" rows={[['Orders without a guide', st?.attention?.unassigned ?? 0], ['Refunds to approve', st?.attention?.refundsPending ?? 0], ['Failed payments (24 h)', st?.attention?.failedPayments ?? 0]]} cta={{ href: '/refunds', label: 'Review' }} />
        <AttentionCard title="Content review" badge="Pending approval" rows={[['Guide media uploads', '→'], ['New reviews to moderate', '→']]} cta={{ href: '/media', label: 'Open queue' }} />
        <AttentionCard title="Today’s operations" badge="Online" rows={[['Bookings today', st?.bookingsToday ?? 0], ['Unassigned orders', st?.attention?.unassigned ?? 0]]} cta={{ href: '/bookings?unassigned=true', label: 'Live board' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h2 style={{ fontFamily: 'var(--f-serif)', fontSize: 28 }}>Recent bookings</h2><Link href="/bookings" style={{ color: 'var(--c-brand)', fontWeight: 600, fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase' }}>All bookings ↗</Link></div>
      <DataTable path="admin/bookings?limit=5" columns={[
        { key: 'reference', label: 'Booking', cell: (r) => <Link href={`/bookings?q=${r.reference}`} style={{ color: 'var(--c-brand)', textDecoration: 'underline', fontWeight: 600 }}>{r.reference}</Link> },
        { key: 'contactName', label: 'Customer' }, { key: 'items.0.title', label: 'Product' }, { key: 'items.0.date', label: 'Date', render: 'date' },
        { key: 'paymentStatus', label: 'Payment', render: 'status' }, { key: 'status', label: 'Status', render: 'status' }, { key: 'total', label: 'Total', render: 'money' },
      ]} />
    </>
  );
}
