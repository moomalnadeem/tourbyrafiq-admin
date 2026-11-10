'use client';
import { useState } from 'react';
import { DataTable } from '@/components/organisms/DataTable';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** AD28 · Email & notifications — all 28 Figma templates (T1–T12, G1–G8, A1–A8) with live preview. */
export default function EmailTemplates() {
  const [html, setHtml] = useState<string | null>(null);
  return (
    <>
      <PageTitle title="Email & notifications" description="Sent through ZeptoMail by the notification service. Click a template to preview." />
      <DataTable path="admin/email-templates" columns={[{ key: 'code', label: 'Code' }, { key: 'key', label: 'Template' }, { key: 'audience', label: 'Audience' }, { key: 'subject', label: 'Subject' }]}
        onRowClick={async (r) => { const d = await apiFetch<{ html: string }>(`admin/email-templates/${r.key}/preview`); setHtml(d.html); }} />
      {html && <Card style={{ padding: 0, overflow: 'hidden' }}><iframe title="Email preview" srcDoc={html} sandbox="" style={{ width: '100%', height: 900, border: 0 }} /></Card>}
    </>
  );
}
