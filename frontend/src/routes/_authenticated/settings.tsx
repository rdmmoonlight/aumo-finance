import SettingsPage from '#/features/settings/settings-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
});