// src/routes/auth/login.tsx
import { AuthFormSkeleton } from '#/features/auth/auth';
import LoginPage from '#/features/auth/login-page';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

function RouteComponent(): React.JSX.Element {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginPage initialMode="login" />
    </Suspense>
  );
}