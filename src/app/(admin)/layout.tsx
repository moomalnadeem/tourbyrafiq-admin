import type { ReactNode } from 'react';
import { AdminShell } from '@/components/organisms/AdminShell';
export default function Layout({ children }: { children: ReactNode }) { return <AdminShell mode="admin">{children}</AdminShell>; }
