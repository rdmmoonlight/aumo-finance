"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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

export function DashboardSidebarCollapse() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={toggleSidebar}
    >
      {isCollapsed? (
        <PanelLeft className="h-4 w-4" />
      ) : (
        <PanelLeftClose className="h-4 w-4" />
      )}
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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  const { data: me, isLoading: isUserLoading } = useGetApiV1AuthMeQuery(
    undefined,
    { skip:!isMounted },
  );
  const user = (me as any)?.data || (me as any);
  const [logoutApi] = usePostApiV1AuthLogoutMutation();

  const handleSignOut = async () => {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(baseApi.util.resetApiState());
      document.cookie =
        "AumoFinance.Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.replace("/auth");
    }
  };

  const ICON_CLASS = "h-4 w-4 shrink-0";
  const isReportsActive = REPORT_SECTIONS.some((s) =>
    s.items.some((i) => pathname === i.url || pathname.startsWith(i.url + "/")),
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r h-screen sticky top-0 flex flex-col justify-between"
      style={
        {
          "--sidebar-width": "310px",
          "--sidebar-width-icon": "4rem",
        } as React.CSSProperties
      }
    >
      <SidebarHeader
        className={`border-b shrink-0 flex items-center gap-2 ${
          isCollapsed
           ? "flex-col justify-center p-2.5 gap-3"
            : "flex-row justify-between p-3.5"
        }`}
      >
        {isCollapsed? (
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Image
              src="/favicon.ico"
              alt="Aumo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </div>
        ) : (
          <h2 className="text-xl font-bold tracking-tight truncate">
            Aumo Finance
          </h2>
        )}
        <DashboardSidebarCollapse />
      </SidebarHeader>

      <SidebarContent className="p-2.5 flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text- uppercase tracking-widest text-muted-foreground mb-2 px-2 group-data-[collapsible=icon]:hidden">
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
                            className="text-sm h-8 font-normal w-full justify-between px-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className={ICON_CLASS} />
                              <span className="truncate group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-60 shrink-0 group-data-[collapsible=icon]:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        {/* --- SUBMENU REPORTS TANPA JUDUL, PAKAI GARIS --- */}
                        <CollapsibleContent>
                          <div className="mt-2 flex flex-col pl-2 group-data-[collapsible=icon]:hidden">
                            {REPORT_SECTIONS.map((section, idx) => (
                              <React.Fragment key={section.title}>
                                {idx!== 0 && (
                                  <div className="my-2 ml-3 mr-3 h-px bg-border/40" />
                                )}
                                <div className="flex flex-col gap-1">
                                  {section.items.map((sub) => {
                                    const active = pathname === sub.url;
                                    return (
                                      <SidebarMenuItem key={sub.url}>
                                        <SidebarMenuButton
                                          asChild
                                          isActive={active}
                                          tooltip={sub.title}
                                          className="h-auto min-h-8 rounded-md px-3 py-2 text-[12.5px] font-normal leading-[1.35] tracking-tight text-muted-foreground hover:bg-accent/50 hover:text-foreground data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-foreground transition-colors"
                                        >
                                          <Link
                                            href={sub.url}
                                            className="flex items-start gap-2.5"
                                          >
                                            <span
                                              className={`mt- h-1 w-1 shrink-0 rounded-full transition-colors ${
                                                active
                                                 ? "bg-foreground"
                                                  : "bg-muted-foreground/50"
                                              }`}
                                            />
                                            <span className="flex-1 whitespace-normal break-words">
                                              {sub.title}
                                            </span>
                                          </Link>
                                        </SidebarMenuButton>
                                      </SidebarMenuItem>
                                    );
                                  })}
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                const isSingleActive =
                  pathname === item.url ||
                  (item.url!== "/home" &&
                    pathname.startsWith(item.url + "/"));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isSingleActive}
                      tooltip={item.title}
                      className="text-sm h-8 font-normal px-2"
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-2.5"
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

      <SidebarFooter
        className={`border-t shrink-0 ${
          isCollapsed? "p-2 flex justify-center" : "p-2.5"
        }`}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {isCollapsed? (
                  <SidebarMenuButton
                    tooltip={user?.fullName || user?.userName || "Account"}
                    className="mx-auto flex size-9 items-center justify-center rounded-full p-0 hover:bg-accent"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.avatarUrl || undefined}
                        alt={user?.fullName || "User"}
                      />
                      <AvatarFallback className="bg-muted text-xs">
                        {user?.fullName? (
                          user.fullName.slice(0, 2).toUpperCase()
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton className="h-auto w-full justify-between px-2 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5 text-left">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage
                          src={user?.avatarUrl || undefined}
                          alt={user?.fullName || "User"}
                        />
                        <AvatarFallback className="bg-muted text-xs">
                          {user?.fullName? (
                            user.fullName.slice(0, 2).toUpperCase()
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col truncate">
                        <span className="truncate text-sm font-medium leading-tight">
                          {!isMounted || isUserLoading
                           ? "Memuat..."
                            : user?.fullName || user?.userName || "Guest"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {!isMounted || isUserLoading
                           ? "..."
                            : user?.email || "Tidak ada email"}
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </SidebarMenuButton>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side={isCollapsed? "right" : "top"}
                sideOffset={8}
                className="w-56"
              >
                <DropdownMenuItem asChild className="text-sm">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-sm text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
