"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  usePostApiV1AuthLoginMutation,
  usePostApiV1AuthGoogleLoginMutation,
  useGetApiV1AuthMeQuery,
  generatedApi,
} from "@/lib/generatedApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

// Deklarasi global type Google GIS SDK
declare global {
  interface Window {
    google?: any;
  }
}

// Icon Google SVG
function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginFormContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [showPass, setShowPass] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const { data: profile, isLoading: isProfileLoading } =
    useGetApiV1AuthMeQuery();

  const [loginMutation, { isLoading: isLoggingIn }] =
    usePostApiV1AuthLoginMutation();

  // RTK Query Hook untuk Google Login
  const [googleLoginMutation, { isLoading: isGoogleLoggingIn }] =
    usePostApiV1AuthGoogleLoginMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      keepMe: false,
    },
  });

  const keepMeValue = watch("keepMe");

  useEffect(() => {
    if (!isProfileLoading && profile) {
      const targetUrl = searchParams.get("redirectTo") || "/home";
      window.location.replace(targetUrl);
    }
  }, [profile, isProfileLoading, searchParams]);

  useEffect(() => {
    document.title = "Sign In | Aumo Workspace";
    const saved = localStorage.getItem("aumo_saved_email");
    if (saved) {
      setValue("email", saved);
      setValue("keepMe", true);
    }
  }, [setValue]);

  // Load Google Identity Services SDK secara konsisten
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handler Login Biasa
  const onSubmit = async (values: LoginFormValues) => {
    setApiErr("");
    try {
      dispatch(generatedApi.util.resetApiState());

      await loginMutation({
        loginRequest: {
          email: values.email,
          password: values.password,
          rememberMe: values.keepMe,
          isMobileClient: false,
        },
      }).unwrap();

      if (values.keepMe) {
        localStorage.setItem("aumo_saved_email", values.email);
      } else {
        localStorage.removeItem("aumo_saved_email");
      }

      const targetUrl = searchParams.get("redirectTo") || "/home";
      window.location.replace(targetUrl);
    } catch (e: any) {
      console.error("[LOGIN FAIL]", e);
      const errorMessage =
        e?.data?.message ||
        e?.data?.title ||
        e?.data?.errors?.Email?.[0] ||
        (e?.status === "FETCH_ERROR"
          ? "Gagal terhubung ke server backend."
          : "Email atau password salah / terjadi kesalahan sistem.");
      setApiErr(errorMessage);
    }
  };

  // Handler Trigger Login Google
  const handleGoogleLogin = () => {
    setApiErr("");

    if (!window.google?.accounts?.id) {
      setApiErr("Layanan Google Login belum siap, silakan coba lagi.");
      return;
    }

    // Inisialisasi Google Token Client untuk OAuth2 Popup
    const client = window.google.accounts.oauth2.initTokenClient({
      // Scope dasar untuk autentikasi user
      scope: "openid email profile",
      callback: async (response: any) => {
        if (response.error) {
          console.error("[GOOGLE AUTH ERROR]", response);
          setApiErr("Gagal melakukan autentikasi dengan Google.");
          return;
        }

        // Ambil access_token / id_token dari respon Google
        const idToken = response.access_token || response.id_token;

        try {
          dispatch(generatedApi.util.resetApiState());

          // Kirim Token ke Backend melalui RTK Query
          await googleLoginMutation({
            googleLoginRequest: {
              idToken: idToken,
              isMobileClient: false,
            },
          }).unwrap();

          const targetUrl = searchParams.get("redirectTo") || "/home";
          window.location.replace(targetUrl);
        } catch (e: any) {
          console.error("[GOOGLE LOGIN FAIL]", e);
          const errorMessage =
            e?.data?.message ||
            e?.data?.title ||
            (e?.status === "FETCH_ERROR"
              ? "Gagal terhubung ke server backend."
              : "Autentikasi Google gagal atau akun tidak terdaftar.");
          setApiErr(errorMessage);
        }
      },
    });

    // Buka Popup Login Google
    client.requestAccessToken();
  };

  if (isProfileLoading) {
    return <LoginFormSkeleton />;
  }

  return (
    <div className="light w-full max-w-sm bg-white text-black p-6 rounded-2xl shadow-sm border border-zinc-200 selection:bg-black selection:text-white [&_*::selection]:bg-black [&_*::selection]:text-white">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          Sign in
        </h2>
        <p className="text-sm text-zinc-600 mt-2">Masuk ke workspace kamu.</p>
      </div>

      {/* Tombol Continue with Google */}
      <div className="space-y-4">
        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoggingIn || isLoggingIn}
          variant="outline"
          className="w-full h-11 rounded-xl text-sm font-medium border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 flex items-center justify-center gap-3 transition-colors"
        >
          <GoogleIcon className="w-5 h-5" />
          <span>
            {isGoogleLoggingIn ? "Authenticating..." : "Continue with Google"}
          </span>
        </Button>

        {/* Separator Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-zinc-200 w-full"></div>
          <span className="bg-white px-3 text-xs font-medium text-zinc-500 uppercase tracking-wider absolute">
            or
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Field Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="tracking-widest uppercase font-semibold text-black"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            {...register("email")}
            className="h-11 rounded-xl bg-zinc-50 border-zinc-300 text-black text-sm placeholder:text-zinc-400 focus-visible:ring-black selection:bg-black selection:text-white"
          />
          {errors.email && (
            <p className="text-xs text-red-600 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Field Password */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="password"
              className="tracking-widest uppercase font-semibold text-black"
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
            placeholder="••••••••"
            {...register("password")}
            className="h-11 rounded-xl bg-zinc-50 border-zinc-300 text-black text-sm placeholder:text-zinc-400 focus-visible:ring-black selection:bg-black selection:text-white font-sans"
          />
          {errors.password && (
            <p className="text-xs text-red-600 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Checkbox Keep Me & Forgot Link */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keepMe"
              checked={keepMeValue}
              onCheckedChange={(v) => setValue("keepMe", v === true)}
              className="h-4 w-4 rounded border border-zinc-400 bg-white shadow-none data-[state=checked]:bg-black data-[state=checked]:border-black data-[state=checked]:text-white [&_svg]:h-3 [&_svg]:w-3 [&_svg]:stroke-[3]"
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

        {/* Alert Error dari Backend */}
        {apiErr && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs px-3.5 py-3 rounded-xl font-medium">
            {apiErr}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoggingIn || isGoogleLoggingIn}
          className="w-full h-11 rounded-xl text-sm font-medium bg-black text-white hover:bg-zinc-800"
        >
          {isLoggingIn ? "Processing..." : "Sign In"}
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
    <div className="light w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 animate-pulse h-64 flex flex-col justify-center items-center">
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
