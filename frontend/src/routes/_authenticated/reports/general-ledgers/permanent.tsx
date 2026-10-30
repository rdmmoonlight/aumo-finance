import GeneralLedgerPermanentPage from '#/features/reports/general-ledgers/permanent-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/reports/general-ledgers/permanent')({
  component: GeneralLedgerPermanentPage,
});