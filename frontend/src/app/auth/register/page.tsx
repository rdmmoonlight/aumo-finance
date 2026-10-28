import { Suspense } from "react";
import { AuthFormSkeleton } from "../../../features/auth/auth";
import RegisterPage from "../../../features/auth/register-page";

export default function Page(): React.JSX.Element {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <RegisterPage initialMode="register" />
    </Suspense>
  );
}
