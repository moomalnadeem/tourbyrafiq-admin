'use client';
import { Icon } from '@/components/atoms';
import { tableStyles as s } from '@/components/organisms/DataTable';
import { useApi } from '@/components/organisms/useApi';
import { PageTitle } from '@/components/organisms/Widgets';

/** AD40 · Permission matrix (read from the gateway — single source of truth). */
export default function Permissions() {
  const { data } = useApi<Record<string, string[]>>('admin/permissions');
  const roles = Object.keys(data ?? {});
  const perms = [...new Set(Object.values(data ?? {}).flat())].sort();
  return (
    <>
      <PageTitle title="Permission matrix" description="Enforced by the API gateway on every request." />
      <div className={s.wrap}><div className={s.scroll}><table className={s.table}>
        <thead><tr><th>Permission</th>{roles.map((r) => <th key={r}>{r.replace('_', ' ')}</th>)}</tr></thead>
        <tbody>{perms.map((p) => <tr key={p}><td><code>{p}</code></td>{roles.map((r) => <td key={r}>{data![r].includes(p) ? <Icon name="check" size={18} style={{ color: 'var(--c-ok)' }} title="Allowed" /> : <span aria-label="Not allowed" style={{ color: 'var(--c-line)' }}>—</span>}</td>)}</tr>)}</tbody>
      </table></div></div>
    </>
  );
}
