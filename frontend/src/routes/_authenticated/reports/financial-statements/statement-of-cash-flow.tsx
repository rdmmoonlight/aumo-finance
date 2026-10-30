import StatementOfCashFlowPage from '#/features/reports/financial-statements/statement-of-cash-flow-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/financial-statements/statement-of-cash-flow')({
  component: StatementOfCashFlowPage,
});