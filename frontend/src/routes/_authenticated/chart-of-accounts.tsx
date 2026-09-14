import { createFileRoute } from '@tanstack/react-router'
import ChartOfAccountsPage from '@/pages/ChartOfAccountsPage'
export const Route = createFileRoute('/_authenticated/chart-of-accounts')({ component: ChartOfAccountsPage })
