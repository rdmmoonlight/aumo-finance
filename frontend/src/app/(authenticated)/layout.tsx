"use client";

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/app-topbar";
import {
  useGetApiV1AuthMeQuery,
  useGetApiV1PeriodsOpenInfoQuery,
} from "@/lib/generatedApi";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  // Pastikan eksekusi kueri terproteksi HANYA berjalan setelah komponen ter-mount di Browser (Client-Side)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // skip: !isMounted mencegah Next.js Server menembak API tanpa Cookie saat SSR
  const { isLoading: isAuthLoading } = useGetApiV1AuthMeQuery(undefined, {
    skip: !isMounted,
  });

  const { isLoading: isPeriodsLoading } = useGetApiV1PeriodsOpenInfoQuery(
    undefined,
    {
      skip: !isMounted,
    },
  );

  // Tampilkan UI Skeleton/Loading minimalis saat aplikasi memverifikasi sesi di awal
  if (!isMounted || isAuthLoading || isPeriodsLoading) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {/* Sidebar Permanen Kiri */}
      <AppSidebar />

      {/* Area Kanan: TopBar + Main Content */}
      <SidebarInset className="flex flex-1 flex-col min-w-0 h-svh overflow-hidden">
        {/* TopBar 2 Kelompok */}
        <TopBar />

        {/* Halaman Konten Utama */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
