"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Database, RefreshCw } from "lucide-react";

// RTK Query Hooks dari auto-generated file
import {
  useGetApiV1PeriodsOpenInfoQuery,
  useGetApiV1HealthQuery,
} from "@/lib/generatedApi";

export function TopBar() {
  const pathname = usePathname();

  // 1. Hook Periode Aktif via RTK Query
  const { data: periodData, isLoading: isPeriodLoading } =
    useGetApiV1PeriodsOpenInfoQuery();

  // 2. Hook Database Health Check via RTK Query
  const {
    data: healthData,
    isLoading: isHealthLoading,
    isFetching: isHealthFetching,
    isError: isHealthError,
    refetch: checkDb,
  } = useGetApiV1HealthQuery(undefined, {
    // Polling otomatis setiap 30 detik untuk memantau status DB
    pollingInterval: 30000,
  });

  // Penentuan status database berdasarkan kondisi RTK Query
  const dbStatus = isHealthError
    ? "offline"
    : isHealthLoading || isHealthFetching
      ? "connecting"
      : healthData
        ? "online"
        : "offline";

  // Ambil periode terpilih/aktif jika ada dari response backend
  const selectedPeriod = periodData as any;

  // Ekstrak segment dari URL untuk breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex flex-col w-full border-b bg-background sticky top-0 z-10 shadow-sm">
      {/* KELOMPOK 1: Bar Utama (Search & Notifications) */}
      <div className="flex h-16 items-center justify-between px-6 gap-4">
        {/* Sisi Kiri: Search Bar */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari transaksi, akun, atau laporan"
              className="pl-9 bg-muted/40 text-sm focus-visible:bg-background"
            />
          </div>
        </div>

        {/* Sisi Kanan: Notifikasi */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* KELOMPOK 2: Bar Sekunder (Breadcrumbs, Status Periode & DB Health) */}
      <div className="flex h-10 items-center justify-between px-6 bg-muted/20 text-xs">
        {/* Dynamic Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" className="text-xs">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => {
              if (segment === "home" && index === 0) return null;

              const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLast = index === pathSegments.length - 1;
              const formattedName = decodeURIComponent(segment)
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());

              return (
                <React.Fragment key={url}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-xs font-semibold">
                        {formattedName}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={url} className="text-xs">
                        {formattedName}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Sisi Kanan: Status Periode Real-time & Indikator Database */}
        <div className="flex items-center gap-4 text-muted-foreground">
          {/* Status Periode */}
          {selectedPeriod ? (
            <Badge
              variant="outline"
              className={`gap-1.5 font-medium ${
                selectedPeriod.isClosed
                  ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                  : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  selectedPeriod.isClosed
                    ? "bg-amber-500"
                    : "bg-emerald-500 animate-pulse"
                }`}
              />
              Periode: {selectedPeriod.periodName || selectedPeriod.name}
              {selectedPeriod.isClosed ? " (Closed)" : " (Aktif)"}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1.5 font-medium text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              {isPeriodLoading
                ? "Memuat periode..."
                : "Belum Ada Periode Dipilih"}
            </Badge>
          )}

          <Separator orientation="vertical" className="h-3" />

          {/* Indikator Database */}
          <div className="flex items-center gap-2 text-xs">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />

            {dbStatus === "online" && (
              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-medium"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                DB: Connected
              </Badge>
            )}

            {dbStatus === "connecting" && (
              <Badge
                variant="outline"
                className="gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-medium"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                DB: Connecting...
              </Badge>
            )}

            {dbStatus === "offline" && (
              <div className="flex items-center gap-1.5">
                <Badge variant="destructive" className="gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive-foreground" />
                  DB: Disconnected
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => checkDb()}
                  disabled={isHealthFetching}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  title="Coba hubungkan ulang"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isHealthFetching ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
