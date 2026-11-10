'use client';
import { DataTable } from '@/components/organisms/DataTable';
import { PageTitle } from '@/components/organisms/Widgets';

/** AD37 · Login history. */
export default function LoginHistory() {
  return (
    <>
      <PageTitle title="Login history" />
      <DataTable path="admin/login-history" columns={[{ key: 'createdAt', label: 'When', cell: (r) => new Date(r.createdAt).toLocaleString('en-GB') }, { key: 'user.email', label: 'User' }, { key: 'user.role', label: 'Role' }, { key: 'ip', label: 'IP' }, { key: 'userAgent', label: 'Device', cell: (r) => <span style={{ display: 'block', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.userAgent}</span> }]} />
    </>
  );
}
