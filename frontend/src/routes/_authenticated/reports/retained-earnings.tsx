import { createFileRoute } from '@tanstack/react-router'
import RetainedEarningsPage from '@/pages/reports/RetainedEarningsPage'
export const Route = createFileRoute('/_authenticated/reports/retained-earnings')({ component: RetainedEarningsPage })
