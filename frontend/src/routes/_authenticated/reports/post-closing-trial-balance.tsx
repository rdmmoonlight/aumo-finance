import { createFileRoute } from '@tanstack/react-router'
import PostClosingTrialBalancePage from '@/pages/reports/PostClosingTrialBalancePage'
export const Route = createFileRoute('/_authenticated/reports/post-closing-trial-balance')({ component: PostClosingTrialBalancePage })
