'use client';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { ConfigList } from '@/components/organisms/config/ConfigList';

export default function Page({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = use(params);
  if (resource !== 'modules' && resource !== 'features') notFound();
  return <ConfigList kind={resource} />;
}
