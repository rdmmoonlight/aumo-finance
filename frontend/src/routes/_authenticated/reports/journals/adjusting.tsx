import AdjustingJournalPage from '#/features/reports/journals/adjusting-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/journals/adjusting')({
  component: AdjustingJournalPage,
});