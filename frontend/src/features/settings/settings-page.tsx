"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  LucideIcon,
  Palette,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AccountSettings from "./components/account";
import { AppearanceSection } from "./components/appearance";
import { SecuritySection } from "./components/security";

interface SettingModuleItem {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  status: string;
}

function SettingsOverviewTable({
  data,
  activeTab,
  onSelectTab,
}: {
  data: SettingModuleItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="text-caption h-8 border-border hover:bg-transparent">
          <TableHead className="h-8 text-caption text-muted-foreground">
            Modul Pengaturan
          </TableHead>
          <TableHead className="h-8 text-caption text-muted-foreground">
            Cakupan Modul
          </TableHead>
          <TableHead className="h-8 text-caption text-muted-foreground">
            Status
          </TableHead>
          <TableHead className="h-8 text-caption text-muted-foreground">
            <div className="text-right text-foreground">Aksi</div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <TableRow key={item.id} className="border-border hover:bg-muted/50">
              <TableCell className="py-2 text-foreground">
                <div className="flex items-center gap-2">
                  <Icon size={15} className="text-foreground" />
                  <span className="font-semibold text-caption text-foreground">
                    {item.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-2 text-foreground">
                <span className="text-caption text-muted-foreground">
                  {item.description}
                </span>
              </TableCell>
              <TableCell className="py-2 text-foreground">
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className="text-label-small py-0 px-1.5 border-border text-foreground data-[variant=default]:bg-white data-[variant=default]:text-black"
                >
                  {isActive ? "Aktif Diampu" : item.status}
                </Badge>
              </TableCell>
              <TableCell className="py-2 text-foreground">
                <div className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-caption gap-1 px-2 text-foreground hover:bg-white hover:text-black"
                    onClick={() => onSelectTab(item.id)}
                  >
                    Buka <ArrowRight size={12} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [mainTab, setMainTab] = useState("account");
  useEffect(() => setMounted(true), []);

  const settingsModules = useMemo<SettingModuleItem[]>(
    () => [
      {
        id: "account",
        name: "Account",
        icon: User,
        description: "Profil pengguna, email, kredensial, dan foto avatar",
        status: "Tersedia",
      },
      {
        id: "appearance",
        name: "Appearance",
        icon: Palette,
        description: "Tema visual antarmuka (Light, Dark, System)",
        status: "Tersedia",
      },
      {
        id: "security",
        name: "Security",
        icon: ShieldCheck,
        description: "Guardian health, manajemen sesi aktif, dan riwayat login",
        status: "Tersedia",
      },
    ],
    [],
  );

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-72px)] space-y-4 text-foreground selection:bg-white selection:text-black">
      <Card className="shrink-0 bg-card text-card-foreground border-border">
        <CardContent className="p-0">
          <SettingsOverviewTable
            data={settingsModules}
            activeTab={mainTab}
            onSelectTab={setMainTab}
          />
        </CardContent>
      </Card>
      <Tabs
        value={mainTab}
        onValueChange={setMainTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="shrink-0 space-y-3 relative z-20 pb-3">
          <h1 className="text-h3 font-bold text-foreground">Settings</h1>
          <TabsList className="h-8 p-1 w-fit bg-zinc-100 dark:bg-muted text-muted-foreground border border-border">
            <TabsTrigger
              value="account"
              className="text-caption gap-1.5 h-6 px-3 rounded-sm data-[state=active]:bg-white data-[state=active]:!text-black data-[state=active]:shadow-sm data-[state=active]:font-semibold"
            >
              <User size={13} /> Account
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="text-caption gap-1.5 h-6 px-3 rounded-sm data-[state=active]:bg-white data-[state=active]:!text-black data-[state=active]:shadow-sm data-[state=active]:font-semibold"
            >
              <Palette size={13} /> Appearance
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-caption gap-1.5 h-6 px-3 rounded-sm data-[state=active]:bg-white data-[state=active]:!text-black data-[state=active]:shadow-sm data-[state=active]:font-semibold"
            >
              <ShieldCheck size={13} /> Security
            </TabsTrigger>
          </TabsList>
          <Separator className="bg-border" />
        </div>
        <div className="flex-1 overflow-y-auto mt-1 relative z-10">
          <TabsContent
            value="account"
            className="m-0 focus-visible:outline-none"
          >
            <AccountSettings />
          </TabsContent>
          <TabsContent
            value="appearance"
            className="m-0 focus-visible:outline-none"
          >
            <AppearanceSection />
          </TabsContent>
          <TabsContent
            value="security"
            className="m-0 focus-visible:outline-none"
          >
            <SecuritySection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
