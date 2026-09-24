"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  IconSun, IconMoon, IconDeviceDesktop, IconCheck,
  IconShieldCheck, IconHeartbeat, IconCircleCheck,
  IconAlertTriangle, IconActivity, IconDeviceLaptop,
  IconAlertOctagon, IconLogout, IconHistory, IconLoader2,
} from "@tabler/icons-react";
import {
  useGetApiV1SettingsGuardianDashboardQuery,
  usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation,
  usePostApiV1SettingsGuardianRevokeAllSessionsMutation,
} from "@/lib/generatedApi";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ApplicationSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [appTab, setAppTab] = useState("appearance");
  const [guardianTab, setGuardianTab] = useState("health");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: dashboardResponse,
    isLoading: loadingGuardian,
    isError,
    error,
    refetch: refetchGuardian,
  } = useGetApiV1SettingsGuardianDashboardQuery(undefined, {
    skip: appTab!== "security",
  });

  const [revokeSession, { isLoading: isRevokingSession }] = usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation();
  const [revokeAll, { isLoading: isRevokingAll }] = usePostApiV1SettingsGuardianRevokeAllSessionsMutation();

  useEffect(() => setMounted(true), []);

  const dashboardData = (dashboardResponse as any)?.data || dashboardResponse;
  const security = dashboardData?.securityStatus;
  const activities = (dashboardData?.recentActivities || []).slice(0, 5);
  const sessions = (dashboardData?.activeSessions || []).slice(0, 5);
  const isHealthy = security?.statusLevel === "Good";

  const showNotification = (msg: string, isErrorMsg = false) => {
    if (isErrorMsg) { setErrorMessage(msg); setSuccessMessage(null); }
    else { setSuccessMessage(msg); setErrorMessage(null); setTimeout(() => setSuccessMessage(null), 3000); }
  };

  const handleRevoke = async (id?: string, device?: string) => {
    if (!id ||!confirm(`Akhiri sesi "${device}"?`)) return;
    try { await revokeSession({ sessionId: id }).unwrap(); showNotification("Sesi diakhiri"); refetchGuardian(); }
    catch (e: any) { showNotification(e?.data?.message || "Gagal", true); }
  };

  const handleRevokeAll = async () => {
    if (!confirm("Lockout semua device lain?")) return;
    try { await revokeAll().unwrap(); showNotification("Semua sesi lain diakhiri"); refetchGuardian(); }
    catch (e: any) { showNotification(e?.data?.message || "Gagal", true); }
  };

  const appearanceOptions = [
    { id: "light", label: "Light", desc: "Terang", icon: IconSun },
    { id: "dark", label: "Dark", desc: "Gelap", icon: IconMoon },
    { id: "system", label: "System", desc: "Ikut OS", icon: IconDeviceDesktop },
  ] as const;

  return (
    <div className="space-y-4">
      {successMessage && (
        <Alert className="py-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <IconCircleCheck size={14} /><AlertDescription className="text-xs">{successMessage}</AlertDescription>
        </Alert>
      )}
      {(errorMessage || (isError && appTab === "security")) && (
        <Alert variant="destructive" className="py-2">
          <IconAlertTriangle size={14} /><AlertDescription className="text-xs">{errorMessage || (error as any)?.data?.message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={appTab} onValueChange={setAppTab}>
        <TabsList className="h-8 p-1 w-fit">
          <TabsTrigger value="appearance" className="text-xs h-6">Appearance</TabsTrigger>
          <TabsTrigger value="security" className="text-xs h-6 gap-1"><IconShieldCheck size={12} /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="mt-3">
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Appearance</CardTitle>
              <CardDescription className="text-xs">Pilih tema antarmuka aplikasi.</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <RadioGroup value={mounted? theme : "system"} onValueChange={(v) => setTheme(v)} className="grid grid-cols-3 gap-2.5">
                {appearanceOptions.map((opt) => {
                  const active = mounted && theme === opt.id;
                  return (
                    <Label key={opt.id} htmlFor={opt.id} className={cn("relative flex flex-col rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-all", active? "border-primary bg-primary/5" : "border-muted")}>
                      <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                      <opt.icon size={16} className={cn("mb-2", active && "text-primary")} />
                      <span className="text-xs font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                      {active && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground grid place-items-center"><IconCheck size={10} /></div>}
                    </Label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5"><IconShieldCheck size={14} /> Guardian</h3>
            <Badge variant="outline" className={cn("gap-1.5 h-6 text-xs px-2.5", isHealthy? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-amber-500/20 bg-amber-500/10 text-amber-600")}>
              <IconHeartbeat size={12} /> {security?.statusLevel || "Loading"}
            </Badge>
          </div>

          {loadingGuardian? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <IconLoader2 className="w-6 h-6 animate-spin" /><p className="text-xs">Memuat Guardian...</p>
            </div>
          ) : (
            <Tabs value={guardianTab} onValueChange={setGuardianTab}>
              <TabsList className="h-7 p-1 w-fit">
                <TabsTrigger value="health" className="text-xs h-5 gap-1"><IconActivity size={12} /> Health</TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs h-5 gap-1"><IconDeviceLaptop size={12} /> Sessions <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">{sessions.length}</Badge></TabsTrigger>
                <TabsTrigger value="logs" className="text-xs h-5 gap-1"><IconHistory size={12} /> Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="health" className="mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <Card className="py-3 px-3 flex items-center justify-between">
                    <div><p className="text-xs font-medium">Failed 24h</p><p className="text-xs text-muted-foreground">Kegagalan login</p></div>
                    {security?.failedAttemptsLast24Hours === 0? <Badge className="bg-emerald-500/15 text-emerald-600 text-xs h-5">0</Badge> : <Badge variant="destructive" className="text-xs h-5">{security?.failedAttemptsLast24Hours}</Badge>}
                  </Card>
                  <Card className="py-3 px-3 flex items-center justify-between">
                    <div><p className="text-xs font-medium">Last Login</p><p className="text-xs text-muted-foreground">Waktu login terakhir</p></div>
                    <span className="text-xs font-mono text-muted-foreground">{security?.lastSuccessfulLogin? new Date(security.lastSuccessfulLogin).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "-"}</span>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="mt-3">
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between py-2 px-3 border-b bg-muted/30">
                    <span className="text-xs font-semibold">Active Sessions</span>
                    <Button variant="destructive" size="sm" className="h-6 text-xs px-2 gap-1" onClick={handleRevokeAll} disabled={isRevokingAll}><IconAlertOctagon size={12} /> Revoke All</Button>
                  </div>
                  <ScrollArea className="h-64">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10"><TableRow className="h-7"><TableHead className="text-xs h-7">Device</TableHead><TableHead className="text-xs h-7">Browser/OS</TableHead><TableHead className="text-xs h-7">IP</TableHead><TableHead className="text-xs h-7">Last</TableHead><TableHead className="text-right text-xs h-7"></TableHead></TableRow></TableHeader>
                      <TableBody>
                        {sessions.map((s: any, i: number) => (
                          <TableRow key={s.id || i} className="h-9">
                            <TableCell className="py-1.5 text-xs font-medium">{s.deviceName}{s.isCurrent && <Badge className="ml-1 h-4 text-xs bg-emerald-500/15 text-emerald-600">Current</Badge>}</TableCell>
                            <TableCell className="py-1.5 text-xs text-muted-foreground">{s.browser}<div className="text-xs">{s.operatingSystem}</div></TableCell>
                            <TableCell className="py-1.5 font-mono text-xs">{s.ipAddress}<div className="text-xs text-muted-foreground">{s.country}</div></TableCell>
                            <TableCell className="py-1.5 text-xs text-muted-foreground">{s.lastActivityAt? new Date(s.lastActivityAt).toLocaleTimeString("id-ID") : "-"}</TableCell>
                            <TableCell className="py-1.5 text-right">{!s.isCurrent? <Button variant="ghost" size="sm" className="h-5 text-xs text-destructive px-2" onClick={() => handleRevoke(s.id, s.deviceName)} disabled={isRevokingSession}><IconLogout size={11} /></Button> : <span className="text-xs text-emerald-600">Active</span>}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="mt-3">
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between py-2 px-3 border-b bg-muted/30"><span className="text-xs font-semibold">Login History</span></div>
                  <ScrollArea className="h-64">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10"><TableRow className="h-7"><TableHead className="text-xs h-7">Type</TableHead><TableHead className="text-xs h-7">Device</TableHead><TableHead className="text-xs h-7">IP</TableHead><TableHead className="text-xs h-7">Date</TableHead><TableHead className="text-right text-xs h-7">Status</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {activities.map((a: any, i: number) => (
                          <TableRow key={a.id || i} className="h-9">
                            <TableCell className="py-1.5 text-xs">{a.activityType}</TableCell>
                            <TableCell className="py-1.5 text-xs text-muted-foreground">{a.device}<div className="text-xs">{a.operatingSystem}</div></TableCell>
                            <TableCell className="py-1.5 font-mono text-xs">{a.ipAddress}</TableCell>
                            <TableCell className="py-1.5 text-xs text-muted-foreground">{a.createdAt? new Date(a.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "-"}</TableCell>
                            <TableCell className="py-1.5 text-right">{a.isSuccess? <Badge className="h-4 text-xs bg-emerald-500/15 text-emerald-600">OK</Badge> : <Badge variant="destructive" className="h-4 text-xs">Fail</Badge>}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
