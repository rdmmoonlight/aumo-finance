"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  usePostApiV1AuthLoginMutation,
  useGetApiV1AuthMeQuery,
  generatedApi,
} from "@/lib/generatedApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [showPass, setShowPass] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const { data: profile, isLoading: isProfileLoading } = useGetApiV1AuthMeQuery();

  const [loginMutation, { isLoading: isLoggingIn }] = usePostApiV1AuthLoginMutation();

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

  // Submit Handler
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Field Email */}
        <div className="space-y-2">
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
            <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Field Password */}
        <div className="space-y-2">
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
            <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
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
          disabled={isLoggingIn}
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
