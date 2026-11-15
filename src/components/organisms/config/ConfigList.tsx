'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ButtonLink, Icon, StatusPill } from '@/components/atoms';
import { apiFetch } from '@/lib/api/client';
import { DataTable, type TableColumn } from '../DataTable';
import { useToast } from '../Toaster';
import { useApi } from '../useApi';
import { KpiTile, PageTitle } from '../Widgets';
import { Switch } from './Switch';

export type ConfigKind = 'modules' | 'features';
export const CONFIG_TEXT: Record<ConfigKind, { title: string; singular: string; description: string }> = {
  modules: { title: 'Modules', singular: 'module', description: 'Switch whole areas of the project on or off. An unpublished module — and every feature inside it — is hidden across the website and app.' },
  features: { title: 'Features', singular: 'feature', description: 'Switch individual features on or off. A feature is live only when it and its module are both published.' },
};

interface Stats {
  modules: { total: number; published: number; unpublished: number; features: number };
  features: { total: number; published: number; unpublished: number; hiddenByModule: number; live: number };
}

const code = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, background: 'var(--c-cream, #f4eee6)', color: 'var(--c-ink)', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' as const };
const chip = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '4px 10px', borderRadius: 999, border: '1px solid var(--c-line)', background: '#fff', whiteSpace: 'nowrap' as const };
const iconBtn = { display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 8, border: '1px solid var(--c-line)', background: '#fff', color: 'var(--c-ink)' };

/** Status of one row, including "published but hidden because its module is off" for features. */
function statusOf(kind: ConfigKind, row: any): { label: string; tone: 'ok' | 'neutral' | 'warn' } {
  if (!row.published) return { label: 'Unpublished', tone: 'neutral' };
  if (kind === 'features' && row.module && !row.module.published) return { label: 'Hidden · module off', tone: 'warn' };
  return { label: 'Published', tone: 'ok' };
}

function RowActions({ kind, row, reload, onChanged }: { kind: ConfigKind; row: any; reload: () => void; onChanged: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
      <Switch
        checked={!!row.published} disabled={busy}
        label={`${row.published ? 'Unpublish' : 'Publish'} ${row.name}`}
        onChange={async (next) => {
          setBusy(true);
          try {
            await apiFetch(`admin/config/${kind}/${row.id}`, { method: 'PATCH', body: { published: next } });
            toast(`${row.name} ${next ? 'published — now live' : 'unpublished — now hidden everywhere'}`);
            reload(); onChanged();
          } catch (err: any) { toast(err.message, 'error'); } finally { setBusy(false); }
        }}
      />
      <Link href={`/config/${kind}/${row.id}`} style={iconBtn} aria-label={`Edit ${row.name}`} title="Edit"><Icon name="edit" size={16} /></Link>
    </div>
  );
}

/** Admin · Configuration → Modules / Features list with report cards. */
export function ConfigList({ kind }: { kind: ConfigKind }) {
  const text = CONFIG_TEXT[kind];
  const router = useRouter();
  const [statsKey, setStatsKey] = useState(0);
  const [moduleId, setModuleId] = useState('');
  const { data: stats } = useApi<Stats>(`admin/config/stats?r=${statsKey}`);
  const { data: modules } = useApi<any>(kind === 'features' ? 'admin/config/modules?limit=100' : null);

  const s = stats?.[kind] as any;
  const pct = (n?: number) => (s?.total ? `${Math.round(((n ?? 0) / s.total) * 100)}% of all ${text.title.toLowerCase()}` : undefined);
  const cards = kind === 'modules'
    ? [
        { label: 'Total modules', value: s?.total, icon: 'layers' as const, sub: 'Areas of the website & app' },
        { label: 'Published', value: s?.published, icon: 'eye' as const, sub: pct(s?.published) },
        { label: 'Unpublished', value: s?.unpublished, icon: 'eye-off' as const, sub: s?.unpublished ? 'Hidden everywhere with their features' : 'Nothing hidden' },
        { label: 'Features inside', value: stats?.modules.features, icon: 'filter' as const, sub: 'Across all modules' },
      ]
    : [
        { label: 'Total features', value: s?.total, icon: 'layers' as const, sub: 'Sections, menus & functions' },
        { label: 'Live on site', value: s?.live, icon: 'eye' as const, sub: pct(s?.live) },
        { label: 'Unpublished', value: s?.unpublished, icon: 'eye-off' as const, sub: 'Switched off individually' },
        { label: 'Hidden by module', value: s?.hiddenByModule, icon: 'shield' as const, sub: s?.hiddenByModule ? 'Published, but their module is off' : 'None' },
      ];

  const columns: TableColumn[] = [
    {
      key: 'name', label: kind === 'modules' ? 'Module' : 'Feature',
      cell: (r) => (
        <div style={{ display: 'grid', gap: 3, minWidth: 220 }}>
          <strong style={{ fontWeight: 600 }}>{r.name}</strong>
          {r.description && <span style={{ fontSize: 12.5, color: 'var(--c-muted)', maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</span>}
        </div>
      ),
    },
    { key: 'key', label: 'Key', cell: (r) => <code style={code}>{r.key}</code> },
    kind === 'modules'
      ? { key: '_count.features', label: 'Features', cell: (r) => <span style={chip}><Icon name="filter" size={13} />{r._count?.features ?? 0}</span> }
      : {
          key: 'module.name', label: 'Module',
          cell: (r) => r.module
            ? <Link href={`/config/modules/${r.module.id}`} onClick={(e) => e.stopPropagation()} style={{ ...chip, color: 'var(--c-ink)', textDecoration: 'none' }}>
                <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: r.module.published ? 'var(--c-ok, #2f7a4f)' : '#b9ada1' }} />{r.module.name}
              </Link>
            : '—',
        },
    { key: 'sortOrder', label: 'Order', cell: (r) => <span style={{ color: 'var(--c-muted)' }}>{r.sortOrder}</span> },
    { key: 'published', label: 'Status', cell: (r) => { const st = statusOf(kind, r); return <StatusPill tone={st.tone}>{st.label}</StatusPill>; } },
  ];

  return (
    <>
      <PageTitle title={text.title} description={text.description}
        actions={<ButtonLink href={`/config/${kind}/new`} iconLeft="plus">{`Add ${text.singular}`}</ButtonLink>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        {cards.map((c) => <KpiTile key={c.label} label={c.label} value={c.value === undefined ? '—' : String(c.value)} sub={c.sub} icon={c.icon} />)}
      </div>

      <DataTable
        path={`admin/config/${kind}${moduleId ? `?moduleId=${moduleId}` : ''}`}
        columns={columns}
        statuses={['PUBLISHED', 'UNPUBLISHED']}
        onRowClick={(row) => router.push(`/config/${kind}/${row.id}`)}
        extraFilters={kind === 'features' ? (
          <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} aria-label="Filter by module">
            <option value="">All modules</option>
            {(modules?.items ?? []).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        ) : undefined}
        actions={(row, reload) => <RowActions kind={kind} row={row} reload={reload} onChanged={() => setStatsKey((k) => k + 1)} />}
      />
    </>
  );
}
