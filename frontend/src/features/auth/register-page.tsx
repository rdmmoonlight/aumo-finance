"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthForm, { GOOGLE_CLIENT_ID } from "./auth";
import type { AuthPageProps } from "./types";

export default function RegisterPage({
  initialMode = "register",
  onSuccess,
}: AuthPageProps): React.JSX.Element {
  const content = <AuthForm initialMode={initialMode} onSuccess={onSuccess} />;
  if (onSuccess) return content;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <main className="flex min-h-screen items-center justify-center p-4 bg-zinc-50">
        {content}
      </main>
    </GoogleOAuthProvider>
  );
}
