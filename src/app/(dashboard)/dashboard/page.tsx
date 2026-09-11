"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ReceiptText,
  ShoppingBag,
  Store,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Coffee,
  AlertCircle,
  QrCode,
  Banknote,
  Award,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { SalesTrendChart, type WeeklyTrendData } from "@/components/dashboard/sales-trend-chart";

interface DashboardData {
  todayRevenue: number;
  todayOrdersCount: number;
  completedTodayCount: number;
  pendingTodayCount: number;
  cancelledTodayCount: number;
  averageOrderValue: number;
  totalOrdersAllTime: number;
  totalTransactionsAllTime: number;
  bestSellingProducts: Array<{
    productId: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  recentTransactions: Array<{
    id: string;
    transactionNumber: string;
    amount: number | string;
    paymentMethod: string;
    paidAt: string;
    createdAt: string;
    order: {
      orderNumber: string;
      customer?: { name: string } | null;
      cashier: { name: string };
    };
  }>;
  paymentDistribution: Array<{
    method: string;
    count: number;
    totalAmount: number;
  }>;
  weeklyTrend: WeeklyTrendData[];
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function loadMetrics(showSpinner = true) {
    if (showSpinner) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const res = await fetch("/api/reports/dashboard");
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal memuat metrik.");
      setData(resData);

      // Cache locally for 0ms instant display next time
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("praz_dashboard_cache", JSON.stringify(resData));
        } catch (_) {}
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    // 1. Instantly render from cache if available
    let hasInstantCache = false;
    if (typeof window !== "undefined") {
      try {
        const cachedRaw = sessionStorage.getItem("praz_dashboard_cache");
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          if (parsed && parsed.weeklyTrend) {
            setData(parsed);
            setIsLoading(false);
            hasInstantCache = true;
          }
        }
      } catch (_) {}
    }

    // 2. Fetch fresh data in background or with spinner
    loadMetrics(!hasInstantCache);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-4 sm:p-6 border border-primary/20">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-2">
            Praz Space Operations Center
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Ringkasan Operasional Cafe
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Data metrik terhubung langsung ke database PostgreSQL Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => loadMetrics(true)}
            className="h-10 w-10 shrink-0 rounded-xl bg-background/80 hover:bg-background border-border/80 shadow-xs cursor-pointer"
            title="Segarkan Data Metrik"
          >
            <RotateCcw className={cn("h-4 w-4", isLoading && "animate-spin text-primary")} />
          </Button>

          <Link href="/pos" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2 shadow-md font-bold cursor-pointer">
              <Store className="h-4 w-4" />
              Buka Kasir POS
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 KPI Metrics: 2 columns on mobile/tablet, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-5 border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 space-y-0">
            <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              Pendapatan Hari Ini
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-base sm:text-2xl font-bold font-mono text-foreground truncate">
              {formatCurrency(data?.todayRevenue || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              Dari {data?.completedTodayCount || 0} transaksi lunas
            </p>
          </CardContent>
        </Card>

        <Card className="p-3.5 sm:p-5 border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 space-y-0">
            <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              Pesanan Hari Ini
            </CardTitle>
            <ReceiptText className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-base sm:text-2xl font-bold font-mono text-foreground truncate">
              {data?.todayOrdersCount || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] sm:text-xs truncate">
              <span className="text-emerald-600 font-semibold truncate">
                {data?.completedTodayCount || 0} Selesai
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-amber-600 font-semibold truncate">
                {data?.pendingTodayCount || 0} Menunggu
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3.5 sm:p-5 border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 space-y-0">
            <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              Rata-rata Order (AOV)
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-base sm:text-2xl font-bold font-mono text-foreground truncate">
              {formatCurrency(data?.averageOrderValue || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              Nilai belanja rata-rata
            </p>
          </CardContent>
        </Card>

        <Card className="p-3.5 sm:p-5 border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 space-y-0">
            <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              Total Transaksi
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-base sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate">
              {data?.totalTransactionsAllTime || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
              Buku besar finansial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Trends Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Interactive 7-Day Sales Trend Chart */}
        <SalesTrendChart data={data?.weeklyTrend} className="lg:col-span-2" />

        {/* Right 1 Col: Best Selling Menu Products */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              Menu Paling Laris
            </CardTitle>
            <CardDescription className="text-xs">
              Produk teratas berdasarkan kuantitas penjualan.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {data?.bestSellingProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Belum ada data penjualan tercatat.
              </div>
            ) : (
              <div className="space-y-3">
                {data?.bestSellingProducts.map((prod, idx) => (
                  <div
                    key={prod.productId}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-foreground truncate">
                        {prod.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-foreground">
                        {prod.totalQuantity} terjual
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Payment Distribution */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Recent Transactions Table */}
        <Card className="lg:col-span-2 overflow-hidden border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-2 sm:pb-3">
            <div>
              <CardTitle className="text-base font-bold">Transaksi Terbaru</CardTitle>
              <CardDescription className="text-xs">
                Penerimaan pembayaran terkini di terminal kasir.
              </CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <span>Lihat Semua</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {data?.recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Belum ada transaksi tercatat.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {data?.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2.5 sm:py-3 gap-2 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                      <p className="font-mono font-bold text-foreground truncate">
                        {tx.transactionNumber}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {tx.order.customer?.name || "Pelanggan Walk-In"} · Kasir: {tx.order.cashier.name}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5 shrink-0">
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(tx.amount)}
                      </p>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {tx.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Breakdown */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="text-base font-bold">Metode Pembayaran</CardTitle>
            <CardDescription className="text-xs">
              Perbandingan penerimaan QRIS vs Tunai.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {data?.paymentDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Belum ada transaksi.
              </div>
            ) : (
              <div className="space-y-3">
                {data?.paymentDistribution.map((pm) => (
                  <div
                    key={pm.method}
                    className="rounded-xl border border-border/80 bg-muted/20 p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {pm.method === "QRIS" ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                          <QrCode className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                          <Banknote className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold uppercase text-foreground">
                          {pm.method}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {pm.count} Transaksi
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {formatCurrency(pm.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
