"use client";
import { useState, useEffect, useRef } from "react";
import { IconUser, IconUpload, IconLoader2, IconCircleCheck, IconAlertTriangle, IconTrash, IconKey } from "@tabler/icons-react";
import { useGetApiV1AuthMeQuery, usePutApiV1SettingsProfileMutation, usePostApiV1SettingsAvatarMutation, usePostApiV1SettingsChangePasswordMutation, useDeleteApiV1SettingsDeleteAccountMutation } from "@/lib/generatedApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; import { Input } from "@/components/ui/input"; import { Textarea } from "@/components/ui/textarea"; import { Button } from "@/components/ui/button"; import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; import { Alert, AlertDescription } from "@/components/ui/alert"; import { Separator } from "@/components/ui/separator";

export default function AccountSettings() {
  const { data: me, isLoading, refetch } = useGetApiV1AuthMeQuery();
  const user = (me as any)?.data || me as any;
  const [updateProfile, { isLoading: saving }] = usePutApiV1SettingsProfileMutation();
  const [uploadAvatar, { isLoading: uploading }] = usePostApiV1SettingsAvatarMutation();
  const [changePassword, { isLoading: changing }] = usePostApiV1SettingsChangePasswordMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteApiV1SettingsDeleteAccountMutation();

  const [fullName, setFullName] = useState(""); const [userName, setUserName] = useState(""); const [phoneNumber, setPhoneNumber] = useState(""); const [bio, setBio] = useState(""); const [avatarPreview, setAvatarPreview] = useState<string|null>(null);
  const [currentPassword, setCurrentPassword] = useState(""); const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState<string|null>(null); const [error, setError] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if(user){ setFullName(user.fullName||""); setUserName(user.userName||""); setPhoneNumber(user.phoneNumber||""); setBio(user.bio||""); setAvatarPreview(user.avatarUrl||null); } }, [user]);
  const notify = (m:string,e=false)=>{ if(e){ setError(m); setSuccess(null);} else { setSuccess(m); setError(null); setTimeout(()=>setSuccess(null),3000);} };

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ updateProfileRequest: { fullName, userName, phoneNumber, bio } } as any).unwrap();
      notify("Profile updated!"); refetch();
    } catch(err:any){ notify(err?.data?.message || "Gagal update", true); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    if(file.size > 2*1024*1024) return notify("Max 2MB", true);
    const blobUrl = URL.createObjectURL(file); setAvatarPreview(blobUrl);

    // PENTING: pakai FormData, biar fetchBaseQuery di apiClient auto set multipart/form-data
    // key "file" sesuai [FromForm] IFormFile? file di SettingsController lu
    const fd = new FormData();
    fd.append("file", file);

    try {
      // Ini udah otomatis pakai BASE_URL dari apiClient.ts -> aumoConfig.backendTarget
      // dan credentials: "include" jadi cookie Identity.Application kebawa
      const res: any = await uploadAvatar(fd as any).unwrap();
      const newUrl = res?.avatarUrl || res?.data?.avatarUrl || res?.url;
      if(newUrl) setAvatarPreview(newUrl);
      notify("Avatar uploaded ke Supabase!"); refetch();
    } catch(err:any){
      console.error("Upload error detail:", err?.data);
      notify(err?.data?.message || err?.data?.errors?.file?.[0] || "Gagal upload", true);
      setAvatarPreview(user?.avatarUrl || null);
    } finally { e.target.value = ""; }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await changePassword({ changePasswordRequest: { currentPassword, newPassword } } as any).unwrap(); notify("Password updated!"); setCurrentPassword(""); setNewPassword(""); }
    catch(err:any){ notify(err?.data?.message, true); }
  };

  const handleDelete = async () => {
    if(!confirm("Hapus permanen?")) return;
    try { await deleteAccount().unwrap(); window.location.href="/login"; } catch(err:any){ notify(err?.data?.message, true); }
  };

  if(isLoading) return <div className="text-xs py-10 flex gap-2"><IconLoader2 className="animate-spin" size={16}/> Loading...</div>;

  return <div className="space-y-4">
    {success && <Alert className="py-2 bg-emerald-500/10 text-emerald-600"><IconCircleCheck size={14}/><AlertDescription className="text-xs">{success}</AlertDescription></Alert>}
    {error && <Alert variant="destructive" className="py-2"><IconAlertTriangle size={14}/><AlertDescription className="text-xs">{error}</AlertDescription></Alert>}
    <Card><CardHeader className="py-3 px-4"><CardTitle className="text-sm">Edit Profile</CardTitle><CardDescription className="text-xs">Data dari /api/v1/auth/me</CardDescription></CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="flex items-center gap-4"><Avatar className="h-16 w-16 border"><AvatarImage src={avatarPreview||undefined}/><AvatarFallback>{(fullName||"U").slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
          <div><input type="file" ref={fileRef} onChange={handleAvatar} accept=".jpg,.jpeg,.png,.webp,.gif" className="hidden"/><Button type="button" variant="outline" size="sm" className="h-8 text-xs" disabled={uploading} onClick={()=>fileRef.current?.click()}>{uploading? <IconLoader2 size={13} className="animate-spin mr-1"/> : <IconUpload size={13} className="mr-1"/>} Change Avatar</Button></div>
        </div><Separator/>
        <form onSubmit={handleProfile} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-xs">Full Name</Label><Input value={fullName} onChange={e=>setFullName(e.target.value)} className="h-8 text-xs"/></div>
          <div className="space-y-1"><Label className="text-xs">Username</Label><Input value={userName} onChange={e=>setUserName(e.target.value)} className="h-8 text-xs"/></div>
          <div className="space-y-1"><Label className="text-xs">Email</Label><Input value={user?.email||""} disabled className="h-8 text-xs bg-muted/50"/></div>
          <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} className="h-8 text-xs"/></div>
          <div className="space-y-1 md:col-span-2"><Label className="text-xs">Bio</Label><Textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} className="text-xs"/></div>
          <div className="md:col-span-2 flex justify-end"><Button size="sm" className="h-8 text-xs" disabled={saving}>Save</Button></div>
        </form>
      </CardContent></Card>
    <Card><CardHeader className="py-3 px-4"><CardTitle className="text-sm flex gap-2"><IconKey size={15}/> Change Password</CardTitle></CardHeader><CardContent className="px-4 pb-4"><form onSubmit={handlePassword} className="space-y-3 max-w-md"><Input type="password" placeholder="Current" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="h-8 text-xs"/><Input type="password" placeholder="New" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="h-8 text-xs"/><Button size="sm" variant="outline" className="h-8 text-xs" disabled={changing}>Update</Button></form></CardContent></Card>
    <Card className="border-destructive/30 bg-destructive/5"><CardHeader className="py-3 px-4"><CardTitle className="text-sm text-destructive flex gap-2"><IconTrash size={15}/> Delete Account</CardTitle></CardHeader><CardContent className="px-4 pb-4 flex justify-end"><Button variant="destructive" size="sm" className="h-8 text-xs" onClick={handleDelete} disabled={deleting}>Delete</Button></CardContent></Card>
  </div>;
}
