'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '@/components/atoms';
import { ADMIN_NAV, can, GUIDE_NAV, type NavItem } from '@/config/navigation';
import { cx } from '@/lib/utils/format';
import s from './AdminShell.module.css';

function readUser(): { name?: string; email?: string; role?: string } {
  const raw = typeof document !== 'undefined' ? document.cookie.split('; ').find((c) => c.startsWith('tga_user='))?.slice(9) : undefined;
  try { return raw ? JSON.parse(decodeURIComponent(raw)) : {}; } catch { return {}; }
}

/** Responsive admin / guide panel shell (sidebar becomes a drawer on tab & mobile). */
export function AdminShell({ children, mode = 'admin' }: { children: ReactNode; mode?: 'admin' | 'guide' }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string }>({});
  const [q, setQ] = useState('');
  useEffect(() => { setUser(readUser()); }, []);
  useEffect(() => { setOpen(false); }, [path]);

  const groups: { group: string; items: NavItem[] }[] = mode === 'guide' ? [{ group: 'Tour guide', items: GUIDE_NAV }] : ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => can(user.role, i.perm)) })).filter((g) => g.items.length);
  const active = (href: string) => (href === '/' || href === '/guide' ? path === href : path.startsWith(href));
  const initials = (user.name ?? user.email ?? '?').split(/[\s@.]/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(mode === 'guide' ? '/guide/login' : '/login');
  }

  return (
    <div className={cx(s.shell, open && s.open)}>
      <div className={s.scrim} onClick={() => setOpen(false)} aria-hidden />
      <aside className={s.side} aria-label="Admin navigation">
        <div className={s.brand}><span className={s.mark}>TR</span><span><strong>Tours By Rafiq</strong><small>{mode === 'guide' ? 'Guide panel' : 'Admin panel'}</small></span></div>
        {groups.map((g) => (
          <nav key={g.group} aria-label={g.group}>
            <div className={s.group}>{g.group}</div>
            {g.items.map((i) => <Link key={i.href} href={i.href} className={s.link} aria-current={active(i.href) ? 'page' : undefined}><Icon name={i.icon} size={17} />{i.label}</Link>)}
          </nav>
        ))}
        <button className={s.link} style={{ border: 0, background: 'none', width: '100%', marginTop: 16 }} onClick={signOut}><Icon name="logout" size={17} />Sign out</button>
      </aside>
      <div className={s.main}>
        <header className={s.top}>
          <button className={s.burger} onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" size={22} /></button>
          {mode === 'admin' && (
            <form className={s.search} onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/bookings?q=${encodeURIComponent(q.trim())}`); }}>
              <Icon name="search" size={16} /><input placeholder="Search bookings, customers…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
            </form>
          )}
          <div className={s.user}>
            <span className={s.userName} style={{ textAlign: 'right' }}><strong>{user.name ?? user.email}</strong><br /><small style={{ color: 'var(--c-muted)' }}>{user.role?.replace('_', ' ').toLowerCase()}</small></span>
            <span className={s.avatar}>{initials}</span>
          </div>
        </header>
        <main className={s.content} id="main">{children}</main>
      </div>
    </div>
  );
}
