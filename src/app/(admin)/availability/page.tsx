'use client';
import { useEffect, useState } from 'react';
import { Button, Select } from '@/components/atoms';
import { useToast } from '@/components/organisms/Toaster';
import { useApi } from '@/components/organisms/useApi';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

type Day = { date: string; slots: number; booked: number; closed: boolean; priceOverride?: string | null };

/** AD11 · Availability & pricing — 60-day calendar per tour. */
export default function Availability() {
  const { data: tours } = useApi<any>('admin/catalog/tours?limit=100');
  const [tourId, setTourId] = useState('');
  const [days, setDays] = useState<Record<string, Day>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const toast = useToast();

  useEffect(() => {
    if (!tourId) return;
    const start = new Date();
    const grid: Record<string, Day> = {};
    for (let i = 1; i <= 60; i++) { const d = new Date(start.getTime() + i * 86_400_000).toISOString().slice(0, 10); grid[d] = { date: d, slots: 12, booked: 0, closed: false }; }
    apiFetch<Day[]>(`catalog/tours/${tourId}/availability`)
      .then((rows) => { for (const r of rows) { const d = r.date.slice(0, 10); if (grid[d]) grid[d] = { ...grid[d], ...r, date: d }; } })
      .catch(() => undefined)
      .finally(() => { setDays({ ...grid }); setDirty(new Set()); });
  }, [tourId]);

  const toggle = (d: string) => { setDays((x) => ({ ...x, [d]: { ...x[d], closed: !x[d].closed } })); setDirty((s) => new Set(s).add(d)); };
  const setSlots = (d: string, n: number) => { setDays((x) => ({ ...x, [d]: { ...x[d], slots: n } })); setDirty((s) => new Set(s).add(d)); };

  async function save() {
    const payload = [...dirty].map((d) => ({ date: d, slots: days[d].slots, closed: days[d].closed }));
    try { await apiFetch(`admin/catalog/tours/${tourId}/availability`, { method: 'PUT', body: { days: payload } }); toast(`Saved ${payload.length} days`); setDirty(new Set()); } catch (e: any) { toast(e.message, 'error'); }
  }

  return (
    <>
      <PageTitle title="Availability & pricing" description="Close dates or change daily capacity. Changes apply instantly to the website and app." actions={tourId ? <Button onClick={save} disabled={!dirty.size}>Save {dirty.size || ''} changes</Button> : undefined} />
      <Card>
        <Select aria-label="Choose tour" value={tourId} onChange={(e) => setTourId(e.target.value)} style={{ maxWidth: 420 }}>
          <option value="">Choose a tour…</option>{(tours?.items ?? []).map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </Select>
      </Card>
      {tourId && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: 8 }}>
          {Object.values(days).map((d) => (
            <div key={d.date} style={{ background: d.closed ? 'var(--c-bad-bg)' : '#fff', border: `1px solid ${dirty.has(d.date) ? 'var(--c-brand)' : 'var(--c-line)'}`, borderRadius: 12, padding: 10, display: 'grid', gap: 6, fontSize: 12.5 }}>
              <strong>{d.booked ? `${d.booked} booked · ` : ''}{new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>Slots <input type="number" min={0} max={200} value={d.slots} onChange={(e) => setSlots(d.date, Number(e.target.value))} style={{ width: 52, height: 28, border: '1px solid var(--c-line)', borderRadius: 6, padding: '0 6px' }} disabled={d.closed} /></label>
              <button type="button" onClick={() => toggle(d.date)} style={{ border: 0, background: 'none', color: d.closed ? 'var(--c-bad)' : 'var(--c-brand)', textAlign: 'left', padding: 0, fontWeight: 600 }}>{d.closed ? 'Closed · open' : 'Close date'}</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
