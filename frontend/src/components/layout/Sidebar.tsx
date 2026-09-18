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
        "aumo-nav-item-link",
        isCollapsed && "aumo-nav-item-collapsed",
        isActive ? "aumo-nav-item-active" : "aumo-nav-item-inactive",
      )}
    >
      {isActive && isCollapsed && (
        <span className="aumo-nav-active-collapsed-indicator" />
      )}

      <item.icon
        size={18}
        stroke={isActive ? 2 : 1.8}
        className={cn(
          "aumo-nav-item-icon-base",
          isActive
            ? "aumo-nav-item-icon-active"
            : "aumo-nav-item-icon-inactive",
        )}
      />
      {!isCollapsed && (
        <>
          <span className="aumo-nav-item-text">{item.label}</span>
          {item.badge && (
            <span className="aumo-nav-item-badge">
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
        "aumo-sidebar-root",
        isCollapsed ? "aumo-sidebar-collapsed" : "aumo-sidebar-expanded",
      )}
    >
      <div className="aumo-sidebar-top-gradient" />

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="aumo-sidebar-toggle-btn"
      >
        {isCollapsed ? (
          <IconChevronRight size={14} />
        ) : (
          <IconChevronLeft size={14} />
        )}
      </button>

      {/* HEADER */}
      <div className="aumo-sidebar-header">
        <div className="aumo-sidebar-logo-box">
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
            "aumo-sidebar-collapsible-wrapper",
            isCollapsed && "aumo-sidebar-collapsed-hidden",
          )}
        >
          <span className="aumo-sidebar-brand-title">AUMO FINANCE</span>
          <span className="aumo-sidebar-brand-subtitle">Accounting Suite</span>
        </div>
      </div>

      {/* NAV & FOOTER INTEGRATED IN SCROLL AREA */}
      <ScrollArea className="flex-1">
        <div className="aumo-sidebar-nav-container">
          <div className="aumo-sidebar-section-wrapper">
            <h2
              className={cn(
                "aumo-sidebar-header-label",
                isCollapsed && "aumo-sidebar-header-collapsed",
              )}
            >
              Main
            </h2>
            <div className="aumo-sidebar-nav-group">
              {mainNavItems.map((i) => (
                <NavItemLink key={i.path} item={i} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>

          <div className="aumo-sidebar-divider" />

          <div className="space-y-3">
            <h2
              className={cn(
                "aumo-sidebar-header-label",
                isCollapsed && "aumo-sidebar-header-collapsed",
              )}
            >
              Reports
            </h2>
            <div className="aumo-sidebar-nav-group">
              {reportNavItems.map((i) => (
                <NavItemLink key={i.path} item={i} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER DIPINDAHKAN KE DALAM SCROLL AREA */}
        <div className="aumo-sidebar-footer">
          <div
            className={cn(
              "aumo-sidebar-footer-card-outer",
              isCollapsed && "aumo-sidebar-footer-card-outer-collapsed",
            )}
          >
            <div
              className={cn(
                "aumo-sidebar-footer-card",
                isCollapsed && "aumo-sidebar-footer-card-collapsed",
              )}
            >
              {isCollapsed ? (
                <div className="aumo-user-avatar-collapsed">
                  <IconUser size={16} />
                </div>
              ) : (
                <div className="aumo-user-flex">
                  <div className="aumo-user-avatar">
                    {(
                      user?.fullName?.[0] ||
                      user?.userName?.[0] ||
                      "U"
                    ).toUpperCase()}
                  </div>
                  <div className="aumo-user-details">
                    <p className="aumo-user-name">
                      {user?.fullName || user?.userName || "Ghofur"}
                    </p>
                    <p className="aumo-user-email">
                      {user?.email || "ghofur@aumo.id"}
                    </p>
                  </div>
                  <div className="aumo-user-status-dot" />
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
              "aumo-logout-btn",
              isCollapsed && "aumo-logout-btn-collapsed",
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

        <ScrollBar orientation="vertical" className="aumo-sidebar-scrollbar" />
      </ScrollArea>
    </aside>
  );
}
