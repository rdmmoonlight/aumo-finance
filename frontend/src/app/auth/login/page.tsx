import { Suspense } from "react";
import { AuthFormSkeleton } from "../../../features/auth/auth";
import LoginPage from "../../../features/auth/login-page";

export default function Page(): React.JSX.Element {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginPage initialMode="login" />
    </Suspense>
  );
}
