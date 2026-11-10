'use client';
import { useState } from 'react';
import { Button, FormField, Input, Select } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { useToast } from '@/components/organisms/Toaster';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

const ROLES = ['EDITOR', 'SUPPORT', 'FINANCE', 'ADMIN', 'SUPER_ADMIN', 'TOURIST'];

/** AD30 / AD39 · Users & roles. */
export default function Staff() {
  const toast = useToast(); const [k, setK] = useState(0);
  const [f, setF] = useState({ email: '', name: '', role: 'EDITOR' });
  return (
    <>
      <PageTitle title="Users & roles" description="Invite staff by email; they sign in with a one-time code." />
      <Card>
        <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, alignItems: 'end' }} onSubmit={async (e) => { e.preventDefault(); try { await apiFetch('admin/staff', { body: f }); toast('User invited'); setF({ ...f, email: '', name: '' }); setK((x) => x + 1); } catch (err: any) { toast(err.message, 'error'); } }}>
          <FormField label="Name">{(id) => <Input id={id} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</FormField>
          <FormField label="Email">{(id) => <Input id={id} type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />}</FormField>
          <FormField label="Role">{(id) => <Select id={id} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{ROLES.slice(0, 5).map((r) => <option key={r}>{r}</option>)}</Select>}</FormField>
          <Button type="submit" iconLeft="plus">Invite</Button>
        </form>
      </Card>
      <DataTable path="admin/staff" reloadKey={k} columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'lastLoginAt', label: 'Last sign-in', render: 'date' }, { key: 'status', label: 'Status', render: 'status' }]}
        actions={(r) => <Select aria-label={`Role for ${r.email}`} value={r.role} style={{ height: 34, fontSize: 12.5 }} onChange={async (e) => { if (!confirm(`Change ${r.email} to ${e.target.value}?`)) return; try { await apiFetch('admin/staff', { body: { userId: r.id, role: e.target.value } }); toast('Role changed'); setK((x) => x + 1); } catch (err: any) { toast(err.message, 'error'); } }}>{ROLES.map((x) => <option key={x}>{x}</option>)}</Select>} />
    </>
  );
}
