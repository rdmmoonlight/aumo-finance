"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
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
  IconHome,
  IconLayoutDashboard,
  IconRobot,
  IconBook,
  IconFileSpreadsheet,
  IconCalendar,
  IconShieldHeart,
  IconFileText,
  IconTools,
  IconSettings,
  IconChevronRight,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import apiClient from "@/lib/apiClient";

export interface UserProfile {
  name?: string;
  email?: string;
  username?: string;
}

export async function getAuthUser(): Promise<UserProfile | null> {
  try {
    const res = await apiClient.get<UserProfile>("/api/v1/auth/me");
    return res.data;
  } catch (error) {
    return null;
  }
}

// Data Menu disesuaikan dengan struktur folder app/(authenticated)
const navigation = [
  { title: "Home", url: "/home", icon: IconHome },
  { title: "Dashboard", url: "/dashboard", icon: IconLayoutDashboard },
  { title: "AI Assistant", url: "/ai-assistant", icon: IconRobot },
  { title: "Chart of Accounts", url: "/chart-of-accounts", icon: IconBook },
  { title: "Journal Entry", url: "/journal-entry", icon: IconFileSpreadsheet },
  { title: "Periods", url: "/periods", icon: IconCalendar },
  { title: "Guardian", url: "/guardian", icon: IconShieldHeart },
  {
    title: "Reports",
    icon: IconFileText,
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
  { title: "Tools", url: "/tools", icon: IconTools },
  { title: "Settings", url: "/settings", icon: IconSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    async function loadUser() {
      const data = await getAuthUser();
      if (data) {
        setUser(data);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/v1/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/auth");
    }
  };

  return (
    <Sidebar collapsible="none" className="h-screen border-r flex flex-col">
      {/* Header Unscrollable */}
      <SidebarHeader className="p-4 border-b shrink-0">
        <h2 className="text-xl font-bold tracking-tight">Accounting App</h2>
      </SidebarHeader>

      {/* Content Menu Scrollable */}
      <SidebarContent className="p-2 flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + "/");

                // Menu dengan Sub-item (khusus Reports)
                if (item.items) {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="text-base py-2 font-medium">
                            <item.icon className="w-5 h-5 mr-2" />
                            <span>{item.title}</span>
                            <IconChevronRight className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                  className="text-sm py-1.5"
                                >
                                  <Link href={subItem.url}>
                                    {subItem.title}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                // Menu Tunggal
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="text-base py-2.5 font-medium"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-5 h-5 mr-2" />
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

      {/* Footer Unscrollable (Fixed di bawah dengan Border Atas) */}
      <SidebarFooter className="p-3 border-t shrink-0 bg-background">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
              <IconUser className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium leading-none truncate">
                {user?.name || user?.username || "User"}
              </span>
              {user?.email && (
                <span className="text-xs text-muted-foreground truncate mt-0.5">
                  {user.email}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0"
          >
            <IconLogout className="w-5 h-5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
