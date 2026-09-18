import LoginForm from "@/app/auth/LoginForm";

export const metadata = {
  title: "Sign In | Aumo Workspace",
  description: "Masuk ke workspace kamu.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
