"use client";

import { useState, useEffect, useRef } from "react";
import { IconUser, IconMail, IconId, IconPhone, IconUpload, IconTrash, IconKey, IconLoader2, IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react";
import {
  useGetApiV1AuthMeQuery,
  usePutApiV1SettingsProfileMutation,
  usePostApiV1SettingsAvatarMutation,
  usePostApiV1SettingsChangePasswordMutation,
  useDeleteApiV1SettingsDeleteAccountMutation,
} from "@/lib/generatedApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface UserProfile { userName?: string; fullName?: string; email?: string; phoneNumber?: string; bio?: string; avatarUrl?: string; }

export default function AccountSettings() {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: rawUser, isLoading: loadingUser, refetch: refetchMe } = useGetApiV1AuthMeQuery();
  const user = rawUser as UserProfile | undefined;

  const [updateProfile, { isLoading: isUpdating }] = usePutApiV1SettingsProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = usePostApiV1SettingsAvatarMutation();
  const [changePassword, { isLoading: isChanging }] = usePostApiV1SettingsChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteApiV1SettingsDeleteAccountMutation();

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setUserName(user.userName || "");
      setPhoneNumber(user.phoneNumber || "");
      setBio(user.bio || "");
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  useEffect(() => () => { if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview); }, [avatarPreview]);

  const notify = (msg: string, isErr = false) => {
    if (isErr) { setError(msg); setSuccess(null); }
    else { setSuccess(msg); setError(null); setTimeout(() => setSuccess(null), 3000); }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ updateProfileRequest: { fullName, userName, phoneNumber, bio, avatarUrl: avatarPreview || undefined } }).unwrap();
      notify("Profil berhasil diperbarui!"); refetchMe();
    } catch (err: any) { notify(err?.data?.message || "Gagal update profil", true); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return notify("Harus gambar", true);
    if (file.size > 2 * 1024 * 1024) return notify("Maks 2MB", true);

    const blobUrl = URL.createObjectURL(file);
    setAvatarPreview(blobUrl);
    const fd = new FormData();
    fd.append("file", file);

    try {
      // FIX buat error 400 di render.com, kalau generatedApi lu error pakai fetch manual gini lebih aman
      // const res: any = await uploadAvatar(fd as any).unwrap();
      // const newUrl = res?.avatarUrl || res?.data?.avatarUrl;

      // Kalau mau aman 100%:
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.file?.[0] || data?.message);

      setAvatarPreview(data?.avatarUrl || data?.data?.avatarUrl);
      notify("Avatar berhasil diunggah!"); refetchMe();
    } catch (err: any) {
      notify(err?.message || "Gagal upload avatar", true);
      setAvatarPreview(user?.avatarUrl || null);
    } finally { e.target.value = ""; }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword ||!newPassword) return notify("Isi semua field password", true);
    try {
      await changePassword({ changePasswordRequest: { currentPassword, newPassword } }).unwrap();
      notify("Password berhasil diubah!"); setCurrentPassword(""); setNewPassword("");
    } catch (err: any) { notify(err?.data?.message || "Gagal ubah password", true); }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin hapus akun permanen?")) return;
    try { await deleteAccount().unwrap(); window.location.href = "/login"; }
    catch (err: any) { notify(err?.data?.message || "Gagal hapus akun", true); }
  };

  return (
    <div className="space-y-4">
      {success && <Alert className="py-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-600"><IconCircleCheck size={14} /><AlertDescription className="text-xs">{success}</AlertDescription></Alert>}
      {error && <Alert variant="destructive" className="py-2"><IconAlertTriangle size={14} /><AlertDescription className="text-xs">{error}</AlertDescription></Alert>}

      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4"><CardTitle className="text-sm flex items-center gap-2"><IconUser size={15} /> Edit Profile</CardTitle><CardDescription className="text-xs">Perbarui informasi profil Anda.</CardDescription></CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {loadingUser? <div className="flex gap-2 text-xs py-4"><IconLoader2 size={16} className="animate-spin" /> Memuat...</div> : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border"><AvatarImage src={avatarPreview || undefined} /><AvatarFallback>{(fullName || "U").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div><input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1.5" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>{isUploading? <IconLoader2 size={13} className="animate-spin" /> : <IconUpload size={13} />} Change Avatar</Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP max 2MB.</p></div>
              </div><Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Full Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">Username</Label><Input value={userName} onChange={e => setUserName(e.target.value)} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs text-muted-foreground">Email (ReadOnly)</Label><Input value={user?.email || ""} disabled className="h-8 text-xs bg-muted/50" /></div>
                <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="h-8 text-xs" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Bio</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="text-xs resize-none" /></div>
              <div className="flex justify-end"><Button type="submit" size="sm" className="h-8 text-xs" disabled={isUpdating}>{isUpdating && <IconLoader2 size={13} className="animate-spin mr-1" />} Save Changes</Button></div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm"><CardHeader className="py-3 px-4"><CardTitle className="text-sm flex items-center gap-2"><IconKey size={15} /> Change Password</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 pt-0"><form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md">
          <div className="space-y-1"><Label className="text-xs">Current</Label><Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-8 text-xs" /></div>
          <div className="space-y-1"><Label className="text-xs">New</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-8 text-xs" /></div>
          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs" disabled={isChanging}>{isChanging && <IconLoader2 size={13} className="animate-spin mr-1" />} Update Password</Button>
        </form></CardContent></Card>

      <Card className="border-destructive/30 bg-destructive/5 shadow-sm"><CardHeader className="py-3 px-4"><CardTitle className="text-sm text-destructive flex items-center gap-2"><IconTrash size={15} /> Delete Account</CardTitle><CardDescription className="text-xs text-destructive/80">Tindakan tidak dapat dibatalkan.</CardDescription></CardHeader>
        <CardContent className="px-4 pb-4 pt-0 flex justify-end"><Button variant="destructive" size="sm" className="h-8 text-xs" onClick={handleDelete} disabled={isDeleting}>Delete Permanently</Button></CardContent></Card>
    </div>
  );
}
