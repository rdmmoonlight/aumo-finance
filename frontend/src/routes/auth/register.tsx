import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from "react";
import { AuthFormSkeleton } from "../../features/auth/auth";
import RegisterPage from "../../features/auth/register-page";

function Page(): React.JSX.Element {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <RegisterPage initialMode="register" />
    </Suspense>
  );
}

export const Route = createFileRoute('/auth/register')({
  component: Page,
});
