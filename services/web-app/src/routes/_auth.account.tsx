import { AccountPage } from '@/features/account/account-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/account')({
  component: AccountPage,
});
