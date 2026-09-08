"use client";

import * as React from "react";
import { User, UserPlus, Check } from "lucide-react";
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

export interface CustomerOption {
  id: string;
  name: string;
  phone?: string | null;
}

interface CustomerSelectorProps {
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string | null, name?: string) => void;
}

export function CustomerSelector({
  selectedCustomerId,
  onSelectCustomer,
}: CustomerSelectorProps) {
  const [customers, setCustomers] = React.useState<CustomerOption[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Form states
  const [newName, setNewName] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function loadCustomers() {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (res.ok) setCustomers(data.customers || []);
    } catch (err) {
      console.error("Gagal memuat pelanggan:", err);
    }
  }

  React.useEffect(() => {
    loadCustomers();
  }, []);

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, phone: newPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat pelanggan.");

      setCustomers((prev) => [data.customer, ...prev]);
      onSelectCustomer(data.customer.id, data.customer.name);
      setIsDialogOpen(false);
      setNewName("");
      setNewPhone("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-1.5 pb-2 border-b border-border/60">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-primary" />
          Pelanggan
        </span>
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          <UserPlus className="h-3 w-3" />
          + Pelanggan Baru
        </button>
      </div>

      <select
        value={selectedCustomerId || ""}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) {
            onSelectCustomer(null, "Pelanggan Walk-In");
          } else {
            const found = customers.find((c) => c.id === val);
            onSelectCustomer(val, found?.name);
          }
        }}
        className="flex h-9 w-full rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">Pelanggan Walk-In (Umum)</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} {c.phone ? `(${c.phone})` : ""}
          </option>
        ))}
      </select>

      {/* Quick Add Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-base">Daftar Pelanggan Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Simpan kontak pelanggan untuk program loyalitas cafe.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCustomer} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Nama</label>
              <Input
                type="text"
                placeholder="Nama pelanggan"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Nomor WhatsApp / HP</label>
              <Input
                type="tel"
                placeholder="08123456789"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
