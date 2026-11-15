import { StatusPill } from '@/components/atoms';

/** How account statuses read in the admin: approval + block/unblock wording. */
export const USER_STATUS: Record<string, { label: string; tone: 'ok' | 'warn' | 'bad' }> = {
  ACTIVE: { label: 'Active', tone: 'ok' },
  PENDING_APPROVAL: { label: 'Waiting for approval', tone: 'warn' },
  SUSPENDED: { label: 'Blocked', tone: 'bad' },
};
export const UserStatusPill = ({ status }: { status: string }) => {
  const m = USER_STATUS[status] ?? { label: status, tone: 'warn' as const };
  return <StatusPill tone={m.tone}>{m.label}</StatusPill>;
};
