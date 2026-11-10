'use client';
import { use } from 'react';
import { ResourceList } from '@/components/organisms/ResourcePages';
export default function Page({ params }: { params: Promise<{ resource: string }> }) { return <ResourceList group="catalog" resource={use(params).resource} />; }
