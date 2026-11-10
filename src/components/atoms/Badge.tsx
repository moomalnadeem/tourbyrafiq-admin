import type { ReactNode } from 'react';
import { cx } from '@/lib/utils/format';
import s from './Badge.module.css';

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral' | 'brand';
export const Badge = ({ children, className }: { children: ReactNode; className?: string }) => <span className={cx(s.badge, s.card, className)}>{children}</span>;
export const StatusPill = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) => <span className={cx(s.badge, s.pill, s[tone])}>{children}</span>;

/** Maps backend statuses to the pill colours used in the admin + account designs. */
export function toneFor(status?: string): Tone {
  const v = String(status ?? '').toUpperCase();
  if (['PAID', 'CONFIRMED', 'COMPLETED', 'PUBLISHED', 'APPROVED', 'ACTIVE', 'PROCESSED', 'RESOLVED'].includes(v)) return 'ok';
  if (['PENDING', 'AWAITING_CONFIRMATION', 'PARTIALLY_PAID', 'PAY_AT_PICKUP', 'REQUESTED', 'PENDING_REVIEW', 'PROCESSING', 'OPEN', 'DRAFT'].includes(v)) return 'warn';
  if (['CANCELLED', 'FAILED', 'REJECTED', 'SUSPENDED', 'REFUNDED', 'UNPAID', 'ARCHIVED'].includes(v)) return 'bad';
  return 'neutral';
}
