"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
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
import { loginSchema, registerSchema } from "@/lib/validations/auth";

type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  keepMe?: boolean;
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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

function GoogleAuthButton({
  isPending,
  onSuccessHandler,
  onError,
}: {
  isPending: boolean;
  onSuccessHandler: (idToken: string) => void;
  onError: (msg: string) => void;
}) {
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      const idToken = tokenResponse.access_token;
      if (idToken) {
        onSuccessHandler(idToken);
      } else {
        onError("Gagal mendapatkan token autentikasi Google.");
      }
    },
    onError: () => {
      onError("Autentikasi Google dibatalkan atau gagal.");
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending || !GOOGLE_CLIENT_ID}
      onClick={() => googleLogin()}
      className="w-full h-11 rounded-xl text-sm font-medium bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-black shadow-none flex items-center justify-center transition-colors"
    >
      <GoogleIcon />
      Continue with Google
    </Button>
  );
}

function AuthFormContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const { data: profile, isLoading: isProfileLoading } =
    useGetApiV1AuthMeQuery();

  const [loginMutation, { isLoading: isLoggingIn }] =
    usePostApiV1AuthLoginMutation();

  const [googleLoginMutation, { isLoading: isGoogleLoggingIn }] =
    usePostApiV1AuthGoogleLoginMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
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
    document.title = `${mode === "login" ? "Sign In" : "Sign Up"} | Aumo Workspace`;
    const saved = localStorage.getItem("aumo_saved_email");
    if (saved && mode === "login") {
      setValue("email", saved);
      setValue("keepMe", true);
    }
  }, [setValue, mode]);

  const handleSwitchMode = (newMode: "login" | "register") => {
    setApiErr("");
    setMode(newMode);
    const saved = localStorage.getItem("aumo_saved_email");
    reset({
      email: newMode === "login" && saved ? saved : "",
      password: "",
      confirmPassword: "",
      keepMe: newMode === "login" && !!saved,
    });
  };

  const onSubmit: SubmitHandler<AuthFormData> = async (values) => {
    setApiErr("");
    try {
      dispatch(generatedApi.util.resetApiState());

      if (mode === "login") {
        await loginMutation({
          loginRequest: {
            email: values.email,
            password: values.password,
            rememberMe: values.keepMe ?? false,
            isMobileClient: false,
          },
        }).unwrap();

        if (values.keepMe) {
          localStorage.setItem("aumo_saved_email", values.email);
        } else {
          localStorage.removeItem("aumo_saved_email");
        }
      } else {
        await loginMutation({
          loginRequest: {
            email: values.email,
            password: values.password,
            rememberMe: false,
            isMobileClient: false,
          },
        }).unwrap();
      }

      const targetUrl = searchParams.get("redirectTo") || "/home";
      window.location.replace(targetUrl);
    } catch (e: any) {
      console.error(`[${mode.toUpperCase()} FAIL]`, e);
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

  const handleGoogleSuccess = async (idToken: string) => {
    setApiErr("");
    try {
      dispatch(generatedApi.util.resetApiState());

      await googleLoginMutation({
        googleLoginRequest: {
          idToken: idToken,
          isMobileClient: false,
        },
      }).unwrap();

      const targetUrl = searchParams.get("redirectTo") || "/home";
      window.location.replace(targetUrl);
    } catch (e: any) {
      console.error("[GOOGLE AUTH FAIL]", e);
      const errorMessage =
        e?.data?.message ||
        e?.data?.title ||
        "Gagal memverifikasi akun Google dengan server backend.";
      setApiErr(errorMessage);
    }
  };

  if (isProfileLoading) {
    return <AuthFormSkeleton />;
  }

  const isPending = isLoggingIn || isGoogleLoggingIn;

  return (
    <div className="light w-full max-w-sm bg-white text-black p-6 rounded-2xl shadow-sm border border-zinc-200 selection:bg-black selection:text-white [&_*::selection]:bg-black [&_*::selection]:text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          {mode === "login" ? "Sign in" : "Create account"}
        </h2>
        <p className="text-sm text-zinc-600 mt-1">
          {mode === "login"
            ? "Masuk ke workspace kamu."
            : "Daftar untuk membuat workspace baru."}
        </p>
      </div>

      <div className="space-y-4">
        {GOOGLE_CLIENT_ID ? (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleAuthButton
              isPending={isPending}
              onSuccessHandler={handleGoogleSuccess}
              onError={(msg) => setApiErr(msg)}
            />
          </GoogleOAuthProvider>
        ) : (
          <div className="text-center p-2 text-xs text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID belum dikonfigurasi di Environment
            Variable.
          </div>
        )}

        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-200 w-full" />
          <span className="bg-white px-2 text-[10px] uppercase font-mono tracking-wider text-zinc-400 absolute">
            OR
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-[11px] tracking-widest uppercase font-semibold text-black"
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

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="password"
              className="text-[11px] tracking-widest uppercase font-semibold text-black"
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

        {mode === "register" && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label
                htmlFor="confirmPassword"
                className="text-[11px] tracking-widest uppercase font-semibold text-black"
              >
                Confirm Password
              </Label>
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="text-xs uppercase tracking-wide text-zinc-600 hover:text-black font-medium"
              >
                {showConfirmPass ? "Hide" : "Show"}
              </button>
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPass ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="h-11 rounded-xl bg-zinc-50 border-zinc-300 text-black text-sm placeholder:text-zinc-400 focus-visible:ring-black selection:bg-black selection:text-white font-sans"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        )}

        {mode === "login" && (
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
        )}

        {apiErr && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs px-3.5 py-3 rounded-xl font-medium">
            {apiErr}
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 rounded-xl text-sm font-medium bg-black text-white hover:bg-zinc-800 transition-colors"
        >
          {isPending
            ? "Processing..."
            : mode === "login"
              ? "Sign In"
              : "Create Account"}
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-zinc-600">
        {mode === "login" ? (
          <>
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => handleSwitchMode("register")}
              className="font-semibold text-black underline underline-offset-4 hover:text-zinc-700"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => handleSwitchMode("login")}
              className="font-semibold text-black underline underline-offset-4 hover:text-zinc-700"
            >
              Sign In
            </button>
          </>
        )}
      </div>

      <div className="flex justify-between mt-6 pt-5 border-t border-zinc-200 text-[10px] font-mono text-zinc-400">
        <span>SECURE COOKIE</span>
        <span>Keep your data safe</span>
      </div>
    </div>
  );
}

function AuthFormSkeleton() {
  return (
    <div className="light w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 animate-pulse h-80 flex flex-col justify-center items-center">
      <p className="text-sm font-medium text-zinc-400">Loading workspace...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-zinc-50">
      <Suspense fallback={<AuthFormSkeleton />}>
        <AuthFormContent />
      </Suspense>
    </main>
  );
}
