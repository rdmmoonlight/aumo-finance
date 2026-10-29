import WorksheetPage from '#/features/reports/worksheet/worksheet-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/worksheet')({
  component: WorksheetPage,
});