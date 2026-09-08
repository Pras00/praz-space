"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ReceiptText,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  User,
  CreditCard,
  ChefHat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThermalReceipt } from "@/components/orders/thermal-receipt";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: "DRAFT" | "PENDING_PAYMENT" | "PAID" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  subtotal: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;
  createdAt: string;
  customer?: { id: string; name: string; phone?: string | null; email?: string | null } | null;
  cashier: { id: string; name: string; email: string };
  transaction?: { id: string; transactionNumber: string; paymentMethod: string; paidAt: string } | null;
  items: Array<{
    id: string;
    productNameSnapshot: string;
    unitPrice: number | string;
    quantity: number;
    subtotal: number | string;
    product?: { imageUrl?: string | null };
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  async function loadOrder() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat detail pesanan.");
      setOrder(data.order);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId]);

  async function handleMarkCompleted() {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui status.");
      await loadOrder();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memperbarui pesanan.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-12">
        <div className="h-8 w-48 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="text-lg font-bold">Pesanan Tidak Ditemukan</h2>
        <Link href="/orders">
          <Button variant="outline">Kembali ke Daftar Pesanan</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Pesanan #{order.orderNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              Dibuat pada {formatDate(order.createdAt)} oleh {order.cashier.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.status === "PAID" && (
            <Button
              onClick={handleMarkCompleted}
              disabled={isUpdating}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <ChefHat className="h-4 w-4" />
              {isUpdating ? "Memperbarui..." : "Tandai Disajikan (Selesai)"}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5 text-xs"
          >
            <Printer className="h-4 w-4" />
            Cetak Struk
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Order Line Items and Financial Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Daftar Item Menu ({order.items.length})</CardTitle>
              <CardDescription>
                Snapshot harga historis yang terkunci saat transaksi terjadi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="divide-y divide-border/60">
                {order.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {it.productNameSnapshot}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {it.quantity} × {formatCurrency(it.unitPrice)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {formatCurrency(it.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border/70 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(order.subtotal)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Diskon:</span>
                    <span className="font-mono">- {formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Pajak Restoran PB1 (10%):</span>
                  <span className="font-mono">{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/60 text-base font-bold text-foreground">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-primary">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Staff Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Data Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p className="font-bold text-sm text-foreground">
                  {order.customer?.name || "Pelanggan Walk-In"}
                </p>
                {order.customer?.phone && (
                  <p className="text-muted-foreground">No. HP: {order.customer.phone}</p>
                )}
                {order.customer?.email && (
                  <p className="text-muted-foreground">Email: {order.customer.email}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Petugas Kasir
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p className="font-bold text-sm text-foreground">{order.cashier.name}</p>
                <p className="text-muted-foreground">{order.cashier.email}</p>
                {order.transaction && (
                  <p className="font-mono text-primary font-semibold pt-1">
                    No. TRX: {order.transaction.transactionNumber}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Col: Thermal Receipt Printable Card */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pratinjau Struk Kasir</CardTitle>
              <CardDescription>
                Format 80mm standar ramah printer thermal cafe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThermalReceipt
                data={{
                  orderNumber: order.orderNumber,
                  transactionNumber: order.transaction?.transactionNumber,
                  date: order.createdAt,
                  cashierName: order.cashier.name,
                  customerName: order.customer?.name || "Pelanggan Walk-In",
                  paymentMethod: order.transaction?.paymentMethod || "Belum Bayar",
                  subtotal: order.subtotal,
                  discount: order.discount,
                  tax: order.tax,
                  total: order.total,
                  items: order.items,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
