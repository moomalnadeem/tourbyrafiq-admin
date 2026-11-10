'use client';
import { useState } from 'react';
import { Select } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { useToast } from '@/components/organisms/Toaster';
import { PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** AD26 · Guide payouts. */
export default function Payouts() {
  const toast = useToast(); const [k, setK] = useState(0);
  return (
    <>
      <PageTitle title="Payouts" />
      <DataTable path="admin/payouts" statuses={['PENDING', 'PROCESSING', 'PAID', 'FAILED']} reloadKey={k}
        columns={[{ key: 'guide.user.name', label: 'Guide' }, { key: 'periodStart', label: 'From', render: 'date' }, { key: 'periodEnd', label: 'To', render: 'date' }, { key: 'amount', label: 'Amount', render: 'money' }, { key: 'status', label: 'Status', render: 'status' }]}
        actions={(r) => <Select aria-label="Update payout" defaultValue="" style={{ height: 34, fontSize: 12.5 }} onChange={async (e) => { if (!e.target.value) return; try { await apiFetch(`admin/payouts/${r.id}`, { method: 'PATCH', body: { status: e.target.value } }); toast('Payout updated'); setK((x) => x + 1); } catch (err: any) { toast(err.message, 'error'); } }}><option value="">Update…</option><option>PROCESSING</option><option>PAID</option><option>FAILED</option></Select>} />
    </>
  );
}
