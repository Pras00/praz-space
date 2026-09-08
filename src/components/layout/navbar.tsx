"use client";

import * as React from "react";
import { Menu, Bell, Store, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  userName?: string;
  userRole?: string;
  onOpenMobileMenu?: () => void;
}

export function Navbar({
  userName = "Staff",
  userRole = "CASHIER",
  onOpenMobileMenu,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/70 bg-card/95 px-4 backdrop-blur-md md:px-6">
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
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-tight text-foreground">
              {userName}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {userRole}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
