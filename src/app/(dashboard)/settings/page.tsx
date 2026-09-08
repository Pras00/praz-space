"use client";

import * as React from "react";
import {
  Settings,
  Store,
  CreditCard,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Wifi,
  Receipt,
  Server,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile");

  // Store Profile State
  const [storeName, setStoreName] = React.useState("Praz Space");
  const [tagline, setTagline] = React.useState("Modern Specialty Coffee & Eatery");
  const [address, setAddress] = React.useState("Jl. Praz Space No. 1, Jakarta Selatan");
  const [phone, setPhone] = React.useState("0812-3456-7890");
  const [wifiSsid, setWifiSsid] = React.useState("PrazSpace-Guest");
  const [wifiPass, setWifiPass] = React.useState("ngopisantai");

  // Financial State
  const [taxPercent, setTaxPercent] = React.useState(10);
  const [isSaved, setIsSaved] = React.useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Pengaturan Sistem & Cafe
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola profil cafe, konfigurasi pajak restoran, status Midtrans, dan koneksi database.
          </p>
        </div>

        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5" />
          Akses Khusus Owner
        </Badge>
      </div>

      {isSaved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Pengaturan cafe berhasil disimpan secara lokal ke sesi aktif.</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="profile" className="gap-2 text-xs">
            <Store className="h-4 w-4" />
            Profil Cafe
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-2 text-xs">
            <Receipt className="h-4 w-4" />
            Pajak & Struk
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2 text-xs">
            <Server className="h-4 w-4" />
            Integrasi & Server
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CAFE PROFILE */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Usaha & Struk</CardTitle>
              <CardDescription>
                Detail ini akan otomatis dicetak pada kepala struk thermal kasir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Nama Cafe
                    </label>
                    <Input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Tagline / Slogan
                    </label>
                    <Input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Alamat Cafe
                    </label>
                    <Input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Nomor Telepon Kontak
                    </label>
                    <Input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/60">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Wifi className="h-3.5 w-3.5 text-primary" />
                      Nama Wi-Fi Tamu (SSID)
                    </label>
                    <Input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-primary" />
                      Password Wi-Fi
                    </label>
                    <Input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="gap-2 font-bold shadow-sm">
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: FINANCE & TAX */}
        <TabsContent value="finance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ketentuan Pajak & Pembulatan</CardTitle>
              <CardDescription>
                Kalkulasi pajak diterapkan secara otomatis oleh server saat kasir melakukan checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Pajak Restoran PB1 (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    disabled
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Standar tarif PB1 makanan dan minuman adalah 10% (terkunci di business logic server).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Mata Uang Transaksi
                  </label>
                  <Input type="text" value="IDR (Indonesian Rupiah - Rp)" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: INTEGRATIONS & SERVER */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Koneksi Payment Gateway Midtrans</CardTitle>
              <CardDescription>
                Status integrasi sistem pembayaran digital QRIS dan e-wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20">
                <div>
                  <p className="font-bold text-foreground">Environment Mode</p>
                  <p className="text-muted-foreground">Sandbox (Uji Coba Pengembang)</p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                  SANDBOX AKTIF
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20">
                <div>
                  <p className="font-bold text-foreground">Midtrans Server Key</p>
                  <p className="font-mono text-muted-foreground">SB-Mid-server-••••••••••••••••••••••••</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Terkonfigurasi di Server
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20">
                <div>
                  <p className="font-bold text-foreground">Webhook Endpoint</p>
                  <p className="font-mono text-muted-foreground">/api/payments/midtrans/notification</p>
                </div>
                <Badge variant="outline" className="font-mono">
                  SHA-512 SIGNATURE
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Database PostgreSQL Supabase</CardTitle>
              <CardDescription>
                Penyimpanan data relasional dan audit trail transaksi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20">
                <div>
                  <p className="font-bold text-foreground">Status Koneksi Supabase</p>
                  <p className="text-muted-foreground">AWS Sydney Pooler (aws-0-ap-southeast-2)</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Tersinkronisasi
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
