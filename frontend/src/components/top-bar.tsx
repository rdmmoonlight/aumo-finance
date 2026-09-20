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
import { Search, Bell, Sparkles } from "lucide-react";
import { usePeriodStore } from "@/lib/usePeriodStore";

export function TopBar() {
  const pathname = usePathname();
  const { selectedPeriod, fetchPeriods, loading } = usePeriodStore();

  // Load status periode aktif dari store saat komponen di-mount
  React.useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // Ekstrak segment dari URL untuk breadcrumb
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

      {/* KELOMPOK 2: Bar Sekunder (Breadcrumbs & Real-time Info) */}
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
              const formattedName = segment
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

        {/* Sisi Kanan: Status Periode Real-time & Status AI */}
        <div className="flex items-center gap-4 text-muted-foreground">
          {selectedPeriod ? (
            <div
              className={`flex items-center gap-1.5 font-medium ${
                selectedPeriod.isClosed
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  selectedPeriod.isClosed
                    ? "bg-amber-500"
                    : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span>
                Periode: {selectedPeriod.periodName}
                {selectedPeriod.isClosed ? " (Closed)" : " (Aktif)"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>
                {loading ? "Memuat periode..." : "Belum Ada Periode Dipilih"}
              </span>
            </div>
          )}

          <Separator orientation="vertical" className="h-3" />

          <div className="flex items-center gap-1 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>AI Guardian: Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
