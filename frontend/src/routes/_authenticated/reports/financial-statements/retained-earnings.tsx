import RetainedEarningsPage from '#/features/reports/financial-statements/retained-earnings-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/financial-statements/retained-earnings')({
  component: RetainedEarningsPage,
});