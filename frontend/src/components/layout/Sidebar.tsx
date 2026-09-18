"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/apiClient";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
}
interface UserProfile {
  userId?: string;
  email?: string;
  userName?: string;
  fullName?: string;
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
  { label: "AI Assistant", path: "/aiassistant", icon: IconRobot },
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
    label: "Unadjusted Trial Balance",
    path: "/reports/unadjusted-trial-balance",
    icon: IconScale,
  },
  {
    label: "Adjusted Trial Balance",
    path: "/reports/adjusted-trial-balance",
    icon: IconScaleOff,
  },
  {
    label: "Post-Closing Trial Balance",
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

function NavItemLink({ item }: { item: MenuItem }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.path || pathname.startsWith(`${item.path}/`);

  return (
    <Link
      href={item.path}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs leading-none transition-colors block",
        isActive
          ? "bg-[var(--color-matte-hover)] text-white font-medium"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05]",
      )}
    >
      <item.icon
        size={17}
        stroke={1.7}
        className={cn(
          "shrink-0",
          isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100",
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let m = true;
    apiClient
      .get("/api/v1/auth/me")
      .then((r) => {
        if (m && r.data) setUser(r.data);
      })
      .catch(() => {})
      .finally(() => {
        if (m) setLoading(false);
      });
    return () => {
      m = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      // Memanggil endpoint ASP.NET Core logout untuk menghapus cookie AumoFinance.Session
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("isAuthenticated");
      setLoggingOut(false);
      // Mengarahkan kembali ke halaman login dan refresh state halaman
      router.push("/auth/login");
      router.refresh();
    }
  };

  return (
    <aside className="w-64 border-r border-white/[0.06] bg-[var(--color-matte)] flex flex-col h-screen sticky top-0 shrink-0 select-none z-20">
      <div className="h-16 px-5 border-b border-white/[0.06] flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-matte-hover)] text-white grid place-items-center font-bold text-sm">
          A
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-none text-white tracking-tight">
            Aumo Finance
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-[0.16em] font-medium mt-1">
            Accounting Suite
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 py-5 space-y-7">
          <div>
            <h2 className="px-3 mb-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.14em]">
              Main Domain
            </h2>
            <div className="space-y-0.5">
              {mainNavItems.map((i) => (
                <NavItemLink key={i.path} item={i} />
              ))}
            </div>
          </div>
          <div className="h-px bg-white/[0.06] mx-2" />
          <div>
            <h2 className="px-3 mb-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.14em]">
              Reports & Statements
            </h2>
            <div className="space-y-0.5">
              {reportNavItems.map((i) => (
                <NavItemLink key={i.path} item={i} />
              ))}
            </div>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <div className="p-3 border-t border-white/[0.06] bg-[var(--color-matte)] space-y-2.5">
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-[var(--color-matte-soft)] border border-white/[0.06]">
          <div className="w-7 h-7 rounded-full bg-white/[0.06] text-zinc-300 grid place-items-center shrink-0">
            <IconUser size={14} />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-medium truncate text-white leading-none">
              {loading
                ? "Loading..."
                : user?.fullName || user?.userName || "User"}
            </span>
            <span className="text-[10px] text-zinc-500 truncate leading-none mt-1.5 font-mono">
              {user?.email || "Active Session"}
            </span>
          </div>
          <Badge
            variant="outline"
            className="px-1.5 py-0 text-[10px] border-emerald-500/20 text-emerald-400 bg-emerald-500/10 rounded-md"
          >
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse mr-1" />
            Online
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full justify-start gap-2 h-8 text-[12.5px] text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg"
        >
          {loggingOut ? (
            <IconLoader2 size={14} className="animate-spin" />
          ) : (
            <IconLogout size={14} />
          )}
          <span>{loggingOut ? "Logging out..." : "Sign Out"}</span>
        </Button>
      </div>
    </aside>
  );
}
