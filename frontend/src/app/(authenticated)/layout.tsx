"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetApiV1AuthMeQuery,
  useGetApiV1PeriodsOpenInfoQuery,
} from "@/lib/generatedApi";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-topbar";
import { AppFooter } from "@/components/app-footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: authData,
    isLoading: isAuthLoading,
    isError: isAuthError,
  } = useGetApiV1AuthMeQuery(undefined, {
    skip: !isMounted,
    refetchOnMountOrArgChange: false,
  });

  const isAuthenticated = isMounted && !isAuthLoading && !isAuthError && !!authData;

  const { isLoading: isPeriodsLoading } = useGetApiV1PeriodsOpenInfoQuery(
    undefined,
    {
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: false,
    }
  );

  useEffect(() => {
    if (isMounted && isAuthError) {
      // kasih delay dikit biar user baca pesan
      const t = setTimeout(() => router.replace("/auth"), 800);
      return () => clearTimeout(t);
    }
  }, [isMounted, isAuthError, router]);

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
        {/* optional loader pas periods loading */}
        {isPeriodsLoading ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Memuat periode...</p>
          </div>
        ) : (
          <main className="flex-1 p-6">{children}</main>
        )}
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
