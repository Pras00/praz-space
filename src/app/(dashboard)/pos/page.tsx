"use client";

import * as React from "react";
import {
  Store,
  Search,
  ShoppingCart,
  Coffee,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Printer,
  RotateCcw,
} from "lucide-react";
import { ProductCard, type PosProduct } from "@/components/pos/product-card";
import { CartItemRow, type CartItem } from "@/components/pos/cart-item-row";
import { CustomerSelector } from "@/components/pos/customer-selector";
import { OrderSummaryPanel } from "@/components/pos/order-summary-panel";
import { PaymentModal } from "@/components/pos/payment-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CreatedOrder {
  id: string;
  orderNumber: string;
  total: number | string;
  subtotal: number | string;
  tax: number | string;
  discount: number | string;
  status: string;
  items: Array<{
    id: string;
    productNameSnapshot: string;
    unitPrice: number | string;
    quantity: number;
    subtotal: number | string;
  }>;
}

interface CompletedTransactionInfo {
  transactionNumber: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  change?: number;
}

export default function PosPage() {
  const [products, setProducts] = React.useState<PosProduct[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  // Cart State
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = React.useState("Pelanggan Walk-In");
  const [discountPercent, setDiscountPercent] = React.useState(0);

  // Mobile cart drawer state
  const [isMobileCartOpen, setIsMobileCartOpen] = React.useState(false);

  // Checkout and Order Created State
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [createdOrder, setCreatedOrder] = React.useState<CreatedOrder | null>(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [completedTx, setCompletedTx] = React.useState<CompletedTransactionInfo | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);

  // Load Products & Categories
  async function loadData() {
    setIsLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch("/api/categories?active=true"),
        fetch("/api/products?active=true&limit=100"),
      ]);

      const catData = await catRes.json();
      const prodData = await prodRes.json();

      if (catRes.ok && catData.categories) {
        setCategories(catData.categories);
      }
      if (prodRes.ok && prodData.products) {
        setProducts(prodData.products);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat produk.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  // Cart Handlers
  function handleAddToCart(product: PosProduct) {
    if (!product.isActive) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
    });
  }

  function handleIncreaseQuantity(productId: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function handleDecreaseQuantity(productId: string) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function handleRemoveItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function handleClearCart() {
    if (cart.length === 0) return;
    setCart([]);
    setDiscountPercent(0);
  }

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === "all" || p.category.id === selectedCategory;
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Client subtotal preview
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Checkout Handler (Creates order in Supabase and opens Payment Modal)
  async function handleCheckout() {
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    setError(null);

    try {
      const payload = {
        customerId: selectedCustomerId,
        discountPercent,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses pesanan.");
      }

      setCreatedOrder(data.order);
      setIsPaymentModalOpen(true);
      setIsMobileCartOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  function handlePaymentComplete(txData: CompletedTransactionInfo) {
    setIsPaymentModalOpen(false);
    setCompletedTx(txData);
    setIsReceiptModalOpen(true);
    setCart([]);
  }

  function handlePrintReceipt() {
    window.print();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6.5rem)] min-h-[600px]">
      {/* LEFT AREA: Product Catalog */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top filter row */}
        <div className="space-y-3 pb-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari menu kopi, non-kopi, makanan, dessert..."
                className="pl-9 bg-card h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Mobile cart toggle button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMobileCartOpen(true)}
              className="lg:hidden relative gap-2 shrink-0 h-9"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Keranjang</span>
              {totalItemCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {totalItemCount}
                </span>
              )}
            </Button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              Semua Menu ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-xl border border-border/60 bg-muted/40 animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
              <Coffee className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">
                Tidak ada menu ditemukan
              </p>
              <p className="text-xs text-muted-foreground">
                Coba gunakan kata kunci pencarian lain atau pilih kategori berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-4">
              {filteredProducts.map((product) => {
                const inCart = cart.find(
                  (item) => item.productId === product.id
                );
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQuantity={inCart?.quantity || 0}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Cashier Cart */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-card border-l border-border p-4 shadow-2xl flex flex-col transition-transform duration-300 lg:static lg:z-auto lg:w-88 lg:shadow-none lg:translate-x-0 lg:rounded-2xl lg:border ${
          isMobileCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground leading-tight">
                Pesanan Saat Ini
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {totalItemCount} item dalam keranjang
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileCartOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customer Selector */}
        <div className="pt-3 shrink-0">
          <CustomerSelector
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={(id, name) => {
              setSelectedCustomerId(id);
              setSelectedCustomerName(name || "Pelanggan Walk-In");
            }}
          />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-2 pr-1">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30 stroke-1" />
              <p className="text-xs font-semibold text-foreground">
                Keranjang Masih Kosong
              </p>
              <p className="text-[11px] max-w-xs">
                Klik produk pada katalog di sebelah kiri untuk menambahkan menu ke pesanan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onIncrease={handleIncreaseQuantity}
                onDecrease={handleDecreaseQuantity}
                onRemove={handleRemoveItem}
              />
            ))
          )}
        </div>

        {/* Order Summary & Primary Action */}
        <div className="shrink-0">
          <OrderSummaryPanel
            subtotal={cartSubtotal}
            discountPercent={discountPercent}
            onChangeDiscount={setDiscountPercent}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            isProcessing={isCheckingOut}
            disabled={cart.length === 0}
          />
        </div>
      </div>

      {/* Payment Modal Component */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={createdOrder}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Post-Payment Thermal Receipt Dialog */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center sm:text-center pb-2 border-b border-border/60">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Pembayaran Berhasil!
            </DialogTitle>
            <DialogDescription className="text-xs">
              Transaksi telah diverifikasi dan tercatat di buku besar database.
            </DialogDescription>
          </DialogHeader>

          {/* Printable Receipt Paper Container */}
          <div className="my-2 rounded-xl border border-dashed border-border bg-white text-black p-5 text-xs font-mono shadow-sm">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-300">
              <h3 className="font-bold text-base tracking-wider uppercase">PRAZ SPACE CAFE</h3>
              <p className="text-[10px] text-zinc-600">Modern Specialty Coffee & Eatery</p>
              <p className="text-[9px] text-zinc-500">Jl. Praz Space No. 1, Jakarta Selatan</p>
            </div>

            <div className="py-2.5 space-y-1 border-b border-dashed border-zinc-300 text-[11px]">
              <div className="flex justify-between">
                <span>No. Order:</span>
                <span className="font-bold">{createdOrder?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>No. Transaksi:</span>
                <span className="font-bold">{completedTx?.transactionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{formatDate(new Date())}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{selectedCustomerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span className="font-bold uppercase">{completedTx?.paymentMethod}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="py-2.5 space-y-1.5 border-b border-dashed border-zinc-300 text-[11px]">
              {createdOrder?.items.map((it) => (
                <div key={it.id} className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <p className="font-bold">{it.productNameSnapshot}</p>
                    <p className="text-[10px] text-zinc-600">
                      {it.quantity} × {formatCurrency(it.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold">{formatCurrency(it.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-2.5 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(createdOrder?.subtotal || 0)}</span>
              </div>
              {Number(createdOrder?.discount) > 0 && (
                <div className="flex justify-between text-zinc-700">
                  <span>Diskon:</span>
                  <span>- {formatCurrency(createdOrder?.discount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>PB1 Restoran (10%):</span>
                <span>{formatCurrency(createdOrder?.tax || 0)}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm border-t border-zinc-300">
                <span>TOTAL AKHIR:</span>
                <span>{formatCurrency(createdOrder?.total || 0)}</span>
              </div>
              {completedTx?.change !== undefined && completedTx.change > 0 && (
                <div className="flex justify-between text-zinc-700 pt-0.5">
                  <span>Kembalian Tunai:</span>
                  <span className="font-bold">{formatCurrency(completedTx.change)}</span>
                </div>
              )}
            </div>

            <div className="text-center pt-4 text-[10px] text-zinc-500">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p>Wi-Fi: PrazSpace-Guest | Password: ngopisantai</p>
            </div>
          </div>

          <DialogFooter className="sm:justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrintReceipt}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Cetak Struk Thermal
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsReceiptModalOpen(false);
                setCreatedOrder(null);
                setCompletedTx(null);
              }}
              className="gap-2 bg-primary font-bold"
            >
              <RotateCcw className="h-4 w-4" />
              Pesanan Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
