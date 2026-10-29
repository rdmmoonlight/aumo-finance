import ToolsPage from '#/features/tools/tools-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/tools')({
  component: ToolsPage,
});