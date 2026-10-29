import UnadjustedTrialBalancePage from '#/features/reports/trial-balances/unadjusted-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/trial-balances/unadjusted')({
  component: UnadjustedTrialBalancePage,
});