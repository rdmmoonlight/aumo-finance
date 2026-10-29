import AiAssistantPage from '#/features/ai-assistant/ai-assistant-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/ai-assistant')({
  component: AiAssistantPage,
});