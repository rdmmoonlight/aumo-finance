import GeneralJournalPage from '#/features/reports/journals/general-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/journals/general')({
  component: GeneralJournalPage,
});