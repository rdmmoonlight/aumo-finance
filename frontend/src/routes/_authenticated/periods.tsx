import { createFileRoute } from '@tanstack/react-router'
import PeriodsPage from '@/pages/PeriodsPage'
export const Route = createFileRoute('/_authenticated/periods')({ component: PeriodsPage })
