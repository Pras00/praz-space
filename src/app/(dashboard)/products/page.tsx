"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Tag,
  Coffee,
  Archive,
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
import { formatCurrency } from "@/lib/utils";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string | number;
  imageUrl: string | null;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    orderItems: number;
  };
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch categories
      const catRes = await fetch("/api/categories?active=false");
      const catData = await catRes.json();
      if (catRes.ok) {
        setCategories(catData.categories);
      }

      // 2. Fetch products with query
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory !== "all") params.set("categoryId", selectedCategory);
      if (statusFilter === "active") params.set("active", "true");
      if (statusFilter === "inactive") params.set("active", "false");

      const prodRes = await fetch(`/api/products?${params.toString()}`);
      const prodData = await prodRes.json();
      if (!prodRes.ok) throw new Error(prodData.message || "Gagal memuat produk.");

      setProducts(prodData.products);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, statusFilter]);

  async function handleToggleAvailability(productId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengubah ketersediaan.");
      }

      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status ketersediaan.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            Katalog Menu & Produk
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola varian menu, penyesuaian harga, ketersediaan kasir, dan gambar cafe.
          </p>
        </div>

        <Link href="/products/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Tambah Menu Baru
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama menu atau deskripsi..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() =>
                setStatusFilter(
                  statusFilter === "all"
                    ? "active"
                    : statusFilter === "active"
                    ? "inactive"
                    : "all"
                )
              }
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              Status:{" "}
              <span className="font-semibold text-foreground capitalize">
                {statusFilter === "all"
                  ? "Semua"
                  : statusFilter === "active"
                  ? "Tersedia"
                  : "Habis/Arsip"}
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* Product Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Daftar Menu ({products.length})
          </CardTitle>
          <CardDescription>
            Harga yang tercatat di bawah adalah harga resmi yang diverifikasi di server saat checkout.
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
              <div className="h-12 w-full rounded-md bg-muted/60 animate-pulse" />
              <div className="h-12 w-full rounded-md bg-muted/60 animate-pulse" />
              <div className="h-12 w-full rounded-md bg-muted/60 animate-pulse" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Tidak ada produk yang cocok dengan pencarian atau filter Anda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>Nama Menu</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Ketersediaan Kasir</TableHead>
                  <TableHead>Terjual</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell>
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-border/80 bg-muted/40 flex items-center justify-center">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Coffee className="h-5 w-5 text-muted-foreground/60" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {prod.name}
                      </div>
                      {prod.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                          {prod.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium text-xs">
                        {prod.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold font-mono text-foreground">
                      {formatCurrency(prod.price)}
                    </TableCell>
                    <TableCell>
                      {prod.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Tersedia
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                          <XCircle className="h-3.5 w-3.5" />
                          Habis / Nonaktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {prod._count.orderItems} Transaksi
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/products/${prod.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Ubah
                          </Button>
                        </Link>
                        <Button
                          variant={prod.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            handleToggleAvailability(prod.id, prod.isActive)
                          }
                          className="h-8 text-xs"
                          title={
                            prod.isActive
                              ? "Nonaktifkan / Set Habis"
                              : "Aktifkan Kembali"
                          }
                        >
                          {prod.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </div>
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
