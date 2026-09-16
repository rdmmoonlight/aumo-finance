import { createFileRoute } from '@tanstack/react-router'
import GeneralLedgerTemporaryPage from '@/pages/reports/GeneralLedgerTemporaryPage'

export const Route = createFileRoute('/_authenticated/reports/general-ledger-temporary')({ component: GeneralLedgerTemporaryPage })
