'use client';
import { UserForm } from '@/components/organisms/users/UserForm';
import { PageTitle } from '@/components/organisms/Widgets';

export default function NewUserPage() {
  return (
    <>
      <PageTitle title="Add user" crumb="All users" description="Create an account with exactly one role. They sign in with a one-time code sent to their email." />
      <UserForm />
    </>
  );
}
