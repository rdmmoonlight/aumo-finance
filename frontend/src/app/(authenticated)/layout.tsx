"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetApiV1AuthMeQuery } from "@/lib/store/auth/authApi";
import { useGetApiV1PeriodsOpenInfoQuery } from "@/lib/store/(authenticated)/periods/periodsApi";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-topbar";
import { AppFooter } from "@/components/app-footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // RTK Query sudah otomatis menangani caching & SSR/hydration di client side.
  // Tidak perlu lagi menunggu state 'isMounted'.
  const {
    data: authData,
    isLoading: isAuthLoading,
    isError: isAuthError,
  } = useGetApiV1AuthMeQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const isAuthenticated = !isAuthLoading && !isAuthError && !!authData;

  const { isLoading: isPeriodsLoading } = useGetApiV1PeriodsOpenInfoQuery(
    undefined,
    {
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: false,
    },
  );

  useEffect(() => {
    if (isAuthError) {
      const t = setTimeout(() => router.replace("/auth"), 800);
      return () => clearTimeout(t);
    }
  }, [isAuthError, router]);

  // Render kondisi loading HANYA saat verifikasi awal (saat cache benar-benar kosong)
  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Memverifikasi sesi...</p>
      </div>
    );
  }

  if (isAuthError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Sesi berakhir, mengalihkan ke halaman login...
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "285px",
            "--sidebar-width-icon": "3.5rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col min-w-0">
          <AppTopBar />
          {/* 
            JANGAN unmount {children} saat loading periode!
            Biarkan UI tetap tampil dan gunakan overlay/skeleton jika perlu, 
            agar layout tidak berkedip hilang-tampil.
          */}
          <main className="flex-1 p-6 relative">
            {isPeriodsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                <p className="text-sm text-muted-foreground">
                  Memuat periode...
                </p>
              </div>
            )}
            {children}
          </main>
          <AppFooter />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
