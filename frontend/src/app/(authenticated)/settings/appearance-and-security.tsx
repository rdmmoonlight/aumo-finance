"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  useGetApiV1SettingsGuardianDashboardQuery,
  usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation,
  usePostApiV1SettingsGuardianRevokeAllSessionsMutation,
} from "@/lib/store/(authenticated)/settings/settingsApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import {
  Activity,
  Laptop,
  History,
  OctagonX,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  Check,
  HeartPulse,
} from "lucide-react";

// --- TYPES ---
export interface AppearanceAndSecuritySettingsProps {
  mode?: "appearance" | "security" | "all";
  defaultTab?: "appearance" | "security" | string;
}

interface SessionItem {
  id?: string;
  deviceName?: string;
  isCurrent?: boolean;
  browser?: string;
  operatingSystem?: string;
  ipAddress?: string;
  country?: string;
  lastActivityAt?: string;
}

interface ActivityItem {
  id?: string;
  activityType?: string;
  device?: string;
  operatingSystem?: string;
  ipAddress?: string;
  createdAt?: string;
  isSuccess?: boolean;
}

interface ApiCustomError {
  data?: {
    message?: string;
  };
}

// --- HELPERS ---
const THEME_OPTIONS = [
  { id: "light", label: "Light", desc: "Terang", icon: Sun },
  { id: "dark", label: "Dark", desc: "Gelap", icon: Moon },
  { id: "system", label: "System", desc: "Ikut OS", icon: Monitor },
] as const;

const formatDate = (dateStr?: string) =>
  dateStr
    ? new Date(dateStr).toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";

// --- TANSTACK TABLE HELPERS & SUB-COMPONENTS ---
const sessionColumnHelper = createColumnHelper<SessionItem>();
const activityColumnHelper = createColumnHelper<ActivityItem>();

function ActiveSessionsTable({
  sessions,
  onRevoke,
  isRevoking,
}: {
  sessions: SessionItem[];
  onRevoke: (id?: string, deviceName?: string) => void;
  isRevoking: boolean;
}) {
  const columns = useMemo(
    () => [
      sessionColumnHelper.accessor("deviceName", {
        header: "Device",
        cell: ({ row }) => (
          <div className="py-1.5 text-caption font-medium">
            {row.original.deviceName}
            {row.original.isCurrent && (
              <Badge className="ml-1 h-4 text-label-small bg-emerald-500/15 text-emerald-600">
                Current
              </Badge>
            )}
          </div>
        ),
      }),
      sessionColumnHelper.accessor("browser", {
        header: "Browser/OS",
        cell: ({ row }) => (
          <div className="py-1.5 text-caption text-muted-foreground">
            {row.original.browser}
            <div className="text-caption">{row.original.operatingSystem}</div>
          </div>
        ),
      }),
      sessionColumnHelper.accessor("ipAddress", {
        header: "IP",
        cell: ({ row }) => (
          <div className="py-1.5 font-mono text-caption">
            {row.original.ipAddress}
            <div className="text-caption text-muted-foreground">
              {row.original.country}
            </div>
          </div>
        ),
      }),
      sessionColumnHelper.accessor("lastActivityAt", {
        header: "Last",
        cell: (info) => (
          <div className="py-1.5 text-caption">
            {info.getValue()
              ? new Date(info.getValue()!).toLocaleTimeString("id-ID")
              : "-"}
          </div>
        ),
      }),
      sessionColumnHelper.display({
        id: "actions",
        header: () => <div className="text-right text-caption h-7" />,
        cell: ({ row }) => (
          <div className="py-1.5 text-right">
            {!row.original.isCurrent ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-caption text-destructive px-2"
                onClick={() =>
                  onRevoke(row.original.id, row.original.deviceName)
                }
                disabled={isRevoking}
              >
                <LogOut size={11} />
              </Button>
            ) : (
              <span className="text-caption text-emerald-600">Active</span>
            )}
          </div>
        ),
      }),
    ],
    [onRevoke, isRevoking],
  );

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="h-7">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="text-caption h-7">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="h-9">
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="p-0 px-4">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ActivityLogsTable({ activities }: { activities: ActivityItem[] }) {
  const columns = useMemo(
    () => [
      activityColumnHelper.accessor("activityType", {
        header: "Type",
        cell: (info) => (
          <div className="py-1.5 text-caption">{info.getValue()}</div>
        ),
      }),
      activityColumnHelper.accessor("device", {
        header: "Device",
        cell: ({ row }) => (
          <div className="py-1.5 text-caption text-muted-foreground">
            {row.original.device}
            <div className="text-caption">{row.original.operatingSystem}</div>
          </div>
        ),
      }),
      activityColumnHelper.accessor("ipAddress", {
        header: "IP",
        cell: (info) => (
          <div className="py-1.5 font-mono text-caption">{info.getValue()}</div>
        ),
      }),
      activityColumnHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) => (
          <div className="py-1.5 text-caption">
            {formatDate(info.getValue())}
          </div>
        ),
      }),
      activityColumnHelper.accessor("isSuccess", {
        header: () => <div className="text-right text-caption">Status</div>,
        cell: (info) => (
          <div className="py-1.5 text-right">
            {info.getValue() ? (
              <Badge className="h-4 text-label-small bg-emerald-500/15 text-emerald-600">
                OK
              </Badge>
            ) : (
              <Badge variant="destructive" className="h-4 text-label-small">
                Fail
              </Badge>
            )}
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: activities,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="h-7">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="text-caption h-7">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="h-9">
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="p-0 px-4">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// --- SUB-COMPONENTS ---
export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-ui">Appearance</CardTitle>
        <CardDescription className="text-caption">
          Pilih tema antarmuka.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <RadioGroup
          value={mounted ? theme : "system"}
          onValueChange={setTheme}
          className="grid grid-cols-3 gap-2.5"
        >
          {THEME_OPTIONS.map(({ id, label, desc, icon: Icon }) => {
            const active = mounted && theme === id;
            return (
              <Label
                key={id}
                htmlFor={id}
                className={cn(
                  "relative flex flex-col rounded-lg border p-3 cursor-pointer hover:bg-accent/50",
                  active ? "border-primary bg-primary/5" : "border-muted",
                )}
              >
                <RadioGroupItem value={id} id={id} className="sr-only" />
                <Icon
                  size={16}
                  className={cn("mb-2", active && "text-primary")}
                />
                <span className="text-caption font-medium">{label}</span>
                <span className="text-caption text-muted-foreground">
                  {desc}
                </span>
                {active && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground grid place-items-center">
                    <Check size={10} />
                  </div>
                )}
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export function SecuritySection() {
  const [guardianTab, setGuardianTab] = useState("health");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: resp,
    isLoading,
    isError,
    error: fetchError,
    refetch,
  } = useGetApiV1SettingsGuardianDashboardQuery();
  const [revokeSession, { isLoading: isRevoking }] =
    usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation();
  const [revokeAll, { isLoading: isRevokingAll }] =
    usePostApiV1SettingsGuardianRevokeAllSessionsMutation();

  const dashboardData = (resp as Record<string, any>)?.data || resp;
  const security = dashboardData?.securityStatus;
  const activities: ActivityItem[] = (
    dashboardData?.recentActivities || []
  ).slice(0, 5);
  const sessions: SessionItem[] = (dashboardData?.activeSessions || []).slice(
    0,
    5,
  );
  const isHealthy = security?.statusLevel === "Good";

  const notify = (msg: string, isErr = false) => {
    if (isErr) {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleRevoke = async (id?: string, device?: string) => {
    if (!id || !confirm(`Akhiri sesi "${device}"?`)) return;
    try {
      await revokeSession({ sessionId: id }).unwrap();
      notify("Sesi diakhiri");
      refetch();
    } catch (e) {
      const err = e as ApiCustomError;
      notify(err?.data?.message || "Gagal", true);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm("Lockout semua device lain?")) return;
    try {
      await revokeAll().unwrap();
      notify("Semua sesi lain diakhiri");
      refetch();
    } catch (e) {
      const err = e as ApiCustomError;
      notify(err?.data?.message || "Gagal", true);
    }
  };

  return (
    <div className="space-y-3">
      {success && (
        <Alert className="py-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 text-ui">
          <CheckCircle2 size={14} />
          <AlertDescription className="text-caption">
            {success}
          </AlertDescription>
        </Alert>
      )}
      {(error || isError) && (
        <Alert variant="destructive" className="py-2 text-ui">
          <AlertTriangle size={14} />
          <AlertDescription className="text-caption">
            {error || (fetchError as ApiCustomError)?.data?.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-ui font-semibold">Guardian Status</h3>
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 h-6 text-caption",
            isHealthy
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
              : "border-amber-500/20 bg-amber-500/10 text-amber-600",
          )}
        >
          <HeartPulse size={12} /> {security?.statusLevel || "Loading"}
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-caption">Memuat Guardian...</p>
        </div>
      ) : (
        <Tabs value={guardianTab} onValueChange={setGuardianTab}>
          <TabsList className="h-7 p-1 w-fit">
            <TabsTrigger value="health" className="text-caption h-5 gap-1">
              <Activity size={12} /> Health
            </TabsTrigger>
            <TabsTrigger value="sessions" className="text-caption h-5 gap-1">
              <Laptop size={12} /> Sessions{" "}
              <Badge
                variant="secondary"
                className="ml-1 h-4 px-1 text-label-small"
              >
                {sessions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-caption h-5 gap-1">
              <History size={12} /> Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-3">
            <div className="grid grid-cols-2 gap-3">
              <Card className="py-3 px-3 flex items-center justify-between">
                <div>
                  <p className="text-caption font-medium">Failed 24h</p>
                  <p className="text-caption text-muted-foreground">
                    Kegagalan login
                  </p>
                </div>
                {security?.failedAttemptsLast24Hours === 0 ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 text-label-small h-5">
                    0
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-label-small h-5">
                    {security?.failedAttemptsLast24Hours}
                  </Badge>
                )}
              </Card>
              <Card className="py-3 px-3 flex items-center justify-between">
                <div>
                  <p className="text-caption font-medium">Last Login</p>
                  <p className="text-caption text-muted-foreground">Terakhir</p>
                </div>
                <span className="text-caption font-mono">
                  {formatDate(security?.lastSuccessfulLogin)}
                </span>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="mt-3">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between py-2 px-3 border-b bg-muted/30">
                <span className="text-caption font-semibold">
                  Active Sessions
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 text-caption px-2 gap-1"
                  onClick={handleRevokeAll}
                  disabled={isRevokingAll}
                >
                  <OctagonX size={12} /> Revoke All
                </Button>
              </div>
              <ScrollArea className="h-64">
                <ActiveSessionsTable
                  sessions={sessions}
                  onRevoke={handleRevoke}
                  isRevoking={isRevoking}
                />
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-3">
            <Card className="overflow-hidden">
              <div className="py-2 px-3 border-b bg-muted/30">
                <span className="text-caption font-semibold">
                  Login History
                </span>
              </div>
              <ScrollArea className="h-64">
                <ActivityLogsTable activities={activities} />
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// --- MAIN COMBINED COMPONENT ---
export default function AppearanceAndSecuritySettings({
  mode,
  defaultTab = "appearance",
}: AppearanceAndSecuritySettingsProps) {
  if (mode === "appearance") return <AppearanceSection />;
  if (mode === "security") return <SecuritySection />;

  return (
    <Tabs defaultValue={defaultTab} className="w-full space-y-4">
      <TabsList className="grid w-full grid-cols-2 text-ui">
        <TabsTrigger value="appearance" className="text-caption">
          Appearance
        </TabsTrigger>
        <TabsTrigger value="security" className="text-caption">
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="appearance">
        <AppearanceSection />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySection />
      </TabsContent>
    </Tabs>
  );
}
