"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global uncaught error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen items-center justify-center bg-[#09090b] p-4 text-[#fafafa] font-sans antialiased">
        <div className="mx-auto max-w-md w-full space-y-6 rounded-2xl border border-white/10 bg-[#18181b] p-6 text-center shadow-2xl sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">
              Praz Space Sedang Mengalami Kendala
            </h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              {error?.message || "Terjadi kesalahan sistem yang tidak terduga."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Coba Muat Ulang
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="w-full sm:w-auto rounded-xl border border-white/20 bg-transparent px-5 py-2.5 text-xs font-medium text-white hover:bg-white/5 transition-colors"
            >
              Halaman Utama
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
