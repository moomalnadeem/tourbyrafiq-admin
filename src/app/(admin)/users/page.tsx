'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Icon } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { ReportCards } from '@/components/organisms/ReportCards';
import { Avatar, ROLE_KEYS, ROLE_META, RoleBadge } from '@/components/organisms/users/RoleBadge';
import { UserStatusPill } from '@/components/organisms/users/userStatus';
import { PageTitle } from '@/components/organisms/Widgets';
import { useCurrentUser } from '@/components/organisms/useCurrentUser';
import { ButtonLink } from '@/components/atoms';

const when = (d?: string) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

/** Admin · Users → All users: every account of every role. */
function AllUsers() {
  const router = useRouter();
  const sp = useSearchParams();
  const me = useCurrentUser();
  const [role, setRole] = useState(sp.get('role') ?? '');
  const path = `admin/users${role ? `?role=${role}` : ''}`;
  return (
    <>
      <PageTitle title="All users" description="Every account on the platform — tourists, companies, tour guides and staff. Each email holds exactly one role."
        actions={me.role === 'SUPER_ADMIN' ? <ButtonLink href="/users/new" iconLeft="plus">Add user</ButtonLink> : undefined} />
      <ReportCards path="admin/users" cards={[
        { label: 'Total users', icon: 'users', tone: 'indigo', query: '' },
        { label: 'Tourists', icon: 'user', tone: 'sky', query: 'role=TOURIST' },
        { label: 'Companies', icon: 'shield', tone: 'violet', query: 'role=COMPANY' },
        { label: 'Tour guides', icon: 'compass', tone: 'teal', query: 'role=GUIDE' },
        { label: 'Staff', icon: 'shield', tone: 'amber', query: 'role=STAFF' },
        { label: 'Waiting for approval', icon: 'clock', tone: 'amber', query: 'status=PENDING_APPROVAL' },
        { label: 'Blocked', icon: 'close', tone: 'rose', query: 'status=SUSPENDED' },
      ]} />
      <DataTable
        path={path}
        statuses={['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED']}
        statusLabels={{ ACTIVE: 'Active', PENDING_APPROVAL: 'Waiting for approval', SUSPENDED: 'Blocked' }}
        extraFilters={(
          <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
            <option value="">All roles</option>
            <option value="STAFF">All staff</option>
            {ROLE_KEYS.map((k) => <option key={k} value={k}>{ROLE_META[k].label}</option>)}
          </select>
        )}
        onRowClick={(r) => router.push(`/users/${r.id}`)}
        columns={[
          {
            key: 'name', label: 'User',
            cell: (r) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 240 }}>
                <Avatar user={r} />
                <div style={{ display: 'grid', minWidth: 0 }}>
                  <strong style={{ fontWeight: 600 }}>{r.name || r.companyName || '—'}</strong>
                  <span style={{ fontSize: 12.5, color: 'var(--c-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.email}</span>
                </div>
              </div>
            ),
          },
          { key: 'role', label: 'Role', cell: (r) => <RoleBadge role={r.role} name={r.roleName} /> },
          { key: 'companyName', label: 'Company / phone', cell: (r) => <span style={{ fontSize: 13 }}>{r.companyName || r.phone || <span style={{ color: 'var(--c-faint)' }}>—</span>}</span> },
          { key: 'status', label: 'Status', cell: (r) => <UserStatusPill status={r.status} /> },
          { key: '_count.bookings', label: 'Bookings', cell: (r) => <strong style={{ color: r._count?.bookings ? 'var(--a-teal)' : 'var(--c-faint)' }}>{r._count?.bookings ?? 0}</strong> },
          { key: 'lastLoginAt', label: 'Last sign-in', cell: (r) => <span style={{ fontSize: 13, color: 'var(--c-muted)' }}>{when(r.lastLoginAt)}</span> },
          { key: 'createdAt', label: 'Joined', cell: (r) => <span style={{ fontSize: 13, color: 'var(--c-muted)' }}>{when(r.createdAt)}</span> },
        ]}
        actions={(r) => (
          <Link href={`/users/${r.id}`} title="View details" aria-label={`View ${r.email}`} style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 10, border: '1px solid var(--a-sky-bg)', background: '#f0f9ff', color: 'var(--a-sky)' }}>
            <Icon name="eye" size={16} />
          </Link>
        )}
      />
    </>
  );
}

export default function AllUsersPage() { return <Suspense fallback={null}><AllUsers /></Suspense>; }
