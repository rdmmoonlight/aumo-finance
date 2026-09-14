import { createFileRoute } from '@tanstack/react-router'
import AIAssistantPage from '@/pages/AIAssistantPage'
export const Route = createFileRoute('/_authenticated/aiassistant')({ component: AIAssistantPage })
