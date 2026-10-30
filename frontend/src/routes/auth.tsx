import AuthPage from '#/features/auth/auth';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});