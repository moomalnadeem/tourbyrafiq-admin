'use client';
import { useState } from 'react';
import { Button, Icon, Skeleton } from '@/components/atoms';
import { apiFetch } from '@/lib/api/client';
import { useToast } from '../Toaster';
import { useApi } from '../useApi';

const day = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const DOC_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  PENDING: { label: 'To review', bg: '#fef3c7', fg: '#b45309' },
  APPROVED: { label: 'Approved', bg: '#dcfce7', fg: '#15803d' },
  REJECTED: { label: 'Rejected', bg: '#ffe4e6', fg: '#be123c' },
};

/** Tour guide verification documents on the admin user page: send upload link, view, approve / reject. */
export function GuideDocumentsPanel({ userId, email }: { userId: string; email: string }) {
  const toast = useToast();
  const { data, loading, reload } = useApi<any>(`admin/users/${userId}/documents`);
  const [busy, setBusy] = useState('');

  const sendLink = async () => {
    if (!confirm(`Email ${email} a private link to upload their documents? It stays valid for 14 days and replaces any earlier unused link.`)) return;
    setBusy('link');
    try { const r = await apiFetch<any>(`admin/users/${userId}/document-link`, { body: {} }); toast(`Upload link sent to ${r.sentTo}`); reload(); }
    catch (e: any) { toast(e.message, 'error'); } finally { setBusy(''); }
  };
  const view = async (mediaId: string) => {
    try { const r = await apiFetch<{ url: string }>(`media/${mediaId}/signed-url`); window.open(r.url, '_blank', 'noopener'); }
    catch (e: any) { toast(e.message, 'error'); }
  };
  const review = async (docId: string, status: 'APPROVED' | 'REJECTED') => {
    const note = status === 'REJECTED' ? prompt('Why is this document rejected? (shown to the guide)') ?? undefined : undefined;
    if (status === 'REJECTED' && note === undefined) return;
    setBusy(docId);
    try { await apiFetch(`admin/users/${userId}/documents/${docId}`, { method: 'PATCH', body: { status, note } }); toast(status === 'APPROVED' ? 'Document approved' : 'Document rejected'); reload(); }
    catch (e: any) { toast(e.message, 'error'); } finally { setBusy(''); }
  };

  if (loading || !data) return <Skeleton style={{ height: 160 }} />;
  const docs: any[] = data.documents ?? [];
  const types: any[] = data.types ?? [];
  const missing = types.filter((t) => t.required && !docs.some((d) => d.type === t.type));
  const link = data.lastLink;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', padding: '12px 14px', borderRadius: 12, background: '#f0f9ff', border: '1px solid var(--a-sky-bg)' }}>
        <span style={{ fontSize: 13 }}>
          {link
            ? link.submittedAt
              ? <>Documents <strong>submitted {day(link.submittedAt)}</strong></>
              : new Date(link.expiresAt) < new Date() ? <>Last link <strong>expired {day(link.expiresAt)}</strong></> : <>Link sent {day(link.createdAt)} · valid until <strong>{day(link.expiresAt)}</strong></>
            : 'No upload link sent yet'}
        </span>
        <Button type="button" size="sm" onClick={sendLink} disabled={busy === 'link'} iconLeft="mail">{busy === 'link' ? 'Sending…' : link ? 'Send new upload link' : 'Send document upload link'}</Button>
      </div>

      {missing.length > 0 && <p style={{ margin: 0, fontSize: 13, color: '#b45309' }}>Missing required: {missing.map((m) => m.label).join(', ')}</p>}

      {docs.length === 0 ? <p style={{ margin: 0, color: 'var(--c-muted)', fontSize: 14 }}>No documents uploaded yet.</p> : (
        <div style={{ display: 'grid', gap: 8 }}>
          {docs.map((d) => {
            const st = DOC_STATUS[d.status] ?? DOC_STATUS.PENDING;
            const expired = d.expiresAt && new Date(d.expiresAt) < new Date();
            return (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center', padding: '10px 12px', border: '1px solid var(--c-line)', borderRadius: 12 }}>
                <div style={{ display: 'grid', gap: 3, minWidth: 0 }}>
                  <strong style={{ fontSize: 14 }}>{d.label}</strong>
                  <span style={{ fontSize: 12.5, color: 'var(--c-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.name} · uploaded {day(d.uploadedAt)}{d.expiresAt ? <> · <span style={{ color: expired ? '#be123c' : undefined, fontWeight: expired ? 700 : 400 }}>expires {day(d.expiresAt)}</span></> : null}
                  </span>
                  {d.note && <span style={{ fontSize: 12.5, color: '#be123c' }}>Note: {d.note}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: st.bg, color: st.fg }}>{st.label}</span>
                  <button type="button" onClick={() => view(d.mediaId)} title="View (secure 5-minute link)" style={{ border: '1px solid var(--a-sky-bg)', background: '#f0f9ff', color: 'var(--a-sky)', borderRadius: 8, height: 30, padding: '0 10px', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="eye" size={14} />View</button>
                  {d.status !== 'APPROVED' && <button type="button" disabled={busy === d.id} onClick={() => review(d.id, 'APPROVED')} style={{ border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#15803d', borderRadius: 8, height: 30, padding: '0 10px', fontSize: 12.5, fontWeight: 600 }}>Approve</button>}
                  {d.status !== 'REJECTED' && <button type="button" disabled={busy === d.id} onClick={() => review(d.id, 'REJECTED')} style={{ border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', borderRadius: 8, height: 30, padding: '0 10px', fontSize: 12.5, fontWeight: 600 }}>Reject</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
