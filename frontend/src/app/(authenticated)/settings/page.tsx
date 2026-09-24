"use client";
import { useState, useEffect, useRef } from "react";
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
  IconLock,
  IconPhone,
  IconUpload,
  IconTrash,
  IconKey,
} from "@tabler/icons-react";
import {
  useGetApiV1AuthMeQuery,
  useGetApiV1SettingsGuardianDashboardQuery,
  usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation,
  usePostApiV1SettingsGuardianRevokeAllSessionsMutation,
  usePutApiV1SettingsProfileMutation,
  usePostApiV1SettingsAvatarMutation,
  usePostApiV1SettingsChangePasswordMutation,
  useDeleteApiV1SettingsDeleteAccountMutation,
} from "@/lib/generatedApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  roles?: string[];
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mainTab, setMainTab] = useState("account");
  const [guardianTab, setGuardianTab] = useState("health");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const {
    data: rawUser,
    isLoading: loadingUser,
    refetch: refetchMe,
  } = useGetApiV1AuthMeQuery();
  const user = rawUser as UserProfile | undefined;
  const {
    data: dashboardResponse,
    isLoading: loadingGuardian,
    isError,
    error,
    refetch: refetchGuardian,
  } = useGetApiV1SettingsGuardianDashboardQuery(undefined, {
    skip: mainTab !== "security",
  });
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    usePutApiV1SettingsProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    usePostApiV1SettingsAvatarMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    usePostApiV1SettingsChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] =
    useDeleteApiV1SettingsDeleteAccountMutation();
  const [revokeSession, { isLoading: isRevokingSession }] =
    usePostApiV1SettingsGuardianRevokeSessionBySessionIdMutation();
  const [revokeAll, { isLoading: isRevokingAll }] =
    usePostApiV1SettingsGuardianRevokeAllSessionsMutation();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setUserName(user.userName || "");
      setPhoneNumber(user.phoneNumber || "");
      setBio(user.bio || "");
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const dashboardData = (dashboardResponse as any)?.data || dashboardResponse;
  const security = dashboardData?.securityStatus;
  const activities = (dashboardData?.recentActivities || []).slice(0, 5);
  const sessions = (dashboardData?.activeSessions || []).slice(0, 5);
  const isHealthy = security?.statusLevel === "Good";

  const showNotification = (msg: string, isErrorMsg = false) => {
    if (isErrorMsg) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        updateProfileRequest: {
          fullName,
          userName,
          phoneNumber,
          bio,
          avatarUrl: avatarPreview || undefined,
        },
      }).unwrap();
      showNotification("Profil berhasil diperbarui!");
      refetchMe();
    } catch (err: any) {
      showNotification(err?.data?.message || "Gagal memperbarui profil", true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res: any = await uploadAvatar(formData as any).unwrap();
      setAvatarPreview(res.avatarUrl);
      showNotification("Avatar berhasil diunggah!");
      refetchMe();
    } catch (err: any) {
      showNotification(err?.data?.message || "Gagal mengunggah avatar", true);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showNotification("Semua field password harus diisi", true);
      return;
    }
    try {
      await changePassword({
        changePasswordRequest: { currentPassword, newPassword },
      }).unwrap();
      showNotification("Password berhasil diubah!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      showNotification(err?.data?.message || "Gagal mengubah password", true);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak dapat dibatalkan!",
      )
    )
      return;
    try {
      await deleteAccount().unwrap();
      alert("Akun Anda telah dihapus.");
      window.location.href = "/login";
    } catch (err: any) {
      showNotification(err?.data?.message || "Gagal menghapus akun", true);
    }
  };

  const handleRevoke = async (id?: string, device?: string) => {
    if (!id || !confirm(`Akhiri sesi "${device}"?`)) return;
    try {
      await revokeSession({ sessionId: id }).unwrap();
      showNotification("Sesi diakhiri");
      refetchGuardian();
    } catch (e: any) {
      showNotification(e?.data?.message || "Gagal", true);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm("Lockout semua device lain?")) return;
    try {
      await revokeAll().unwrap();
      showNotification("Semua sesi lain diakhiri");
      refetchGuardian();
    } catch (e: any) {
      showNotification(e?.data?.message || "Gagal", true);
    }
  };

  const appearanceOptions = [
    { id: "light", label: "Light", desc: "Terang", icon: IconSun },
    { id: "dark", label: "Dark", desc: "Gelap", icon: IconMoon },
    { id: "system", label: "System", desc: "Ikut OS", icon: IconDeviceDesktop },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-72px)]">
      <div className="shrink-0 space-y-3 bg-background sticky top-0 z-10 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Settings</h1>
            <p className="text-xs text-muted-foreground">
              Account, appearance, and security in one place.
            </p>
          </div>
          {mainTab === "security" && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 h-6 text-xs px-2.5",
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
          <TabsList className="w-full sm:w-auto h-8 p-1">
            <TabsTrigger value="account" className="text-xs gap-1.5 h-6">
              <IconUser size={13} /> Account
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs gap-1.5 h-6">
              <IconPalette size={13} /> Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5 h-6">
              <IconShieldCheck size={13} /> Security
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator className="mt-3" />
      </div>
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 mt-1 space-y-4">
        {successMessage && (
          <Alert className="py-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
            <IconCircleCheck size={14} />
            <AlertDescription className="text-xs">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        {(errorMessage || isError) && (
          <Alert variant="destructive" className="py-2">
            <IconAlertTriangle size={14} />
            <AlertDescription className="text-xs">
              {errorMessage || (error as any)?.data?.message}
            </AlertDescription>
          </Alert>
        )}
        {mainTab === "account" && (
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconUser size={15} /> Edit Profile
                </CardTitle>
                <CardDescription className="text-xs">
                  Perbarui informasi profil dan identitas akun Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {loadingUser ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                    <IconLoader2 size={16} className="animate-spin" /> Memuat
                    data profil...
                  </div>
                ) : user ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border">
                        <AvatarImage src={avatarPreview || undefined} />
                        <AvatarFallback className="font-bold text-sm">
                          {(fullName || user.userName || "U")
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.gif,.webp"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          disabled={isUploadingAvatar}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploadingAvatar ? (
                            <IconLoader2 size={13} className="animate-spin" />
                          ) : (
                            <IconUpload size={13} />
                          )}{" "}
                          Change Avatar
                        </Button>
                        <p className="text- text-muted-foreground mt-1">
                          JPG, PNG, WEBP max 2MB.
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <IconUser size={12} /> Full Name
                        </Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nama lengkap"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <IconId size={12} /> Username
                        </Label>
                        <Input
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Username"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1 text-muted-foreground">
                          <IconMail size={12} /> Email (ReadOnly)
                        </Label>
                        <Input
                          value={user.email || ""}
                          disabled
                          className="h-8 text-xs bg-muted/50 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <IconPhone size={12} /> Phone Number
                        </Label>
                        <Input
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+62812345678"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Bio</Label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tuliskan deskripsi singkat profil Anda..."
                        rows={3}
                        className="text-xs resize-none"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile && (
                          <IconLoader2 size={13} className="animate-spin" />
                        )}{" "}
                        Save Profile Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-xs text-destructive">
                    Gagal memuat profil / Tidak terautentikasi
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconKey size={15} /> Change Password
                </CardTitle>
                <CardDescription className="text-xs">
                  Perbarui kata sandi Anda secara berkala demi keamanan akun.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <form
                  onSubmit={handlePasswordSubmit}
                  className="space-y-3 max-w-md"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">Current Password</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword && (
                      <IconLoader2 size={13} className="animate-spin" />
                    )}{" "}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm text-destructive flex items-center gap-2">
                  <IconTrash size={15} /> Delete Account
                </CardTitle>
                <CardDescription className="text-xs text-destructive/80">
                  Menghapus akun Anda secara permanen. Tindakan ini tidak dapat
                  dibatalkan.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount && (
                    <IconLoader2 size={13} className="animate-spin" />
                  )}{" "}
                  Delete Account Permanently
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        {mainTab === "appearance" && (
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Appearance</CardTitle>
              <CardDescription className="text-xs">
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
                        "relative flex flex-col rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-all",
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
                      <span className="text-xs font-medium">{opt.label}</span>
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
                  <TabsTrigger value="health" className="text-xs h-5 gap-1">
                    <IconActivity size={12} /> Health
                  </TabsTrigger>
                  <TabsTrigger value="sessions" className="text-xs h-5 gap-1">
                    <IconDeviceLaptop size={12} /> Sessions{" "}
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-">
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
                        <p className="text- text-muted-foreground">
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
                        <p className="text- text-muted-foreground">
                          Waktu login terakhir
                        </p>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
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
                      <span className="text-xs font-semibold">
                        Active Sessions
                      </span>
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
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow className="h-7">
                            <TableHead className="text-xs h-7">
                              Device
                            </TableHead>
                            <TableHead className="text-xs h-7">
                              Browser/OS
                            </TableHead>
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
                                  <Badge className="ml-1 h-4 text- bg-emerald-500/15 text-emerald-600">
                                    Current
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-1.5 text-xs text-muted-foreground">
                                {s.browser}
                                <div className="text-">{s.operatingSystem}</div>
                              </TableCell>
                              <TableCell className="py-1.5 font-mono text-xs">
                                {s.ipAddress}
                                <div className="text- text-muted-foreground">
                                  {s.country}
                                </div>
                              </TableCell>
                              <TableCell className="py-1.5 text-xs text-muted-foreground">
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
                                    className="h-5 text-xs text-destructive px-2"
                                    onClick={() =>
                                      handleRevoke(s.id, s.deviceName)
                                    }
                                    disabled={isRevokingSession}
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
                    <div className="flex items-center justify-between py-2 px-3 border-b bg-muted/30">
                      <span className="text-xs font-semibold">
                        Login History
                      </span>
                    </div>
                    <ScrollArea className="h-64">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow className="h-7">
                            <TableHead className="text-xs h-7">Type</TableHead>
                            <TableHead className="text-xs h-7">
                              Device
                            </TableHead>
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
                                <div className="text-">{a.operatingSystem}</div>
                              </TableCell>
                              <TableCell className="py-1.5 font-mono text-xs">
                                {a.ipAddress}
                              </TableCell>
                              <TableCell className="py-1.5 text-xs text-muted-foreground">
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
