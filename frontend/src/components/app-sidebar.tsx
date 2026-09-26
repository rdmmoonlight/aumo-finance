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
  SidebarRail,
  useSidebar,
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Home,
  Bot,
  BookOpen,
  FileBarChart,
  Calendar,
  FileSpreadsheet,
  Wrench,
  Settings,
  ChevronRight,
  User,
  LogOut,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import {
  useGetApiV1AuthMeQuery,
  usePostApiV1AuthLogoutMutation,
} from "@/lib/generatedApi";

// ===== Ini pengganti UDashboardSidebarCollapse versi shadcn =====
export function DashboardSidebarCollapse() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={toggleSidebar}
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? (
        <PanelLeft className="h-4 w-4" />
      ) : (
        <PanelLeftClose className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

const REPORT_SECTIONS = [
  {
    title: "General Ledger",
    items: [
      {
        title: "General Ledger — Permanent",
        url: "/reports/general-ledger-permanent",
      },
      {
        title: "General Ledger — Temporary",
        url: "/reports/general-ledger-temporary",
      },
    ],
  },
  {
    title: "Trial Balance & Adjustments",
    items: [
      { title: "General Journal", url: "/reports/general-journal" },
      { title: "Trial Balance", url: "/reports/unadjusted-trial-balance" },
      { title: "Adjusting Journal", url: "/reports/adjusting-journal" },
      {
        title: "Adjusted Trial Balance",
        url: "/reports/adjusted-trial-balance",
      },
    ],
  },
  {
    title: "Worksheet",
    items: [{ title: "Worksheet", url: "/reports/worksheet" }],
  },
  {
    title: "Financial Statements",
    items: [
      { title: "Income Statement", url: "/reports/income-statement" },
      {
        title: "Retained Earnings Statement",
        url: "/reports/retained-earnings",
      },
      {
        title: "Statement of Financial Position",
        url: "/reports/statement-of-financial-position",
      },
      {
        title: "Statement of Cash Flows",
        url: "/reports/statement-of-cash-flow",
      },
    ],
  },
  {
    title: "Closing",
    items: [
      { title: "Closing Journal", url: "/reports/closing-journal" },
      {
        title: "Post-Closing Trial Balance",
        url: "/reports/post-closing-trial-balance",
      },
    ],
  },
] as const;

const navigation = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Periods", url: "/periods", icon: Calendar },
  { title: "Chart of Accounts", url: "/chart-of-accounts", icon: BookOpen },
  { title: "Reports", icon: FileBarChart, url: "/reports", isGrouped: true },
  { title: "Journal Entry", url: "/journal-entry", icon: FileSpreadsheet },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "Tools", url: "/tools", icon: Wrench },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  const { data: me, isLoading: isUserLoading } = useGetApiV1AuthMeQuery(
    undefined,
    {
      skip: !isMounted,
    },
  );

  // Penyesuaian ekstraksi data sesuai rujukan
  const user = (me as any)?.data || (me as any);

  const [logoutApi] = usePostApiV1AuthLogoutMutation();

  const handleSignOut = async () => {
    try {
      await logoutApi().unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(baseApi.util.resetApiState());
      if (typeof window !== "undefined") {
        document.cookie =
          "AumoFinance.Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("/auth");
      }
    }
  };

  const ICON_CLASS = "w-4 h-4 mr-2.5 shrink-0";

  const isReportsActive = REPORT_SECTIONS.some((s) =>
    s.items.some((i) => pathname === i.url || pathname.startsWith(i.url + "/")),
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r h-screen sticky top-0 flex flex-col justify-between"
      style={
        {
          "--sidebar-width": "285px",
          "--sidebar-width-icon": "3.5rem",
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="p-3.5 border-b shrink-0 flex flex-row items-center justify-between gap-2">
        <h2 className="text-lg font-bold tracking-tight truncate group-data-[collapsible=icon]:hidden">
          Aumo Finance
        </h2>
        <DashboardSidebarCollapse />
      </SidebarHeader>

      <SidebarContent className="p-2.5 flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-widest text-muted-foreground mb-2 px-2 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                // @ts-ignore
                if (item.isGrouped) {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={
                        isReportsActive || pathname.startsWith(item.url)
                      }
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isReportsActive}
                            className="text-[13.5px] h-8 font-normal w-full justify-between px-2 overflow-hidden"
                          >
                            <div className="flex items-center min-w-0 overflow-hidden">
                              <Icon className={ICON_CLASS} />
                              <span className="truncate group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-60 shrink-0 group-data-[collapsible=icon]:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-1 flex flex-col gap-3 group-data-[collapsible=icon]:hidden">
                            {REPORT_SECTIONS.map((section) => (
                              <div key={section.title}>
                                <div className="px-2 py-1 select-none">
                                  <p className="text- font-semibold uppercase tracking-widest text-muted-foreground/60 leading-none truncate">
                                    {section.title}
                                  </p>
                                </div>
                                <div className="mt-1 flex flex-col gap-1">
                                  {section.items.map((sub) => {
                                    const isActive = pathname === sub.url;
                                    return (
                                      <SidebarMenuItem
                                        key={sub.url}
                                        className="overflow-hidden"
                                      >
                                        <SidebarMenuButton
                                          asChild
                                          isActive={isActive}
                                          tooltip={sub.title}
                                          className="text-[13.5px] h-8 font-normal px-2 overflow-hidden w-full"
                                        >
                                          <Link
                                            href={sub.url}
                                            title={sub.title}
                                            className="truncate block w-full"
                                          >
                                            {sub.title}
                                          </Link>
                                        </SidebarMenuButton>
                                      </SidebarMenuItem>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                const isSingleActive =
                  pathname === item.url ||
                  (item.url !== "/home" && pathname.startsWith(item.url + "/"));
                return (
                  <SidebarMenuItem key={item.title} className="overflow-hidden">
                    <SidebarMenuButton
                      asChild
                      isActive={isSingleActive}
                      tooltip={item.title}
                      className="text-[13.5px] h-8 font-normal px-2 overflow-hidden"
                    >
                      <Link
                        href={item.url}
                        title={item.title}
                        className="flex items-center min-w-0 overflow-hidden w-full"
                      >
                        <Icon className={ICON_CLASS} />
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2.5 border-t shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between h-auto py-3 overflow-hidden">
                  <div className="flex items-center gap-2.5 overflow-hidden text-left min-w-0">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage
                        src={user?.avatarUrl || undefined}
                        alt={user?.fullName || user?.userName || "User"}
                      />
                      <AvatarFallback className="bg-muted text-xs">
                        {user?.fullName ? (
                          user.fullName.slice(0, 2).toUpperCase()
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col truncate min-w-0 group-data-[collapsible=icon]:hidden">
                      <span className="font-medium text-[13.5px] leading-tight truncate">
                        {!isMounted || isUserLoading
                          ? "Memuat..."
                          : user?.fullName || user?.userName || "Guest"}
                      </span>
                      <span className="text-[11.5px] text-muted-foreground truncate">
                        {!isMounted || isUserLoading
                          ? "..."
                          : user?.email || "Tidak ada email"}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="text-[13.5px]">
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive text-[13.5px]"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Ini biar bisa drag di pinggir kayak Nuxt UI */}
      <SidebarRail />
    </Sidebar>
  );
}
