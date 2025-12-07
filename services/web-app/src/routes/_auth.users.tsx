import { UsersPage } from '@/features/users/users-page';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/users')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.roles?.includes('admin')) {
      throw redirect({ to: '/' });
    }
  },
  component: UsersPage,
});
