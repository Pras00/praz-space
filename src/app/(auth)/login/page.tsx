"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal masuk. Periksa email dan kata sandi.");
      }

      let targetUrl = data.user?.role === "CASHIER" ? "/pos" : from;
      if (!targetUrl || targetUrl === "/login" || targetUrl.startsWith("/login")) {
        targetUrl = data.user?.role === "CASHIER" ? "/pos" : "/dashboard";
      }

      // Gunakan window.location.replace untuk navigasi dokumen penuh.
      // Menghilangkan race condition router.push + router.refresh
      // dan menjamin cookie sesi terkirim pada permintaan pertama.
      window.location.replace(targetUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan pada sistem.");
      setIsLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password123");
    setError(null);
  }

  return (
    <Card className="border-border/80 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight">
          Masuk ke Sistem
        </CardTitle>
        <CardDescription>
          Gunakan akun staff atau kasir terdaftar Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="nama@prazspace.cafe"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-foreground"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 mt-2 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-4 border-t border-border/70 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">
            Akses Cepat Demo (Development)
          </p>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => fillDemo("owner@prazspace.cafe")}
              className="rounded-md border border-border/80 px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors text-center"
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@prazspace.cafe")}
              className="rounded-md border border-border/80 px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo("cashier@prazspace.cafe")}
              className="rounded-md border border-border/80 px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors text-center"
            >
              Kasir
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 selection:bg-primary/20">
      {/* Top right theme toggle */}
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo size="lg" />
          <p className="text-sm text-muted-foreground pt-2">
            Sistem Kasir & Manajemen Operasional Cafe
          </p>
        </div>

        {/* Login Form with Suspense */}
        <React.Suspense
          fallback={
            <div className="h-80 w-full rounded-xl border border-border/70 bg-card p-6 animate-pulse" />
          }
        >
          <LoginForm />
        </React.Suspense>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Praz Space. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
