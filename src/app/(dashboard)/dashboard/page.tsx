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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

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
  weeklyTrend: Array<{
    date: string;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function loadMetrics() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/dashboard");
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal memuat metrik.");
      setData(resData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadMetrics();
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

  const maxWeeklyRevenue = Math.max(
    ...(data?.weeklyTrend.map((d) => d.revenue) || [1]),
    1
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 border border-primary/20">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-2">
            Praz Space Operations Center
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Ringkasan Operasional Cafe
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Data metrik terhubung langsung ke database PostgreSQL Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pos">
            <Button className="gap-2 shadow-md font-bold">
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

      {/* 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pendapatan Hari Ini
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatCurrency(data?.todayRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari {data?.completedTodayCount || 0} transaksi lunas hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pesanan Hari Ini
            </CardTitle>
            <ReceiptText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {data?.todayOrdersCount || 0}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-emerald-600 font-semibold">
                {data?.completedTodayCount || 0} Selesai
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-amber-600 font-semibold">
                {data?.pendingTodayCount || 0} Menunggu
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rata-rata Order (AOV)
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatCurrency(data?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Nilai belanja rata-rata per transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Transaksi Terverifikasi
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {data?.totalTransactionsAllTime || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Buku besar transaksi finansial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Trends Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: 7-Day Sales Trend Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tren Penjualan 7 Hari Terakhir</CardTitle>
            <CardDescription>
              Volume pendapatan harian cafe yang berhasil diselesaikan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
              {data?.weeklyTrend.map((item, idx) => {
                const heightPct =
                  maxWeeklyRevenue > 0
                    ? Math.max(8, Math.round((item.revenue / maxWeeklyRevenue) * 100))
                    : 8;
                return (
                  <div
                    key={idx}
                    className="flex flex-1 flex-col items-center gap-2 group"
                  >
                    <div className="text-[10px] font-mono font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.revenue > 0 ? formatCurrency(item.revenue) : "0"}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[42px] rounded-t-lg bg-primary/80 group-hover:bg-primary transition-all shadow-xs"
                    />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Best Selling Menu Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              Menu Paling Laris
            </CardTitle>
            <CardDescription>
              Produk teratas berdasarkan kuantitas penjualan.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
              <CardDescription>
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
          <CardContent>
            {data?.recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Belum ada transaksi tercatat.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {data?.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2.5 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-foreground">
                        {tx.transactionNumber}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {tx.order.customer?.name || "Pelanggan Walk-In"} · Kasir: {tx.order.cashier.name}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metode Pembayaran</CardTitle>
            <CardDescription>
              Perbandingan penerimaan QRIS vs Tunai.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
