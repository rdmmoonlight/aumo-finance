import { createFileRoute } from '@tanstack/react-router'
import GeneralLedgerPermanentPage from '@/pages/reports/GeneralLedgerPermanentPage'

export const Route = createFileRoute('/_authenticated/reports/general-ledger-permanent')({ component: GeneralLedgerPermanentPage })
