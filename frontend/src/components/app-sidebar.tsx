"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Home,
  Bot,
  BookOpen,
  FileSpreadsheet,
  Calendar,
  ShieldAlert,
  FileText,
  Wrench,
  Settings,
  ChevronRight,
  User,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { getUserProfile, logout } from "@/lib/auth";

const navigation = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "Chart of Accounts", url: "/chart-of-accounts", icon: BookOpen },
  { title: "Journal Entry", url: "/journal-entry", icon: FileSpreadsheet },
  { title: "Periods", url: "/periods", icon: Calendar },
  { title: "Guardian", url: "/guardian", icon: ShieldAlert },
  {
    title: "Reports",
    icon: FileText,
    url: "/reports",
    items: [
      { title: "General Journal", url: "/reports/general-journal" },
      { title: "Adjusting Journal", url: "/reports/adjusting-journal" },
      { title: "Closing Journal", url: "/reports/closing-journal" },
      {
        title: "Unadjusted Trial Balance",
        url: "/reports/unadjusted-trial-balance",
      },
      {
        title: "Adjusted Trial Balance",
        url: "/reports/adjusted-trial-balance",
      },
      {
        title: "Post-Closing Trial Balance",
        url: "/reports/post-closing-trial-balance",
      },
      {
        title: "General Ledger (Temp)",
        url: "/reports/general-ledger-temporary",
      },
      {
        title: "General Ledger (Perm)",
        url: "/reports/general-ledger-permanent",
      },
      { title: "Worksheet", url: "/reports/worksheet" },
      { title: "Income Statement", url: "/reports/income-statement" },
      { title: "Retained Earnings", url: "/reports/retained-earnings" },
      {
        title: "Financial Position",
        url: "/reports/statement-of-financial-position",
      },
      {
        title: "Statement of Cash Flow",
        url: "/reports/statement-of-cash-flow",
      },
    ],
  },
  { title: "Tools", url: "/tools", icon: Wrench },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Inisialisasi state user secara otomatis dari ReturnType getUserProfile
  const [user, setUser] = React.useState<Awaited<
    ReturnType<typeof getUserProfile>
  >>(null);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (err) {
        console.error("[SIDEBAR] Gagal memuat profil user:", err);
      }
    }
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const success = await logout();
    if (success) {
      window.location.href = "/auth";
    } else {
      router.push("/auth");
    }
  };

  return (
    <Sidebar
      collapsible="none"
      className="border-r h-screen sticky top-0 flex flex-col justify-between"
    >
      {/* Header Utama */}
      <SidebarHeader className="p-4 border-b shrink-0">
        <h2 className="text-xl font-bold tracking-tight">Aumo Finance</h2>
      </SidebarHeader>

      {/* Content Navigasi */}
      <SidebarContent className="p-2 flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;

                const isSubActive = item.items?.some(
                  (sub) =>
                    pathname === sub.url || pathname.startsWith(sub.url + "/"),
                );

                if (item.items) {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={
                        isSubActive || pathname.startsWith(item.url)
                      }
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isSubActive}
                            className="text-base py-2.5 font-medium w-full justify-between"
                          >
                            <div className="flex items-center">
                              <Icon className="w-5 h-5 mr-2 shrink-0" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const isChildActive = pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isChildActive}
                                    className="text-sm py-1.5"
                                  >
                                    <Link href={subItem.url}>
                                      {subItem.title}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                const isSingleActive =
                  pathname === item.url ||
                  (item.url !== "/home" &&
                    pathname.startsWith(item.url + "/"));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isSingleActive}
                      className="text-base py-2.5 font-medium"
                    >
                      <Link href={item.url}>
                        <Icon className="w-5 h-5 mr-2 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Sidebar */}
      <SidebarFooter className="p-2 border-t shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between py-6">
                  <div className="flex items-center gap-3 overflow-hidden text-left">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-sm leading-tight truncate">
                        {user?.fullName || user?.userName || "Guest"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user?.email || "Tidak ada email"}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
