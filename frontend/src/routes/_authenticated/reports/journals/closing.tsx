import ClosingJournalReportPage from '#/features/reports/journals/closing-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/journals/closing')({
  component: ClosingJournalReportPage,
});