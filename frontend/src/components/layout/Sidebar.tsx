"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconListDetails,
  IconFilePencil,
  IconCalendarTime,
  IconRobot,
  IconShieldCheck,
  IconTools,
  IconSettings,
  IconBook,
  IconFileCheck,
  IconLock,
  IconNotebook,
  IconScale,
  IconReceipt2,
  IconPigMoney,
  IconBuildingBank,
  IconCash,
  IconTable,
  IconBuildingStore,
  IconScaleOff,
  IconLogout,
  IconLoader2,
  IconUser,
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import apiClient from "@/lib/apiClient";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

export interface UserProfile {
  userId?: string;
  email?: string;
  userName?: string;
  fullName?: string;
}

interface SidebarProps {
  user?: UserProfile | null;
}

const mainNavItems: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: IconLayoutDashboard },
  { label: "Periods", path: "/periods", icon: IconCalendarTime },
  {
    label: "Chart of Accounts",
    path: "/chart-of-accounts",
    icon: IconListDetails,
  },
  { label: "Journal Entry", path: "/journal-entry", icon: IconFilePencil },
  {
    label: "AI Assistant",
    path: "/aiassistant",
    icon: IconRobot,
    badge: "New",
  },
  { label: "Guardian", path: "/guardian", icon: IconShieldCheck },
  { label: "Tools", path: "/tools", icon: IconTools },
  { label: "Settings", path: "/settings", icon: IconSettings },
];

const reportNavItems: MenuItem[] = [
  {
    label: "General Journal",
    path: "/reports/general-journal",
    icon: IconBook,
  },
  {
    label: "Adjusting Journal",
    path: "/reports/adjusting-journal",
    icon: IconFileCheck,
  },
  {
    label: "Closing Journal",
    path: "/reports/closing-journal",
    icon: IconLock,
  },
  {
    label: "Permanent Ledger",
    path: "/reports/general-ledger-permanent",
    icon: IconNotebook,
  },
  {
    label: "Temporary Ledger",
    path: "/reports/general-ledger-temporary",
    icon: IconNotebook,
  },
  {
    label: "Unadjusted TB",
    path: "/reports/unadjusted-trial-balance",
    icon: IconScale,
  },
  {
    label: "Adjusted TB",
    path: "/reports/adjusted-trial-balance",
    icon: IconScaleOff,
  },
  {
    label: "Post-Closing TB",
    path: "/reports/post-closing-trial-balance",
    icon: IconReceipt2,
  },
  {
    label: "Income Statement",
    path: "/reports/income-statement",
    icon: IconPigMoney,
  },
  {
    label: "Retained Earnings",
    path: "/reports/retained-earnings",
    icon: IconBuildingBank,
  },
  {
    label: "Financial Position",
    path: "/reports/statement-of-financial-position",
    icon: IconBuildingStore,
  },
  {
    label: "Cash Flow",
    path: "/reports/statement-of-cash-flow",
    icon: IconCash,
  },
  { label: "Worksheet", path: "/reports/worksheet", icon: IconTable },
];

function NavItemLink({
  item,
  isCollapsed,
}: {
  item: MenuItem;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.path ||
    (item.path !== "/dashboard" && pathname.startsWith(`${item.path}/`));

  return (
    <Link
      href={item.path}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-lg border px-3 py-2 text-xs leading-none transition-all duration-200",
        isCollapsed && "justify-center px-2",
        isActive ? "border-white bg-white font-[550] text-zinc-900 shadow-[0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.04)]" : "border-transparent bg-transparent text-zinc-500 hover:border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-200",
      )}
    >
      {isActive && isCollapsed && (
        <span className="absolute left-0 top-1/2 -ml-1 h-5 w-1 -translate-y-1/2 rounded-full bg-white" />
      )}

      <item.icon
        size={18}
        stroke={isActive ? 2 : 1.8}
        className={cn(
          "shrink-0 transition-colors",
          isActive
            ? "text-zinc-900"
            : "text-zinc-500 group-hover:text-zinc-200",
        )}
      />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate tracking-[-0.01em]">{item.label}</span>
          {item.badge && (
            <span className="ml-auto flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
              <IconSparkles size={10} />
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export default function Sidebar({ user }: SidebarProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await apiClient.post("/api/v1/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("isAuthenticated");
      setLoggingOut(false);
      window.location.href = "/";
    }
  };

  return (
    <aside
      className={cn(
        "relative sticky top-0 z-20 flex h-screen shrink-0 select-none flex-col border-r border-white/[0.07] bg-[#0E0E0E] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.06] to-transparent" />

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-30 grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-[#1A1A1A] text-zinc-400 shadow-md backdrop-blur-md transition-all hover:bg-[#222] hover:text-white"
      >
        {isCollapsed ? (
          <IconChevronRight size={14} />
        ) : (
          <IconChevronLeft size={14} />
        )}
      </button>

      {/* HEADER (STATIS) */}
      <div className="relative flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-[0_1px_1px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <Image
            src="/favicon.ico"
            alt="Aumo Logo"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
        <div
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-200",
            isCollapsed && "w-0 opacity-0",
          )}
        >
          <span className="whitespace-nowrap text-xs font-semibold tracking-tight text-white">AUMO FINANCE</span>
          <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-500">Accounting Suite</span>
        </div>
      </div>

      {/* AREA SCROLL (HANYA NAVIGASI) */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3">
          <div className="mb-6 space-y-3">
            <h2
              className={cn(
                "px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition-opacity",
                isCollapsed && "h-0 opacity-0",
              )}
            >
              Main
            </h2>
            <div className="space-y-1">
              {mainNavItems.map((i) => (
                <NavItemLink key={i.path} item={i} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>

          <div className="mb-6 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          <div className="space-y-3">
            <h2
              className={cn(
                "px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition-opacity",
                isCollapsed && "h-0 opacity-0",
              )}
            >
              Reports
            </h2>
            <div className="space-y-1">
              {reportNavItems.map((i) => (
                <NavItemLink key={i.path} item={i} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>
        </div>
        <ScrollBar orientation="vertical" className="w-1" />
      </ScrollArea>

      {/* FOOTER (STATIS / PEMBATAS SCROLL) */}
      <div className="relative border-t border-white/[0.06] p-3">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-1 transition-all",
            isCollapsed && "border-transparent bg-transparent from-transparent to-transparent p-0",
          )}
        >
          <div
            className={cn(
              "rounded-lg bg-[#161616] p-2.5",
              isCollapsed && "flex justify-center bg-transparent p-0",
            )}
          >
            {isCollapsed ? (
              <div className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.08] text-white">
                <IconUser size={16} />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-zinc-900 shadow-inner">
                  {(
                    user?.fullName?.[0] ||
                    user?.userName?.[0] ||
                    "U"
                  ).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium leading-none text-white">
                    {user?.fullName || user?.userName || "Ghofur"}
                  </p>
                  <p className="mt-1 truncate text-[10px] leading-none text-zinc-500">
                    {user?.email || "ghofur@aumo.id"}
                  </p>
                </div>
                <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            "mt-2.5 h-9 w-full justify-start gap-2.5 rounded-lg text-xs font-[450] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200",
            isCollapsed && "justify-center px-0",
          )}
        >
          {loggingOut ? (
            <IconLoader2 size={18} className="animate-spin" />
          ) : (
            <IconLogout size={18} />
          )}
          {!isCollapsed && (
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          )}
        </Button>
      </div>
    </aside>
  );
}
