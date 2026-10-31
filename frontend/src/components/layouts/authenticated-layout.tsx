"use client";

import { useAuth } from "#/features/auth/hooks/use-auth";
import { AppFooter } from "@/components/app-footer";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppRouter } from "@/lib/router-compat";
import { Outlet } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from "react";
import { periodsApi } from "../../features/periods/hooks/usePeriods";

function PeriodsLoadingOverlay() {
    const { isLoading } = periodsApi.useGetPeriodsOpenInfo();

    if (!isLoading) return null;

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-">
            <p className="text-sm text-muted-foreground">Memuat periode...</p>
        </div>
    );
}

export default function AuthenticatedLayout() {
    const { refetchProfile } = useAuth();
    const router = useAppRouter();

    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isAuthError, setIsAuthError] = useState(false);

    const verifySessionAndLoadData = useCallback(async () => {
        try {
            setIsAuthLoading(true);
            const authResult = await refetchProfile();
            if (authResult.isError || !authResult.data) {
                setIsAuthError(true);
                setIsAuthLoading(false);
                return;
            }
            setIsAuthError(false);
            setIsAuthLoading(false);
        } catch {
            setIsAuthError(true);
        } finally {
            setIsAuthLoading(false);
        }
    }, [refetchProfile]);

    useEffect(() => { verifySessionAndLoadData(); }, [verifySessionAndLoadData]);

    useEffect(() => {
        if (isAuthError) {
            const t = setTimeout(() => router.replace("/auth"), 800);
            return () => clearTimeout(t);
        }
    }, [isAuthError, router]);

    if (isAuthLoading) {
        return <div className="flex h-screen w-full items-center justify-center bg-background"><p className="text-sm text-muted-foreground">Memverifikasi sesi...</p></div>;
    }

    if (isAuthError) {
        return <div className="flex h-screen w-full items-center justify-center bg-background"><p className="text-sm text-muted-foreground">Sesi berakhir, mengalihkan ke halaman login...</p></div>;
    }

    return (
        <TooltipProvider delayDuration={0}>
            <SidebarProvider style={{ "--sidebar-width": "285px", "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}>
                <AppSidebar />
                <SidebarInset className="flex flex-1 flex-col min-w-0">
                    <AppTopBar />
                    <main className="relative flex-1 p-6">
                        <PeriodsLoadingOverlay />
                        <Outlet />
                    </main>
                    <AppFooter />
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}