'use client'

import { useState, useEffect } from 'react';
import { IconSun, IconMoon, IconDeviceDesktop, IconCheck, IconUser, IconShieldCheck, IconMail, IconId } from '@tabler/icons-react';
import { useTheme } from '@/hooks/useTheme';
import apiClient from '@/lib/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UserProfile {
  userId: string;
  email: string;
  userName: string;
  fullName: string;
  roles: string[];
  customClaims?: Array<{ type: string; value: string }>;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await apiClient.get('/api/v1/auth/me', { withCredentials: true });
        if (res.data?.success || res.data?.userId) {
          setUser(res.data);
        }
      } catch (e) {
        console.error('[SETTINGS] Failed to fetch user profile:', e);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  const options = [
    { id: 'light', label: 'Light', desc: 'Tampilan terang', icon: IconSun },
    { id: 'dark', label: 'Dark', desc: 'Mata gak perih', icon: IconMoon },
    { id: 'system', label: 'System', desc: 'Ngikutin OS', icon: IconDeviceDesktop },
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

      {/* USER PROFILE SECTION (ASP.NET CORE IDENTITY) */}
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
            <div className="text-sm text-muted-foreground font-mono">Loading profile data...</div>
          ) : user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <IconUser size={14} /> Full Name
                  </Label>
                  <p className="text-sm font-medium">{user.fullName || user.userName}</p>
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
                      user.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="text-xs font-mono">
                          {r}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No roles assigned</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <IconId size={14} /> User Identity ID
                  </Label>
                  <p className="text-xs font-mono text-muted-foreground truncate">{user.userId}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-destructive font-mono">Sesi pengguna tidak terautentikasi.</div>
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
            value={theme}
            onValueChange={(v) => setTheme(v as any)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {options.map((opt) => {
              const isActive = theme === opt.id;
              return (
                <Label
                  key={opt.id}
                  htmlFor={opt.id}
                  className={cn(
                    'relative flex flex-col rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent/50',
                    isActive ? 'border-primary bg-primary/5' : 'border-muted bg-card'
                  )}
                >
                  <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                  <opt.icon size={20} className={cn('mb-3', isActive && 'text-primary')} />
                  <span className="font-medium text-sm">{opt.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{opt.desc}</span>
                  {isActive && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-primary-foreground grid place-items-center">
                      <IconCheck size={12} stroke={3} />
                    </div>
                  )}
                </Label>
              );
            })}
          </RadioGroup>

          <div className="mt-6 rounded-lg bg-muted p-3 text-xs font-mono text-muted-foreground">
            current: <span className="text-foreground font-bold">{theme}</span> • html class: "
            {typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'}"
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
