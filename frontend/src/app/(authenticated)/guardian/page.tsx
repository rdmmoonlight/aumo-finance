"use client";

import { useState } from "react";
import {
  IconShieldCheck,
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
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  useGetApiV1GuardianDashboardQuery,
  usePostApiV1GuardianRevokeSessionBySessionIdMutation,
  usePostApiV1GuardianRevokeAllSessionsMutation,
} from "@/lib/generatedApi";

export default function GuardianSecurityPage() {
  const [activeTab, setActiveTab] = useState("health");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RTK Query: Fetch data Guardian Dashboard
  const {
    data: dashboardResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApiV1GuardianDashboardQuery();

  // RTK Query: Mutations untuk Revoke Session
  const [revokeSession, { isLoading: isRevokingSession }] =
    usePostApiV1GuardianRevokeSessionBySessionIdMutation();
  const [revokeAllSessions, { isLoading: isRevokingAll }] =
    usePostApiV1GuardianRevokeAllSessionsMutation();

  // Cast data dari response API
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
      refetch(); // Refresh data otomatis setelah aksi sukses
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
      refetch(); // Refresh data otomatis setelah aksi sukses
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Gagal mengakhiri semua sesi",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-muted-foreground">
        <IconLoader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs">Memuat Guardian...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <IconShieldCheck className="text-primary" size={24} /> Guardian
            Security
          </h1>
          <p className="text-sm text-muted-foreground">
            Security health, sessions, and logs
          </p>
        </div>
        <Badge
          variant="outline"
          className={`gap-2 px-3 py-1.5 ${
            isHealthy
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              : "border-amber-500/20 bg-amber-500/10 text-amber-500"
          }`}
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

      {(errorMessage || isError) && (
        <Alert variant="destructive">
          <IconAlertTriangle size={16} />
          <AlertDescription>
            {errorMessage ||
              (error as any)?.data?.message ||
              "Gagal memuat data guardian"}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
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
                <IconHeartbeat size={16} className="text-rose-400" /> Account
                Health Checkup
              </div>
              <span className="text-xs text-muted-foreground">Automated</span>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div>
                  <p className="text-sm font-medium">Failed Attempts (24h)</p>
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
                  <p className="text-sm font-medium">Last Successful Login</p>
                  <p className="text-xs text-muted-foreground">
                    Waktu login terakhir
                  </p>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {security?.lastSuccessfulLogin
                    ? new Date(security.lastSuccessfulLogin).toLocaleString(
                        "id-ID",
                      )
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
                        <span className="text-[10px]">{s.operatingSystem}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-primary">
                        {s.ipAddress} <br />
                        <span className="text-[10px] text-muted-foreground">
                          {s.country}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.lastActivityAt
                          ? new Date(s.lastActivityAt).toLocaleString("id-ID")
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
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
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
                        <span className="text-[10px]">{a.operatingSystem}</span>
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
                          <Badge variant="destructive" className="text-xs">
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
    </div>
  );
}
