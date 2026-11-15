'use client';
import { use } from 'react';
import { Skeleton } from '@/components/atoms';
import { useApi } from '@/components/organisms/useApi';
import { UserForm } from '@/components/organisms/users/UserForm';
import { PageTitle } from '@/components/organisms/Widgets';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error } = useApi<any>(`admin/users/${id}`);
  const { data: me } = useApi<any>('auth/me');
  return (
    <>
      <PageTitle title={data ? `Edit ${data.name || data.email}` : 'Edit user'} crumb="All users" description={data?.email} />
      {error ? <p style={{ color: 'var(--a-rose)' }}>{error}</p> : loading || !data ? <Skeleton style={{ height: 480 }} /> : <UserForm initial={data} selfId={me?.id} />}
    </>
  );
}
