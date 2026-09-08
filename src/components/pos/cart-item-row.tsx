"use client";

import * as React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface CartItemRowProps {
  item: CartItem;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemRowProps) {
  const lineSubtotal = item.price * item.quantity;

  return (
    <div className="flex items-center justify-between gap-2.5 py-3 border-b border-border/60 last:border-b-0">
      <div className="min-w-0 flex-1">
        <h5 className="text-xs font-semibold text-foreground truncate">
          {item.name}
        </h5>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground font-mono">
            {formatCurrency(item.price)}
          </span>
          <span className="text-[10px] text-muted-foreground">×</span>
          <span className="text-xs font-bold font-mono text-foreground">
            {formatCurrency(lineSubtotal)}
          </span>
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onDecrease(item.productId)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-card hover:bg-accent text-foreground transition-colors"
          aria-label="Kurangi kuantitas"
        >
          {item.quantity === 1 ? (
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
        </button>

        <span className="w-6 text-center text-xs font-bold font-mono">
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={() => onIncrease(item.productId)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-card hover:bg-accent text-foreground transition-colors"
          aria-label="Tambah kuantitas"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
