"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePostApiV1AuthLoginMutation } from "@/lib/generatedApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepMe, setKeepMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");

  // Panggil mutation hook dari RTK Query auto-generated
  const [loginMutation, { isLoading }] = usePostApiV1AuthLoginMutation();

  useEffect(() => {
    document.title = "Sign In | Aumo Workspace";

    const saved = localStorage.getItem("aumo_saved_email");
    if (saved) {
      setEmail(saved);
      setKeepMe(true);
    }
  }, []);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    try {
      // Eksekusi mutasi login lewat RTK Query
      await loginMutation({
        loginRequest: {
          email,
          password,
          rememberMe: keepMe,
          isMobileClient: false,
        },
      }).unwrap();

      // Simpan/hapus email di local storage jika checkbox diset
      if (keepMe) {
        localStorage.setItem("aumo_saved_email", email);
      } else {
        localStorage.removeItem("aumo_saved_email");
      }

      const targetUrl = searchParams.get("redirectTo") || "/home";

      // Hard navigation agar cookie session 'AumoFinance.Session' aktif sempurna di browser
      window.location.href = targetUrl;
    } catch (e: any) {
      console.error("[LOGIN FAIL]", e);
      // Fallback bertingkat untuk menangkap error dari .NET Identity / ProblemDetails
      const errorMessage =
        e?.data?.message ||
        e?.data?.title ||
        e?.data?.errors?.Email?.[0] ||
        (e?.status === "FETCH_ERROR"
          ? "Gagal terhubung ke server backend."
          : "Email atau password salah / terjadi kesalahan sistem.");

      setErr(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white text-black p-6 rounded-2xl shadow-sm border border-zinc-200">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          Sign in
        </h2>
        <p className="text-sm text-zinc-600 mt-2">Masuk ke workspace kamu.</p>
      </div>
      <form onSubmit={onLogin} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs tracking-widest uppercase font-semibold text-black"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="h-11 rounded-xl bg-zinc-50 border-zinc-300 text-black placeholder:text-zinc-400 focus-visible:ring-black"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="password"
              className="text-xs tracking-widest uppercase font-semibold text-black"
            >
              Password
            </Label>
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-xs uppercase tracking-wide text-zinc-600 hover:text-black font-medium"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
          <Input
            id="password"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 rounded-xl bg-zinc-50 border-zinc-300 text-black placeholder:text-zinc-400 focus-visible:ring-black"
            required
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keepMe"
              checked={keepMe}
              onCheckedChange={(v) => setKeepMe(v as boolean)}
              className="rounded border-zinc-400 data-[state=checked]:bg-black data-[state=checked]:text-white"
            />
            <Label
              htmlFor="keepMe"
              className="text-xs font-normal cursor-pointer leading-none text-black"
            >
              Keep me signed in
            </Label>
          </div>
          <a
            href="#"
            className="text-xs text-zinc-600 hover:text-black underline underline-offset-4"
          >
            Forgot?
          </a>
        </div>
        {err && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs px-3.5 py-3 rounded-xl font-medium">
            {err}
          </div>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl text-sm font-medium bg-black text-white hover:bg-zinc-800"
        >
          {isLoading ? "Processing..." : "Sign In"}
        </Button>
        <div className="flex justify-between pt-6 border-t border-zinc-200 text-xs font-mono text-zinc-500">
          <span>SECURE COOKIE</span>
          <span>Keep your data safe</span>
        </div>
      </form>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 animate-pulse h-[420px] flex flex-col justify-center items-center">
      <p className="text-sm font-medium text-zinc-400">Loading workspace...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginFormContent />
      </Suspense>
    </main>
  );
}
