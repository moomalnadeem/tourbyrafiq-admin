'use client';
import { DataTable } from '@/components/organisms/DataTable';
import { PageTitle } from '@/components/organisms/Widgets';

/** AD3 · Payments. */
export default function Payments() {
  return (
    <>
      <PageTitle title="Payments" description="Every payment attempt, with provider reference." />
      <DataTable path="admin/payments" columns={[{ key: 'booking.reference', label: 'Booking' }, { key: 'booking.contactName', label: 'Customer' }, { key: 'method', label: 'Method' }, { key: 'providerRef', label: 'Provider ref' }, { key: 'createdAt', label: 'Date', render: 'date' }, { key: 'amount', label: 'Amount', render: 'money' }, { key: 'status', label: 'Status', render: 'status' }]} />
    </>
  );
}
