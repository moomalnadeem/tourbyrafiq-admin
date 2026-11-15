'use client';
import { notFound, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ButtonLink, Skeleton } from '@/components/atoms';
import { RESOURCES, type ResourceConfig, type ResourceGroup } from '@/config/resources';
import { apiFetch } from '@/lib/api/client';
import { DataTable } from './DataTable';
import { ResourceForm } from './ResourceForm';
import { useToast } from './Toaster';
import { useApi } from './useApi';
import { PageTitle } from './Widgets';

/** One-click Publish / Unpublish for resources with a boolean `published` field. */
function PublishToggle({ cfg, row, reload }: { cfg: ResourceConfig; row: any; reload: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const live = !!row.published;
  return (
    <button
      type="button" disabled={busy}
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        try {
          await apiFetch(`${cfg.api}/${row.id}`, { method: 'PATCH', body: { published: !live } });
          toast(`${row.name ?? cfg.singular} ${live ? 'unpublished — now hidden everywhere' : 'published — now live'}`);
          reload();
        } catch (err: any) { toast(err.message, 'error'); } finally { setBusy(false); }
      }}
      style={{
        border: '1px solid', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: busy ? 'default' : 'pointer', whiteSpace: 'nowrap',
        background: live ? '#fff' : 'var(--c-brand)', color: live ? 'var(--c-bad)' : '#fff', borderColor: live ? 'var(--c-line)' : 'var(--c-brand)', opacity: busy ? 0.6 : 1,
      }}
    >
      {busy ? '…' : live ? 'Unpublish' : 'Publish'}
    </button>
  );
}

/** Generic list screen for any configured resource. */
export function ResourceList({ group, resource }: { group: ResourceGroup; resource: string }) {
  const cfg = RESOURCES[resource];
  const router = useRouter();
  if (!cfg || cfg.group !== group) notFound();
  return (
    <>
      <PageTitle title={cfg.title} description={cfg.description ?? `${cfg.code} · manage ${cfg.title.toLowerCase()} shown on the website and app.`}
        actions={!cfg.readOnly && cfg.fields.length > 0 && resource !== 'inquiries' ? <ButtonLink href={`/${group}/${resource}/new`} iconLeft="plus">{`Add ${cfg.singular}`}</ButtonLink> : undefined} />
      <DataTable
        path={cfg.api} columns={cfg.columns} statuses={cfg.statusFilter}
        onRowClick={cfg.readOnly ? undefined : (row) => router.push(`/${group}/${resource}/${row.id}`)}
        actions={cfg.publishToggle ? (row, reload) => <PublishToggle cfg={cfg} row={row} reload={reload} /> : undefined}
      />
    </>
  );
}

/** Generic create / edit screen. */
export function ResourceEdit({ group, resource, id }: { group: ResourceGroup; resource: string; id: string }) {
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
