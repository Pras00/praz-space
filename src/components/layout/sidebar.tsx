"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ReceiptText,
  UtensilsCrossed,
  Layers,
  CreditCard,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("OWNER" | "ADMIN" | "CASHIER")[];
  badge?: string;
}

export const navItems: NavItem[] = [
  {
    title: "POS / Kasir",
    href: "/pos",
    icon: Store,
    roles: ["OWNER", "ADMIN", "CASHIER"],
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Pesanan",
    href: "/orders",
    icon: ReceiptText,
    roles: ["OWNER", "ADMIN", "CASHIER"],
  },
  {
    title: "Menu / Produk",
    href: "/products",
    icon: UtensilsCrossed,
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Kategori",
    href: "/categories",
    icon: Layers,
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Transaksi",
    href: "/transactions",
    icon: CreditCard,
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Pelanggan",
    href: "/customers",
    icon: Users,
    roles: ["OWNER", "ADMIN", "CASHIER"],
  },
  {
    title: "Laporan",
    href: "/reports",
    icon: BarChart3,
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Staf / Pengguna",
    href: "/users",
    icon: ShieldCheck,
    roles: ["OWNER"],
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: Settings,
    roles: ["OWNER"],
  },
];

interface SidebarProps {
  userRole?: "OWNER" | "ADMIN" | "CASHIER";
  userName?: string;
  userEmail?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({
  userRole = "OWNER",
  userName = "Praz Space Staff",
  userEmail = "staff@prazspace.cafe",
  isCollapsed = false,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border/80 bg-card transition-all duration-300 select-none z-30",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
        <Logo collapsed={isCollapsed} size="sm" />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {!isCollapsed && "Menu Utama"}
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/pos" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!isCollapsed && (
                <span className="truncate flex-1">{item.title}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User Profile & Controls */}
      <div className="border-t border-border/60 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {userName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {userRole}
                </span>
              </div>
            </div>
          )}
          <ThemeToggle />
        </div>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors",
              isCollapsed && "justify-center"
            )}
            title="Keluar / Logout"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
