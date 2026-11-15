'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/atoms';
import { apiFetch } from '@/lib/api/client';
import s from './NotificationBell.module.css';

interface Note { id: string; title: string; body: string; link: string | null; readAt: string | null; createdAt: string }
interface Feed { items: Note[]; unread: number }

const POLL_MS = 30_000;
function ago(d: string) {
  const sec = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (sec < 60) return 'just now';
  const m = Math.round(sec / 60); if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24); return days < 7 ? `${days} d ago` : new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
const toneOf = (title: string) => (/waiting for approval|blocked/i.test(title) ? 'amber' : /added|signed up/i.test(title) ? 'emerald' : 'indigo');

/** Admin top-bar bell (admins & super admins): new users and other alerts, polled every 30 s. */
export function NotificationBell() {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed>({ items: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try { setFeed(await apiFetch<Feed>('admin/notifications?limit=20')); } catch { /* keep last state */ }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus); };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const markRead = async (id?: string) => {
    try { setFeed(await apiFetch<Feed>('admin/notifications/read', { body: id ? { id } : {} })); } catch { /* ignore */ }
  };
  const openNote = async (n: Note) => {
    if (!n.readAt) markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div className={s.wrap} ref={wrap}>
      <button type="button" className={s.bell} onClick={() => { setOpen((v) => !v); if (!open) load(); }}
        aria-label={`Notifications${feed.unread ? `, ${feed.unread} unread` : ''}`} aria-expanded={open} aria-haspopup="dialog" data-ring={feed.unread > 0 || undefined}>
        <Icon name="bell" size={20} />
        {feed.unread > 0 && <span className={s.badge}>{feed.unread > 99 ? '99+' : feed.unread}</span>}
      </button>
      {open && (
        <div className={s.panel} role="dialog" aria-label="Notifications">
          <header className={s.head}>
            <strong>Notifications</strong>
            {feed.unread > 0 ? <button type="button" className={s.markAll} onClick={() => markRead()}>Mark all as read</button> : <span className={s.allRead}>All caught up</span>}
          </header>
          {feed.items.length === 0 ? (
            <div className={s.empty}><Icon name="bell" size={26} /><p>No notifications yet. New users will show up here.</p></div>
          ) : (
            <ul className={s.list}>
              {feed.items.map((n) => (
                <li key={n.id}>
                  <button type="button" className={s.item} data-unread={!n.readAt || undefined} onClick={() => openNote(n)}>
                    <span className={s.dot} data-tone={toneOf(n.title)} aria-hidden><Icon name="users" size={15} /></span>
                    <span className={s.text}>
                      <strong>{n.title}</strong>
                      <span>{n.body}</span>
                      <small>{ago(n.createdAt)}</small>
                    </span>
                    {!n.readAt && <span className={s.unread} aria-label="Unread" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
