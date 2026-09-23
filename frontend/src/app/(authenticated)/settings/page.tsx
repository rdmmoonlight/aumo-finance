"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconCheck,
  IconUser,
  IconShieldCheck,
  IconMail,
  IconId,
  IconHeartbeat,
  IconCircleCheck,
  IconAlertTriangle,
  IconActivity,
  IconDeviceLaptop,
  IconAlertOctagon,
  IconLogout,
  IconHistory,
  IconDownload,
  IconLoader2,
  IconPalette,
} from "@tabler/icons-react";

import {
  useGetApiV1AuthMeQuery,
  useGetApiV1GuardianDashboardQuery,
  usePostApiV1GuardianRevokeSessionBySessionIdMutation,
  usePostApiV1GuardianRevokeAllSessionsMutation,
} from "@/lib/generatedApi";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
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
import { cn } from "@/lib/utils";

interface UserProfile {
  userId?: string;
  userName?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
}

export default function SettingsPage() {
  // --- Settings State ---
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mainTab, setMainTab] = useState("account");

  // --- Guardian State ---
  const [guardianTab, setGuardianTab] = useState("health");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Queries ---
  const { data: rawUser, isLoading: loadingUser } = useGetApiV1AuthMeQuery();
  const user = rawUser as UserProfile | undefined;

  const {
    data: dashboardResponse,
    isLoading: loadingGuardian,
    isError: isGuardianError,
    error: guardianError,
    refetch: refetchGuardian,
  } = useGetApiV1GuardianDashboardQuery(undefined, {
    skip: mainTab !== "security", // fetch hanya saat tab security dibuka
  });

  const [revokeSession, { isLoading: isRevokingSession }] =
    usePostApiV1GuardianRevokeSessionBySessionIdMutation();
  const [revokeAllSessions, { isLoading: isRevokingAll }] =
    usePostApiV1GuardianRevokeAllSessionsMutation();

  useEffect(() => setMounted(true), []);

  // --- Guardian Logic ---
  const dashboardData = (dashboardResponse as any)?.data || dashboardResponse;
  const security = dashboardData?.securityStatus;
  const activities = (dashboardData?.recentActivities || []).slice(0, 5);
  const displayedSessions = (dashboardData?.activeSessions || []).slice(0, 5);
  const isHealthy = security?.statusLevel === "Good";

  const handleRevokeSession = async (id?: string, device?: string) => {
    if (!id || !confirm(`Akhiri sesi "${device}"?`)) return;
    try {
      setErrorMessage(null);
      await revokeSession({ sessionId: id }).unwrap();
      setSuccessMessage("Sesi berhasil diakhiri");
      refetchGuardian();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Gagal mengakhiri sesi",
      );
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm("Emergency Lockout semua device lain?")) return;
    try {
      setErrorMessage(null);
      await revokeAllSessions().unwrap();
      setSuccessMessage("Semua sesi lain berhasil diakhiri");
      refetchGuardian();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Gagal mengakhiri semua sesi",
      );
    }
  };

  const appearanceOptions = [
    { id: "light", label: "Light", desc: "Tampilan terang", icon: IconSun },
    { id: "dark", label: "Dark", desc: "Mata gak perih", icon: IconMoon },
    {
      id: "system",
      label: "System",
      desc: "Ngikutin OS",
      icon: IconDeviceDesktop,
    },
  ] as const;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Manage your account, appearance, and security.
        </p>
      </div>

      <Separator />

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-">
          <TabsTrigger value="account" className="gap-1.5">
            <IconUser size={14} /> Account
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5">
            <IconPalette size={14} /> Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <IconShieldCheck size={14} /> Guardian
          </TabsTrigger>
        </TabsList>

        {/* ACCOUNT TAB */}
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IconUser size={18} /> Account Profile
              </CardTitle>
              <CardDescription>
                Informasi akun dari ASP.NET Core Identity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUser ? (
                <div className="text-sm text-muted-foreground font-mono">
                  Loading profile data...
                </div>
              ) : user ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconUser size={14} /> Full Name
                      </Label>
                      <p className="text-sm font-medium">
                        {user.fullName || user.userName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconMail size={14} /> Email Address
                      </Label>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconShieldCheck size={14} /> Assigned Roles
                      </Label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((r: string) => (
                            <Badge
                              key={r}
                              variant="secondary"
                              className="text-xs font-mono"
                            >
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No roles assigned
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconId size={14} /> User Identity ID
                      </Label>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {user.userId}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-destructive font-mono">
                  Sesi pengguna tidak terautentikasi.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>
                Pilih tema Aumo Finance. Disimpan otomatis di local storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={mounted ? theme : "system"}
                onValueChange={(v) => setTheme(v as any)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {appearanceOptions.map((opt) => {
                  const isActive = mounted && theme === opt.id;
                  return (
                    <Label
                      key={opt.id}
                      htmlFor={opt.id}
                      className={cn(
                        "relative flex flex-col rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent/50",
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-muted bg-card",
                      )}
                    >
                      <RadioGroupItem
                        value={opt.id}
                        id={opt.id}
                        className="sr-only"
                      />
                      <opt.icon
                        size={20}
                        className={cn("mb-3", isActive && "text-primary")}
                      />
                      <span className="font-medium text-sm">{opt.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {opt.desc}
                      </span>
                      {isActive && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-primary-foreground grid place-items-center">
                          <IconCheck size={12} stroke={3} />
                        </div>
                      )}
                    </Label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GUARDIAN SECURITY TAB */}
        <TabsContent value="security" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <IconShieldCheck className="text-primary" size={20} /> Guardian
                Security
              </h2>
              <p className="text-xs text-muted-foreground">
                Security health, sessions, and logs
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "gap-2 px-3 py-1.5 w-fit",
                isHealthy
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-500",
              )}
            >
              <IconHeartbeat size={16} /> Status:{" "}
              {security?.statusLevel || "Unknown"}
            </Badge>
          </div>

          {successMessage && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
              <IconCircleCheck size={16} />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {(errorMessage || isGuardianError) && (
            <Alert variant="destructive">
              <IconAlertTriangle size={16} />
              <AlertDescription>
                {errorMessage ||
                  (guardianError as any)?.data?.message ||
                  "Gagal memuat data guardian"}
              </AlertDescription>
            </Alert>
          )}

          {loadingGuardian ? (
            <div className="flex flex-col items-center justify-center min-h- gap-3 text-muted-foreground">
              <IconLoader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs">Memuat Guardian...</p>
            </div>
          ) : (
            <Tabs value={guardianTab} onValueChange={setGuardianTab}>
              <TabsList className="grid w-full grid-cols-3 sm:w-">
                <TabsTrigger value="health" className="gap-1.5 text-xs">
                  <IconActivity size={14} /> Health
                </TabsTrigger>
                <TabsTrigger value="sessions" className="gap-1.5 text-xs">
                  <IconDeviceLaptop size={14} /> Sessions{" "}
                  <Badge variant="secondary" className="ml-1 px-1 text-xs">
                    {displayedSessions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="logs" className="gap-1.5 text-xs">
                  <IconHistory size={14} /> Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="health" className="mt-4">
                <Card>
                  <CardHeader className="py-3 border-b flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <IconHeartbeat size={16} className="text-rose-400" />{" "}
                      Account Health Checkup
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Automated
                    </span>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                      <div>
                        <p className="text-sm font-medium">
                          Failed Attempts (24h)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Jumlah kegagalan login
                        </p>
                      </div>
                      {security?.failedAttemptsLast24Hours === 0 ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">
                          0 Attempts
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          {security?.failedAttemptsLast24Hours ?? 0} Attempts
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                      <div>
                        <p className="text-sm font-medium">
                          Last Successful Login
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Waktu login terakhir
                        </p>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">
                        {security?.lastSuccessfulLogin
                          ? new Date(
                              security.lastSuccessfulLogin,
                            ).toLocaleString("id-ID")
                          : "-"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="mt-4">
                <Card>
                  <CardHeader className="py-3 flex-row items-center justify-between space-y-0 border-b">
                    <span className="text-sm font-semibold">
                      Active Sessions (Max 5)
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={handleRevokeAll}
                      disabled={isRevokingAll}
                    >
                      {isRevokingAll ? (
                        <IconLoader2 size={14} className="animate-spin" />
                      ) : (
                        <IconAlertOctagon size={14} />
                      )}
                      Revoke All
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-xs">
                          <TableHead>Device</TableHead>
                          <TableHead>Browser/OS</TableHead>
                          <TableHead>IP/Country</TableHead>
                          <TableHead>Last Activity</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedSessions.map((s: any, i: number) => (
                          <TableRow key={s.id || i}>
                            <TableCell className="font-medium flex items-center gap-2">
                              {s.deviceName}
                              {s.isCurrent && (
                                <Badge className="text-xs bg-emerald-500/15 text-emerald-600">
                                  Current
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {s.browser} <br />
                              <span className="text-">{s.operatingSystem}</span>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-primary">
                              {s.ipAddress} <br />
                              <span className="text- text-muted-foreground">
                                {s.country}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {s.lastActivityAt
                                ? new Date(s.lastActivityAt).toLocaleString(
                                    "id-ID",
                                  )
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {!s.isCurrent ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs text-destructive hover:text-destructive gap-1"
                                  onClick={() =>
                                    handleRevokeSession(s.id, s.deviceName)
                                  }
                                  disabled={isRevokingSession}
                                >
                                  <IconLogout size={12} /> Out
                                </Button>
                              ) : (
                                <span className="text-xs text-emerald-500 font-medium">
                                  Active
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {displayedSessions.length === 0 && (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No sessions
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="mt-4">
                <Card>
                  <CardHeader className="py-3 flex-row items-center justify-between space-y-0 border-b">
                    <span className="text-sm font-semibold">
                      Recent Login History (Max 5)
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                    >
                      <IconDownload size={14} /> Export CSV
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-xs">
                          <TableHead>Type</TableHead>
                          <TableHead>Device/OS</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activities.map((a: any, i: number) => (
                          <TableRow key={a.id || i}>
                            <TableCell className="font-medium text-xs">
                              {a.activityType}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {a.device} <br />
                              <span className="text-">{a.operatingSystem}</span>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-primary">
                              {a.ipAddress}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {a.createdAt
                                ? new Date(a.createdAt).toLocaleString("id-ID")
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {a.isSuccess ? (
                                <Badge className="text-xs bg-emerald-500/15 text-emerald-600">
                                  Success
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Failed
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {activities.length === 0 && (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No logs
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
