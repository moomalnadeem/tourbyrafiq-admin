'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button, FormField, Icon, Input, Skeleton, Textarea } from '@/components/atoms';
import { useToast } from '@/components/organisms/Toaster';
import { useApi } from '@/components/organisms/useApi';
import { ROLE_META, RoleBadge } from '@/components/organisms/users/RoleBadge';
import { KpiTile, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

interface RoleRow { id: string; key: string; name: string; description: string | null; isStaff: boolean; _count: { users: number } }

const GROUPS: { title: string; hint: string; tone: string; match: (r: RoleRow) => boolean }[] = [
  { title: 'Customers', hint: 'Sign in on the website and app', tone: 'sky', match: (r) => ['TOURIST', 'COMPANY'].includes(r.key) },
  { title: 'Tour guides', hint: 'Sign in to the guide panel', tone: 'teal', match: (r) => r.key === 'GUIDE' },
  { title: 'Staff', hint: 'Sign in to this admin panel with their role', tone: 'rose', match: (r) => r.isStaff },
];

function RoleCard({ r, onSaved }: { r: RoleRow; onSaved: () => void }) {
  const toast = useToast();
  const tone = ROLE_META[r.key]?.tone ?? 'indigo';
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(r.name);
  const [description, setDescription] = useState(r.description ?? '');
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await apiFetch(`admin/roles/${r.id}`, { method: 'PATCH', body: { name, description } }); toast('Role updated'); setEditing(false); onSaved(); }
    catch (err: any) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <article style={{ background: '#fff', border: '1px solid var(--c-line)', borderTop: `3px solid var(--a-${tone})`, borderRadius: 16, padding: 20, display: 'grid', gap: 12, boxShadow: '0 10px 28px rgba(42,32,27,.05)', alignContent: 'start' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <RoleBadge role={r.key} name={r.name} />
        <code style={{ fontSize: 11.5, background: 'var(--a-indigo-bg)', color: 'var(--a-indigo)', padding: '3px 8px', borderRadius: 6 }}>{r.key}</code>
      </div>
      {editing ? (
        <form onSubmit={save} style={{ display: 'grid', gap: 12 }}>
          <FormField label="Display name">{(id) => <Input id={id} required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />}</FormField>
          <FormField label="Description">{(id) => <Textarea id={id} maxLength={300} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 80 }} />}</FormField>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" size="sm" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setEditing(false); setName(r.name); setDescription(r.description ?? ''); }}>Cancel</Button>
          </div>
        </form>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--c-muted)', minHeight: 40 }}>{r.description || 'No description yet.'}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <Link href={`/users?role=${r.key}`} style={{ display: 'flex', alignItems: 'baseline', gap: 6, color: `var(--a-${tone})` }}>
              <strong style={{ fontFamily: 'var(--f-serif)', fontSize: 28, lineHeight: 1 }}>{r._count.users}</strong>
              <span style={{ fontSize: 13, fontWeight: 600 }}>user{r._count.users === 1 ? '' : 's'}</span>
            </Link>
            <button type="button" onClick={() => setEditing(true)} title="Edit role" aria-label={`Edit ${r.name}`}
              style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 10, border: '1px solid var(--a-sky-bg)', background: '#f0f9ff', color: 'var(--a-sky)' }}>
              <Icon name="edit" size={16} />
            </button>
          </div>
        </>
      )}
    </article>
  );
}

/** Admin · Users → Roles (from the `roles` table). */
export default function RolesPage() {
  const { data, loading, reload } = useApi<RoleRow[]>('admin/roles');
  const roles = Array.isArray(data) ? data : [];
  const total = roles.reduce((s, r) => s + r._count.users, 0);
  const count = (f: (r: RoleRow) => boolean) => roles.filter(f).reduce((s, r) => s + r._count.users, 0);
  return (
    <>
      <PageTitle title="Roles" description="Every user holds exactly one role. Role keys are fixed (the code uses them); you can rename roles and edit their descriptions." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
        <KpiTile label="Roles" value={loading ? '…' : String(roles.length)} icon="shield" tone="indigo" sub="From the roles table" />
        <KpiTile label="Users" value={loading ? '…' : String(total)} icon="users" tone="emerald" sub="Across all roles" />
        <KpiTile label="Customers" value={loading ? '…' : String(count(GROUPS[0].match))} icon="user" tone="sky" sub="Tourists & companies" />
        <KpiTile label="Staff" value={loading ? '…' : String(count((r) => r.isStaff))} icon="shield" tone="rose" sub={`${roles.filter((r) => r.isStaff).length} staff roles`} />
      </div>
      {loading ? <Skeleton style={{ height: 360 }} /> : GROUPS.map((g) => {
        const list = roles.filter(g.match);
        if (!list.length) return null;
        return (
          <section key={g.title} style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 13, letterSpacing: 1.3, textTransform: 'uppercase', fontWeight: 700, color: `var(--a-${g.tone})` }}>{g.title}</h2>
              <span style={{ fontSize: 13, color: 'var(--c-muted)' }}>{g.hint}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {list.map((r) => <RoleCard key={r.id} r={r} onSaved={reload} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}
