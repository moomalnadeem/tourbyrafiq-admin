'use client';
import { DataTable } from '@/components/organisms/DataTable';
import { ReportCards, aed } from '@/components/organisms/ReportCards';
import { PageTitle } from '@/components/organisms/Widgets';

/** AD3 · Payments. */
export default function Payments() {
  return (
    <>
      <PageTitle title="Payments" description="Every payment attempt, with provider reference." />
      <ReportCards path={'admin/payments'} cards={[
          { label: 'Payment attempts', icon: 'tag', tone: 'indigo', query: '' },
          { label: 'Paid', icon: 'check', tone: 'emerald', compute: (i) => i.filter((x) => x.status === 'PAID').length },
          { label: 'Failed', icon: 'close', tone: 'rose', compute: (i) => i.filter((x) => x.status === 'FAILED').length },
          { label: 'Collected', icon: 'tag', tone: 'teal', compute: (i) => i.filter((x) => x.status === 'PAID').reduce((s, x) => s + Number(x.amount), 0), format: aed },
        ]} />
      <DataTable path="admin/payments" columns={[{ key: 'booking.reference', label: 'Booking' }, { key: 'booking.contactName', label: 'Customer' }, { key: 'method', label: 'Method' }, { key: 'providerRef', label: 'Provider ref' }, { key: 'createdAt', label: 'Date', render: 'date' }, { key: 'amount', label: 'Amount', render: 'money' }, { key: 'status', label: 'Status', render: 'status' }]} />
    </>
  );
}
