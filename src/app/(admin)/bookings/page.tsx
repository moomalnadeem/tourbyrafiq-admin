'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button, Select } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { useToast } from '@/components/organisms/Toaster';
import { useApi } from '@/components/organisms/useApi';
import { PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

const STATUSES = ['PENDING', 'AWAITING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

function Bookings() {
  const sp = useSearchParams();
  const toast = useToast();
  const { data: guides } = useApi<any>('admin/guides?limit=100');
  const [k, setK] = useState(0);
  const base = `admin/bookings${sp.get('unassigned') ? '?unassigned=true' : ''}${sp.get('q') ? `${sp.get('unassigned') ? '&' : '?'}q=${encodeURIComponent(sp.get('q')!)}` : ''}`;

  return (
    <>
      <PageTitle title="Bookings" description="All bookings across the website and app (AD2). Assign guides and update status." />
      <DataTable path={base} statuses={STATUSES} reloadKey={k} columns={[
        { key: 'reference', label: 'Booking' }, { key: 'contactName', label: 'Customer' }, { key: 'items.0.title', label: 'Product' },
        { key: 'items.0.date', label: 'Date', render: 'date' }, { key: 'paymentStatus', label: 'Payment', render: 'status' }, { key: 'guide.name', label: 'Guide' },
        { key: 'total', label: 'Total', render: 'money' },
        { key: 'status', label: 'Status', cell: (r) => (
          <Select aria-label={`Status for ${r.reference}`} value={r.status} style={{ height: 34, fontSize: 12.5, minWidth: 150 }}
            onChange={async (e) => { try { await apiFetch(`admin/bookings/${r.id}`, { method: 'PATCH', body: { status: e.target.value } }); toast('Status updated'); setK((x) => x + 1); } catch (err: any) { toast(err.message, 'error'); } }}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ').toLowerCase()}</option>)}
          </Select>) },
      ]}
      actions={(r) => (
        <Select aria-label={`Assign guide to ${r.reference}`} defaultValue="" style={{ height: 34, fontSize: 12.5, minWidth: 140 }}
          onChange={async (e) => { if (!e.target.value) return; try { await apiFetch(`admin/bookings/${r.id}/assign-guide`, { body: { guideUserId: e.target.value } }); toast('Guide assigned & notified'); setK((x) => x + 1); } catch (err: any) { toast(err.message, 'error'); } }}>
          <option value="">Assign guide…</option>
          {(guides?.items ?? []).map((g: any) => <option key={g.userId} value={g.userId}>{g.user?.name ?? g.slug}</option>)}
        </Select>
      )} />
      <Button variant="ghost" onClick={() => setK((x) => x + 1)}>Refresh</Button>
    </>
  );
}
export default function Page() { return <Suspense><Bookings /></Suspense>; }
