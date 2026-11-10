'use client';
import { DataTable } from '@/components/organisms/DataTable';
import { PageTitle } from '@/components/organisms/Widgets';

/** Guide panel · Orders (guest list, pickup, phone). */
export default function Orders() {
  return (
    <>
      <PageTitle title="Orders" crumb="Orders" />
      <DataTable path="guide/orders" columns={[{ key: 'reference', label: 'Booking' }, { key: 'contactName', label: 'Lead guest' }, { key: 'contactPhone', label: 'Phone' }, { key: 'items.0.title', label: 'Tour' }, { key: 'items.0.date', label: 'Date', render: 'date' }, { key: 'guests', label: 'Guests', cell: (r) => r.items.reduce((a: number, i: any) => a + i.adults + i.children, 0) }, { key: 'pickupLocation', label: 'Pickup' }, { key: 'notes', label: 'Notes' }, { key: 'status', label: 'Status', render: 'status' }]} />
    </>
  );
}
