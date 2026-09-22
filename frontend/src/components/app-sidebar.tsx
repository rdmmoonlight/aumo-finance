"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { baseApi } from "@/lib/apiClient";
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
import {
  useGetApiV1AuthMeQuery,
  usePostApiV1AuthLogoutMutation,
} from "@/lib/generatedApi";

const navigation = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Periods", url: "/periods", icon: Calendar },
  { title: "Chart of Accounts", url: "/chart-of-accounts", icon: BookOpen },
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
  { title: "Journal Entry", url: "/journal-entry", icon: FileSpreadsheet },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "Guardian", url: "/guardian", icon: ShieldAlert },
  { title: "Tools", url: "/tools", icon: Wrench },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: user, isLoading: isUserLoading } = useGetApiV1AuthMeQuery(
    undefined,
    { skip: !isMounted },
  );
  const [logoutApi] = usePostApiV1AuthLogoutMutation();

  const handleSignOut = async () => {
    try {
      await logoutApi().unwrap();
    } catch (err) {
      console.error("[SIDEBAR] Logout gagal:", err);
    } finally {
      dispatch(baseApi.util.resetApiState());
      if (typeof window !== "undefined") {
        document.cookie =
          "AumoFinance.Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("/auth");
      }
    }
  };

  const userData = user as
    { fullName?: string; userName?: string; email?: string } | undefined;
  const ICON_CLASS = "w-4 h-4 mr-2.5 shrink-0"; // SAMAIN SEMUA DISINI

  return (
    <Sidebar
      collapsible="none"
      className="border-r h-screen sticky top-0 flex flex-col justify-between"
      style={{ "--sidebar-width": "280px" } as React.CSSProperties}
    >
      <SidebarHeader className="p-3.5 border-b shrink-0">
        <h2 className="text- font-bold tracking-tight">Aumo Finance</h2>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text- uppercase tracking-widest text-muted-foreground mb-2 px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
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
                      defaultOpen={isSubActive || pathname.startsWith(item.url)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isSubActive}
                            className="text-[12.5px] h-8 py-0 font-normal w-full justify-between"
                          >
                            <div className="flex items-center">
                              <Icon className={ICON_CLASS} />
                              <span>{item.title}</span>
                            </div>
                            <ChevronRight className="w-3 h-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-60" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {/* INI YANG BIKIN RAPET */}
                          <SidebarMenuSub className="ml-3.5 mt-1 border-l pl-3.5 gap-0.5 py-1">
                            {item.items.map((subItem) => {
                              const isChildActive = pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isChildActive}
                                    className="text-[11.5px] leading-[1.4] h-auto py- px-2 font-normal"
                                  >
                                    <Link
                                      href={subItem.url}
                                      className="whitespace-normal"
                                    >
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
                  (item.url !== "/home" && pathname.startsWith(item.url + "/"));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isSingleActive}
                      className="text-[12.5px] h-8 py-0 font-normal"
                    >
                      <Link href={item.url}>
                        <Icon className={ICON_CLASS} />
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

      <SidebarFooter className="p-2 border-t shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between h-auto py-2.5">
                  <div className="flex items-center gap-2.5 overflow-hidden text-left">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-medium text- leading-tight truncate">
                        {!isMounted || isUserLoading
                          ? "Memuat..."
                          : userData?.fullName || userData?.userName || "Guest"}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground truncate">
                        {!isMounted || isUserLoading
                          ? "..."
                          : userData?.email || "Tidak ada email"}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="text-">
                  <Link href="/settings">
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive text-"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
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
