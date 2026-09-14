import { createFileRoute } from '@tanstack/react-router'
import StatementOfCashFlowPage from '@/pages/reports/StatementOfCashFlowPage'
export const Route = createFileRoute('/_authenticated/reports/statement-of-cash-flow')({ component: StatementOfCashFlowPage })
