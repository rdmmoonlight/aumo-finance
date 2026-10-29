import ChartOfAccountsPage from '#/features/chart-of-accounts/chart-of-accounts-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/chart-of-accounts')({
  component: ChartOfAccountsPage,
});