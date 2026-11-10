'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { useToast } from '@/components/organisms/Toaster';
import { PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** AD23 · Customers. Suspending revokes all sessions. */
export default function Customers() {
  const toast = useToast(); const [k, setK] = useState(0);
  return (
    <>
      <PageTitle title="Customers" />
      <DataTable path="admin/customers" statuses={['ACTIVE', 'SUSPENDED']} reloadKey={k}
        columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: '_count.bookings', label: 'Bookings' }, { key: 'lastLoginAt', label: 'Last sign-in', render: 'date' }, { key: 'status', label: 'Status', render: 'status' }]}
        actions={(r) => <Button size="sm" variant="outline" onClick={async () => { const status = r.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'; if (!confirm(`${status === 'SUSPENDED' ? 'Suspend' : 'Reactivate'} ${r.email}?`)) return; try { await apiFetch(`admin/users/${r.id}/status`, { method: 'PATCH', body: { status } }); toast('Updated'); setK((x) => x + 1); } catch (e: any) { toast(e.message, 'error'); } }}>{r.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}</Button>} />
    </>
  );
}
