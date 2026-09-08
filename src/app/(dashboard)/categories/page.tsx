"use client";

import * as React from "react";
import {
  Layers,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FolderOpen,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: {
    products: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  async function fetchCategories() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat kategori.");
      setCategories(data.categories);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchCategories();
  }, []);

  function handleOpenCreate() {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setIsActive(true);
    setFormError(null);
    setIsDialogOpen(true);
  }

  function handleOpenEdit(cat: CategoryItem) {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIsActive(cat.isActive);
    setFormError(null);
    setIsDialogOpen(true);
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, isActive }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memperbarui kategori.");
      } else {
        // Create
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, isActive }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal membuat kategori.");
      }

      setIsDialogOpen(false);
      await fetchCategories();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(cat: CategoryItem) {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengubah status kategori.");
      }
      await fetchCategories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Kategori Menu Cafe
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola klasifikasi menu produk untuk kemudahan pemesanan di terminal POS.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Dialog Create / Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Ubah Kategori Menu" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              Kategori menentukan filter utama pada antarmuka kasir dan laporan penjualan.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Kategori
              </label>
              <Input
                type="text"
                placeholder="Contoh: Signature Drink"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCategory) {
                    setSlug(generateSlug(e.target.value));
                  }
                }}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Slug URL (Sistem)
              </label>
              <Input
                type="text"
                placeholder="signature-drink"
                className="font-mono text-xs"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-foreground cursor-pointer">
                Kategori Aktif & Ditampilkan di Kasir
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Kategori Terdaftar</CardTitle>
          <CardDescription>
            Kategori yang berstatus non-aktif tidak akan muncul di layar kasir POS.
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
            <div className="space-y-2 py-4">
              <div className="h-10 w-full rounded-md bg-muted/60 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-muted/60 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-muted/60 animate-pulse" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Belum ada kategori menu. Klik &ldquo;Tambah Kategori&rdquo; untuk memulai.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Slug Identifikasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jumlah Menu Terkait</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <span>{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {cat.slug}
                    </TableCell>
                    <TableCell>
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                          <XCircle className="h-3.5 w-3.5" />
                          Nonaktif / Arsip
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat._count.products} Menu
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(cat)}
                          className="h-8 gap-1 text-xs"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Ubah
                        </Button>
                        <Button
                          variant={cat.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleStatus(cat)}
                          className="h-8 text-xs"
                        >
                          {cat.isActive ? "Arsipkan" : "Aktifkan"}
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
