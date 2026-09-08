# PRAZ SPACE — Modern Cafe Point of Sale (POS) & Management System

> Production-grade, high-integrity Point of Sale and Cafe Management Web Application built for **Praz Space**.

---

## 1. Project Overview

**Praz Space** adalah sistem Point of Sale (POS) dan manajemen operasional cafe modern yang dirancang dengan standar komersial SaaS. Sistem ini menghubungkan operasional meja kasir, manajemen katalog menu cafe, pemrosesan transaksi multi-metode (Tunai & Midtrans QRIS/E-Wallet), pembukuan transaksi *immutable*, serta pemantauan analitik pendapatan harian secara *real-time*.

Aplikasi ini dibangun dengan prinsip **Zero-Trust Pricing** dan **Zero-Fake Functionality** — seluruh data kalkulasi harga, pajak PB1, otorisasi peran, dan pelaporan keuangan diproses serta divalidasi langsung oleh server terhadap database PostgreSQL Supabase.

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router, Server Components & Server Actions)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 & CSS Variables (`globals.css`)
- **UI Components**: shadcn/ui primitives (`@radix-ui/react-*`, `class-variance-authority`)
- **Icons**: Lucide React
- **Theme**: `next-themes` (Dark Mode & Light Mode support)

### Backend & Database
- **Runtime**: Node.js v24
- **Database**: PostgreSQL (Supabase AWS Sydney Connection Pooler)
- **ORM**: Prisma ORM v6.19.3
- **Validation**: Zod v3
- **Authentication**: Stateless JWT via `jose` dalam cookie `HttpOnly`, `SameSite=Lax`, `Secure`
- **Password Hashing**: `bcryptjs` (Salt Rounds 10)
- **Payment Gateway**: Midtrans Snap & Core API (QRIS, GoPay, Bank Transfer) dengan verifikasi signature kriptografis SHA-512

---

## 3. System Architecture & Directory Structure

```
praz-space/
├── prisma/
│   ├── schema.prisma            # Skema lengkap: User, Category, Product, Customer, Order, OrderItem, Payment, Transaction, AuditLog
│   └── seed.ts                  # Skrip seed realistis menu cafe, kasir, dan transaksi contoh
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/           # Halaman login dengan kartu demo instan
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # Layout pembungkus AppShell dan sesi
│   │   │   ├── dashboard/       # KPI metrik harian, tren omset 7 hari, menu terlaris
│   │   │   ├── pos/             # Terminal POS kasir interaktif 2 kolom
│   │   │   ├── products/        # Katalog menu, filter kategori, tambah & edit menu
│   │   │   │   ├── [id]/        # Edit produk & pelacakan perubahan harga
│   │   │   │   └── new/         # Pendaftaran menu baru dengan live preview
│   │   │   ├── categories/      # Manajemen kategori cafe & toggle aktif
│   │   │   ├── orders/          # Riwayat pesanan & detail pesanan individual
│   │   │   │   └── [id]/        # Detail pesanan & struk belanja
│   │   │   ├── transactions/    # Buku besar transaksi keuangan (immutable ledger)
│   │   │   │   └── [id]/        # Rekonsiliasi transaksi per pembayaran
│   │   │   ├── customers/       # Direktori pelanggan cafe
│   │   │   ├── reports/         # Laporan performa per kategori & menu
│   │   │   ├── users/           # Manajemen akun staf & peran (Owner only)
│   │   │   └── settings/        # Pengaturan cafe, pajak PB1, status Midtrans
│   │   └── api/
│   │       ├── auth/            # /login dan /logout handler
│   │       ├── categories/      # API Kategori CRUD
│   │       ├── customers/       # API Pelanggan
│   │       ├── orders/          # API Pesanan (perhitungan harga server-side)
│   │       ├── payments/        # /cash, /create-snap, /simulate, /midtrans/notification (Webhook)
│   │       ├── products/        # API Produk dengan search & filtering
│   │       ├── reports/         # API Agregasi dashboard & kategori
│   │       ├── transactions/    # API Buku besar transaksi
│   │       └── users/           # API Pengguna staf
│   ├── components/
│   │   ├── layout/              # Sidebar, Navbar, AppShell, Logo, ThemeToggle
│   │   ├── pos/                 # ProductCard, CartItemRow, CustomerSelector, OrderSummaryPanel, PaymentModal
│   │   ├── orders/              # ThermalReceipt (layout 80mm standar cetak thermal)
│   │   └── ui/                  # Button, Card, Input, Badge, Table, Dialog, Dropdown, Select, Tabs, etc.
│   ├── lib/
│   │   ├── auth/                # JWT session, bcrypt hashing, cookie manager
│   │   ├── db/                  # Prisma singleton client
│   │   ├── payments/            # Midtrans Snap client & SHA-512 verifier
│   │   ├── permissions/         # Server-side RBAC guards
│   │   ├── validations/         # Zod schemas (auth, product, order, user)
│   │   └── utils/               # Format Rupiah (IDR), format tanggal, generator nomor transaksi
│   ├── services/                # Layer logika bisnis terisolasi
│   │   ├── category.service.ts
│   │   ├── customer.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── product.service.ts
│   │   ├── report.service.ts
│   │   ├── transaction.service.ts
│   │   └── user.service.ts
│   └── middleware.ts            # Proteksi rute otomatis & pengalihan peran
```

---

## 4. Role-Based Access Control (RBAC)

| Modul / Fitur | OWNER | ADMIN / MANAGER | CASHIER |
| :--- | :---: | :---: | :---: |
| **Terminal Kasir POS (`/pos`)** | Ya | Ya | Ya |
| **Riwayat Pesanan (`/orders`)** | Ya | Ya | Ya |
| **Cetak Struk Thermal** | Ya | Ya | Ya |
| **Katalog Produk (`/products`)** | Ya | Ya | Dibatalkan (Dialihkan ke POS) |
| **Kategori Menu (`/categories`)** | Ya | Ya | Dibatalkan (Dialihkan ke POS) |
| **Buku Besar Transaksi (`/transactions`)** | Ya | Ya | Dibatalkan (Dialihkan ke POS) |
| **Laporan Omset (`/reports`)** | Ya | Ya | Dibatalkan (Dialihkan ke POS) |
| **Dashboard Operasional (`/dashboard`)** | Ya | Ya | Dibatalkan (Dialihkan ke POS) |
| **Manajemen Staf (`/users`)** | Ya | Dibatalkan (Dialihkan ke POS) | Dibatalkan (Dialihkan ke POS) |
| **Pengaturan Sistem (`/settings`)** | Ya | Dibatalkan (Dialihkan ke POS) | Dibatalkan (Dialihkan ke POS) |
| **Pembatalan / Refund Pesanan** | Ya | Ya | Dilarang di Server |

---

## 5. Akun Pengguna Bawaan (Default Seed Credentials)

Seluruh akun di bawah dapat langsung digunakan untuk login:

| Peran (Role) | Email Akun | Kata Sandi | Akses Utama |
| :--- | :--- | :--- | :--- |
| **OWNER** | `owner@prazspace.cafe` | `password123` | Seluruh Modul, Manajemen Staf & Pengaturan |
| **ADMIN** | `admin@prazspace.cafe` | `password123` | Dashboard, Produk, Kategori, Laporan, Order |
| **CASHIER** | `cashier@prazspace.cafe` | `password123` | Khusus Terminal POS & Riwayat Pesanan |
| **CASHIER 2** | `cashier2@prazspace.cafe` | `password123` | Terminal POS Shift Malam |

---

## 6. Aturan Bisnis Finansial Krusial

1. **Zero-Trust Client Pricing**:
   Browser client dilarang keras menentukan subtotal atau harga produk. Request checkout hanya mengirimkan ID produk dan kuantitas. Server membaca harga asli dari database Supabase, menghitung ulang subtotal, diskon, dan pajak PB1 (10%).
2. **Ketersediaan Produk**:
   Produk berstatus `isActive: false` (habis/nonaktif) dicegah secara mutlak oleh server saat checkout diproses.
3. **Snapshot Harga Historis (`OrderItem`)**:
   Setiap baris item pesanan menyimpan snapshot `unitPrice` dan `productNameSnapshot`. Jika harga menu diubah di kemudian hari, nilai transaksi masa lalu tetap valid dan tidak berubah.
4. **Idempotensi Webhook Midtrans**:
   Notifikasi webhook yang dikirim ulang oleh Midtrans tidak akan membuat catatan transaksi ganda pada database. Jika order sudah `PAID`, sistem mengabaikan pengulangan notifikasi dengan aman (HTTP 200).
5. **Buku Besar Transaksi Immutable**:
   Setiap pembayaran lunas dicatat pada tabel `Transaction` yang berdiri sendiri sebagai jurnal akuntansi resmi dan tidak dapat dihapus.

---

## 7. Panduan Instalasi & Menjalankan Aplikasi

### Kebutuhan Sistem
- **Node.js**: Versi 20 atau 24+
- **Database**: PostgreSQL (atau instance Supabase)

### Langkah Setup

1. **Clone repository dan install dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment (`.env`)**:
   Salin `.env.example` ke `.env` lalu sesuaikan kredensial Anda:
   ```env
   DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

   AUTH_SECRET="your-256-bit-cryptographic-random-string"

   MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxxxxxx"
   MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxxxxxx"
   MIDTRANS_IS_PRODUCTION="false"
   ```

3. **Sinkronisasi Skema Database**:
   ```bash
   npx prisma db push
   ```

4. **Eksekusi Seeding Data Awal Cafe**:
   ```bash
   npx prisma db seed
   ```

5. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:3000`.

6. **Kompilasi Build Produksi**:
   ```bash
   npm run build
   npm run start
   ```

---

## 8. Panduan Pengujian & Simulasi Midtrans

Saat pengujian lokal di lingkungan sandbox tanpa reverse proxy / ngrok:
1. Buka terminal POS di `/pos`.
2. Masukkan item menu ke keranjang belanja kasir.
3. Klik **"Proses Pembayaran"**.
4. Pada tab **QRIS / Midtrans**, kasir dapat menggunakan tombol **"Simulasi Bayar QRIS Berhasil"** untuk menyimulasikan notifikasi status `SETTLEMENT` dari gateway.
5. Pesanan akan langsung berubah status menjadi `PAID`, record `Transaction` tercatat, dan dialog struk thermal 80mm siap dicetak.

---

## 9. Troubleshooting

- **Error koneksi pooler database**: Pastikan password Supabase yang mengandung karakter khusus telah di-URL-encode dan port direct connection `5432` dapat dijangkau.
- **Session Expired**: Bersihkan cookie peramban `praz_space_session` dan login kembali via `/login`.
- **Prisma Client Missing**: Jalankan `npx prisma generate` untuk meregenerasi tipe TypeScript.

---

© 2026 Praz Space. Hak cipta dilindungi undang-undang.
