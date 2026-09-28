"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AccountSettings from "./account";
import AppearanceAndSecuritySettings from "./appearance-and-security";
import { User, Palette, ShieldCheck, LucideIcon, ArrowRight } from "lucide-react";

interface SettingModuleItem {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  status: string;
}

const columnHelper = createColumnHelper<SettingModuleItem>();

function SettingsOverviewTable({
  data,
  activeTab,
  onSelectTab,
}: {
  data: SettingModuleItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Modul Pengaturan",
        cell: ({ row }) => {
          const IconComponent = row.original.icon;
          return (
            <div className="flex items-center gap-2">
              <IconComponent size={15} className="text-primary" />
              <span className="font-semibold text-caption">{row.original.name}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("description", {
        header: "Cakupan Modul",
        cell: (info) => (
          <span className="text-caption text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.id === activeTab;
          return (
            <Badge
              variant={isActive ? "default" : "outline"}
              className="text-label-small py-0 px-1.5"
            >
              {isActive ? "Aktif Diampu" : row.original.status}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "action",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-caption gap-1 px-2"
              onClick={() => onSelectTab(row.original.id)}
            >
              Buka <ArrowRight size={12} />
            </Button>
          </div>
        ),
      }),
    ],
    [activeTab, onSelectTab],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="text-caption h-8">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="h-8 text-caption">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="py-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
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
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-72px)] space-y-4">
      {/* MODULE OVERVIEW TABLE */}
      <Card className="shrink-0">
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
        <div className="shrink-0 space-y-3 bg-background relative z-20 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="text-h3 font-bold">Settings</h1>
          </div>

          <TabsList className="h-8 p-1 w-fit bg-muted text-muted-foreground">
            <TabsTrigger
              value="account"
              className="text-caption gap-1.5 h-6 px-3 rounded-sm transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <User size={13} /> Account
            </TabsTrigger>

            <TabsTrigger
              value="appearance"
              className="text-caption gap-1.5 h-6 px-3 rounded-sm transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Palette size={13} /> Appearance
            </TabsTrigger>

            <TabsTrigger
              value="security"
              className="text-caption gap-1.5 h-6 px-3 rounded-sm transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <ShieldCheck size={13} /> Security
            </TabsTrigger>
          </TabsList>

          <Separator />
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
            <AppearanceAndSecuritySettings mode="appearance" />
          </TabsContent>
          <TabsContent
            value="security"
            className="m-0 focus-visible:outline-none"
          >
            <AppearanceAndSecuritySettings mode="security" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
