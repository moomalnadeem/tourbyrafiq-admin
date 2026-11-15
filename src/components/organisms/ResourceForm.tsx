'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, FormField, Icon, type IconName, Input, Select, Textarea } from '@/components/atoms';
import type { Field, ResourceConfig } from '@/config/resources';
import { apiFetch } from '@/lib/api/client';
import { ImageUpload } from './ImageUpload';
import { RichTextEditor } from './RichTextEditor';
import { Switch } from './config/Switch';
import { useApi } from './useApi';
import { useToast } from './Toaster';

function RelationSelect({ id, field, value, onChange }: { id: string; field: Field; value: any; onChange: (v: any) => void }) {
  const { data } = useApi<any>(`${field.relation!.path}?limit=100`);
  return (
    <Select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} required={field.required}>
      <option value="">—</option>
      {(data?.items ?? []).map((o: any) => <option key={o.id} value={o.id}>{o[field.relation!.labelKey ?? 'name'] ?? o.title}</option>)}
    </Select>
  );
}

const toInput = (f: Field, v: any) => {
  if (v == null) return f.type === 'boolean' ? false : f.type === 'tags' ? '' : f.type === 'json' ? '' : '';
  if (f.type === 'tags') return Array.isArray(v) ? v.join(', ') : v;
  if (f.type === 'json') return typeof v === 'string' ? v : JSON.stringify(v, null, 2);
  if (f.type === 'date') return String(v).slice(0, 10);
  return v;
};

/** Generic create/edit form generated from a ResourceConfig (all catalogue & content editors). */
export function ResourceForm({ config, initial }: { config: ResourceConfig; initial?: any }) {
  const [values, setValues] = useState<Record<string, any>>(() => Object.fromEntries(config.fields.map((f) => [f.key, toInput(f, initial?.[f.key])])));
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const toast = useToast();
  const set = (k: string, v: any) => setValues((x) => ({ ...x, [k]: v }));

  function serialise() {
    const out: Record<string, any> = {}; const errs: Record<string, string> = {};
    for (const f of config.fields) {
      const v = values[f.key];
      if (f.required && (v === '' || v == null || (Array.isArray(v) && !v.length))) errs[f.key] = 'Required';
      switch (f.type) {
        case 'number': case 'money': if (v !== '' && v != null) out[f.key] = Number(v); break;
        case 'tags': out[f.key] = String(v ?? '').split(',').map((t) => t.trim()).filter(Boolean); break;
        case 'json': if (String(v ?? '').trim()) { try { out[f.key] = JSON.parse(v); } catch { errs[f.key] = 'Invalid JSON'; } } break;
        case 'date': out[f.key] = v ? new Date(v).toISOString() : null; break;
        case 'select': out[f.key] = v === '' ? null : v; break;
        default: if (v !== '' || initial) out[f.key] = v === '' ? null : v;
      }
    }
    if (!out.slug) delete out.slug;
    setErrors(errs);
    return Object.keys(errs).length ? null : out;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body = serialise(); if (!body) return;
    setBusy(true);
    try {
      const saved = initial?.id
        ? await apiFetch(`${config.api}/${initial.id}`, { method: 'PATCH', body })
        : await apiFetch(config.api, { body });
      toast(`${config.singular[0].toUpperCase() + config.singular.slice(1)} saved`);
      if (!initial?.id) router.replace(`/${config.group}/${config.key}/${saved.id}`);
    } catch (err: any) { toast(err.message, 'error'); } finally { setBusy(false); }
  }

  async function remove() {
    if (!initial?.id || !confirm(`Archive/delete this ${config.singular}? This affects the live website.`)) return;
    try { await apiFetch(`${config.api}/${initial.id}`, { method: 'DELETE' }); toast('Removed'); router.push(`/${config.group}/${config.key}`); } catch (err: any) { toast(err.message, 'error'); }
  }

  /** Render one field (shared by all sections). */
  const renderField = (f: Field) => (
    <div key={f.key} style={f.full || ['textarea', 'richtext', 'markdown', 'json', 'images', 'tags'].includes(f.type) ? { gridColumn: '1 / -1' } : undefined}>
      {f.type === 'boolean' ? (
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, border: `1px solid ${values[f.key] ? '#a7f3d0' : 'var(--c-line)'}`, background: values[f.key] ? '#ecfdf5' : '#fff', height: '100%' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{f.label}{f.hint && <small style={{ display: 'block', fontWeight: 400, color: 'var(--c-muted)', fontSize: 12 }}>{f.hint}</small>}</span>
          <Switch checked={!!values[f.key]} onChange={(v) => set(f.key, v)} label={f.label} />
        </div>
      ) : (
        <FormField label={f.label + (f.required ? ' *' : '')} hint={f.hint} error={errors[f.key]}>
          {(id) => {
            switch (f.type) {
              case 'textarea': return <Textarea id={id} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />;
              case 'richtext': return <RichTextEditor id={id} value={values[f.key]} onChange={(html) => set(f.key, html)} folder={f.folder ?? config.key} placeholder={`Write the ${f.label.toLowerCase()}…`} />;
              case 'markdown': case 'json': return <Textarea id={id} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} style={{ minHeight: 220, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }} />;
              case 'select': return <Select id={id} value={values[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>{(f.options ?? []).map((o) => <option key={o} value={o}>{o ? o.replace(/_/g, ' ').toLowerCase() : '—'}</option>)}</Select>;
              case 'relation': return <RelationSelect id={id} field={f} value={values[f.key]} onChange={(v) => set(f.key, v)} />;
              case 'image': return <ImageUpload value={values[f.key]} onChange={(v) => set(f.key, v)} folder={f.folder} />;
              case 'images': return <ImageUpload multiple value={values[f.key]} onChange={(v) => set(f.key, v)} folder={f.folder} />;
              case 'number': case 'money': return <Input id={id} type="number" step={f.type === 'money' ? '0.01' : '1'} min={0} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />;
              case 'date': return <Input id={id} type="date" value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />;
              case 'tags': return <Input id={id} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder="Comma separated" />;
              default: return <Input id={id} value={values[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />;
            }
          }}
        </FormField>
      )}
    </div>
  );

  // Group fields into coloured sections: Basics · Options · Photos · Content · SEO.
  const isSeo = (f: Field) => f.key.startsWith('seo');
  const groups: { key: string; title: string; hint: string; icon: IconName; tone: string; fields: Field[] }[] = [
    { key: 'basics', title: 'Basics', hint: 'Name, status, links and pricing', icon: 'filter', tone: 'indigo', fields: config.fields.filter((f) => !isSeo(f) && ['text', 'select', 'relation', 'number', 'money', 'date'].includes(f.type)) },
    { key: 'options', title: 'Options', hint: 'Switch features of this item on or off', icon: 'check', tone: 'emerald', fields: config.fields.filter((f) => f.type === 'boolean') },
    { key: 'media', title: 'Photos', hint: 'Images shown on the website and app', icon: 'upload', tone: 'sky', fields: config.fields.filter((f) => f.type === 'image' || f.type === 'images') },
    { key: 'content', title: 'Content', hint: 'Descriptions, lists and details', icon: 'copy', tone: 'violet', fields: config.fields.filter((f) => !isSeo(f) && ['textarea', 'richtext', 'markdown', 'json', 'tags'].includes(f.type)) },
    { key: 'seo', title: 'SEO', hint: 'How this page appears in Google and when shared', icon: 'globe', tone: 'amber', fields: config.fields.filter(isSeo) },
  ].filter((g) => g.fields.length);

  return (
    <form onSubmit={save} style={{ display: 'grid', gap: 20 }}>
      {groups.map((g) => (
        <section key={g.key} style={{ background: '#fff', border: '1px solid var(--c-line)', borderTop: `3px solid var(--a-${g.tone})`, borderRadius: 16, padding: 24, boxShadow: '0 10px 28px rgba(42,32,27,.05)', display: 'grid', gap: 18 }}>
          <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 12, background: `var(--a-${g.tone}-bg)`, color: `var(--a-${g.tone})` }}><Icon name={g.icon} size={18} /></span>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{g.title}</h2>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--c-muted)' }}>{g.hint}</p>
            </div>
          </header>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>{g.fields.map(renderField)}</div>
        </section>
      ))}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 4, display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', padding: '14px 18px', borderRadius: 16, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(8px)', border: '1px solid var(--c-line)', boxShadow: '0 -8px 24px rgba(42,32,27,.08)' }}>
        <span style={{ fontSize: 13, color: Object.keys(errors).length ? 'var(--a-rose)' : 'var(--c-muted)', fontWeight: Object.keys(errors).length ? 600 : 400 }}>
          {Object.keys(errors).length ? `Please fix ${Object.keys(errors).length} field${Object.keys(errors).length > 1 ? 's' : ''} above` : initial?.id ? 'Editing — changes are saved when you click Save' : `New ${config.singular}`}
        </span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {initial?.id && <Button type="button" variant="outline" onClick={remove} iconLeft="trash">{config.fields.some((f) => f.key === 'status') ? 'Archive' : 'Delete'}</Button>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? 'Saving…' : initial?.id ? 'Save changes' : `Create ${config.singular}`}</Button>
        </div>
      </div>
    </form>
  );
}
