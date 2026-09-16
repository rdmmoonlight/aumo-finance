import { createFileRoute } from '@tanstack/react-router'
import StatementOfFinancialPositionPage from '@/pages/reports/StatementOfFinancialPositionPage'

export const Route = createFileRoute('/_authenticated/reports/statement-of-financial-position')({ component: StatementOfFinancialPositionPage })
