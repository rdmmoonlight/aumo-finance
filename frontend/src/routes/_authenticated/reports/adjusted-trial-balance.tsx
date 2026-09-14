import { createFileRoute } from '@tanstack/react-router'
import AdjustedTrialBalancePage from '@/pages/reports/AdjustedTrialBalancePage'
export const Route = createFileRoute('/_authenticated/reports/adjusted-trial-balance')({ component: AdjustedTrialBalancePage })
