'use client';
import { useState } from 'react';
import { Button, StatusPill, Textarea, toneFor } from '@/components/atoms';
import { useToast } from '@/components/organisms/Toaster';
import { useApi } from '@/components/organisms/useApi';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** AD27 · Support inbox. */
export default function Support() {
  const { data, reload } = useApi<any>('admin/content/tickets?limit=50');
  const [reply, setReply] = useState<Record<string, string>>({});
  const toast = useToast();
  return (
    <>
      <PageTitle title="Support inbox" />
      {(data?.items ?? []).map((t: any) => (
        <Card key={t.id} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}><strong>{t.subject}</strong><span style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>{t.user?.email} {t.bookingRef && `· ${t.bookingRef}`}<StatusPill tone={toneFor(t.status)}>{t.status.toLowerCase()}</StatusPill></span></div>
          {t.messages.map((m: any) => <p key={m.id} style={{ background: m.authorId === t.userId ? 'var(--c-sand)' : 'var(--c-cream)', padding: 12, borderRadius: 10, fontSize: 14 }}>{m.body}</p>)}
          <Textarea aria-label="Reply" value={reply[t.id] ?? ''} onChange={(e) => setReply({ ...reply, [t.id]: e.target.value })} style={{ minHeight: 80 }} />
          <div><Button size="sm" disabled={!reply[t.id]} onClick={async () => { try { await apiFetch(`admin/support/tickets/${t.id}/reply`, { body: { body: reply[t.id] } }); setReply({ ...reply, [t.id]: '' }); toast('Reply sent'); reload(); } catch (e: any) { toast(e.message, 'error'); } }}>Send reply</Button></div>
        </Card>
      ))}
      {data && !data.items?.length && <p style={{ color: 'var(--c-muted)' }}>Inbox zero.</p>}
    </>
  );
}
