import { createFileRoute } from '@tanstack/react-router'
import ClosingJournalPage from '@/pages/reports/ClosingJournalPage'

export const Route = createFileRoute('/_authenticated/reports/closing-journal')({ component: ClosingJournalPage })
