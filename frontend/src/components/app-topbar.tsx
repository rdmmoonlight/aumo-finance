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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Bell,
  Database,
  RefreshCw,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// RTK Query Hooks & Types
import {
  useGetApiV1PeriodsQuery,
  useGetApiV1HealthQuery,
  useGetApiV1NotificationsQuery,
  usePutApiV1NotificationsReadByIdMutation,
  usePutApiV1NotificationsReadAllMutation,
  NotificationDto,
} from "@/lib/generatedApi";
import { useUserProfile } from "@/lib/auth";

interface PeriodItem {
  id: number;
  periodName?: string;
  name?: string;
  isClosed?: boolean;
  isSelected?: boolean;
}

export function AppTopBar() {
  const pathname = usePathname();

  // Cek profil user
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const isAuthenticated = !isProfileLoading && !!profile;

  // 1. Fetch seluruh periode
  const { data: rawPeriodsData, isLoading: isPeriodLoading } =
    useGetApiV1PeriodsQuery(undefined, {
      skip: !isAuthenticated,
    });

  // 2. Hook Database Health Check
  const {
    data: healthData,
    isLoading: isHealthLoading,
    isFetching: isHealthFetching,
    isError: isHealthError,
    refetch: checkDb,
  } = useGetApiV1HealthQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: isAuthenticated ? 30000 : 0,
    refetchOnFocus: false,
  });

  // 3. RTK Query Hooks Notifikasi
  const { data: notificationsData, isLoading: isNotificationsLoading } =
    useGetApiV1NotificationsQuery(
      { limit: 20 },
      {
        skip: !isAuthenticated,
        pollingInterval: isAuthenticated ? 15000 : 0, // Auto-refetch tiap 15 detik
      },
    );

  const [markAsRead] = usePutApiV1NotificationsReadByIdMutation();
  const [markAllAsRead, { isLoading: isMarkingAllRead }] =
    usePutApiV1NotificationsReadAllMutation();

  const notifications: NotificationDto[] = Array.isArray(notificationsData)
    ? notificationsData
    : [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error("Gagal menandai semua dibaca:", error);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await markAsRead({ id }).unwrap();
    } catch (error) {
      console.error("Gagal menandai dibaca:", error);
    }
  };

  // Penentuan status database
  const dbStatus = isHealthError
    ? "offline"
    : isHealthLoading
      ? "connecting"
      : healthData
        ? "online"
        : "offline";

  // Parsing array periods
  const periods: PeriodItem[] = Array.isArray(rawPeriodsData)
    ? rawPeriodsData
    : (rawPeriodsData as any)?.items || (rawPeriodsData as any)?.periods || [];

  const selectedPeriod = periods.find((p) => p.isSelected);
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
              placeholder="Cari transaksi, akun, atau laporan..."
              className="pl-9 bg-muted/40 text-sm focus-visible:bg-background"
            />
          </div>
        </div>

        {/* Sisi Kanan: Notifikasi */}
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                aria-label="Notifikasi"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4" align="end">
              {/* Header Popover */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">Notifikasi</h4>
                  {unreadCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {unreadCount} baru
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAllRead}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {isMarkingAllRead ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Tandai dibaca"
                    )}
                  </Button>
                )}
              </div>

              {/* List Notifikasi */}
              <div className="max-h-[300px] overflow-y-auto divide-y">
                {isNotificationsLoading ? (
                  <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Memuat
                    notifikasi...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    Tidak ada notifikasi saat ini.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkAsRead(item.id, item.isRead)}
                      className={`p-3 text-xs cursor-pointer transition-colors hover:bg-muted/50 flex gap-3 ${
                        !item.isRead ? "bg-muted/20 font-medium" : "opacity-70"
                      }`}
                    >
                      <div className="mt-0.5">
                        {item.type === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-foreground">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : ""}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator />

      {/* KELOMPOK 2: Bar Sekunder */}
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

        {/* Status Periode & Indikator DB */}
        <div className="flex items-center gap-4 text-muted-foreground">
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
