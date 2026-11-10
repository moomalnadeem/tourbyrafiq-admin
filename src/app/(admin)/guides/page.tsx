'use client';
import { useState } from 'react';
import { Button, FormField, Input } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { useToast } from '@/components/organisms/Toaster';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** AD24 · Guides — invite, approve, suspend. */
export default function Guides() {
  const toast = useToast(); const [k, setK] = useState(0);
  const [email, setEmail] = useState(''); const [name, setName] = useState('');
  return (
    <>
      <PageTitle title="Guides" description="Invited guides sign in with an email code at the guide panel, then wait for approval." />
      <Card>
        <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, alignItems: 'end' }} onSubmit={async (e) => { e.preventDefault(); try { await apiFetch('admin/staff', { body: { email, name, role: 'GUIDE' } }); toast('Guide invited'); setEmail(''); setName(''); setK((x) => x + 1); } catch (err: any) { toast(err.message, 'error'); } }}>
          <FormField label="Guide name">{(id) => <Input id={id} required value={name} onChange={(e) => setName(e.target.value)} />}</FormField>
          <FormField label="Email">{(id) => <Input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}</FormField>
          <Button type="submit" iconLeft="plus">Invite guide</Button>
        </form>
      </Card>
      <DataTable path="admin/guides" reloadKey={k} columns={[{ key: 'user.name', label: 'Guide' }, { key: 'user.email', label: 'Email' }, { key: 'headline', label: 'Headline' }, { key: 'rating', label: 'Rating' }, { key: 'verified', label: 'Verified', render: 'bool' }, { key: 'user.status', label: 'Status', render: 'status' }]}
        actions={(r) => <Button size="sm" variant={r.verified ? 'outline' : 'primary'} onClick={async () => { try { await apiFetch(`admin/guides/${r.userId}/approval`, { body: { approve: !r.verified } }); toast(r.verified ? 'Guide suspended' : 'Guide approved'); setK((x) => x + 1); } catch (e: any) { toast(e.message, 'error'); } }}>{r.verified ? 'Suspend' : 'Approve'}</Button>} />
    </>
  );
}
