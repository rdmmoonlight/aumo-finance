// app/(authenticated)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useGetApiV1AuthMeQuery, useGetApiV1PeriodsOpenInfoQuery } from "@/lib/generatedApi";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Cek profil user terlebih dahulu
  const {
    data: authData,
    isLoading: isAuthLoading,
    isError: isAuthError,
  } = useGetApiV1AuthMeQuery(undefined, {
    skip: !isMounted,
    // PENTING: Jangan re-fetch otomatis jika gagal
    refetchOnMountOrArgChange: false,
  });

  // 2. HANYA panggil periods/open-info JIKA auth/me SUDAH BERHASIL
  const isAuthenticated = isMounted && !isAuthLoading && !isAuthError && !!authData;

  const { isLoading: isPeriodsLoading } = useGetApiV1PeriodsOpenInfoQuery(undefined, {
    skip: !isAuthenticated, // Skip jika belum terverifikasi login
    refetchOnMountOrArgChange: false,
  });

  // Tampilan Loading
  if (!isMounted || isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Memverifikasi sesi...</p>
      </div>
    );
  }

  // Jika error (401), tahan tampilan agar interceptor di apiClient meredirect ke /auth
  if (isAuthError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Sesi berakhir, mengalihkan ke halaman login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
