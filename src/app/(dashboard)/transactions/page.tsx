"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Eye,
  AlertCircle,
  Banknote,
  QrCode,
  Calendar,
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

interface TransactionRow {
  id: string;
  transactionNumber: string;
  amount: number | string;
  paymentMethod: "QRIS" | "CASH" | "GOPAY" | "SHOPEEPAY" | "BANK_TRANSFER" | "CREDIT_CARD";
  status: string;
  paidAt: string;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    customer?: { name: string } | null;
    cashier: { name: string };
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState<TransactionRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("ALL");

  async function loadTransactions() {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (paymentMethod !== "ALL") params.set("paymentMethod", paymentMethod);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat transaksi.");

      setTransactions(data.transactions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, paymentMethod]);

  function getMethodBadge(method: string) {
    switch (method) {
      case "QRIS":
        return (
          <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 gap-1 font-mono text-xs">
            <QrCode className="h-3 w-3" />
            QRIS
          </Badge>
        );
      case "CASH":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 font-mono text-xs">
            <Banknote className="h-3 w-3" />
            Tunai / Cash
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-mono text-xs">
            {method}
          </Badge>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Buku Besar Transaksi Keuangan
          </h1>
          <p className="text-sm text-muted-foreground">
            Catatan transaksi pembayaran yang bersifat permanen dan tidak dapat diubah (immutable ledger).
          </p>
        </div>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nomor transaksi (TRX-...) atau nomor pesanan..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { label: "Semua Metode", value: "ALL" },
              { label: "QRIS", value: "QRIS" },
              { label: "Tunai / Cash", value: "CASH" },
              { label: "Bank Transfer", value: "BANK_TRANSFER" },
            ].map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setPaymentMethod(m.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  paymentMethod === m.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Daftar Transaksi Tercatat ({transactions.length})
          </CardTitle>
          <CardDescription>
            Seluruh transaksi di bawah telah melewati verifikasi status settlement atau validasi kasir.
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
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Tidak ada data transaksi yang ditemukan.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Waktu Lunas</TableHead>
                  <TableHead>Metode Pembayaran</TableHead>
                  <TableHead>Total Dana Masuk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono font-bold text-xs text-foreground">
                      {tx.transactionNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {tx.order.orderNumber}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {tx.order.customer?.name || "Pelanggan Walk-In"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(tx.paidAt || tx.createdAt)}
                    </TableCell>
                    <TableCell>{getMethodBadge(tx.paymentMethod)}</TableCell>
                    <TableCell className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Lunas
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/transactions/${tx.id}`}>
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
