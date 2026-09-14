import { createFileRoute } from '@tanstack/react-router'
import GuardianPage from '@/pages/GuardianPage'
export const Route = createFileRoute('/_authenticated/guardian')({ component: GuardianPage })
