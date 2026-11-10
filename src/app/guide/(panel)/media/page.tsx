'use client';
import { StatusPill, toneFor } from '@/components/atoms';
import { ImageUpload } from '@/components/organisms/ImageUpload';
import { useApi } from '@/components/organisms/useApi';
import { Card, PageTitle } from '@/components/organisms/Widgets';

/** Guide panel · Media library (uploads need admin approval). */
export default function GuideMedia() {
  const { data, reload } = useApi<any>('guide/media?limit=60');
  return (
    <>
      <PageTitle title="Media library" description="Upload tour photos. They appear on the website once approved." />
      <Card><ImageUpload multiple value={[]} onChange={() => reload()} folder="guides" /></Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
        {(data?.items ?? []).map((m: any) => <figure key={m.id} style={{ margin: 0, background: '#fff', border: '1px solid var(--c-line)', borderRadius: 12, overflow: 'hidden' }}><img src={m.url} alt="" style={{ width: '100%', height: 120, objectFit: 'cover' }} /><figcaption style={{ padding: 8 }}><StatusPill tone={toneFor(m.status)}>{m.status.toLowerCase()}</StatusPill></figcaption></figure>)}
      </div>
    </>
  );
}
