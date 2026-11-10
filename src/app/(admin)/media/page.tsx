'use client';
import { useState } from 'react';
import { Button, StatusPill, toneFor } from '@/components/atoms';
import { ImageUpload } from '@/components/organisms/ImageUpload';
import { useToast } from '@/components/organisms/Toaster';
import { useApi } from '@/components/organisms/useApi';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** AD20 · Media library + guide upload approval queue. Files live in Supabase Storage, served by its CDN. */
export default function Media() {
  const [status, setStatus] = useState('');
  const { data, reload } = useApi<any>(`admin/media?limit=60${status ? `&status=${status}` : ''}`);
  const toast = useToast();
  const act = async (id: string, body: any, method = 'PATCH') => { try { await apiFetch(`admin/media/${id}`, { method, body }); reload(); } catch (e: any) { toast(e.message, 'error'); } };
  return (
    <>
      <PageTitle title="Media library" description="Upload images to tourguidebucket. Guide uploads wait here for approval." />
      <Card style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ImageUpload multiple value={[]} onChange={() => { toast('Uploaded'); reload(); }} folder="general" />
        <div style={{ display: 'flex', gap: 6 }}>{['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => <Button key={s} size="sm" variant={status === s ? 'dark' : 'outline'} onClick={() => setStatus(s)}>{s ? s.toLowerCase() : 'all'}</Button>)}</div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
        {(data?.items ?? []).map((m: any) => (
          <figure key={m.id} style={{ margin: 0, background: '#fff', border: '1px solid var(--c-line)', borderRadius: 12, overflow: 'hidden', display: 'grid' }}>
            {m.mimeType.startsWith('image/') ? <img src={m.url} alt={m.alt ?? ''} style={{ width: '100%', height: 130, objectFit: 'cover' }} loading="lazy" /> : <div style={{ height: 130, display: 'grid', placeItems: 'center', background: 'var(--c-cream)' }}>{m.mimeType}</div>}
            <figcaption style={{ padding: 10, display: 'grid', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{m.folder}</span><StatusPill tone={toneFor(m.status)}>{m.status.toLowerCase()}</StatusPill></div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {m.status === 'PENDING' && <><Button size="sm" onClick={() => act(m.id, { status: 'APPROVED' })}>Approve</Button><Button size="sm" variant="outline" onClick={() => act(m.id, { status: 'REJECTED' })}>Reject</Button></>}
                <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(m.url).then(() => toast('CDN URL copied'))}>Copy URL</Button>
                <Button size="sm" variant="ghost" onClick={() => confirm('Delete this file permanently?') && act(m.id, undefined, 'DELETE')}>Delete</Button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
