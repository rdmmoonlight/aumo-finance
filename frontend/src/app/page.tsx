"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/auth/page";
import { useGetApiV1AuthMeQuery } from "@/lib/store/auth/authApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, ArrowRight, UserPlus, Loader2 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // RTK Query untuk mengecek status autentikasi saat ini
  const {
    data: user,
    isLoading: checkingAuth,
    isSuccess,
  } = useGetApiV1AuthMeQuery();

  const isAuthenticated = isSuccess && Boolean(user);

  useEffect(() => {
    document.title = "Aumo Finance | Operations, neatly organized.";

    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  const handleOpenModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setOpen(true);
  };

  // Tampilan loading penuh jika sudah terautentikasi dan menunggu redirect
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black text-white">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Redirecting to dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full bg-black text-white lg:grid-cols-[1.15fr_1fr]">
      {/* LEFT PANEL */}
      <div className="flex flex-col justify-between border-r border-zinc-800 bg-zinc-950 p-8 lg:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white font-bold text-black">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight">
            AUMO FINANCE
          </span>
        </div>

        <div className="mt-12 lg:mt-0">
          <h1 className="max-w-lg text-5xl font-semibold leading-[0.95] tracking-[-0.03em]">
            Operations,
            <br />
            neatly
            <br />
            organized.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-6 text-zinc-400">
            Matte, tenang, tanpa distraksi. Dibuat untuk produksi, bukan
            pameran.
          </p>
          <div className="mt-12 border-t border-zinc-800">
            <div className="flex justify-between border-b border-zinc-800 py-4 text-xs">
              <span className="font-mono text-zinc-500">01</span>
              <span>Revenues & Expenses</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 py-4 text-xs">
              <span className="font-mono text-zinc-500">02</span>
              <span>Tracking</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 py-4 text-xs">
              <span className="font-mono text-zinc-500">03</span>
              <span>Finance & Costings</span>
            </div>
          </div>
        </div>

        <div className="hidden justify-between font-mono text-xs text-zinc-500 lg:flex">
          <span>© rdmmoonlight 2026</span>
          <span>COOKIE AUTH • AUMO SYSTEM</span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col items-center justify-center gap-6 bg-black p-6 lg:p-12">
        <div className="max-w-sm text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Selamat Datang
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Silakan masuk atau buat akun baru untuk mengakses dashboard dan
            layanan finansial.
          </p>
        </div>

        {/* Action Buttons: Sign In & Register */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <Button
            disabled={checkingAuth}
            onClick={() => handleOpenModal("login")}
            className="flex-1 w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            {checkingAuth ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>{checkingAuth ? "Checking..." : "Sign In"}</span>
            {!checkingAuth && <ArrowRight className="w-4 h-4" />}
          </Button>

          <Button
            disabled={checkingAuth}
            onClick={() => handleOpenModal("register")}
            variant="outline"
            className="flex-1 w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 hover:text-white disabled:opacity-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register</span>
          </Button>
        </div>

        {/* Modal Dialog Form */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-md p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-lg font-medium text-zinc-100">
                {authMode === "login" ? "Sign In to Aumo" : "Create an Account"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-4">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-8 text-sm text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Loading form...
                  </div>
                }
              >
                <LoginPage
                  initialMode={authMode}
                  onSuccess={() => setOpen(false)}
                />
              </Suspense>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}