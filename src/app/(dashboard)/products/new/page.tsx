"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UtensilsCrossed,
  Image as ImageIcon,
  Save,
  AlertCircle,
  Coffee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface CategoryOption {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [price, setPrice] = React.useState<number | "">("");
  const [categoryId, setCategoryId] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories?active=true");
        const data = await res.json();
        if (res.ok && data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      }
    }
    loadCategories();
  }, []);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!price || Number(price) <= 0) {
      setError("Harga jual harus lebih besar dari Rp 0.");
      return;
    }

    if (!categoryId) {
      setError("Silakan pilih kategori menu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          price: Number(price),
          categoryId,
          imageUrl: imageUrl.trim() || undefined,
          description: description.trim() || undefined,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menambahkan menu baru.");
      }

      router.push("/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/70">
        <Link href="/products">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Tambah Menu Baru
          </h1>
          <p className="text-xs text-muted-foreground">
            Daftarkan produk makanan atau minuman ke dalam sistem POS cafe.
          </p>
        </div>
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
            <CardDescription>
              Detail produk yang akan ditampilkan kepada kasir di layar POS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nama Menu
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Iced Salted Caramel Latte"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(generateSlug(e.target.value));
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Slug Identifikasi (Sistem)
                </label>
                <Input
                  type="text"
                  placeholder="iced-salted-caramel-latte"
                  className="font-mono text-xs"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
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
                  {price !== "" && (
                    <span className="text-xs font-bold font-mono text-primary">
                      {formatCurrency(price)}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  placeholder="Contoh: 32000"
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
                placeholder="Tuliskan komposisi atau profil rasa menu..."
                className="flex w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media and Status */}
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
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Gunakan URL gambar publik (misal Unsplash) dengan resolusi persegi/landscape.
              </p>
            </div>

            {/* Image Preview */}
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
                id="isActiveProduct"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label
                htmlFor="isActiveProduct"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Menu Aktif & Langsung Tersedia untuk Kasir
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
            {isSubmitting ? "Menyimpan Menu..." : "Simpan Menu"}
          </Button>
        </div>
      </form>
    </div>
  );
}
