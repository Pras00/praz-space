"use client";

import * as React from "react";
import {
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Receipt,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    total: number | string;
    items: Array<{
      productNameSnapshot: string;
      quantity: number;
      unitPrice: number | string;
      subtotal: number | string;
    }>;
  } | null;
  onPaymentComplete: (transactionData: {
    transactionNumber: string;
    orderId: string;
    amount: number;
    paymentMethod: string;
    change?: number;
  }) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentComplete,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = React.useState<"cash" | "midtrans">("cash");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Cash Tab State
  const [cashAmount, setCashAmount] = React.useState<number | "">("");

  // Midtrans Tab State
  const [snapToken, setSnapToken] = React.useState<string | null>(null);
  const [snapUrl, setSnapUrl] = React.useState<string | null>(null);

  const orderTotal = order ? Number(order.total) : 0;
  const numericCash = typeof cashAmount === "number" ? cashAmount : 0;
  const change = numericCash >= orderTotal ? numericCash - orderTotal : 0;

  // Reset states on open
  React.useEffect(() => {
    if (isOpen && order) {
      setCashAmount(orderTotal);
      setError(null);
      setIsProcessing(false);
      setSnapToken(null);
      setSnapUrl(null);
    }
  }, [isOpen, order, orderTotal]);

  // Handle Cash Payment
  async function handleConfirmCash() {
    if (!order) return;
    if (numericCash < orderTotal) {
      setError("Nominal uang yang diterima kurang dari total pesanan.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          cashReceived: numericCash,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memproses pembayaran tunai.");

      onPaymentComplete({
        transactionNumber: data.transaction.transactionNumber,
        orderId: order.id,
        amount: orderTotal,
        paymentMethod: "CASH",
        change,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle Midtrans Snap Request
  async function handleLoadMidtransSnap() {
    if (!order) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/create-snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menginisiasi Midtrans.");

      setSnapToken(data.token);
      setSnapUrl(data.redirectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat Midtrans.");
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle Midtrans Simulator (Sandbox dev helper)
  async function handleSimulateMidtransSuccess() {
    if (!order) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal simulasi pembayaran.");

      onPaymentComplete({
        transactionNumber: data.transaction.transactionNumber,
        orderId: order.id,
        amount: orderTotal,
        paymentMethod: "QRIS",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal simulasi.");
    } finally {
      setIsProcessing(false);
    }
  }

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Pembayaran Pesanan
          </DialogTitle>
          <DialogDescription className="text-xs">
            Nomor: <span className="font-mono font-bold text-foreground">{order.orderNumber}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Total Amount Badge */}
        <div className="flex items-center justify-between rounded-xl bg-primary/10 p-3.5 border border-primary/20">
          <span className="text-xs font-semibold text-muted-foreground">
            Total Tagihan Lunas
          </span>
          <span className="text-xl font-mono font-black text-primary">
            {formatCurrency(orderTotal)}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "cash" | "midtrans")}
          className="w-full pt-1"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cash" className="gap-1.5 text-xs">
              <Banknote className="h-4 w-4" />
              Tunai / Cash
            </TabsTrigger>
            <TabsTrigger value="midtrans" className="gap-1.5 text-xs">
              <QrCode className="h-4 w-4" />
              QRIS / Midtrans
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CASH */}
          <TabsContent value="cash" className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Uang Diterima dari Pelanggan (IDR)
              </label>
              <Input
                type="number"
                min={orderTotal}
                step="1000"
                value={cashAmount}
                onChange={(e) =>
                  setCashAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="font-mono text-base font-bold"
              />
            </div>

            {/* Quick cash denomination buttons */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setCashAmount(orderTotal)}
                className="rounded-lg border border-border/80 px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Uang Pas
              </button>
              <button
                type="button"
                onClick={() => setCashAmount(50000)}
                className="rounded-lg border border-border/80 px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Rp 50rb
              </button>
              <button
                type="button"
                onClick={() => setCashAmount(100000)}
                className="rounded-lg border border-border/80 px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Rp 100rb
              </button>
              <button
                type="button"
                onClick={() => setCashAmount(200000)}
                className="rounded-lg border border-border/80 px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Rp 200rb
              </button>
            </div>

            {/* Change Calculator */}
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card p-3 text-xs">
              <span className="text-muted-foreground font-medium">Uang Kembalian:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  numericCash < orderTotal ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {numericCash < orderTotal
                  ? `Kurang ${formatCurrency(orderTotal - numericCash)}`
                  : formatCurrency(change)}
              </span>
            </div>

            <Button
              type="button"
              onClick={handleConfirmCash}
              disabled={isProcessing || numericCash < orderTotal}
              className="w-full font-bold gap-2 mt-2 shadow-sm"
            >
              {isProcessing ? "Menyimpan Transaksi..." : "Konfirmasi Pembayaran Tunai"}
            </Button>
          </TabsContent>

          {/* TAB 2: MIDTRANS / QRIS */}
          <TabsContent value="midtrans" className="space-y-3 pt-2">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 text-center space-y-3">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <QrCode className="h-8 w-8" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Pembayaran Digital QRIS & E-Wallet
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mendukung QRIS BCA/Mandiri/BRI, GoPay, ShopeePay, dan transfer bank otomatis melalui Midtrans.
                </p>
              </div>

              {!snapToken ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoadMidtransSnap}
                  disabled={isProcessing}
                  className="w-full text-xs font-semibold"
                >
                  {isProcessing ? "Menghubungkan ke Midtrans..." : "Buat Tagihan QRIS Midtrans"}
                </Button>
              ) : (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Snap Token Aktif: {snapToken.substring(0, 16)}...
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Pelanggan dapat melakukan scan QRIS atau bayar via link Midtrans.
                  </p>
                </div>
              )}
            </div>

            {/* Sandbox Simulation Button */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Mode Uji Coba Sandbox
                </span>
                <span className="text-[10px] font-bold text-primary uppercase">
                  Development
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Gunakan tombol di bawah untuk menyimulasikan notifikasi sukses QRIS dari Midtrans secara instan.
              </p>
              <Button
                type="button"
                onClick={handleSimulateMidtransSuccess}
                disabled={isProcessing}
                variant="outline"
                className="w-full text-xs font-semibold h-9 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                {isProcessing ? "Menyimulasikan..." : "Simulasi Bayar QRIS Berhasil"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full text-xs text-muted-foreground"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
