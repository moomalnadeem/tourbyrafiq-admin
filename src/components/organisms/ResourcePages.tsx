'use client';
import { notFound, useRouter } from 'next/navigation';
import { ButtonLink, Skeleton } from '@/components/atoms';
import { RESOURCES } from '@/config/resources';
import { DataTable } from './DataTable';
import { ResourceForm } from './ResourceForm';
import { useApi } from './useApi';
import { PageTitle } from './Widgets';

/** Generic list screen for any configured resource. */
export function ResourceList({ group, resource }: { group: 'catalog' | 'content'; resource: string }) {
  const cfg = RESOURCES[resource];
  const router = useRouter();
  if (!cfg || cfg.group !== group) notFound();
  return (
    <>
      <PageTitle title={cfg.title} description={`${cfg.code} · manage ${cfg.title.toLowerCase()} shown on the website and app.`}
        actions={!cfg.readOnly && cfg.fields.length > 0 && resource !== 'inquiries' ? <ButtonLink href={`/${group}/${resource}/new`} iconLeft="plus">{`Add ${cfg.singular}`}</ButtonLink> : undefined} />
      <DataTable path={cfg.api} columns={cfg.columns} statuses={cfg.statusFilter} onRowClick={cfg.readOnly ? undefined : (row) => router.push(`/${group}/${resource}/${row.id}`)} />
    </>
  );
}

/** Generic create / edit screen. */
export function ResourceEdit({ group, resource, id }: { group: 'catalog' | 'content'; resource: string; id: string }) {
  const cfg = RESOURCES[resource];
  if (!cfg || cfg.group !== group) notFound();
  const isNew = id === 'new';
  const { data, loading, error } = useApi<any>(isNew ? null : `${cfg.api}/${id}`);
  return (
    <>
      <PageTitle title={isNew ? `New ${cfg.singular}` : data?.title ?? data?.name ?? data?.question ?? cfg.singular} crumb={cfg.title} />
      {error ? <p style={{ color: 'var(--c-bad)' }}>{error}</p> : loading ? <Skeleton style={{ height: 400 }} /> : <ResourceForm config={cfg} initial={isNew ? undefined : data} />}
    </>
  );
}
