import PostClosingTrialBalancePage from '#/features/reports/trial-balances/post-closing-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/trial-balances/post-closing')({
  component: PostClosingTrialBalancePage,
});