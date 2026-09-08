"use client";

import * as React from "react";
import {
  BarChart3,
  Calendar,
  Layers,
  Award,
  CreditCard,
  Printer,
  TrendingUp,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  slug: string;
  productCount: number;
  totalQuantitySold: number;
  totalRevenue: number;
}

interface DashboardStat {
  todayRevenue: number;
  todayOrdersCount: number;
  completedTodayCount: number;
  averageOrderValue: number;
  bestSellingProducts: Array<{
    productId: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  paymentDistribution: Array<{
    method: string;
    count: number;
    totalAmount: number;
  }>;
}

export default function ReportsPage() {
  const [categories, setCategories] = React.useState<CategoryStat[]>([]);
  const [dashboardData, setDashboardData] = React.useState<DashboardStat | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function loadReports() {
    setIsLoading(true);
    setError(null);
    try {
      const [catRes, dashRes] = await Promise.all([
        fetch("/api/reports/categories"),
        fetch("/api/reports/dashboard"),
      ]);

      const catData = await catRes.json();
      const dashData = await dashRes.json();

      if (!catRes.ok) throw new Error(catData.message || "Gagal memuat kategori.");
      if (!dashRes.ok) throw new Error(dashData.message || "Gagal memuat metrik.");

      setCategories(catData.categories || []);
      setDashboardData(dashData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadReports();
  }, []);

  const totalCategoryRevenue = categories.reduce(
    (sum, c) => sum + c.totalRevenue,
    0
  );
  const totalCategorySold = categories.reduce(
    (sum, c) => sum + c.totalQuantitySold,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Laporan Operasional & Penjualan
          </h1>
          <p className="text-sm text-muted-foreground">
            Rekapitulasi penjualan per kategori menu, produk terlaris, dan distribusi saluran pembayaran.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="gap-2 text-xs self-start sm:self-auto"
        >
          <Printer className="h-4 w-4" />
          Cetak Laporan
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Total Akumulasi Penjualan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {formatCurrency(totalCategoryRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari seluruh pesanan berstatus lunas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Total Item Menu Terjual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {totalCategorySold} Pcs
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kombinasi seluruh varian menu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Kategori Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {categories.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.categoryName || "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kontributor omset terbesar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Performa Penjualan per Kategori Menu
          </CardTitle>
          <CardDescription>
            Rincian jumlah porsi terjual dan total omset per kategori produk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 py-4">
              <div className="h-10 w-full rounded-md bg-muted/60 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-muted/60 animate-pulse" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Jumlah Varian Menu</TableHead>
                  <TableHead>Total Terjual (Pcs)</TableHead>
                  <TableHead>Kontribusi Omset</TableHead>
                  <TableHead className="text-right">Total Pendapatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => {
                  const sharePct =
                    totalCategoryRevenue > 0
                      ? Math.round((cat.totalRevenue / totalCategoryRevenue) * 100)
                      : 0;

                  return (
                    <TableRow key={cat.categoryId}>
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-primary" />
                          <span>{cat.categoryName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cat.productCount} Menu
                      </TableCell>
                      <TableCell className="font-bold font-mono text-foreground">
                        {cat.totalQuantitySold} Pcs
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                            <div
                              style={{ width: `${sharePct}%` }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground font-mono">
                            {sharePct}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm text-foreground">
                        {formatCurrency(cat.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Best-Selling Products Detailed Table */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Peringkat Menu Terlaris
            </CardTitle>
            <CardDescription>
              Menu paling banyak dipesan pelanggan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.bestSellingProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Belum ada data penjualan.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No.</TableHead>
                    <TableHead>Nama Menu</TableHead>
                    <TableHead>Terjual</TableHead>
                    <TableHead className="text-right">Total Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.bestSellingProducts.map((p, idx) => (
                    <TableRow key={p.productId}>
                      <TableCell className="font-bold text-xs text-muted-foreground">
                        #{idx + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {p.name}
                      </TableCell>
                      <TableCell className="font-bold font-mono text-foreground">
                        {p.totalQuantity} Pcs
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm text-primary">
                        {formatCurrency(p.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Distribusi Saluran Pembayaran
            </CardTitle>
            <CardDescription>
              Persentase penggunaan QRIS vs Uang Tunai di meja kasir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.paymentDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Belum ada data transaksi.
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.paymentDistribution.map((pm) => (
                  <div
                    key={pm.method}
                    className="rounded-xl border border-border/70 p-4 space-y-2 bg-card"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase text-foreground">
                        {pm.method}
                      </span>
                      <span className="font-mono font-bold text-sm text-primary">
                        {formatCurrency(pm.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{pm.count} Transaksi Berhasil</span>
                      <span>100% Terverifikasi</span>
                    </div>
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
