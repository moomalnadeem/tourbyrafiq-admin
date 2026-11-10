'use client';
import { use } from 'react';
import { ResourceEdit } from '@/components/organisms/ResourcePages';
export default function Page({ params }: { params: Promise<{ resource: string; id: string }> }) { const p = use(params); return <ResourceEdit group="catalog" resource={p.resource} id={p.id} />; }
