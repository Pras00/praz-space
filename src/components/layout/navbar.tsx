"use client";

import * as React from "react";
import { Menu, Store, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  userName?: string;
  userRole?: string;
  userEmail?: string;
  onOpenMobileMenu?: () => void;
}

export function Navbar({
  userName = "Staff",
  userRole = "CASHIER",
  userEmail,
  onOpenMobileMenu,
}: NavbarProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between border-b border-border/70 bg-card/95 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2 md:hidden">
          <Logo size="sm" />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            POS Online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link href="/pos">
          <Button size="sm" className="hidden sm:flex gap-1.5">
            <Store className="h-4 w-4" />
            Buka Kasir
          </Button>
        </Link>
        <ThemeToggle />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 pl-2 border-l border-border/60 hover:bg-accent/60 rounded-xl p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none"
              aria-label="Menu profil dan akun"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20 shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-tight text-foreground truncate max-w-[130px]">
                  {userName}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {userRole}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/80 hidden sm:block shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-border/80">
            <DropdownMenuLabel className="font-normal px-2.5 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold leading-none text-foreground truncate">
                  {userName}
                </p>
                {userEmail && (
                  <p className="text-[11px] leading-none text-muted-foreground truncate">
                    {userEmail}
                  </p>
                )}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {userRole}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2.5 py-2 px-2.5 rounded-lg text-xs font-medium"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>{isLoggingOut ? "Keluar..." : "Keluar / Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
