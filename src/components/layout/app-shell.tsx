"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: "OWNER" | "ADMIN" | "CASHIER";
  userName?: string;
  userEmail?: string;
}

export function AppShell({
  children,
  userRole = "OWNER",
  userName = "Praz Space Staff",
  userEmail = "staff@prazspace.cafe",
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-50 flex h-full w-72 flex-col bg-card shadow-2xl">
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar
              userRole={userRole}
              userName={userName}
              userEmail={userEmail}
              isCollapsed={false}
              className="w-full h-full border-r-0"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        <Navbar
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto min-h-0 w-full">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
