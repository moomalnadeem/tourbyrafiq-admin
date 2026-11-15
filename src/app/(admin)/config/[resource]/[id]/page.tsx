'use client';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { ConfigEdit } from '@/components/organisms/config/ConfigForm';

export default function Page({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = use(params);
  if (resource !== 'modules' && resource !== 'features') notFound();
  return <ConfigEdit kind={resource} id={id} />;
}
