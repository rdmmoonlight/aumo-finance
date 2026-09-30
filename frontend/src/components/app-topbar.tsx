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
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Search,
  Bell,
  Database,
  RefreshCw,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  useGetApiV1AuthMeQuery,
  useGetApiV1PeriodsQuery,
  useGetApiV1HealthQuery,
  useGetApiV1NotificationsQuery,
  usePutApiV1NotificationsByIdReadMutation,
  usePutApiV1NotificationsReadAllMutation,
  GetApiV1NotificationsApiResponse,
} from "@/lib/generatedApi";

interface PeriodItem {
  id: number;
  periodName?: string;
  name?: string;
  isClosed?: boolean;
  isSelected?: boolean;
}

type NotificationItem =
  GetApiV1NotificationsApiResponse extends Array<infer T>? T : any;

export function AppTopBar() {
  const pathname = usePathname();

  const { data: userProfile, isLoading: isProfileLoading } =
    useGetApiV1AuthMeQuery();
  const isAuthenticated =!isProfileLoading &&!!userProfile;

  const { data: rawPeriodsData, isLoading: isPeriodLoading } =
    useGetApiV1PeriodsQuery(undefined, { skip:!isAuthenticated });

  const {
    data: healthData,
    isLoading: isHealthLoading,
    isFetching: isHealthFetching,
    isError: isHealthError,
    refetch: checkDb,
  } = useGetApiV1HealthQuery(undefined, {
    skip:!isAuthenticated,
    pollingInterval: isAuthenticated? 30000 : 0,
    refetchOnFocus: false,
  });

  const { data: notificationsData, isLoading: isNotificationsLoading } =
    useGetApiV1NotificationsQuery(
      { limit: 20 },
      {
        skip:!isAuthenticated,
        pollingInterval: isAuthenticated? 15000 : 0,
      }
    );

  const [markAllAsRead, { isLoading: isMarkingAllRead }] =
    usePutApiV1NotificationsReadAllMutation();
  const [markByIdRead] = usePutApiV1NotificationsByIdReadMutation();

  const notifications: NotificationItem[] = Array.isArray(notificationsData)
   ? notificationsData
    : [];

  const unreadCount = notifications.filter((n: any) =>!n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try { await markAllAsRead().unwrap(); } catch (e) { console.error(e); }
  };
  const handleMarkAsRead = async (id: string, isRead?: boolean) => {
    if (isRead ||!id) return;
    try { await markByIdRead({ id }).unwrap(); } catch (e) { console.error(e); }
  };

  const dbStatus = isHealthError? "offline" : isHealthLoading? "connecting" : healthData? "online" : "offline";
  const periods: PeriodItem[] = Array.isArray(rawPeriodsData)? rawPeriodsData : (rawPeriodsData as any)?.items || (rawPeriodsData as any)?.periods || [];
  const selectedPeriod = periods.find((p) => p.isSelected);
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex flex-col w-full border-b bg-background/80 backdrop-blur-md sticky top-0 z-20">
      {/* BAR 1 - UTAMA */}
      <div className="flex h- items-center justify-between px-4 gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <SidebarTrigger className="h-7 w-7 -ml-1 shrink-0" />
          <Separator orientation="vertical" className="h-4" />
          <div className="relative w-full max-w-">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari transaksi, akun..."
              className="pl-8 h-8 bg-muted/50 text- border-transparent focus-visible:bg-background focus-visible:border-input"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
                <Bell className="h- w-" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w- p-0 mr-2" align="end">
              <div className="flex items-center justify-between p-3.5 border-b">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-">Notifikasi</h4>
                  {unreadCount > 0 && <Badge variant="secondary" className="text- px-1.5 py-0 h-4">{unreadCount} baru</Badge>}
                </div>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} disabled={isMarkingAllRead} className="h-auto p-0 text- text-muted-foreground">
                    {isMarkingAllRead? <Loader2 className="h-3 w-3 animate-spin" /> : "Tandai dibaca"}
                  </Button>
                )}
              </div>
              <div className="max-h- overflow-y-auto divide-y">
                {isNotificationsLoading? (
                  <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
                  </div>
                ) : notifications.length === 0? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Tidak ada notifikasi.</div>
                ) : (
                  notifications.map((item: any) => (
                    <div key={item.id} onClick={() => handleMarkAsRead(item.id, item.isRead)}
                      className={`p-3 text- cursor-pointer hover:bg-muted/50 flex gap-2.5 ${!item.isRead? "bg-muted/30" : "opacity-70"}`}>
                      <div className="mt-0.5">
                        {item.type === "warning"? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <Info className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text- truncate">{item.title}</p>
                          <span className="text- text-muted-foreground shrink-0">
                            {item.createdAt? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-snug text- line-clamp-2">{item.message}</p>
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

      {/* BAR 2 - SEKUNDER - lebih tipis biar match sidebar 255px */}
      <div className="flex h-9 items-center justify-between px-4 bg-muted/25">
        <Breadcrumb>
          <BreadcrumbList className="gap-1.5">
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" className="text-">Home</BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => {
              if (segment === "home" && index === 0) return null;
              const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLast = index === pathSegments.length - 1;
              const formattedName = decodeURIComponent(segment).replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
              return (
                <React.Fragment key={url}>
                  <BreadcrumbSeparator className="[&>svg]:size-3" />
                  <BreadcrumbItem>
                    {isLast? <BreadcrumbPage className="text- font-semibold">{formattedName}</BreadcrumbPage>
                    : <BreadcrumbLink href={url} className="text-">{formattedName}</BreadcrumbLink>}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3 text-muted-foreground">
          {selectedPeriod? (
            <Badge variant="outline" className={`gap-1.5 h-5 text- font-medium px-2 ${selectedPeriod.isClosed? "border-amber-500/30 text-amber-600 bg-amber-500/10" : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${selectedPeriod.isClosed? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
              {selectedPeriod.periodName || selectedPeriod.name}
            </Badge>
          ) : (
            <span className="text-">{isPeriodLoading? "Memuat periode..." : "No period"}</span>
          )}

          <Separator orientation="vertical" className="h-3" />

          <div className="flex items-center gap-1.5">
            <Database className="h-3 w-3" />
            {dbStatus === "online" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {dbStatus === "connecting" && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />}
            {dbStatus === "offline" && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
            <span className="text- font-medium capitalize hidden sm:inline">{dbStatus === "online"? "Connected" : dbStatus}</span>
            {dbStatus === "offline" && (
              <Button variant="ghost" size="icon" onClick={() => checkDb()} disabled={isHealthFetching} className="h-5 w-5 ml-1">
                <RefreshCw className={`h-3 w-3 ${isHealthFetching? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
