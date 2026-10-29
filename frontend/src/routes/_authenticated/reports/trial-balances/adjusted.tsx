import AdjustedTrialBalancePage from '#/features/reports/trial-balances/adjusted-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/trial-balances/adjusted')({
  component: AdjustedTrialBalancePage,
});