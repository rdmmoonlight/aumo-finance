"use client";

import { useState, useEffect } from "react";
import { IconUser, IconPalette, IconShieldCheck } from "@tabler/icons-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import AccountSettings from "./account";
import AppearanceSettings from "./appearance";
import SecuritySettings from "./security";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [mainTab, setMainTab] = useState("account");

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-72px)]">
      <div className="shrink-0 space-y-3 bg-background sticky top-0 z-10 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground">Account, appearance, and security in one place.</p>
        </div>
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="w-full sm:w-auto h-8 p-1">
            <TabsTrigger value="account" className="text-xs gap-1.5 h-6"><IconUser size={13} /> Account</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs gap-1.5 h-6"><IconPalette size={13} /> Appearance</TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5 h-6"><IconShieldCheck size={13} /> Security</TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1 mt-1 space-y-4">
        {mainTab === "account" && <AccountSettings />}
        {mainTab === "appearance" && <AppearanceSettings />}
        {mainTab === "security" && <SecuritySettings />}
      </div>
    </div>
  );
}
