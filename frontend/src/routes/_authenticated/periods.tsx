import PeriodsPage from '#/features/periods/periods-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/periods')({
  component: PeriodsPage,
});