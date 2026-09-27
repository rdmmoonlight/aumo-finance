"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/auth/page";
import { useGetApiV1AuthMeQuery } from "@/lib/generatedApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconArrowRight, IconLock } from "@tabler/icons-react";

export default function LandingPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Menggunakan RTK Query menggantikan getUserProfile() dari auth.ts
  const {
    data: user,
    isLoading: checkingAuth,
    isSuccess,
  } = useGetApiV1AuthMeQuery();

  useEffect(() => {
    document.title = "Aumo Finance | Operations, neatly organized.";

    // Jika fetching sukses dan user terautentikasi, redirect ke /home
    if (isSuccess && user) {
      router.replace("/home");
    }
  }, [isSuccess, user, router]);

  return (
    <div className="grid min-h-screen w-full bg-black text-white lg:grid-cols-[1.15fr_1fr]">
      {/* LEFT PANEL */}
      <div className="flex flex-col justify-between border-r border-zinc-800 bg-zinc-950 p-8 lg:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white font-bold text-black">
            A
          </div>
          {/* UI (14px) */}
          <span className="text-sm font-semibold tracking-tight">
            AUMO FINANCE
          </span>
        </div>

        <div className="mt-12 lg:mt-0">
          {/* Display (48px) */}
          <h1 className="max-w-lg text-5xl font-semibold leading-[0.95] tracking-[-0.03em]">
            Operations,
            <br />
            neatly
            <br />
            organized.
          </h1>
          {/* UI (14px) */}
          <p className="mt-6 max-w-sm text-sm leading-6 text-zinc-400">
            Matte, tenang, tanpa distraksi. Dibuat untuk produksi, bukan
            pameran.
          </p>
          <div className="mt-12 border-t border-zinc-800">
            {/* Caption (12px) */}
            <div className="flex justify-between border-b border-zinc-800 py-4 text-xs">
              <span className="font-mono text-zinc-500">01</span>
              <span>Revenues & Expenses</span>
            </div>
            {/* Caption (12px) */}
            <div className="flex justify-between border-b border-zinc-800 py-4 text-xs">
              <span className="font-mono text-zinc-500">02</span>
              <span>Tracking</span>
            </div>
            {/* Caption (12px) */}
            <div className="flex justify-between border-b border-zinc-800 py-4 text-xs">
              <span className="font-mono text-zinc-500">03</span>
              <span>Finance & Costings</span>
            </div>
          </div>
        </div>

        {/* Caption (12px) */}
        <div className="hidden justify-between font-mono text-xs text-zinc-500 lg:flex">
          <span>© rdmmoonlight 2026</span>
          <span>COOKIE AUTH • AUMO SYSTEM</span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col items-center justify-center gap-6 bg-black p-6 lg:p-12">
        <div className="max-w-sm text-center">
          {/* H2 (24px) */}
          <h2 className="text-2xl font-semibold tracking-tight">
            Selamat Datang
          </h2>
          {/* UI (14px) */}
          <p className="mt-2 text-sm text-zinc-400">
            Silakan masuk ke akun Anda untuk mengakses dashboard dan layanan
            finansial.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* UI (14px) */}
            <Button
              disabled={checkingAuth}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white px-6 py-5 text-sm text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              <IconLock size={18} />
              <span>
                {checkingAuth ? "Checking Session..." : "Sign In to Account"}
              </span>
              <IconArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-md">
            <DialogHeader>
              {/* H3 (20px) */}
              <DialogTitle className="text-center text-xl font-semibold">
                Sign In
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Suspense
                fallback={
                  /* UI (14px) */
                  <div className="p-8 text-center text-sm text-zinc-400 animate-pulse">
                    Loading form...
                  </div>
                }
              >
                <LoginPage />
              </Suspense>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
