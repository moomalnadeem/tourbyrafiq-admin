'use client';
import { DataTable } from '@/components/organisms/DataTable';
import { PageTitle } from '@/components/organisms/Widgets';

/** AD35–AD36 · Audit log (written automatically by the gateway for every admin change). */
export default function AuditLog() {
  return (
    <>
      <PageTitle title="Audit log" description="Who changed what, when and from where." />
      <DataTable path="admin/audit-log" columns={[{ key: 'createdAt', label: 'When', cell: (r) => new Date(r.createdAt).toLocaleString('en-GB') }, { key: 'actor.email', label: 'User' }, { key: 'actor.role', label: 'Role' }, { key: 'action', label: 'Action' }, { key: 'entity', label: 'Entity' }, { key: 'ip', label: 'IP' }, { key: 'after', label: 'Change', cell: (r) => <details><summary>View</summary><pre style={{ maxWidth: 360, whiteSpace: 'pre-wrap', fontSize: 11 }}>{JSON.stringify(r.after, null, 2)}</pre></details> }]} />
    </>
  );
}
