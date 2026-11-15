'use client';
import { DataTable } from '@/components/organisms/DataTable';
import { ReportCards } from '@/components/organisms/ReportCards';
import { PageTitle } from '@/components/organisms/Widgets';

/** AD37 · Login history. */
export default function LoginHistory() {
  return (
    <>
      <PageTitle title="Login history" />
      <ReportCards path={'admin/login-history'} cards={[
          { label: 'Total sign-ins', icon: 'logout', tone: 'indigo', query: '' },
          { label: 'Today', icon: 'calendar', tone: 'emerald', compute: (i) => i.filter((x) => new Date(x.createdAt).toDateString() === new Date().toDateString()).length },
          { label: 'Last 7 days', icon: 'clock', tone: 'sky', compute: (i) => i.filter((x) => Date.now() - new Date(x.createdAt).getTime() < 7 * 864e5).length },
          { label: 'Unique people', icon: 'users', tone: 'violet', compute: (i) => new Set(i.map((x) => x.user?.email).filter(Boolean)).size },
        ]} />
      <DataTable path="admin/login-history" columns={[{ key: 'createdAt', label: 'When', cell: (r) => new Date(r.createdAt).toLocaleString('en-GB') }, { key: 'user.email', label: 'User' }, { key: 'user.role', label: 'Role' }, { key: 'ip', label: 'IP' }, { key: 'userAgent', label: 'Device', cell: (r) => <span style={{ display: 'block', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.userAgent}</span> }]} />
    </>
  );
}
