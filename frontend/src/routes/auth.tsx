import { GoogleOAuthProvider } from "@react-oauth/google";
import { createFileRoute } from '@tanstack/react-router';
import React, { Suspense } from "react";
import AuthForm, { AuthFormSkeleton, GOOGLE_CLIENT_ID } from "../features/auth/auth";

"use client";

function Page(): React.JSX.Element {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <main className="flex min-h-screen items-center justify-center p-4 bg-zinc-50">
        <Suspense fallback={<AuthFormSkeleton />}>
          <AuthForm initialMode="login" />
        </Suspense>
      </main>
    </GoogleOAuthProvider>
  );
}

export const Route = createFileRoute('/auth')({
  component: Page,
});
