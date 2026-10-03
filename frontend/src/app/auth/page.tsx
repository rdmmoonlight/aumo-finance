"use client";
import React, { Suspense } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthForm, { GOOGLE_CLIENT_ID, AuthFormSkeleton } from "./auth";

export default function Page(): React.JSX.Element {
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
