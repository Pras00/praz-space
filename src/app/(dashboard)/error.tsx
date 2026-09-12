"use client";

import * as React from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-destructive/20 bg-card p-6 shadow-xl sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            Terjadi Kendala Saat Menampilkan Halaman
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {error?.message ||
              "Terjadi kesalahan saat memuat komponen atau koneksi internet tidak stabil."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 cursor-pointer font-semibold shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Muat Ulang
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="w-full sm:w-auto gap-2 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
