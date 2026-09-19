import { Suspense } from "react";
import LoginForm from "@/app/auth/LoginForm";

export const metadata = {
  title: "Sign In | Aumo Workspace",
  description: "Masuk ke workspace kamu.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 animate-pulse h-[420px] flex flex-col justify-center items-center">
      <p className="text-sm font-medium text-zinc-400">Loading workspace...</p>
    </div>
  );
}
