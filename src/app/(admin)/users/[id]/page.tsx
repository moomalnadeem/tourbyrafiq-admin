'use client';
import Link from 'next/link';
import { use, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Icon, type IconName, Select, Skeleton, StatusPill, toneFor } from '@/components/atoms';
import { aed } from '@/components/organisms/ReportCards';
import { useToast } from '@/components/organisms/Toaster';
import { useApi } from '@/components/organisms/useApi';
import { Avatar, ROLE_KEYS, ROLE_META, RoleBadge } from '@/components/organisms/users/RoleBadge';
import { KpiTile, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

const panel: CSSProperties = { background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, padding: 22, boxShadow: '0 10px 28px rgba(42,32,27,.05)', display: 'grid', gap: 16, alignContent: 'start' };
const dt = (d?: string) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

function Panel({ title, icon, tone, children, action }: { title: string; icon: IconName; tone: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section style={{ ...panel, borderTop: `3px solid var(--a-${tone})` }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 11, background: `var(--a-${tone}-bg)`, color: `var(--a-${tone})` }}><Icon name={icon} size={16} /></span>
        <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, flex: 1 }}>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, fontSize: 14, padding: '8px 0', borderBottom: '1px dashed var(--c-line)' }}>
      <span style={{ color: 'var(--c-muted)' }}>{label}</span><span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{children ?? '—'}</span>
    </div>
  );
}

/** Admin · Users → one user's details. */
export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const { data: u, loading, error, reload } = useApi<any>(`admin/users/${id}`);
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState('');

  if (error) return <><PageTitle title="User" crumb="All users" /><p style={{ color: 'var(--a-rose)' }}>{error}</p></>;
  if (loading || !u) return <><PageTitle title="User" crumb="All users" /><Skeleton style={{ height: 520 }} /></>;

  const suspended = u.status === 'SUSPENDED';
  const toggleStatus = async () => {
    if (!confirm(suspended ? `Reactivate ${u.email}?` : `Suspend ${u.email}? They will be signed out everywhere.`)) return;
    setBusy('status');
    try { await apiFetch(`admin/users/${u.id}/status`, { method: 'PATCH', body: { status: suspended ? 'ACTIVE' : 'SUSPENDED' } }); toast(suspended ? 'User reactivated' : 'User suspended'); reload(); }
    catch (e: any) { toast(e.message, 'error'); } finally { setBusy(''); }
  };
  const changeRole = async () => {
    if (!role || role === u.role) return;
    if (!confirm(`Change ${u.email} from ${ROLE_META[u.role]?.label ?? u.role} to ${ROLE_META[role]?.label ?? role}? One email holds one role, so they will sign in with the new role from now on.`)) return;
    setBusy('role');
    try { await apiFetch('admin/staff', { body: { userId: u.id, role } }); toast('Role updated'); setRole(''); reload(); }
    catch (e: any) { toast(e.message, 'error'); } finally { setBusy(''); }
  };

  return (
    <>
      <PageTitle title={u.name || u.companyName || u.email} crumb="All users" description={u.email} />

      {/* Header card */}
      <section style={{ ...panel, gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', background: 'linear-gradient(120deg, #fff 55%, #fbf1e4)', borderTop: '3px solid var(--c-gold)' }} className="user-head">
        <style>{`@media (max-width: 760px) { .user-head { grid-template-columns: 1fr !important; } }`}</style>
        <Avatar user={u} size={64} />
        <div style={{ display: 'grid', gap: 6 }}>
          <strong style={{ fontSize: 20 }}>{u.name || u.companyName || '—'}</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <RoleBadge role={u.role} name={u.roleName} />
            <StatusPill tone={toneFor(u.status)}>{String(u.status).replace(/_/g, ' ').toLowerCase()}</StatusPill>
            {u.companyName && <span style={{ fontSize: 13, color: 'var(--c-muted)' }}>· {u.companyName}</span>}
          </div>
          <span style={{ fontSize: 13, color: 'var(--c-muted)' }}>Joined {dt(u.createdAt)} · Last sign-in {dt(u.lastLoginAt)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button type="button" variant={suspended ? 'primary' : 'outline'} onClick={toggleStatus} disabled={busy === 'status'} iconLeft={suspended ? 'check' : 'close'}>
            {busy === 'status' ? 'Saving…' : suspended ? 'Reactivate' : 'Suspend'}
          </Button>
        </div>
      </section>

      {/* Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <KpiTile label="Bookings" value={String(u._count?.bookings ?? 0)} icon="ticket" tone="indigo" sub={u._count?.guidedBookings ? `${u._count.guidedBookings} guided` : undefined} />
        <KpiTile label="Total spent" value={aed(u.totalSpent ?? 0)} icon="tag" tone="emerald" sub="Paid bookings" />
        <KpiTile label="Reviews" value={String(u._count?.reviews ?? 0)} icon="star" tone="violet" />
        <KpiTile label="Sign-ins" value={String(u._count?.loginHistory ?? 0)} icon="logout" tone="sky" />
        <KpiTile label="Support tickets" value={String(u._count?.tickets ?? 0)} icon="chat" tone="amber" />
        <KpiTile label="Reward points" value={String(u.rewardPoints ?? 0)} icon="gift" tone="teal" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, alignItems: 'start' }}>
        <Panel title="Profile" icon="user" tone="indigo">
          <div>
            <Row label="Full name">{u.name}</Row>
            <Row label="Email">{u.email}</Row>
            <Row label="Phone">{u.phone}</Row>
            {u.role === 'COMPANY' && <Row label="Company">{u.companyName}</Row>}
            <Row label="Nationality">{u.nationality}</Row>
            <Row label="Language">{u.locale === 'ar' ? 'العربية' : 'English'}</Row>
            <Row label="Currency">{u.currency}</Row>
            <Row label="Saved travellers">{u._count?.travellers ?? 0}</Row>
            <Row label="Wishlist items">{u._count?.wishlist ?? 0}</Row>
            <Row label="User ID"><code style={{ fontSize: 12 }}>{u.id}</code></Row>
          </div>
        </Panel>

        <Panel title="Role & access" icon="shield" tone="rose">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            Current role: <RoleBadge role={u.role} name={u.roleName} /> <span style={{ fontSize: 13, color: 'var(--c-muted)' }}>({ROLE_META[u.role]?.type ?? 'Staff'})</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="New role" style={{ maxWidth: 240 }}>
              <option value="">Change role to…</option>
              {ROLE_KEYS.filter((k) => k !== u.role).map((k) => <option key={k} value={k}>{ROLE_META[k].label}</option>)}
            </Select>
            <Button type="button" onClick={changeRole} disabled={!role || busy === 'role'}>{busy === 'role' ? 'Saving…' : 'Update role'}</Button>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--c-muted)' }}>Only super admins can grant Super admin, and nobody can change their own role.</p>
        </Panel>

        {u.guideProfile && (
          <Panel title="Guide profile" icon="compass" tone="teal" action={u.guideProfile.slug ? <Link href={`/guides`} style={{ fontSize: 13, color: 'var(--a-teal)', fontWeight: 600 }}>All guides →</Link> : undefined}>
            <div>
              <Row label="Headline">{u.guideProfile.headline}</Row>
              <Row label="Verified">{u.guideProfile.verified ? <StatusPill tone="ok">verified</StatusPill> : <StatusPill tone="warn">awaiting approval</StatusPill>}</Row>
              <Row label="Rating">{u.guideProfile.rating ? `${Number(u.guideProfile.rating).toFixed(1)} ★ (${u.guideProfile.reviewCount})` : '—'}</Row>
              <Row label="Tours led">{u.guideProfile.toursLed}</Row>
              <Row label="Languages">{u.guideProfile.languages?.join(', ')}</Row>
              <Row label="Emirates">{u.guideProfile.emirates?.join(', ')}</Row>
            </div>
          </Panel>
        )}

        <Panel title="Recent bookings" icon="ticket" tone="emerald" action={u._count?.bookings ? <Link href={`/bookings?q=${encodeURIComponent(u.email)}`} style={{ fontSize: 13, color: 'var(--a-emerald)', fontWeight: 600 }}>View all →</Link> : undefined}>
          {u.bookings?.length ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {u.bookings.map((b: any) => (
                <Link key={b.id} href={`/bookings?q=${b.reference}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', padding: '10px 12px', border: '1px solid var(--c-line)', borderRadius: 12, color: 'var(--c-ink)' }}>
                  <span style={{ display: 'grid' }}><strong style={{ fontSize: 14 }}>{b.reference}</strong><small style={{ color: 'var(--c-muted)' }}>{dt(b.createdAt)}</small></span>
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><StatusPill tone={toneFor(b.status)}>{String(b.status).replace(/_/g, ' ').toLowerCase()}</StatusPill><strong>{b.currency} {Number(b.total).toFixed(0)}</strong></span>
                </Link>
              ))}
            </div>
          ) : <p style={{ margin: 0, color: 'var(--c-muted)', fontSize: 14 }}>No bookings yet.</p>}
        </Panel>

        <Panel title="Recent sign-ins" icon="logout" tone="sky" action={<Link href="/login-history" style={{ fontSize: 13, color: 'var(--a-sky)', fontWeight: 600 }}>Login history →</Link>}>
          {u.loginHistory?.length ? (
            <div style={{ display: 'grid', gap: 6 }}>
              {u.loginHistory.map((l: any, i: number) => (
                <div key={i} style={{ display: 'grid', gap: 2, padding: '8px 0', borderBottom: '1px dashed var(--c-line)', fontSize: 13 }}>
                  <strong>{dt(l.createdAt)}</strong>
                  <span style={{ color: 'var(--c-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.ip ?? '—'} · {l.userAgent ?? '—'}</span>
                </div>
              ))}
            </div>
          ) : <p style={{ margin: 0, color: 'var(--c-muted)', fontSize: 14 }}>Never signed in.</p>}
        </Panel>
      </div>
    </>
  );
}
