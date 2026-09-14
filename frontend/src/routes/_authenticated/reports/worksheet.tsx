import { createFileRoute } from '@tanstack/react-router'
import WorksheetPage from '@/pages/reports/WorksheetPage'
export const Route = createFileRoute('/_authenticated/reports/worksheet')({ component: WorksheetPage })
