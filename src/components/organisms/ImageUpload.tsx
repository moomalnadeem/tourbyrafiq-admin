'use client';
import { useState } from 'react';
import { Icon, Spinner } from '@/components/atoms';
import { apiFetch } from '@/lib/api/client';
import { useToast } from './Toaster';

/** Uploads to Supabase Storage via the media service; stores the returned CDN URL in the form. */
export function ImageUpload({ value, onChange, multiple, folder = 'general' }: { value: string | string[] | null | undefined; onChange: (v: any) => void; multiple?: boolean; folder?: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const list: string[] = multiple ? (Array.isArray(value) ? value : []) : value ? [value as string] : [];

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, multiple ? 10 : 1)) {
        const fd = new FormData(); fd.append('file', f); fd.append('folder', folder);
        const m = await apiFetch<{ url: string }>('media', { formData: fd });
        urls.push(m.url);
      }
      onChange(multiple ? [...list, ...urls] : urls[0]);
    } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(false); }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {list.map((src, i) => (
        <div key={src + i} style={{ position: 'relative', width: 96, height: 72 }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
          <button type="button" aria-label="Remove image" onClick={() => onChange(multiple ? list.filter((_, j) => j !== i) : null)}
            style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, border: 0, background: 'rgba(0,0,0,.6)', color: '#fff', display: 'grid', placeItems: 'center' }}><Icon name="close" size={12} /></button>
        </div>
      ))}
      <label style={{ width: 96, height: 72, borderRadius: 8, border: '1px dashed var(--c-line)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--c-brand)', background: 'var(--c-sand)' }}>
        {busy ? <Spinner /> : <Icon name="upload" size={20} />}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
      </label>
    </div>
  );
}
