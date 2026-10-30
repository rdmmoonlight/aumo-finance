import GeneralLedgerTemporaryPage from '#/features/reports/general-ledgers/temporary-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/general-ledgers/temporary')({
  component: GeneralLedgerTemporaryPage,
});