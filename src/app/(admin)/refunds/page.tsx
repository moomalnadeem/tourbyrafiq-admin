'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { useToast } from '@/components/organisms/Toaster';
import { PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** AD4 · Refunds & cancellations (approve → provider refund + T10 email). */
export default function Refunds() {
  const toast = useToast(); const [k, setK] = useState(0);
  const decide = async (id: string, approve: boolean) => {
    if (!confirm(approve ? 'Approve and send this refund to the customer’s card?' : 'Reject this refund request?')) return;
    try { await apiFetch(`admin/refunds/${id}/decision`, { body: { approve } }); toast(approve ? 'Refund processed' : 'Refund rejected'); setK((x) => x + 1); } catch (e: any) { toast(e.message, 'error'); }
  };
  return (
    <>
      <PageTitle title="Refunds & cancellations" description="Refunds are calculated from the cancellation policy and need approval." />
      <DataTable path="admin/refunds" statuses={['REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSED']} reloadKey={k}
        columns={[{ key: 'booking.reference', label: 'Booking' }, { key: 'booking.contactName', label: 'Customer' }, { key: 'reason', label: 'Reason' }, { key: 'createdAt', label: 'Requested', render: 'date' }, { key: 'amount', label: 'Refund', render: 'money' }, { key: 'status', label: 'Status', render: 'status' }]}
        actions={(r) => r.status === 'REQUESTED' ? <div style={{ display: 'flex', gap: 6 }}><Button size="sm" onClick={() => decide(r.id, true)}>Approve</Button><Button size="sm" variant="outline" onClick={() => decide(r.id, false)}>Reject</Button></div> : null} />
    </>
  );
}
