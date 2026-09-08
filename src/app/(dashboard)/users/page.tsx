"use client";

import * as React from "react";
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  History,
  Pencil,
  KeyRound,
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
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "CASHIER";
  isActive: boolean;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Form states (Create)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"OWNER" | "ADMIN" | "CASHIER">("CASHIER");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Form states (Edit / Reset Password)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserItem | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editRole, setEditRole] = React.useState<"OWNER" | "ADMIN" | "CASHIER">("CASHIER");
  const [editPassword, setEditPassword] = React.useState("");
  const [isEditSubmitting, setIsEditSubmitting] = React.useState(false);
  const [editFormError, setEditFormError] = React.useState<string | null>(null);

  async function fetchUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memuat daftar pengguna.");
      }
      setUsers(data.users);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat pengguna.");
      }

      setIsDialogOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("CASHIER");
      await fetchUsers();
      router.refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: boolean) {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengubah status.");
      }

      await fetchUsers();
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status.");
    }
  }

  function openEditDialog(user: UserItem) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword("");
    setEditFormError(null);
    setIsEditDialogOpen(true);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setEditFormError(null);
    setIsEditSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editName,
          email: editEmail,
          role: editRole,
          password: editPassword.trim() ? editPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui data staf.");
      }

      setIsEditDialogOpen(false);
      setEditingUser(null);
      await fetchUsers();
      router.refresh();
    } catch (err: unknown) {
      setEditFormError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsEditSubmitting(false);
    }
  }

  function getRoleBadge(userRole: string) {
    switch (userRole) {
      case "OWNER":
        return <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30">Owner</Badge>;
      case "ADMIN":
        return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">Admin / Manager</Badge>;
      default:
        return <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Kasir</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Manajemen Staf & Pengguna
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola hak akses pengguna, kasir, dan audit peran sistem Praz Space.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" />
              Tambah Akun Staf
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Akun Staf Baru</DialogTitle>
              <DialogDescription>
                Akun baru akan memiliki akses sesuai peran yang ditentukan.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Contoh: Rian Pratama"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="nama@prazspace.cafe"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kata Sandi Awal</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Peran (Role)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("CASHIER")}
                    className={`rounded-lg border p-2.5 text-xs font-semibold text-center transition-all ${
                      role === "CASHIER"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    Kasir (POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`rounded-lg border p-2.5 text-xs font-semibold text-center transition-all ${
                      role === "ADMIN"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    Admin / Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("OWNER")}
                    className={`rounded-lg border p-2.5 text-xs font-semibold text-center transition-all ${
                      role === "OWNER"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    Owner
                  </button>
                </div>
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
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Edit Staf & Reset Password */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" />
                Edit Akun Staf
              </DialogTitle>
              <DialogDescription>
                Ubah nama, email, peran akses, atau reset kata sandi staf jika terjadi lupa sandi.
              </DialogDescription>
            </DialogHeader>

            {editFormError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editFormError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Nama staf"
                    className="pl-9"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="email@prazspace.cafe"
                    className="pl-9"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Peran (Role)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole("CASHIER")}
                    className={`rounded-lg border p-2.5 text-xs font-semibold text-center transition-all ${
                      editRole === "CASHIER"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    Kasir (POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole("ADMIN")}
                    className={`rounded-lg border p-2.5 text-xs font-semibold text-center transition-all ${
                      editRole === "ADMIN"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    Admin / Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole("OWNER")}
                    className={`rounded-lg border p-2.5 text-xs font-semibold text-center transition-all ${
                      editRole === "OWNER"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    Owner
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg border border-border/80 bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    Kata Sandi Baru
                  </label>
                  <span className="text-[11px] text-muted-foreground font-medium">Opsional</span>
                </div>
                <div className="relative pt-1">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Kosongkan jika tidak ingin diubah"
                    className="pl-9 bg-background"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">
                  💡 Gunakan kolom ini jika staf lupa kata sandi. Minimal 6 karakter.
                </p>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isEditSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isEditSubmitting}>
                  {isEditSubmitting ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Akun Terdaftar</CardTitle>
          <CardDescription>
            Seluruh data pengguna diambil secara langsung dari database Supabase PostgreSQL.
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
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Tidak ada pengguna ditemukan.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Staf</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Pesanan Ditangani</TableHead>
                  <TableHead>Terdaftar Sejak</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-foreground">
                      {u.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {u.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                          <XCircle className="h-3.5 w-3.5" />
                          Nonaktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u._count.orders} Pesanan
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(u)}
                          className="h-8 text-xs gap-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          Edit
                        </Button>
                        {u.role !== "OWNER" && (
                          <Button
                            variant={u.isActive ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                            className="h-8 text-xs"
                          >
                            {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        )}
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
