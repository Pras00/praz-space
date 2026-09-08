"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Archive,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface CategoryOption {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [originalPrice, setOriginalPrice] = React.useState<number>(0);
  const [price, setPrice] = React.useState<number | "">("");
  const [categoryId, setCategoryId] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories?active=false"),
          fetch(`/api/products/${productId}`),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (!prodRes.ok) throw new Error(prodData.message || "Gagal memuat detail menu.");

        setCategories(catData.categories || []);

        const p = prodData.product;
        setName(p.name);
        setSlug(p.slug);
        setOriginalPrice(Number(p.price));
        setPrice(Number(p.price));
        setCategoryId(p.categoryId);
        setImageUrl(p.imageUrl || "");
        setDescription(p.description || "");
        setIsActive(p.isActive);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) loadData();
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!price || Number(price) <= 0) {
      setError("Harga jual harus lebih besar dari Rp 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          price: Number(price),
          categoryId,
          imageUrl: imageUrl.trim() || null,
          description: description.trim() || null,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui menu.");
      }

      router.push("/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive() {
    if (!confirm("Arsipkan menu ini? Menu tidak akan lagi muncul di terminal kasir.")) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal mengarsipkan menu.");
      router.push("/products");
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengarsipkan menu.");
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto py-12">
        <div className="h-8 w-48 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-64 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  const isPriceChanged = Number(price) !== originalPrice && price !== "";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-2 border-b border-border/70">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Ubah Menu: {name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Perubahan harga akan otomatis dicatat pada Audit Log sistem.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleArchive}
          className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
        >
          <Archive className="h-4 w-4" />
          Arsipkan Menu
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Utama Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nama Menu
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Slug Identifikasi (Sistem)
                </label>
                <Input
                  type="text"
                  className="font-mono text-xs"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Kategori
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Harga Jual (IDR)
                  </label>
                  {isPriceChanged && (
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      Sebelumnya: {formatCurrency(originalPrice)}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  min="1000"
                  step="500"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Deskripsi / Catatan Rasa (Opsional)
              </label>
              <textarea
                rows={3}
                className="flex w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto & Ketersediaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                URL Foto Menu
              </label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            {imageUrl && (
              <div className="flex items-center gap-4 rounded-xl border border-border/80 p-3 bg-muted/20">
                <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-card">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Pratinjau Foto Menu</p>
                  <p className="line-clamp-1 font-mono">{imageUrl}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveProductEdit"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label
                htmlFor="isActiveProductEdit"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Menu Aktif & Tersedia untuk Kasir
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/products">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Batal
            </Button>
          </Link>
          <Button type="submit" className="gap-2 shadow-sm" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
