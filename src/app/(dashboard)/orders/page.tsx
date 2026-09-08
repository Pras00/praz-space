"use client";

import * as React from "react";
import Link from "next/link";
import {
  ReceiptText,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
  Printer,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderItemSummary {
  id: string;
  orderNumber: string;
  status: "DRAFT" | "PENDING_PAYMENT" | "PAID" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;
  createdAt: string;
  customer?: { name: string } | null;
  cashier: { name: string };
  transaction?: { transactionNumber: string } | null;
  items: Array<{ id: string }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<OrderItemSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  async function loadOrders() {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat pesanan.");

      setOrders(data.orders || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  function getStatusBadge(status: string) {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Selesai
          </Badge>
        );
      case "PAID":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Lunas
          </Badge>
        );
      case "PENDING_PAYMENT":
        return (
          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1">
            <Clock className="h-3 w-3" />
            Menunggu Bayar
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/20 gap-1">
            <XCircle className="h-3 w-3" />
            Dibatalkan
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ReceiptText className="h-6 w-6 text-primary" />
            Riwayat Pesanan Cafe
          </h1>
          <p className="text-sm text-muted-foreground">
            Lacak seluruh transaksi pelanggan, status verifikasi, dan cetak ulang bukti struk.
          </p>
        </div>

        <Link href="/pos">
          <Button className="gap-2 shadow-sm">Buka Kasir POS</Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nomor pesanan (ORD-...) atau nama pelanggan..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["all", "PAID", "COMPLETED", "PENDING_PAYMENT", "CANCELLED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {st === "all"
                  ? "Semua Status"
                  : st === "PAID"
                  ? "Lunas"
                  : st === "COMPLETED"
                  ? "Selesai"
                  : st === "PENDING_PAYMENT"
                  ? "Menunggu Bayar"
                  : "Batal"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Daftar Pesanan ({orders.length})
          </CardTitle>
          <CardDescription>
            Pesanan disimpan secara permanen dengan snapshot harga produk asli.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3 py-4">
              <div className="h-10 w-full rounded-md bg-muted/60 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-muted/60 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-muted/60 animate-pulse" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Belum ada pesanan yang sesuai dengan kriteria pencarian.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Waktu Transaksi</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Total Tagihan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((ord) => (
                  <TableRow key={ord.id}>
                    <TableCell className="font-mono font-bold text-xs text-foreground">
                      {ord.orderNumber}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(ord.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {ord.customer?.name || "Pelanggan Walk-In"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {ord.cashier.name}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-sm text-primary">
                      {formatCurrency(ord.total)}
                    </TableCell>
                    <TableCell>{getStatusBadge(ord.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/${ord.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <Eye className="h-3.5 w-3.5" />
                          Detail
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
