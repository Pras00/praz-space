"use client";

import * as React from "react";
import { Plus, Coffee, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface PosProduct {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  imageUrl: string | null;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface ProductCardProps {
  product: PosProduct;
  cartQuantity?: number;
  onAddToCart: (product: PosProduct) => void;
}

export function ProductCard({
  product,
  cartQuantity = 0,
  onAddToCart,
}: ProductCardProps) {
  const isAvailable = product.isActive;

  return (
    <div
      onClick={() => {
        if (isAvailable) onAddToCart(product);
      }}
      className={`group relative flex flex-col justify-between rounded-xl border bg-card p-3 shadow-xs transition-all select-none ${
        isAvailable
          ? "cursor-pointer hover:border-primary/60 hover:shadow-md active:scale-[0.98]"
          : "opacity-60 cursor-not-allowed border-dashed"
      } ${cartQuantity > 0 ? "border-primary ring-1 ring-primary/40 bg-primary/5" : "border-border/80"}`}
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-muted/40 mb-2.5">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Coffee className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Category Pill */}
        <span className="absolute left-2 top-2 rounded-full bg-background/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-xs">
          {product.category.name}
        </span>

        {/* In-cart count badge */}
        {cartQuantity > 0 && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md animate-in zoom-in-50">
            {cartQuantity}
          </span>
        )}

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-2xs">
            <span className="rounded-md bg-destructive px-2 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h4>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className="text-sm font-bold font-mono text-primary">
            {formatCurrency(product.price)}
          </span>

          <button
            type="button"
            disabled={!isAvailable}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              cartQuantity > 0
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-primary hover:text-primary-foreground text-foreground"
            }`}
            aria-label={`Tambah ${product.name} ke keranjang`}
          >
            {cartQuantity > 0 ? (
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            ) : (
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
