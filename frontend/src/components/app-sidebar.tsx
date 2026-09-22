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

// Rujukan dari ReportsMenuActivity.kt
const REPORT_SECTIONS = [
  {
    title: "General Ledger",
    items: [
      { title: "General Ledger — Permanent", url: "/reports/general-ledger-permanent" },
      { title: "General Ledger — Temporary", url: "/reports/general-ledger-temporary" },
    ],
  },
  {
    title: "Trial Balance & Adjustments",
    items: [
      { title: "General Journal", url: "/reports/general-journal" },
      { title: "Trial Balance", url: "/reports/unadjusted-trial-balance" },
      { title: "Adjusting Journal", url: "/reports/adjusting-journal" },
      { title: "Adjusted Trial Balance", url: "/reports/adjusted-trial-balance" },
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
      { title: "Retained Earnings Statement", url: "/reports/retained-earnings" },
      { title: "Statement of Financial Position", url: "/reports/statement-of-financial-position" },
      { title: "Statement of Cash Flows", url: "/reports/statement-of-cash-flow" },
    ],
  },
  {
    title: "Closing",
    items: [
      { title: "Closing Journal", url: "/reports/closing-journal" },
      { title: "Post-Closing Trial Balance", url: "/reports/post-closing-trial-balance" },
    ],
  },
] as const;

const navigation = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Periods", url: "/periods", icon: Calendar },
  { title: "Chart of Accounts", url: "/chart-of-accounts", icon: BookOpen },
  { title: "Reports", icon: FileText, url: "/reports", isGrouped: true },
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
  React.useEffect(() => { setIsMounted(true); }, []);

  const { data: user, isLoading: isUserLoading } = useGetApiV1AuthMeQuery(undefined, { skip:!isMounted });
  const [logoutApi] = usePostApiV1AuthLogoutMutation();

  const handleSignOut = async () => {
    try { await logoutApi().unwrap(); } catch (err) { console.error(err); }
    finally {
      dispatch(baseApi.util.resetApiState());
      if (typeof window!== "undefined") {
        document.cookie = "AumoFinance.Session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("/auth");
      }
    }
  };

  const userData = user as { fullName?: string; userName?: string; email?: string } | undefined;
  const ICON_CLASS = "w- h- mr-2.5 shrink-0 stroke-[1.75]";

  const isReportsActive = REPORT_SECTIONS.some(s => s.items.some(i => pathname === i.url || pathname.startsWith(i.url + "/")));

  return (
    <Sidebar
      collapsible="none"
      className="border-r h-screen sticky top-0 flex flex-col justify-between"
      style={{ "--sidebar-width": "285px" } as React.CSSProperties}
    >
      <SidebarHeader className="p-3.5 border-b shrink-0">
        <h2 className="text- font-bold tracking-tight">Aumo Finance</h2>
      </SidebarHeader>

      <SidebarContent className="p-2.5 flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11.5px] uppercase tracking-widest text-muted-foreground mb-2 px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                // @ts-ignore - grouped reports
                if (item.isGrouped) {
                  return (
                    <Collapsible key={item.title} defaultOpen={isReportsActive || pathname.startsWith(item.url)} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={isReportsActive} className="text- h- font-normal w-full justify-between px-2">
                            <div className="flex items-center">
                              <Icon className={ICON_CLASS} />
                              <span>{item.title}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-60" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-1 flex flex-col gap-3 px-1">
                            {REPORT_SECTIONS.map((section) => (
                              <div key={section.title}>
                                {/* TEKS UNCLICKABLE */}
                                <div className="px-2 py-1 select-none cursor-default">
                                  <p className="text- font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">
                                    {section.title}
                                  </p>
                                </div>
                                <div className="mt-1 flex flex-col gap-0.5">
                                  {section.items.map((sub) => {
                                    const isActive = pathname === sub.url;
                                    return (
                                      <SidebarMenuSubItem key={sub.url}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={isActive}
                                          className="text- leading-[1.5] h-auto min-h- py-1 px-2 ml-2 pl-6 font-normal justify-start whitespace-normal text-left"
                                        >
                                          <Link href={sub.url}>{sub.title}</Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
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

                const isSingleActive = pathname === item.url || (item.url!== "/home" && pathname.startsWith(item.url + "/"));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isSingleActive} className="text- h- font-normal px-2">
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

      <SidebarFooter className="p-2.5 border-t shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between h-auto py-3">
                  <div className="flex items-center gap-2.5 overflow-hidden text-left">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="font-medium text-[13.5px] leading-tight truncate">
                        {!isMounted || isUserLoading? "Memuat..." : userData?.fullName || userData?.userName || "Guest"}
                      </span>
                      <span className="text- text-muted-foreground truncate">
                        {!isMounted || isUserLoading? "..." : userData?.email || "Tidak ada email"}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="text-">
                  <Link href="/settings"><Settings className="w-4 h-4 mr-2" />Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive text-">
                  <LogOut className="w-4 h-4 mr-2" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
