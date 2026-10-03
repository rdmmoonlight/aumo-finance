"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleLogin } from "@react-oauth/google";
import {
  usePostApiV1AuthLoginMutation,
  usePostApiV1AuthGoogleLoginMutation,
  useGetApiV1AuthMeQuery,
  enhancedApi as generatedApi,
} from "@/lib/store/auth/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

// ===== TYPES - INI YANG ILANG TADI =====
export type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  keepMe?: boolean;
};

export interface AuthPageProps {
  initialMode?: "login" | "register";
  onSuccess?: () => void;
}

export const GOOGLE_CLIENT_ID: string =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function GoogleIcon(
  props: React.ComponentProps<"svg">,
): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={props.className ?? "h-4 w-4"}
      {...props}
    >
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

export function GoogleAuthButtonInner({
  isPending,
  onSuccessHandler,
  onError,
}: {
  isPending: boolean;
  onSuccessHandler: (idToken: string) => void;
  onError: (msg: string) => void;
}): React.JSX.Element {
  const googleLogin = useGoogleLogin({
    onSuccess: (res) => {
      if (res.access_token) onSuccessHandler(res.access_token);
      else onError("Gagal mendapatkan token dari Google.");
    },
    onError: () => onError("Autentikasi Google dibatalkan."),
  });
  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        if (!GOOGLE_CLIENT_ID) {
          onError("NEXT_PUBLIC_GOOGLE_CLIENT_ID belum diset");
          return;
        }
        googleLogin();
      }}
      className="w-full h-11 rounded-xl bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
    >
      <GoogleIcon className="mr-2 h-4 w-4" /> Continue with Google
    </Button>
  );
}

export function AuthFormSkeleton(): React.JSX.Element {
  return (
    <div className="w-full max-w-sm bg-white p-6 rounded-2xl border animate-pulse h-80 flex justify-center items-center">
      <p className="text-sm text-zinc-400">Loading workspace...</p>
    </div>
  );
}

function AuthFormInner({
  initialMode = "login",
  onSuccess,
}: AuthPageProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
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
    setMode(initialMode);
  }, [initialMode]);
  useEffect(() => {
    if (!isProfileLoading && profile) {
      if (onSuccess) onSuccess();
      else {
        const target = searchParams.get("redirectTo") || "/home";
        window.location.replace(target);
      }
    }
  }, [profile, isProfileLoading, searchParams, onSuccess]);
  useEffect(() => {
    const saved = localStorage.getItem("aumo_saved_email");
    if (saved && mode === "login") {
      setValue("email", saved);
      setValue("keepMe", true);
    }
  }, [setValue, mode]);

  const handleSwitchMode = (newMode: "login" | "register"): void => {
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
      await loginMutation({
        loginRequest: {
          email: values.email,
          password: values.password,
          rememberMe: values.keepMe ?? false,
          isMobileClient: false,
        },
      }).unwrap();
      if (values.keepMe) localStorage.setItem("aumo_saved_email", values.email);
      else localStorage.removeItem("aumo_saved_email");
      if (onSuccess) onSuccess();
      else {
        const target = searchParams.get("redirectTo") || "/home";
        window.location.replace(target);
      }
    } catch (e: any) {
      const msg =
        e?.data?.message ||
        e?.data?.title ||
        (e?.status === "FETCH_ERROR"
          ? "Gagal terhubung ke server backend."
          : "Email atau password salah.");
      setApiErr(msg);
    }
  };

  const handleGoogleSuccess = async (idToken: string): Promise<void> => {
    setApiErr("");
    try {
      dispatch(generatedApi.util.resetApiState());
      await googleLoginMutation({
        googleLoginRequest: { idToken, isMobileClient: false },
      }).unwrap();
      if (onSuccess) onSuccess();
      else {
        const target = searchParams.get("redirectTo") || "/home";
        window.location.replace(target);
      }
    } catch (e: any) {
      setApiErr(e?.data?.message || "Gagal verifikasi Google.");
    }
  };

  if (isProfileLoading) return <AuthFormSkeleton />;
  const isPending = isLoggingIn || isGoogleLoggingIn;

  return (
    <div className="light w-full max-w-sm bg-white text-black p-6 rounded-2xl shadow-sm border border-zinc-200">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Sign in" : "Create account"}
        </h2>
        <p className="text-sm text-zinc-600 mt-1">
          {mode === "login"
            ? "Masuk ke workspace kamu."
            : "Daftar untuk membuat workspace baru."}
        </p>
      </div>
      <div className="space-y-4">
        <GoogleAuthButtonInner
          isPending={isPending}
          onSuccessHandler={handleGoogleSuccess}
          onError={setApiErr}
        />
        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-200 w-full" />
          <span className="bg-white px-2 text- uppercase font-mono text-zinc-400 absolute">
            OR
          </span>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div className="space-y-1.5">
          <Label className="text- uppercase font-semibold">Email</Label>
          <Input
            {...register("email")}
            placeholder="nama@email.com"
            className="h-11 rounded-xl bg-zinc-50"
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label className="text- uppercase font-semibold">Password</Label>
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-xs text-zinc-600"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
          <Input
            {...register("password")}
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            className="h-11 rounded-xl bg-zinc-50"
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        {mode === "register" && (
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text- uppercase font-semibold">
                Confirm Password
              </Label>
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="text-xs text-zinc-600"
              >
                {showConfirmPass ? "Hide" : "Show"}
              </button>
            </div>
            <Input
              {...register("confirmPassword")}
              type={showConfirmPass ? "text" : "password"}
              placeholder="••••••••"
              className="h-11 rounded-xl bg-zinc-50"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        )}
        {mode === "login" && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={keepMeValue}
                onCheckedChange={(v) => setValue("keepMe", v === true)}
              />
              <Label className="text-xs">Keep me signed in</Label>
            </div>
            <a href="#" className="text-xs underline">
              Forgot?
            </a>
          </div>
        )}
        {apiErr && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs px-3.5 py-3 rounded-xl">
            {apiErr}
          </div>
        )}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 rounded-xl bg-black text-white hover:bg-zinc-800"
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
              onClick={() => handleSwitchMode("register")}
              className="font-semibold underline"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Sudah punya akun?{" "}
            <button
              onClick={() => handleSwitchMode("login")}
              className="font-semibold underline"
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthForm(props: AuthPageProps): React.JSX.Element {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthFormInner {...props} />
    </Suspense>
  );
}
