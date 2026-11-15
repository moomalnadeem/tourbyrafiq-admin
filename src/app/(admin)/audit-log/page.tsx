'use client';
import { DataTable } from '@/components/organisms/DataTable';
import { ReportCards } from '@/components/organisms/ReportCards';
import { PageTitle } from '@/components/organisms/Widgets';

/** AD35–AD36 · Audit log (written automatically by the gateway for every admin change). */
export default function AuditLog() {
  return (
    <>
      <PageTitle title="Audit log" description="Who changed what, when and from where." />
      <ReportCards path={'admin/audit-log'} cards={[
          { label: 'Total changes', icon: 'copy', tone: 'indigo', query: '' },
          { label: 'Today', icon: 'calendar', tone: 'emerald', compute: (i) => i.filter((x) => new Date(x.createdAt).toDateString() === new Date().toDateString()).length },
          { label: 'People', icon: 'users', tone: 'violet', compute: (i) => new Set(i.map((x) => x.actor?.email).filter(Boolean)).size },
          { label: 'Areas changed', icon: 'filter', tone: 'teal', compute: (i) => new Set(i.map((x) => x.entity)).size },
        ]} />
      <DataTable path="admin/audit-log" columns={[{ key: 'createdAt', label: 'When', cell: (r) => new Date(r.createdAt).toLocaleString('en-GB') }, { key: 'actor.email', label: 'User' }, { key: 'actor.assignedRole.name', label: 'Role' }, { key: 'action', label: 'Action' }, { key: 'entity', label: 'Entity' }, { key: 'ip', label: 'IP' }, { key: 'after', label: 'Change', cell: (r) => <details><summary>View</summary><pre style={{ maxWidth: 360, whiteSpace: 'pre-wrap', fontSize: 11 }}>{JSON.stringify(r.after, null, 2)}</pre></details> }]} />
    </>
  );
}
