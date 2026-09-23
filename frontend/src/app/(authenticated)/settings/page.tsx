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
  IconLoader2,
  IconPalette,
} from "@tabler/icons-react";

import {
  useGetApiV1AuthMeQuery,
  useGetApiV1SettingsGuardianDashboardQuery,
  usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation,
  usePostApiV1SettingsGuardianRevokeAllSessionsMutation,
} from "@/lib/generatedApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface UserProfile {
  userId?: string;
  userName?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mainTab, setMainTab] = useState("account");
  const [guardianTab, setGuardianTab] = useState("health");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: rawUser, isLoading: loadingUser } = useGetApiV1AuthMeQuery();
  const user = rawUser as UserProfile | undefined;

  const {
    data: dashboardResponse,
    isLoading: loadingGuardian,
    isError,
    error,
    refetch,
  } = useGetApiV1SettingsGuardianDashboardQuery(undefined, {
    skip: mainTab !== "security",
  });

  const [revokeSession, { isLoading: isRevokingSession }] =
    usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation();
  const [revokeAll, { isLoading: isRevokingAll }] =
    usePostApiV1SettingsGuardianRevokeAllSessionsMutation();

  useEffect(() => setMounted(true), []);

  const dashboardData = (dashboardResponse as any)?.data || dashboardResponse;
  const security = dashboardData?.securityStatus;
  const activities = (dashboardData?.recentActivities || []).slice(0, 5);
  const sessions = (dashboardData?.activeSessions || []).slice(0, 5);
  const isHealthy = security?.statusLevel === "Good";

  const handleRevoke = async (id?: string, device?: string) => {
    if (!id || !confirm(`Akhiri sesi "${device}"?`)) return;
    try {
      setErrorMessage(null);
      await revokeSession({ sessionId: id }).unwrap();
      setSuccessMessage("Sesi diakhiri");
      refetch();
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e: any) {
      setErrorMessage(e?.data?.message || "Gagal");
    }
  };
  const handleRevokeAll = async () => {
    if (!confirm("Lockout semua device lain?")) return;
    try {
      setErrorMessage(null);
      await revokeAll().unwrap();
      setSuccessMessage("Semua sesi lain diakhiri");
      refetch();
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e: any) {
      setErrorMessage(e?.data?.message || "Gagal");
    }
  };

  const appearanceOptions = [
    { id: "light", label: "Light", desc: "Terang", icon: IconSun },
    { id: "dark", label: "Dark", desc: "Gelap", icon: IconMoon },
    { id: "system", label: "System", desc: "Ikut OS", icon: IconDeviceDesktop },
  ] as const;

  return (
    <div className="max-w- mx-auto flex flex-col h-[calc(100vh-72px)]">
      {/* HEADER + TABS STICKY DI ATAS */}
      <div className="shrink-0 space-y-3 bg-background sticky top-0 z-10 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text- font-bold tracking-tight">Settings</h1>
            <p className="text- text-muted-foreground">
              Account, appearance, and security in one place.
            </p>
          </div>
          {mainTab === "security" && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 h-6 text- px-2.5",
                isHealthy
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-600",
              )}
            >
              <IconHeartbeat size={12} /> {security?.statusLevel || "Loading"}
            </Badge>
          )}
        </div>

        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="w-full sm:w- h-8 p-1">
            <TabsTrigger value="account" className="text- gap-1.5 h-6">
              <IconUser size={13} /> Account
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text- gap-1.5 h-6">
              <IconPalette size={13} /> Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="text- gap-1.5 h-6">
              <IconShieldCheck size={13} /> Security
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator className="mt-3" />
      </div>

      {/* CONTENT SCROLL CUMA KALO BUTUH */}
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 mt-1">
        {successMessage && (
          <Alert className="mb-3 py-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
            <IconCircleCheck size={14} />
            <AlertDescription className="text-xs">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        {(errorMessage || isError) && (
          <Alert variant="destructive" className="mb-3 py-2">
            <IconAlertTriangle size={14} />
            <AlertDescription className="text-xs">
              {errorMessage || (error as any)?.data?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* ACCOUNT */}
        {mainTab === "account" && (
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text- flex items-center gap-2">
                <IconUser size={14} /> Profile
              </CardTitle>
              <CardDescription className="text-">
                Data dari ASP.NET Core Identity
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {loadingUser ? (
                <div className="text-xs text-muted-foreground">Loading...</div>
              ) : user ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <Label className="text- text-muted-foreground flex gap-1">
                      <IconUser size={10} /> Full Name
                    </Label>
                    <p className="text- font-medium mt-0.5">
                      {user.fullName || user.userName}
                    </p>
                  </div>
                  <div>
                    <Label className="text- text-muted-foreground flex gap-1">
                      <IconMail size={10} /> Email
                    </Label>
                    <p className="text- font-medium mt-0.5 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text- text-muted-foreground flex gap-1">
                      <IconShieldCheck size={10} /> Roles
                    </Label>
                    <div className="flex gap-1 mt-1">
                      {user.roles?.map((r: string) => (
                        <Badge
                          key={r}
                          variant="secondary"
                          className="text- h-5 px-1.5 font-mono"
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text- text-muted-foreground flex gap-1">
                      <IconId size={10} /> User ID
                    </Label>
                    <p className="text- font-mono text-muted-foreground truncate mt-0.5">
                      {user.userId}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-destructive">
                  Tidak terautentikasi
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* APPEARANCE */}
        {mainTab === "appearance" && (
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-">Appearance</CardTitle>
              <CardDescription className="text-">
                Tema disimpan di localStorage
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <RadioGroup
                value={mounted ? theme : "system"}
                onValueChange={(v) => setTheme(v as any)}
                className="grid grid-cols-3 gap-2.5"
              >
                {appearanceOptions.map((opt) => {
                  const active = mounted && theme === opt.id;
                  return (
                    <Label
                      key={opt.id}
                      htmlFor={opt.id}
                      className={cn(
                        "flex flex-col rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-all",
                        active ? "border-primary bg-primary/5" : "border-muted",
                      )}
                    >
                      <RadioGroupItem
                        value={opt.id}
                        id={opt.id}
                        className="sr-only"
                      />
                      <opt.icon
                        size={16}
                        className={cn("mb-2", active && "text-primary")}
                      />
                      <span className="text- font-medium">{opt.label}</span>
                      <span className="text- text-muted-foreground">
                        {opt.desc}
                      </span>
                      {active && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground grid place-items-center">
                          <IconCheck size={10} />
                        </div>
                      )}
                    </Label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* SECURITY */}
        {mainTab === "security" && (
          <div className="space-y-3">
            {loadingGuardian ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                <IconLoader2 className="w-6 h-6 animate-spin" />
                <p className="text-xs">Memuat Guardian...</p>
              </div>
            ) : (
              <Tabs value={guardianTab} onValueChange={setGuardianTab}>
                <TabsList className="h-7 p-1 w-fit">
                  <TabsTrigger value="health" className="text- h-5 gap-1">
                    <IconActivity size={12} /> Health
                  </TabsTrigger>
                  <TabsTrigger value="sessions" className="text- h-5 gap-1">
                    <IconDeviceLaptop size={12} /> Sessions{" "}
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-">
                      {sessions.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="text- h-5 gap-1">
                    <IconHistory size={12} /> Logs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="health" className="mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="py-3 px-3 flex items-center justify-between">
                      <div>
                        <p className="text- font-medium">Failed 24h</p>
                        <p className="text- text-muted-foreground">
                          Kegagalan login
                        </p>
                      </div>
                      {security?.failedAttemptsLast24Hours === 0 ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 text- h-5">
                          0
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text- h-5">
                          {security?.failedAttemptsLast24Hours}
                        </Badge>
                      )}
                    </Card>
                    <Card className="py-3 px-3 flex items-center justify-between">
                      <div>
                        <p className="text- font-medium">Last Login</p>
                        <p className="text- text-muted-foreground">
                          Waktu login terakhir
                        </p>
                      </div>
                      <span className="text- font-mono text-muted-foreground">
                        {security?.lastSuccessfulLogin
                          ? new Date(
                              security.lastSuccessfulLogin,
                            ).toLocaleString("id-ID", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "-"}
                      </span>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="sessions" className="mt-3">
                  <Card className="overflow-hidden">
                    <div className="flex items-center justify-between py-2 px-3 border-b bg-muted/30">
                      <span className="text- font-semibold">
                        Active Sessions
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 text- px-2 gap-1"
                        onClick={handleRevokeAll}
                        disabled={isRevokingAll}
                      >
                        <IconAlertOctagon size={12} /> Revoke All
                      </Button>
                    </div>
                    <ScrollArea className="h-">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow className="h-7">
                            <TableHead className="text- h-7">Device</TableHead>
                            <TableHead className="text- h-7">
                              Browser/OS
                            </TableHead>
                            <TableHead className="text- h-7">IP</TableHead>
                            <TableHead className="text- h-7">Last</TableHead>
                            <TableHead className="text-right text- h-7"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sessions.map((s: any, i: number) => (
                            <TableRow key={s.id || i} className="h-9">
                              <TableCell className="py-1.5 text- font-medium">
                                {s.deviceName}
                                {s.isCurrent && (
                                  <Badge className="ml-1 h-4 text- bg-emerald-500/15 text-emerald-600">
                                    Current
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-1.5 text- text-muted-foreground">
                                {s.browser}
                                <div className="text-">{s.operatingSystem}</div>
                              </TableCell>
                              <TableCell className="py-1.5 font-mono text-">
                                {s.ipAddress}
                                <div className="text- text-muted-foreground">
                                  {s.country}
                                </div>
                              </TableCell>
                              <TableCell className="py-1.5 text- text-muted-foreground">
                                {s.lastActivityAt
                                  ? new Date(
                                      s.lastActivityAt,
                                    ).toLocaleTimeString("id-ID")
                                  : "-"}
                              </TableCell>
                              <TableCell className="py-1.5 text-right">
                                {!s.isCurrent ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 text- text-destructive px-2"
                                    onClick={() =>
                                      handleRevoke(s.id, s.deviceName)
                                    }
                                    disabled={isRevokingSession}
                                  >
                                    <IconLogout size={11} />
                                  </Button>
                                ) : (
                                  <span className="text- text-emerald-600">
                                    Active
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </Card>
                </TabsContent>

                <TabsContent value="logs" className="mt-3">
                  <Card className="overflow-hidden">
                    <div className="flex items-center justify-between py-2 px-3 border-b bg-muted/30">
                      <span className="text- font-semibold">Login History</span>
                    </div>
                    <ScrollArea className="h-">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow className="h-7">
                            <TableHead className="text- h-7">Type</TableHead>
                            <TableHead className="text- h-7">Device</TableHead>
                            <TableHead className="text- h-7">IP</TableHead>
                            <TableHead className="text- h-7">Date</TableHead>
                            <TableHead className="text-right text- h-7">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activities.map((a: any, i: number) => (
                            <TableRow key={a.id || i} className="h-9">
                              <TableCell className="py-1.5 text-">
                                {a.activityType}
                              </TableCell>
                              <TableCell className="py-1.5 text- text-muted-foreground">
                                {a.device}
                                <div className="text-">{a.operatingSystem}</div>
                              </TableCell>
                              <TableCell className="py-1.5 font-mono text-">
                                {a.ipAddress}
                              </TableCell>
                              <TableCell className="py-1.5 text- text-muted-foreground">
                                {a.createdAt
                                  ? new Date(a.createdAt).toLocaleString(
                                      "id-ID",
                                      {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      },
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell className="py-1.5 text-right">
                                {a.isSuccess ? (
                                  <Badge className="h-4 text- bg-emerald-500/15 text-emerald-600">
                                    OK
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="h-4 text-"
                                  >
                                    Fail
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
