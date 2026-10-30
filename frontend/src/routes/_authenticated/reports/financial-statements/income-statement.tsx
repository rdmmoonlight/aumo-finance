import IncomeStatementPage from '#/features/reports/financial-statements/income-statement-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/financial-statements/income-statement')({
  component: IncomeStatementPage,
});