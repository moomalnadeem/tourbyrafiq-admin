'use client';
import { useEffect, useState } from 'react';
import { Button, FormField, Textarea } from '@/components/atoms';
import { useToast } from '@/components/organisms/Toaster';
import { useApi } from '@/components/organisms/useApi';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

const KEYS: [string, string][] = [['site.contact', 'Contact details'], ['site.whatsapp', 'WhatsApp'], ['site.social', 'Social links'], ['site.announcement', 'Announcement bar'], ['homepage.sections', 'Homepage sections']];

/** AD29 · Settings (JSON values; public keys are exposed read-only to the website). */
export default function Settings() {
  const { data } = useApi<Record<string, any>>('admin/settings');
  const [vals, setVals] = useState<Record<string, string>>({});
  const toast = useToast();
  useEffect(() => { if (data) setVals(Object.fromEntries(KEYS.map(([k]) => [k, data[k] ? JSON.stringify(data[k], null, 2) : '']))); }, [data]);
  async function save() {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(vals)) { if (!v.trim()) continue; try { out[k] = JSON.parse(v); } catch { return toast(`${k}: invalid JSON`, 'error'); } }
    try { await apiFetch('admin/settings', { method: 'PUT', body: out }); toast('Settings saved'); } catch (e: any) { toast(e.message, 'error'); }
  }
  return (
    <>
      <PageTitle title="Settings" actions={<Button onClick={save}>Save settings</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {KEYS.map(([k, label]) => <Card key={k}><FormField label={label} hint={k}>{(id) => <Textarea id={id} value={vals[k] ?? ''} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5, minHeight: 160 }} />}</FormField></Card>)}
      </div>
    </>
  );
}
