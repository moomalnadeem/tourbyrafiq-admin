'use client';
import { useEffect, useState } from 'react';
import { Button, FormField, Input, Textarea } from '@/components/atoms';
import { ImageUpload } from '@/components/organisms/ImageUpload';
import { useToast } from '@/components/organisms/Toaster';
import { useApi } from '@/components/organisms/useApi';
import { Card, PageTitle } from '@/components/organisms/Widgets';
import { apiFetch } from '@/lib/api/client';

/** Guide panel · Profile editor (public profile P25). */
export default function GuideProfile() {
  const { data } = useApi<any>('guide/profile');
  const [f, setF] = useState<any>({});
  const toast = useToast();
  useEffect(() => { const g = data?.guideProfile ?? {}; setF({ headline: g.headline ?? '', bio: g.bio ?? '', photo: g.photo ?? null, languages: (g.languages ?? []).join(', '), specialties: (g.specialties ?? []).join(', '), yearsExperience: g.yearsExperience ?? 1 }); }, [data]);
  const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
  return (
    <>
      <PageTitle title="Profile editor" />
      <Card style={{ display: 'grid', gap: 16 }}>
        <FormField label="Photo">{() => <ImageUpload folder="guides" value={f.photo} onChange={(v) => setF({ ...f, photo: v })} />}</FormField>
        <FormField label="Headline">{(id) => <Input id={id} value={f.headline ?? ''} onChange={(e) => setF({ ...f, headline: e.target.value })} />}</FormField>
        <FormField label="About you">{(id) => <Textarea id={id} value={f.bio ?? ''} onChange={(e) => setF({ ...f, bio: e.target.value })} />}</FormField>
        <FormField label="Languages" hint="Comma separated">{(id) => <Input id={id} value={f.languages ?? ''} onChange={(e) => setF({ ...f, languages: e.target.value })} />}</FormField>
        <FormField label="Specialties" hint="Comma separated">{(id) => <Input id={id} value={f.specialties ?? ''} onChange={(e) => setF({ ...f, specialties: e.target.value })} />}</FormField>
        <FormField label="Years of experience">{(id) => <Input id={id} type="number" min={0} max={60} value={f.yearsExperience ?? 1} onChange={(e) => setF({ ...f, yearsExperience: e.target.value })} />}</FormField>
        <div><Button onClick={async () => { try { await apiFetch('guide/profile', { method: 'PATCH', body: { headline: f.headline, bio: f.bio, photo: f.photo ?? undefined, languages: list(f.languages), specialties: list(f.specialties), yearsExperience: Number(f.yearsExperience) } }); toast('Profile saved'); } catch (e: any) { toast(e.message, 'error'); } }}>Save profile</Button></div>
      </Card>
    </>
  );
}
