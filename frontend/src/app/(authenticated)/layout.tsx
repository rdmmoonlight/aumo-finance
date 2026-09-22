"use client";

import { useEffect, useState } from "react";
import {
  useGetApiV1AuthMeQuery,
  useGetApiV1PeriodsOpenInfoQuery,
} from "@/lib/generatedApi";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/app-topbar";
// Impor SidebarProvider dari shadcn UI sidebar
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Verifikasi profil user lebih dulu
  const {
    data: authData,
    isLoading: isAuthLoading,
    isError: isAuthError,
  } = useGetApiV1AuthMeQuery(undefined, {
    skip: !isMounted,
    refetchOnMountOrArgChange: false,
  });

  // 2. Ambil info periode HANYA jika autentikasi sukses
  const isAuthenticated =
    isMounted && !isAuthLoading && !isAuthError && !!authData;

  const { isLoading: isPeriodsLoading } = useGetApiV1PeriodsOpenInfoQuery(
    undefined,
    {
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: false,
    },
  );

  if (!isMounted || isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Memverifikasi sesi...</p>
      </div>
    );
  }

  if (isAuthError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Sesi berakhir, mengalihkan ke halaman login...
        </p>
      </div>
    );
  }

  return (
    // Pembungkus SidebarProvider wajib dipasang di tingkat teratas layout terautentikasi
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
