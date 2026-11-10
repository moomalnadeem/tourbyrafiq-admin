'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, FormField, Input, Select, Textarea } from '@/components/atoms';
import type { Field, ResourceConfig } from '@/config/resources';
import { apiFetch } from '@/lib/api/client';
import { ImageUpload } from './ImageUpload';
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

  return (
    <form onSubmit={save} style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 16, padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
      {config.fields.map((f) => (
        <div key={f.key} style={f.full || ['textarea', 'markdown', 'json', 'images', 'tags'].includes(f.type) ? { gridColumn: '1 / -1' } : undefined}>
          {f.type === 'boolean' ? (
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', height: '100%', fontWeight: 600, fontSize: 14 }}>
              <input type="checkbox" checked={!!values[f.key]} onChange={(e) => set(f.key, e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--c-brand)' }} />{f.label}
            </label>
          ) : (
            <FormField label={f.label + (f.required ? ' *' : '')} hint={f.hint} error={errors[f.key]}>
              {(id) => {
                switch (f.type) {
                  case 'textarea': return <Textarea id={id} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} />;
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
      ))}
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap', borderTop: '1px solid var(--c-line)', paddingTop: 18 }}>
        <Button type="submit" size="lg" disabled={busy}>{busy ? 'Saving…' : initial?.id ? 'Save changes' : `Create ${config.singular}`}</Button>
        {initial?.id && <Button type="button" variant="outline" onClick={remove} iconLeft="trash">{config.fields.some((f) => f.key === 'status') ? 'Archive' : 'Delete'}</Button>}
      </div>
    </form>
  );
}
