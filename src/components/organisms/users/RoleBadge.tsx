/** One colour per role, used across Admin · Users. */
export const ROLE_META: Record<string, { label: string; tone: string; type: 'Customer' | 'Guide' | 'Staff' }> = {
  TOURIST: { label: 'Tourist', tone: 'sky', type: 'Customer' },
  COMPANY: { label: 'Company', tone: 'violet', type: 'Customer' },
  GUIDE: { label: 'Tour guide', tone: 'teal', type: 'Guide' },
  EDITOR: { label: 'Editor', tone: 'amber', type: 'Staff' },
  SUPPORT: { label: 'Support', tone: 'indigo', type: 'Staff' },
  FINANCE: { label: 'Finance', tone: 'emerald', type: 'Staff' },
  ADMIN: { label: 'Admin', tone: 'rose', type: 'Staff' },
  SUPER_ADMIN: { label: 'Super admin', tone: 'rose', type: 'Staff' },
};
export const ROLE_KEYS = Object.keys(ROLE_META);

export function RoleBadge({ role, name }: { role: string; name?: string }) {
  const m = ROLE_META[role] ?? { label: role, tone: 'indigo', type: 'Staff' as const };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
      background: `var(--a-${m.tone}-bg)`, color: `var(--a-${m.tone})`, boxShadow: role === 'SUPER_ADMIN' ? '0 0 0 1px var(--a-rose) inset' : undefined,
    }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />{name ?? m.label}
    </span>
  );
}

export const initialsOf = (u: { name?: string | null; companyName?: string | null; email?: string }) =>
  (u.name ?? u.companyName ?? u.email ?? '?').split(/[\s@.]/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

export function Avatar({ user, size = 36 }: { user: { name?: string | null; companyName?: string | null; email?: string; avatarUrl?: string | null; role?: string }; size?: number }) {
  const tone = ROLE_META[user.role ?? '']?.tone ?? 'indigo';
  // eslint-disable-next-line @next/next/no-img-element
  if (user.avatarUrl) return <img src={user.avatarUrl} alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flex: 'none' }} />;
  return (
    <span aria-hidden style={{ flex: 'none', width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: size * 0.36, fontWeight: 700, background: `var(--a-${tone}-bg)`, color: `var(--a-${tone})` }}>
      {initialsOf(user)}
    </span>
  );
}
