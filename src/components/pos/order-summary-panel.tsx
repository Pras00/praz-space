"use client";

import * as React from "react";
import { CreditCard, Trash2, ArrowRight, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface OrderSummaryPanelProps {
  subtotal: number;
  discountPercent: number;
  onChangeDiscount: (percent: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function OrderSummaryPanel({
  subtotal,
  discountPercent,
  onChangeDiscount,
  onClearCart,
  onCheckout,
  isProcessing = false,
  disabled = false,
}: OrderSummaryPanelProps) {
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  // PB1 Cafe Tax: 10%
  const taxAmount = Math.round(taxableAmount * 0.1);
  const grandTotal = taxableAmount + taxAmount;

  return (
    <div className="space-y-3 pt-3 border-t border-border/80">
      {/* Discount Selector */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Percent className="h-3.5 w-3.5" />
          Diskon
        </span>
        <div className="flex items-center gap-1">
          {[0, 5, 10, 15, 20].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => onChangeDiscount(pct)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                discountPercent === pct
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Financial Line Breakdown */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono">{formatCurrency(subtotal)}</span>
        </div>

        {discountPercent > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span>Diskon ({discountPercent}%)</span>
            <span className="font-mono">- {formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-muted-foreground">
          <span>Pajak Restoran PB1 (10%)</span>
          <span className="font-mono">{formatCurrency(taxAmount)}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-sm font-bold text-foreground">
          <span>Total Pembayaran</span>
          <span className="text-base font-mono text-primary">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearCart}
          disabled={disabled || isProcessing}
          className="h-10 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
          title="Kosongkan Keranjang"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="default"
          onClick={onCheckout}
          disabled={disabled || isProcessing}
          className="flex-1 h-10 gap-2 font-bold shadow-sm"
        >
          {isProcessing ? (
            <span>Membuat Pesanan...</span>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              <span>Proses Pembayaran</span>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
