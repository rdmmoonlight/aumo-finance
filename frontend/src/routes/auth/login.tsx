import { createFileRoute } from '@tanstack/react-router';

import { Suspense } from "react";
import { AuthFormSkeleton } from "../../features/auth/auth";
import LoginPage from "../../features/auth/login-page";

function Page(): React.JSX.Element {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginPage initialMode="login" />
    </Suspense>
  );
}

export const Route = createFileRoute('/auth/login')({
  component: Page,
});
