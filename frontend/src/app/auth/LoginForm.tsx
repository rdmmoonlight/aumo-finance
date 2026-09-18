"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepMe, setKeepMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("aumo_saved_email");
    if (saved) {
      setEmail(saved);
      setKeepMe(true);
    }
  }, []);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const res = await apiClient.post(
        "/api/v1/auth/login",
        {
          email,
          password,
          rememberMe: keepMe,
          isMobileClient: false,
        },
        { withCredentials: true }
      );

      const isOk =
        res.status === 200 ||
        res.data?.Success ||
        res.data?.success ||
        res.data?.isSuccess;

      if (!isOk) {
        throw new Error(
          res.data?.Message || res.data?.message || "Login gagal"
        );
      }

      localStorage.setItem("isAuthenticated", "true");
      if (keepMe) {
        localStorage.setItem("aumo_saved_email", email);
      } else {
        localStorage.removeItem("aumo_saved_email");
      }

      // Gunakan router bawaan Next.js agar tidak reload total
      router.push("/home");
      router.refresh();
    } catch (e: any) {
      console.error("[LOGIN FAIL]", e.response?.data || e.message);
      const errorMessage =
        e.response?.data?.Message ||
        e.response?.data?.message ||
        e.response?.data?.title ||
        "Email atau password salah";
      setErr(errorMessage);
    } finally {
      setLoading(false);
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
            placeholder="nama@perusahaan.com"
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
          disabled={loading}
          className="w-full h-11 rounded-xl text-sm font-medium bg-black text-white hover:bg-zinc-800"
        >
          {loading ? "Processing..." : "Sign In"}
        </Button>
        <div className="flex justify-between pt-6 border-t border-zinc-200 text-xs font-mono text-zinc-500">
          <span>SECURE COOKIE</span>
          <span>Keep your data safe</span>
        </div>
      </form>
    </div>
  );
}