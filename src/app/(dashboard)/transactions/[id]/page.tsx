"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Banknote,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThermalReceipt } from "@/components/orders/thermal-receipt";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TransactionDetail {
  id: string;
  transactionNumber: string;
  amount: number | string;
  paymentMethod: string;
  status: string;
  paidAt: string;
  createdAt: string;
  payment?: {
    provider: string;
    providerTransactionId?: string | null;
    status: string;
  } | null;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number | string;
    discount: number | string;
    tax: number | string;
    total: number | string;
    createdAt: string;
    customer?: { name: string; phone?: string | null } | null;
    cashier: { name: string; email: string };
    items: Array<{
      id: string;
      productNameSnapshot: string;
      quantity: number;
      unitPrice: number | string;
      subtotal: number | string;
    }>;
  };
}

export default function TransactionDetailPage() {
  const params = useParams();
  const txId = params.id as string;

  const [transaction, setTransaction] = React.useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadTx() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/transactions/${txId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat transaksi.");
        setTransaction(data.transaction);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    }
    if (txId) loadTx();
  }, [txId]);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-12">
        <div className="h-8 w-48 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="text-lg font-bold">Transaksi Tidak Ditemukan</h2>
        <Link href="/transactions">
          <Button variant="outline">Kembali ke Buku Besar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div className="flex items-center gap-3">
          <Link href="/transactions">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Transaksi #{transaction.transactionNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              Tercatat permanen pada {formatDate(transaction.paidAt || transaction.createdAt)}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="gap-1.5 text-xs"
        >
          <Printer className="h-4 w-4" />
          Cetak Struk Transaksi
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Pembayaran & Rekonsiliasi</CardTitle>
              <CardDescription>
                Buku besar transaksi finansial Praz Space (Immutable Ledger).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/20 p-4 border border-border/70">
                <div>
                  <span className="text-muted-foreground">Nominal Masuk</span>
                  <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Metode Pembayaran</span>
                  <p className="font-bold text-sm text-foreground uppercase mt-1">
                    {transaction.paymentMethod}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nomor Pesanan Terkait</span>
                  <p className="font-mono font-bold text-foreground">
                    <Link
                      href={`/orders/${transaction.order.id}`}
                      className="text-primary hover:underline"
                    >
                      {transaction.order.orderNumber}
                    </Link>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Provider Gateway</span>
                  <p className="font-semibold text-foreground">
                    {transaction.payment?.provider || "LANGSUNG (KASIR)"}
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div className="pt-2">
                <h4 className="font-semibold text-sm text-foreground mb-2">
                  Item Menu yang Dibayar
                </h4>
                <div className="divide-y divide-border/60">
                  {transaction.order.items.map((it) => (
                    <div key={it.id} className="flex justify-between py-2">
                      <span>
                        {it.productNameSnapshot} × {it.quantity}
                      </span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(it.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parties */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Data Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <p className="font-bold text-sm text-foreground">
                  {transaction.order.customer?.name || "Pelanggan Walk-In"}
                </p>
                {transaction.order.customer?.phone && (
                  <p className="text-muted-foreground mt-0.5">
                    No. HP: {transaction.order.customer.phone}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Petugas Kasir
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <p className="font-bold text-sm text-foreground">
                  {transaction.order.cashier.name}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  {transaction.order.cashier.email}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Col: Printable Thermal Receipt */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Struk Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <ThermalReceipt
                data={{
                  orderNumber: transaction.order.orderNumber,
                  transactionNumber: transaction.transactionNumber,
                  date: transaction.paidAt || transaction.createdAt,
                  cashierName: transaction.order.cashier.name,
                  customerName: transaction.order.customer?.name || "Pelanggan Walk-In",
                  paymentMethod: transaction.paymentMethod,
                  subtotal: transaction.order.subtotal,
                  discount: transaction.order.discount,
                  tax: transaction.order.tax,
                  total: transaction.order.total,
                  items: transaction.order.items,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
