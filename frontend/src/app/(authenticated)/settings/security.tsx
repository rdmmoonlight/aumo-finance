"use client";
import { useState } from "react";
import {
  IconHeartbeat,
  IconActivity,
  IconDeviceLaptop,
  IconHistory,
  IconAlertOctagon,
  IconLogout,
  IconLoader2,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  useGetApiV1SettingsGuardianDashboardQuery,
  usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation,
  usePostApiV1SettingsGuardianRevokeAllSessionsMutation,
} from "@/lib/generatedApi";
import { Card } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

export default function SecuritySettings() {
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

  const dashboardData = (resp as any)?.data || resp;
  const security = dashboardData?.securityStatus;
  const activities = (dashboardData?.recentActivities || []).slice(0, 5);
  const sessions = (dashboardData?.activeSessions || []).slice(0, 5);
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
    } catch (e: any) {
      notify(e?.data?.message || "Gagal", true);
    }
  };
  const handleRevokeAll = async () => {
    if (!confirm("Lockout semua device lain?")) return;
    try {
      await revokeAll().unwrap();
      notify("Semua sesi lain diakhiri");
      refetch();
    } catch (e: any) {
      notify(e?.data?.message || "Gagal", true);
    }
  };

  return (
    <div className="space-y-3">
      {success && (
        <Alert className="py-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <IconCircleCheck size={14} />
          <AlertDescription className="text-xs">{success}</AlertDescription>
        </Alert>
      )}
      {(error || isError) && (
        <Alert variant="destructive" className="py-2">
          <IconAlertTriangle size={14} />
          <AlertDescription className="text-xs">
            {error || (fetchError as any)?.data?.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Guardian Status</h3>
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 h-6 text-xs",
            isHealthy
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
              : "border-amber-500/20 bg-amber-500/10 text-amber-600",
          )}
        >
          <IconHeartbeat size={12} /> {security?.statusLevel || "Loading"}
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-16 gap-2 text-muted-foreground">
          <IconLoader2 className="w-6 h-6 animate-spin" />
          <p className="text-xs">Memuat Guardian...</p>
        </div>
      ) : (
        <Tabs value={guardianTab} onValueChange={setGuardianTab}>
          <TabsList className="h-7 p-1 w-fit">
            <TabsTrigger value="health" className="text-xs h-5 gap-1">
              <IconActivity size={12} /> Health
            </TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs h-5 gap-1">
              <IconDeviceLaptop size={12} /> Sessions{" "}
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {sessions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs h-5 gap-1">
              <IconHistory size={12} /> Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-3">
            <div className="grid grid-cols-2 gap-3">
              <Card className="py-3 px-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Failed 24h</p>
                  <p className="text-xs text-muted-foreground">
                    Kegagalan login
                  </p>
                </div>
                {security?.failedAttemptsLast24Hours === 0 ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 text-xs h-5">
                    0
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs h-5">
                    {security?.failedAttemptsLast24Hours}
                  </Badge>
                )}
              </Card>
              <Card className="py-3 px-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Last Login</p>
                  <p className="text-xs text-muted-foreground">Terakhir</p>
                </div>
                <span className="text-xs font-mono">
                  {security?.lastSuccessfulLogin
                    ? new Date(security.lastSuccessfulLogin).toLocaleString(
                        "id-ID",
                        { dateStyle: "short", timeStyle: "short" },
                      )
                    : "-"}
                </span>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="mt-3">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between py-2 px-3 border-b bg-muted/30">
                <span className="text-xs font-semibold">Active Sessions</span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-6 text-xs px-2 gap-1"
                  onClick={handleRevokeAll}
                  disabled={isRevokingAll}
                >
                  <IconAlertOctagon size={12} /> Revoke All
                </Button>
              </div>
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow className="h-7">
                      <TableHead className="text-xs h-7">Device</TableHead>
                      <TableHead className="text-xs h-7">Browser/OS</TableHead>
                      <TableHead className="text-xs h-7">IP</TableHead>
                      <TableHead className="text-xs h-7">Last</TableHead>
                      <TableHead className="text-right text-xs h-7"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((s: any, i: number) => (
                      <TableRow key={s.id || i} className="h-9">
                        <TableCell className="py-1.5 text-xs font-medium">
                          {s.deviceName}
                          {s.isCurrent && (
                            <Badge className="ml-1 h-4 text-xs bg-emerald-500/15 text-emerald-600">
                              Current
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-muted-foreground">
                          {s.browser}
                          <div className="text-xs">{s.operatingSystem}</div>
                        </TableCell>
                        <TableCell className="py-1.5 font-mono text-xs">
                          {s.ipAddress}
                          <div className="text-xs text-muted-foreground">
                            {s.country}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 text-xs">
                          {s.lastActivityAt
                            ? new Date(s.lastActivityAt).toLocaleTimeString(
                                "id-ID",
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="py-1.5 text-right">
                          {!s.isCurrent ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-xs text-destructive px-2"
                              onClick={() => handleRevoke(s.id, s.deviceName)}
                              disabled={isRevoking}
                            >
                              <IconLogout size={11} />
                            </Button>
                          ) : (
                            <span className="text-xs text-emerald-600">
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
              <div className="py-2 px-3 border-b bg-muted/30">
                <span className="text-xs font-semibold">Login History</span>
              </div>
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow className="h-7">
                      <TableHead className="text-xs h-7">Type</TableHead>
                      <TableHead className="text-xs h-7">Device</TableHead>
                      <TableHead className="text-xs h-7">IP</TableHead>
                      <TableHead className="text-xs h-7">Date</TableHead>
                      <TableHead className="text-right text-xs h-7">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((a: any, i: number) => (
                      <TableRow key={a.id || i} className="h-9">
                        <TableCell className="py-1.5 text-xs">
                          {a.activityType}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-muted-foreground">
                          {a.device}
                          <div className="text-xs">{a.operatingSystem}</div>
                        </TableCell>
                        <TableCell className="py-1.5 font-mono text-xs">
                          {a.ipAddress}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs">
                          {a.createdAt
                            ? new Date(a.createdAt).toLocaleString("id-ID", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="py-1.5 text-right">
                          {a.isSuccess ? (
                            <Badge className="h-4 text-xs bg-emerald-500/15 text-emerald-600">
                              OK
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="h-4 text-xs"
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
  );
}
