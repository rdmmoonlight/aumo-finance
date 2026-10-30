import StatementOfFinancialPositionPage from '#/features/reports/financial-statements/statement-of-financial-position-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/financial-statements/statement-of-financial-position')({
  component: StatementOfFinancialPositionPage,
});