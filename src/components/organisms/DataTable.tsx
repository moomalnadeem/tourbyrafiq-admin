'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Price, Skeleton, StatusPill, toneFor } from '@/components/atoms';
import type { Column } from '@/config/resources';
import { shortDate } from '@/lib/utils/format';
import { useApi } from './useApi';
import s from './DataTable.module.css';

export const get = (obj: any, path: string) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

export function renderCell(row: any, c: Column & { cell?: (row: any) => ReactNode }) {
  if (c.cell) return c.cell(row);
  const v = get(row, c.key);
  switch (c.render) {
    case 'money': return v == null ? '—' : <Price amount={v} size="sm" />;
    case 'status': return v ? <StatusPill tone={toneFor(v)}>{String(v).replace(/_/g, ' ').toLowerCase()}</StatusPill> : '—';
    case 'date': return v ? shortDate(v) : '—';
    case 'image': { const src = Array.isArray(v) ? v[0] : v; return src ? <img className={s.thumb} src={src} alt="" loading="lazy" /> : <span className={s.thumb} style={{ display: 'inline-block' }} />; }
    case 'bool': return v ? 'Yes' : '—';
    default: return v == null || v === '' ? '—' : String(v);
  }
}

export interface TableColumn extends Column { cell?: (row: any) => ReactNode }

/** Reusable paginated, searchable, filterable table bound to any admin list endpoint. */
export function DataTable({ path, columns, statuses, statusParam = 'status', onRowClick, extraFilters, actions, reloadKey }: {
  path: string; columns: TableColumn[]; statuses?: string[]; statusParam?: string; onRowClick?: (row: any) => void;
  extraFilters?: ReactNode; actions?: (row: any, reload: () => void) => ReactNode; reloadKey?: number;
}) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(''); const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const sep = path.includes('?') ? '&' : '?';
  const url = `${path}${sep}page=${page}&limit=20${query ? `&q=${encodeURIComponent(query)}` : ''}${status ? `&${statusParam}=${status}` : ''}`;
  const { data, loading, error, reload } = useApi<any>(url);
  useEffect(() => { if (reloadKey) reload(); }, [reloadKey, reload]);
  const items: any[] = Array.isArray(data) ? data : data?.items ?? [];

  return (
    <div className={s.wrap}>
      <form className={s.bar} onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(q); }}>
        <input type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        {statuses && (
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} aria-label="Filter by status">
            <option value="">All statuses</option>{statuses.map((st) => <option key={st} value={st}>{st.replace(/_/g, ' ').toLowerCase()}</option>)}
          </select>
        )}
        {extraFilters}
      </form>
      <div className={s.scroll}>
        <table className={s.table}>
          <thead><tr>{columns.map((c) => <th key={c.key + c.label} scope="col">{c.label}</th>)}{actions && <th scope="col"><span className="visually-hidden">Actions</span></th>}</tr></thead>
          <tbody>
            {loading && !items.length ? Array.from({ length: 5 }, (_, i) => <tr key={i}><td colSpan={columns.length + 1}><Skeleton style={{ height: 22 }} /></td></tr>) : null}
            {items.map((row) => (
              <tr key={row.id ?? row.key ?? JSON.stringify(row)} className={onRowClick ? s.click : undefined} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {columns.map((c) => <td key={c.key + c.label}>{renderCell(row, c)}</td>)}
                {actions && <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>{actions(row, reload)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !items.length && <div className={s.empty}>{error ?? 'Nothing here yet.'}</div>}
      </div>
      {data && !Array.isArray(data) && data.pages > 1 && (
        <div className={s.foot}>
          <span>{data.total} records</span>
          <div className={s.pager}>
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">‹</button>
            <span style={{ alignSelf: 'center' }}>{page} / {data.pages}</span>
            <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)} aria-label="Next page">›</button>
          </div>
        </div>
      )}
    </div>
  );
}

export { s as tableStyles };
