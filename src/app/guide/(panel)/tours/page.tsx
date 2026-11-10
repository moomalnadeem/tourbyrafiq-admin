'use client';
import { useState } from 'react';
import { Button, FormField, Textarea } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { ImageUpload } from '@/components/organisms/ImageUpload';
import { useToast } from '@/components/organisms/Toaster';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** Guide panel · My tours — edits go back to admin review. */
export default function GuideTours() {
  const [sel, setSel] = useState<any>(null); const [k, setK] = useState(0);
  const toast = useToast();
  return (
    <>
      <PageTitle title="My tours" description="Edits are sent to the Tours By Rafiq team for review before going live." />
      <DataTable path="guide/tours" reloadKey={k} onRowClick={setSel} columns={[{ key: 'images', label: '', render: 'image' }, { key: 'title', label: 'Tour' }, { key: 'priceFrom', label: 'Price', render: 'money' }, { key: 'status', label: 'Status', render: 'status' }]} />
      {sel && (
        <Card style={{ display: 'grid', gap: 14 }}>
          <strong style={{ fontFamily: 'var(--f-serif)', fontSize: 20, fontWeight: 400 }}>{sel.title}</strong>
          <FormField label="Description">{(id) => <Textarea id={id} value={sel.description ?? ''} onChange={(e) => setSel({ ...sel, description: e.target.value })} />}</FormField>
          <FormField label="Photos">{() => <ImageUpload multiple folder="tours" value={sel.images} onChange={(v) => setSel({ ...sel, images: v })} />}</FormField>
          <div><Button onClick={async () => { try { await apiFetch(`guide/tours/${sel.id}`, { method: 'PATCH', body: { description: sel.description, images: sel.images } }); toast('Sent for review'); setSel(null); setK((x) => x + 1); } catch (e: any) { toast(e.message, 'error'); } }}>Submit for review</Button></div>
        </Card>
      )}
    </>
  );
}
