'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, FormField, Icon, Input, Select, Skeleton, StatusPill } from '@/components/atoms';
import { apiFetch } from '@/lib/api/client';
import { RichTextEditor } from '../RichTextEditor';
import { useToast } from '../Toaster';
import { useApi } from '../useApi';
import { PageTitle } from '../Widgets';
import { CONFIG_TEXT, type ConfigKind } from './ConfigList';
import { Switch } from './Switch';

const panel: CSSProperties = { background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, padding: 24, display: 'grid', gap: 18 };
const h2: CSSProperties = { fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, color: 'var(--c-brand)', margin: 0 };

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section style={panel}>
      <div style={{ display: 'grid', gap: 4 }}>
        <h2 style={h2}>{title}</h2>
        {hint && <p style={{ margin: 0, fontSize: 13, color: 'var(--c-muted)' }}>{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** "Tours & experiences" → "tours_experiences"; features get "<module key>." in front. */
const toKey = (name: string, prefix = '') =>
  prefix + name.toLowerCase().normalize('NFKD').replace(/[^\w\s.-]/g, '').trim().replace(/[\s-]+/g, '_').replace(/^[^a-z]+/, '').slice(0, 63 - prefix.length);

function Form({ kind, initial }: { kind: ConfigKind; initial?: any }) {
  const text = CONFIG_TEXT[kind];
  const router = useRouter();
  const toast = useToast();
  const isNew = !initial;
  const [v, setV] = useState({
    name: initial?.name ?? '', key: initial?.key ?? '', description: initial?.description ?? '',
    published: initial?.published ?? false, sortOrder: initial?.sortOrder ?? '', moduleId: initial?.moduleId ?? '',
  });
  const [keyTouched, setKeyTouched] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const { data: modules } = useApi<any>(kind === 'features' ? 'admin/config/modules?limit=100' : null);
  const { data: children } = useApi<any>(kind === 'modules' && !isNew ? `admin/config/features?moduleId=${initial.id}&limit=100` : null);
  const parent = useMemo(() => (modules?.items ?? []).find((m: any) => m.id === v.moduleId), [modules, v.moduleId]);
  const set = (k: keyof typeof v, val: any) => setV((p) => ({ ...p, [k]: val }));

  const onName = (name: string) => setV((p) => ({ ...p, name, key: keyTouched ? p.key : toKey(name, kind === 'features' && parent ? `${parent.key}.` : '') }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    const body: any = { name: v.name.trim(), key: v.key.trim(), description: v.description.trim() || undefined, published: v.published };
    if (v.sortOrder !== '' && v.sortOrder !== null) body.sortOrder = Number(v.sortOrder);
    if (kind === 'features') body.moduleId = v.moduleId;
    try {
      const saved = isNew
        ? await apiFetch<any>(`admin/config/${kind}`, { body })
        : await apiFetch<any>(`admin/config/${kind}/${initial.id}`, { method: 'PATCH', body });
      toast(isNew ? `${text.singular[0].toUpperCase()}${text.singular.slice(1)} added` : 'Changes saved');
      router.push(isNew ? `/config/${kind}/${saved.id}` : `/config/${kind}`);
      router.refresh();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  async function remove() {
    if (!confirm(`Delete “${initial.name}”? Code that uses the key “${initial.key}” will treat it as visible.`)) return;
    try { await apiFetch(`admin/config/${kind}/${initial.id}`, { method: 'DELETE' }); toast('Deleted'); router.push(`/config/${kind}`); }
    catch (e: any) { toast(e.message, 'error'); }
  }

  const liveNow = v.published && (kind === 'modules' || !parent || parent.published);

  return (
    <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 20, alignItems: 'start' }} className="cfg-grid">
      <style>{`@media (max-width: 960px) { .cfg-grid { grid-template-columns: 1fr !important; } }`}</style>
      <div style={{ display: 'grid', gap: 20 }}>
        <Section title="Details" hint={kind === 'modules' ? 'What this module is called and how the code refers to it.' : 'What this feature is called and how the code refers to it.'}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <FormField label="Name">{(id) => <Input id={id} required maxLength={120} autoFocus={isNew} value={v.name} onChange={(e) => onName(e.target.value)} placeholder={kind === 'modules' ? 'e.g. Tours & experiences' : 'e.g. Hero slider'} />}</FormField>
            <FormField label="Key" hint={isNew ? 'Filled in from the name — edit if needed' : 'Used by the code. Changing it can switch things on/off unexpectedly.'}>
              {(id) => <Input id={id} required maxLength={63} pattern="[a-z][a-z0-9_.\-]{1,62}" title="Lowercase letters, numbers, _ . -" value={v.key}
                onChange={(e) => { setKeyTouched(true); set('key', e.target.value.toLowerCase()); }} style={{ fontFamily: 'ui-monospace, Menlo, monospace' }} />}
            </FormField>
          </div>
          <FormField label="Description" hint="Optional — helps the team understand what switching it off hides">
            {(id) => <RichTextEditor id={id} value={v.description} onChange={(html) => set('description', html)} minHeight={140} folder="general" placeholder="Describe what this controls…" />}
          </FormField>
        </Section>

        {kind === 'features' && (
          <Section title="Placement" hint="The module this feature belongs to. If the module is unpublished, this feature is hidden too.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <FormField label="Module">
                {(id) => (
                  <Select id={id} required value={v.moduleId} onChange={(e) => {
                    const m = (modules?.items ?? []).find((x: any) => x.id === e.target.value);
                    setV((p) => ({ ...p, moduleId: e.target.value, key: keyTouched || !m ? p.key : toKey(p.name, `${m.key}.`) }));
                  }}>
                    <option value="" disabled>Select a module</option>
                    {(modules?.items ?? []).map((m: any) => <option key={m.id} value={m.id}>{m.name}{m.published ? '' : ' (unpublished)'}</option>)}
                  </Select>
                )}
              </FormField>
              <FormField label="Order" hint="Lower numbers come first">{(id) => <Input id={id} type="number" min={0} value={v.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />}</FormField>
            </div>
          </Section>
        )}
        {kind === 'modules' && (
          <Section title="Placement">
            <FormField label="Order" hint="Lower numbers come first in lists">{(id) => <Input id={id} type="number" min={0} value={v.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} style={{ maxWidth: 200 }} />}</FormField>
          </Section>
        )}

        {err && <p role="alert" style={{ color: 'var(--c-bad)', margin: 0 }}>{err}</p>}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : isNew ? `Add ${text.singular}` : 'Save changes'}</Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/config/${kind}`)}>Cancel</Button>
          {!isNew && <button type="button" onClick={remove} style={{ marginLeft: 'auto', border: 0, background: 'none', color: 'var(--c-bad)', display: 'inline-flex', gap: 6, alignItems: 'center', fontWeight: 600 }}><Icon name="trash" size={16} />Delete</button>}
        </div>
      </div>

      <aside style={{ display: 'grid', gap: 20 }}>
        <Section title="Visibility">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'grid', gap: 4 }}>
              <strong>{v.published ? 'Published' : 'Unpublished'}</strong>
              <span style={{ fontSize: 13, color: 'var(--c-muted)' }}>{v.published ? 'Visible on the website and app' : 'Hidden everywhere'}</span>
            </div>
            <Switch checked={v.published} onChange={(n) => set('published', n)} label="Published" />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            Status on site: <StatusPill tone={liveNow ? 'ok' : v.published ? 'warn' : 'neutral'}>{liveNow ? 'Live' : v.published ? 'Hidden · module off' : 'Hidden'}</StatusPill>
          </div>
          {kind === 'features' && parent && !parent.published && v.published && (
            <p style={{ margin: 0, fontSize: 13, background: '#fdf1d6', color: '#8a5a00', padding: '10px 12px', borderRadius: 10 }}>
              The module <strong>{parent.name}</strong> is unpublished, so this feature stays hidden until the module is published.
            </p>
          )}
          {kind === 'modules' && !v.published && !isNew && (children?.total ?? 0) > 0 && (
            <p style={{ margin: 0, fontSize: 13, background: '#fdf1d6', color: '#8a5a00', padding: '10px 12px', borderRadius: 10 }}>
              Unpublishing hides all <strong>{children.total}</strong> features in this module.
            </p>
          )}
          {!isNew && <p style={{ margin: 0, fontSize: 12, color: 'var(--c-muted)' }}>Changes reach the website within ~15 seconds.</p>}
        </Section>

        {kind === 'modules' && !isNew && (
          <Section title={`Features (${children?.total ?? 0})`}>
            {!children ? <Skeleton style={{ height: 80 }} /> : children.items.length === 0
              ? <p style={{ margin: 0, fontSize: 13, color: 'var(--c-muted)' }}>No features in this module yet.</p>
              : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2, maxHeight: 420, overflow: 'auto' }}>
                  {children.items.map((f: any) => (
                    <li key={f.id}>
                      <Link href={`/config/features/${f.id}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 8, color: 'var(--c-ink)', textDecoration: 'none', fontSize: 13.5 }}>
                        <span>{f.name}</span>
                        <StatusPill tone={f.published ? 'ok' : 'neutral'}>{f.published ? 'On' : 'Off'}</StatusPill>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            <Link href={`/config/features/new`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-brand)' }}>+ Add feature</Link>
          </Section>
        )}
      </aside>
    </form>
  );
}

/** Admin · Configuration → add / edit a module or feature. */
export function ConfigEdit({ kind, id }: { kind: ConfigKind; id: string }) {
  const text = CONFIG_TEXT[kind];
  const isNew = id === 'new';
  const { data, loading, error } = useApi<any>(isNew ? null : `admin/config/${kind}/${id}`);
  return (
    <>
      <PageTitle title={isNew ? `New ${text.singular}` : data?.name ?? text.singular} crumb={text.title}
        description={isNew ? (kind === 'modules' ? 'Add a new area of the project that can be switched on or off.' : 'Add a feature and choose the module it belongs to.') : data ? `Key: ${data.key}` : undefined} />
      {error ? <p style={{ color: 'var(--c-bad)' }}>{error}</p> : !isNew && loading ? <Skeleton style={{ height: 420 }} /> : <Form kind={kind} initial={isNew ? undefined : data} />}
    </>
  );
}
