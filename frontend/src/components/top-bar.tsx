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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Search, Bell, Sparkles } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();

  // Mengubah path URL menjadi breadcrumb sederhana
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex flex-col w-full border-b bg-background sticky top-0 z-10 shadow-sm">
      {/* KELOMPOK 1: Utama & Lebih Besar (h-16 / 64px) */}
      <div className="flex h-16 items-center justify-between px-6 gap-4">
        {/* Sisi Kiri: Search Bar */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari transaksi, akun, atau laporan..."
              className="pl-9 bg-muted/40 text-sm focus-visible:bg-background"
            />
          </div>
        </div>

        {/* Sisi Kanan: Notifikasi & Profil */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-1">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src="/avatar-placeholder.png" alt="Ghofur" />
              <AvatarFallback className="font-semibold">GF</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold leading-none">Ghofur</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                Akuntan Utama
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GARIS PEMISAH PUTIH / LIGHT BORDER */}
      {/* Menggunakan border-white/border-slate-100 atau Separator */}
      <Separator className="bg-white/20 dark:bg-slate-800" />

      {/* KELOMPOK 2: Sekunder & Lebih Kecil (h-10 / 40px) */}
      <div className="flex h-10 items-center justify-between px-6 bg-muted/20 text-xs">
        {/* Sisi Kiri: Dynamic Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" className="text-xs">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => {
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

        {/* Sisi Kanan: Status/Info Cepat (Periode Aktif & AI Status) */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Periode: 2026 / Aktif</span>
          </div>
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
