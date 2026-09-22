"use client";

import { useState, useEffect } from "react";
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconCheck,
  IconUser,
  IconShieldCheck,
  IconMail,
  IconId,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";

// Import RTK Query auto-generated hook
import { useGetApiV1AuthMeQuery } from "@/lib/generatedApi";

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
import { cn } from "@/lib/utils";

// 1. Definisikan interface sesuai skema data dari ASP.NET Core Identity
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

  // RTK Query menggantikan useState + useEffect fetchUserProfile
  const { data: rawUser, isLoading: loadingUser } = useGetApiV1AuthMeQuery();

  // 2. Cast tipe data ke UserProfile agar properti terdeteksi oleh TypeScript
  const user = rawUser as UserProfile | undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = [
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
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Manage your account and system preferences.
        </p>
      </div>

      <Separator />

      {/* USER PROFILE SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IconUser size={18} /> Account Profile
          </CardTitle>
          <CardDescription>
            Informasi akun pengguna dari ASP.NET Core Identity.
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
                      // 3. Tambahkan anotasi tipe (r: string) secara eksplisit
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

      {/* APPEARANCE SECTION */}
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
            {options.map((opt) => {
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
    </div>
  );
}
