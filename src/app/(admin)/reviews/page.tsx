'use client';
import { useState } from 'react';
import { Button } from '@/components/atoms';
import { DataTable } from '@/components/organisms/DataTable';
import { useToast } from '@/components/organisms/Toaster';
import { PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** AD25 · Reviews moderation (approval recalculates the tour rating). */
export default function Reviews() {
  const toast = useToast(); const [k, setK] = useState(0);
  const mod = async (id: string, status: string) => { const reply = status === 'APPROVED' ? prompt('Optional public reply:') ?? undefined : undefined; try { await apiFetch(`admin/reviews/${id}`, { method: 'PATCH', body: { status, reply: reply || undefined } }); toast('Review updated'); setK((x) => x + 1); } catch (e: any) { toast(e.message, 'error'); } };
  return (
    <>
      <PageTitle title="Reviews" />
      <DataTable path="admin/reviews" statuses={['PENDING', 'APPROVED', 'REJECTED']} reloadKey={k}
        columns={[{ key: 'user.name', label: 'Guest' }, { key: 'tour.title', label: 'Tour' }, { key: 'rating', label: '★' }, { key: 'body', label: 'Review', cell: (r) => <span style={{ display: 'block', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.body}</span> }, { key: 'status', label: 'Status', render: 'status' }]}
        actions={(r) => r.status === 'PENDING' ? <div style={{ display: 'flex', gap: 6 }}><Button size="sm" onClick={() => mod(r.id, 'APPROVED')}>Approve</Button><Button size="sm" variant="outline" onClick={() => mod(r.id, 'REJECTED')}>Reject</Button></div> : null} />
    </>
  );
}
