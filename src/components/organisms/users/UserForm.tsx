'use client';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Button, FormField, Icon, type IconName, Input, Select } from '@/components/atoms';
import { apiFetch } from '@/lib/api/client';
import { Switch } from '../config/Switch';
import { useToast } from '../Toaster';
import { ROLE_KEYS, ROLE_META, RoleBadge } from './RoleBadge';

function Section({ title, hint, icon, tone, children }: { title: string; hint: string; icon: IconName; tone: string; children: ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid var(--c-line)', borderTop: `3px solid var(--a-${tone})`, borderRadius: 16, padding: 24, display: 'grid', gap: 18, boxShadow: '0 10px 28px rgba(42,32,27,.05)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 12, background: `var(--a-${tone}-bg)`, color: `var(--a-${tone})` }}><Icon name={icon} size={18} /></span>
        <div><h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h2><p style={{ margin: 0, fontSize: 12.5, color: 'var(--c-muted)' }}>{hint}</p></div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>{children}</div>
    </section>
  );
}

/** Admin · Users → add / edit a user (super admin). One email holds exactly one role. */
export function UserForm({ initial, selfId }: { initial?: any; selfId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !initial;
  const isSelf = !!initial && initial.id === selfId;
  const [v, setV] = useState({
    email: initial?.email ?? '', name: initial?.name ?? '', role: initial?.role ?? 'TOURIST', status: initial?.status ?? '',
    phone: initial?.phone ?? '', companyName: initial?.companyName ?? '', nationality: initial?.nationality ?? '',
    locale: initial?.locale ?? 'en', currency: initial?.currency ?? 'AED',
    guideVerified: initial?.guideProfile?.verified ?? false, guideHeadline: initial?.guideProfile?.headline ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof typeof v, val: any) => setV((p) => ({ ...p, [k]: val }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    const body: any = { email: v.email.trim(), name: v.name.trim() || undefined, role: v.role, status: v.status || undefined, phone: v.phone.trim() || undefined,
      nationality: v.nationality.trim() || undefined, locale: v.locale, currency: v.currency };
    if (v.role === 'COMPANY') body.companyName = v.companyName.trim();
    if (v.role === 'GUIDE') { body.guideVerified = v.guideVerified; body.guideHeadline = v.guideHeadline.trim() || undefined; }
    if (isSelf) { delete body.role; delete body.status; }
    try {
      const u = isNew ? await apiFetch<any>('admin/users', { body }) : await apiFetch<any>(`admin/users/${initial.id}`, { method: 'PATCH', body });
      toast(isNew ? 'User added — they can sign in with an email code' : 'User updated');
      router.push(`/users/${u.id}`); router.refresh();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} style={{ display: 'grid', gap: 20 }}>
      <Section title="Account" hint="Sign-in email, role and access. One email can hold only one role." icon="shield" tone="indigo">
        <FormField label="Email *" hint={isNew ? 'They sign in with a one-time code sent here' : 'Changing it changes where login codes are sent'}>
          {(id) => <Input id={id} type="email" required maxLength={254} autoFocus={isNew} value={v.email} onChange={(e) => set('email', e.target.value)} placeholder="name@example.com" />}
        </FormField>
        <FormField label="Role *" hint={isSelf ? 'You cannot change your own role' : `Type: ${ROLE_META[v.role]?.type ?? '—'}`}>
          {(id) => (
            <Select id={id} required disabled={isSelf} value={v.role} onChange={(e) => set('role', e.target.value)}>
              {ROLE_KEYS.map((k) => <option key={k} value={k}>{ROLE_META[k].label}</option>)}
            </Select>
          )}
        </FormField>
        <FormField label="Status" hint={isSelf ? 'You cannot change your own status' : 'Blocked users are signed out everywhere and can’t sign in'}>
          {(id) => (
            <Select id={id} disabled={isSelf} value={v.status} onChange={(e) => set('status', e.target.value)}>
              {isNew && <option value="">Automatic — companies & guides wait for approval</option>}
              <option value="ACTIVE">Active</option><option value="PENDING_APPROVAL">Waiting for approval</option><option value="SUSPENDED">Blocked</option>
            </Select>
          )}
        </FormField>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}><RoleBadge role={v.role} /></div>
      </Section>

      <Section title="Profile" hint="Name and contact details" icon="user" tone="violet">
        <FormField label="Full name">{(id) => <Input id={id} maxLength={120} value={v.name} onChange={(e) => set('name', e.target.value)} />}</FormField>
        <FormField label="Phone">{(id) => <Input id={id} type="tel" maxLength={40} value={v.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+971 …" />}</FormField>
        <FormField label="Nationality">{(id) => <Input id={id} maxLength={60} value={v.nationality} onChange={(e) => set('nationality', e.target.value)} />}</FormField>
        <FormField label="Language">{(id) => <Select id={id} value={v.locale} onChange={(e) => set('locale', e.target.value)}><option value="en">English</option><option value="ar">العربية</option></Select>}</FormField>
        <FormField label="Currency">{(id) => <Select id={id} value={v.currency} onChange={(e) => set('currency', e.target.value)}>{['AED', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select>}</FormField>
      </Section>

      {v.role === 'COMPANY' && (
        <Section title="Company" hint="Shown on bookings and invoices" icon="layers" tone="sky">
          <FormField label="Company name *">{(id) => <Input id={id} required maxLength={120} value={v.companyName} onChange={(e) => set('companyName', e.target.value)} />}</FormField>
        </Section>
      )}

      {v.role === 'GUIDE' && (
        <Section title="Tour guide" hint="Verified guides can be assigned tours and appear on the website" icon="compass" tone="teal">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, border: `1px solid ${v.guideVerified ? '#a7f3d0' : 'var(--c-line)'}`, background: v.guideVerified ? '#ecfdf5' : '#fff' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Verified guide</span>
            <Switch checked={v.guideVerified} onChange={(n) => set('guideVerified', n)} label="Verified guide" />
          </div>
          <FormField label="Headline">{(id) => <Input id={id} maxLength={160} value={v.guideHeadline} onChange={(e) => set('guideHeadline', e.target.value)} placeholder="e.g. Desert & heritage specialist" />}</FormField>
        </Section>
      )}

      {err && <p role="alert" style={{ margin: 0, color: 'var(--a-rose)', fontWeight: 600 }}>{err}</p>}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 4, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', padding: '14px 18px', borderRadius: 16, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(8px)', border: '1px solid var(--c-line)', boxShadow: '0 -8px 24px rgba(42,32,27,.08)' }}>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" size="lg" disabled={busy}>{busy ? 'Saving…' : isNew ? 'Add user' : 'Save changes'}</Button>
      </div>
    </form>
  );
}
