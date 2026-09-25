"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { baseApi } from "@/lib/apiClient";
import {
  IconUser,
  IconMail,
  IconId,
  IconPhone,
  IconUpload,
  IconTrash,
  IconKey,
  IconLoader2,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  useGetApiV1AuthMeQuery,
  usePutApiV1SettingsProfileMutation,
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

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

export default function AccountSettings() {
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { data: rawUser, isLoading: loadingUser } = useGetApiV1AuthMeQuery();
  const user = rawUser as UserProfile | undefined;

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    usePutApiV1SettingsProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    usePostApiV1SettingsChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] =
    useDeleteApiV1SettingsDeleteAccountMutation();

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setUserName(user.userName || "");
      setPhoneNumber(user.phoneNumber || "");
      setBio(user.bio || "");
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [user]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
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
      // Reset cache RTK Query agar seluruh komponen (Sidebar, dll) ter-refresh data Me-nya
      dispatch(baseApi.util.invalidateTags(["Auth", "Me"] as any));
    } catch (err: any) {
      showNotification(
        err?.data?.message || err?.data?.title || "Gagal memperbarui profil",
        true,
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return showNotification(
        "File harus berupa gambar (JPG, PNG, WEBP)",
        true,
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      return showNotification("Ukuran gambar maksimal 2MB", true);
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Gunakan fetch native dengan credentials untuk menghindari masalah header RTK Query pada multipart
      const response = await fetch(
        "https://aumonext-api.onrender.com/api/v1/settings/avatar",
        {
          method: "POST",
          body: formData,
          credentials: "include", // Mengirim cookie session (AumoFinance.Session)
        },
      );

      const res = await response.json();

      if (!response.ok || !res.success) {
        throw new Error(res.message || "Gagal mengunggah avatar");
      }

      const uploadedUrl = res.avatarUrl || res.url;
      if (uploadedUrl) {
        setAvatarPreview(uploadedUrl);

        // Langsung simpan URL avatar baru ke profil
        await updateProfile({
          updateProfileRequest: {
            fullName: fullName || user?.fullName,
            userName: userName || user?.userName,
            phoneNumber: phoneNumber || user?.phoneNumber,
            bio: bio || user?.bio,
            avatarUrl: uploadedUrl,
          },
        }).unwrap();
      }

      showNotification("Avatar berhasil diperbarui!");

      // Memicu pembaruan state global Redux untuk Sidebar & Topbar
      dispatch(baseApi.util.resetApiState());
    } catch (err: any) {
      showNotification(err.message || "Gagal mengunggah avatar", true);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return showNotification("Semua field password harus diisi", true);
    }
    try {
      await changePassword({
        changePasswordRequest: { currentPassword, newPassword },
      }).unwrap();
      showNotification("Password berhasil diubah!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      showNotification(
        err?.data?.message || err?.data?.title || "Gagal mengubah password",
        true,
      );
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
      showNotification(
        err?.data?.message || err?.data?.title || "Gagal menghapus akun",
        true,
      );
    }
  };

  return (
    <div className="space-y-4">
      {successMessage && (
        <Alert className="py-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
          <IconCircleCheck size={14} />
          <AlertDescription className="text-xs">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive" className="py-2">
          <IconAlertTriangle size={14} />
          <AlertDescription className="text-xs">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

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
              <IconLoader2 size={16} className="animate-spin" /> Memuat data
              profil...
            </div>
          ) : user ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  {/* tag img bawaan browser di dalam AvatarImage dipaksa refresh dengan timestamp query */}
                  <AvatarImage
                    src={
                      avatarPreview
                        ? `${avatarPreview}?t=${Date.now()}`
                        : undefined
                    }
                    alt="Avatar"
                    className="object-cover"
                  />
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
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <IconLoader2 size={13} className="animate-spin" />
                    ) : (
                      <IconUpload size={13} />
                    )}{" "}
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
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
          <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md">
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
  );
}
