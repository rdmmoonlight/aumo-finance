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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import {
  useGetApiV1AuthMeQuery,
  usePostApiV1AuthLogoutMutation,
} from "@/lib/generatedApi";
import { cn } from "@/lib/utils";

type ReportItem = {
  title: string;
  url: string;
};

type ReportSection = {
  title: string;
  items: readonly ReportItem[];
};

const REPORT_SECTIONS: readonly ReportSection[] = [
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

type NavItem =
  | {
      title: string;
      url: string;
      icon: React.ComponentType<{ className?: string }>;
      isGrouped?: false;
    }
  | {
      title: string;
      url: string;
      icon: React.ComponentType<{ className?: string }>;
      isGrouped: true;
    };

const navigation: NavItem[] = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Periods", url: "/periods", icon: Calendar },
  { title: "Chart of Accounts", url: "/chart-of-accounts", icon: BookOpen },
  { title: "Reports", url: "/reports", icon: FileBarChart, isGrouped: true },
  { title: "Journal Entry", url: "/journal-entry", icon: FileSpreadsheet },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "Tools", url: "/tools", icon: Wrench },
  { title: "Settings", url: "/settings", icon: Settings },
];

function getUserInitials(name?: string | null) {
  if (!name?.trim()) return "GU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

  const userData = user as
    | {
        fullName?: string;
        userName?: string;
        email?: string;
        avatarUrl?: string;
      }
    | undefined;

  const isReportsActive = REPORT_SECTIONS.some((section) =>
    section.items.some(
      (item) => pathname === item.url || pathname.startsWith(`${item.url}/`),
    ),
  );

  const displayName = userData?.fullName || userData?.userName || "Guest";
  const displayEmail = userData?.email || "Tidak ada email";

  return (
    <Sidebar
      collapsible="none"
      className="border-r h-screen sticky top-0 flex flex-col"
      style={{ "--sidebar-width": "280px" } as React.CSSProperties}
    >
      {/* Header */}
      <SidebarHeader className="px-4 py-3.5 border-b shrink-0">
        <h2 className="text-base font-semibold tracking-tight">Aumo Finance</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide uppercase">
          Accounting Suite
        </p>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2.5 py-3 flex-1 overflow-y-auto">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;

                if (item.isGrouped) {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={isReportsActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isReportsActive}
                            className="h-8 text-[13px] font-normal px-2"
                          >
                            <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                              <Icon className="size-4 mr-2.5 shrink-0 opacity-80" />
                              <span className="truncate">{item.title}</span>
                            </div>
                            <ChevronRight className="size-3.5 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="mt-1 ml-2 pl-3 border-l border-border/60 space-y-3">
                            {REPORT_SECTIONS.map((section) => (
                              <div key={section.title}>
                                <p className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none">
                                  {section.title}
                                </p>
                                <div className="mt-0.5 space-y-0.5">
                                  {section.items.map((sub) => {
                                    const isActive = pathname === sub.url;
                                    return (
                                      <SidebarMenuItem key={sub.url}>
                                        <SidebarMenuButton
                                          asChild
                                          isActive={isActive}
                                          className="h-7 text-[12.5px] font-normal px-2"
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

                const isActive =
                  pathname === item.url ||
                  (item.url !== "/home" && pathname.startsWith(`${item.url}/`));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-8 text-[13px] font-normal px-2"
                    >
                      <Link
                        href={item.url}
                        title={item.title}
                        className="flex items-center min-w-0 w-full overflow-hidden"
                      >
                        <Icon className="size-4 mr-2.5 shrink-0 opacity-80" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="p-2.5 border-t shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className={cn(
                    "w-full h-auto py-2 px-2 justify-between",
                    "data-[state=open]:bg-sidebar-accent",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                    <Avatar className="size-8 rounded-full border shrink-0">
                      <AvatarImage
                        key={userData?.avatarUrl}
                        src={userData?.avatarUrl || undefined}
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                        {getUserInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0 truncate text-left">
                      <span className="text-[13px] font-medium leading-tight truncate">
                        {!isMounted || isUserLoading
                          ? "Memuat..."
                          : displayName}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {!isMounted || isUserLoading ? "..." : displayEmail}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" side="top" className="w-56">
                <DropdownMenuItem asChild className="text-[13px]">
                  <Link href="/settings">
                    <Settings className="size-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive text-[13px] focus:text-destructive"
                >
                  <LogOut className="size-4 mr-2" />
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
