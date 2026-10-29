import JournalEntryPage from '#/features/journal-entry/journal-entry-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/journal-entry')({
  component: JournalEntryPage,
});