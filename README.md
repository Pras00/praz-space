# ☕ PRAZ SPACE — Modern Cafe POS & Management System

<p align="center">
  <img src="public/icon.svg" alt="Praz Space Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Sistem Point of Sale (POS) & Manajemen Operasional Cafe Berstandar Komersial</strong><br>
  Dibangun dengan arsitektur modern Next.js App Router, Prisma ORM, PostgreSQL Supabase, dan Integrasi Midtrans Payment Gateway.
</p>

<p align="center">
  <a href="https://praz-space.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-praz--space.vercel.app-emerald?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-6.19-2d3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ecf8e?style=for-the-badge&logo=supabase" alt="Supabase" />
</p>

---

## 📌 Daftar Isi

1. [Tentang Praz Space](#-tentang-praz-space)
2. [Fitur Utama](#-fitur-utama)
3. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
4. [Akun Demo Bawaan](#-akun-demo-bawaan-default-credentials)
5. [Panduan Instalasi Cepat](#-panduan-instalasi-cepat-quick-start)
6. [Konfigurasi Environment (.env)](#-konfigurasi-environment-env)
7. [Panduan Simulasi Pembayaran QRIS](#-panduan-simulasi-pembayaran-qris)
8. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
9. [Daftar Perintah (Scripts)](#-daftar-perintah-scripts)
10. [Prinsip Desain & Keamanan Finansial](#-prinsip-desain--keamanan-finansial)

---

## 📖 Tentang Praz Space

**Praz Space** adalah aplikasi web Point of Sale (POS) dan manajemen cafe berbasis *cloud* yang dirancang untuk kecepatan operasional kasir, akurasi pembukuan finansial, dan kemudahan pemantauan bisnis bagi pemilik cafe. 

Sistem ini menerapkan prinsip **Zero-Trust Server Authority** di mana semua perhitungan harga, diskon, dan pajak PB1 (10%) dihitung dan divalidasi langsung oleh server database untuk mencegah manipulasi data dari sisi peramban klien.

> 🌐 **Coba Langsung**: Anda dapat mengakses versi live demo di [praz-space.vercel.app](https://praz-space.vercel.app).

---

## ✨ Fitur Utama

### 🛒 1. Terminal Kasir (Point of Sale)
- **Katalog Menu Interaktif**: Pemilihan kategori cepat (Kopi, Non-Kopi, Makanan, Camilan) serta pencarian nama menu secara instan.
- **Keranjang Belanja Real-Time**: Penyesuaian kuantitas, catatan pesanan khusus, dan kalkulasi subtotal otomatis.
- **Manajemen Pelanggan**: Dukungan pesanan untuk pelanggan *Walk-In* maupun pelanggan tetap yang terdaftar.
- **Diskon Fleksibel**: Penerapan persentase diskon promo secara instan.
- **Kalkulator Pembayaran Tunai**: Fitur uang pas serta tombol nominal uang pecahan rekomendasi otomatis untuk menghitung uang kembalian secara tepat.
- **Cetak Struk Thermal 80mm**: Format struk belanja standar kasir cafe yang siap dicetak ke printer thermal Bluetooth/USB atau diunduh sebagai PDF.

### 📊 2. Dashboard Analitik Operasional
- **Grafik Tren Penjualan 7 Hari**: Visualisasi omset dan volume pesanan dengan mode interaktif **Area Spline** dan **Bar Chart**.
- **Ringkasan KPI Utama**:
  - Pendapatan Hari Ini (Total nominal dari transaksi lunas)
  - Jumlah Pesanan (Selesai vs Menunggu)
  - Rata-rata Nilai Belanja (*Average Order Value* / AOV)
  - Akumulasi Total Transaksi Buku Besar
- **Peringkat Menu Terlaris**: 5 produk dengan jumlah penjualan tertinggi.
- **Distribusi Pembayaran**: Visualisasi perbandingan penerimaan pembayaran QRIS vs Uang Tunai.
- **Feed Transaksi Kasir Terkini**: Daftar penerimaan transaksi kasir yang diperbarui secara langsung.

### 📋 3. Manajemen Menu & Kategori
- **Katalog Produk**: Daftar menu lengkap dengan foto, nama, deskripsi, harga, dan kategori.
- **Tambah & Ubah Menu**: Formulir pendaftaran menu baru dengan *live preview*.
- **Status Ketersediaan**: Tombol sekali klik untuk menonaktifkan menu yang habis/stok kosong.
- **Manajemen Kategori**: Menambah, mengubah nama, dan mengaktifkan kategori menu cafe.

### 📑 4. Buku Besar Transaksi & Laporan
- **Buku Besar Transaksi (*Immutable Ledger*)**: Setiap pembayaran yang berhasil dicatat permanen dan tidak dapat dimanipulasi atau dihapus sembarangan.
- **Laporan Penjualan per Kategori**: Analisis kategori mana yang menjadi kontributor omset terbesar.
- **Cetak Laporan**: Fitur cetak ramah printer untuk kebutuhan pembukuan fisik.

### 🔐 5. Role-Based Access Control (RBAC)
Sistem memiliki 3 tingkat hak akses dengan perlindungan berlapis di sisi server:
- **OWNER**: Akses tanpa batas ke seluruh modul, termasuk manajemen akun staf (`/users`) dan pengaturan cafe (`/settings`).
- **ADMIN / MANAGER**: Mengelola menu produk, kategori, melihat laporan keuangan, dan memantau dashboard.
- **CASHIER**: Fokus pada operasional kasir (`/pos`), riwayat pesanan (`/orders`), dan cetak struk belanja. Upaya akses ke halaman manajerial akan secara otomatis dialihkan kembali ke POS.

### 📱 6. Desain Responsif & Kinerja Tinggi
- **Mobile & Tablet Friendly**: Tata letak adaptif dengan drawer navigasi yang menutup otomatis saat berpindah halaman.
- **Instant Client Caching**: Menggunakan `sessionStorage` cerdas dengan *background revalidation* untuk transisi halaman berkecepatan 0 milidetik.
- **Error Boundary**: Penanganan galat tingkat komponen untuk memastikan aplikasi tidak *crash* atau blank saat terjadi kendala jaringan seluler.
- **Mode Gelap / Terang**: Dukungan tema *Dark Mode* dan *Light Mode* bawaan.

---

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi | Kegunaan |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server Components, Route Handlers, dan Client Interactivity |
| **Bahasa** | TypeScript (Strict Mode) | Keamanan tipe data end-to-end |
| **Styling** | Tailwind CSS v4 & Lucide Icons | Antarmuka responsif modern & ikonografi |
| **UI Primitives** | Radix UI / shadcn/ui | Komponen dialog, dropdown, tabs, dan tooltip yang aksesibel |
| **Database** | PostgreSQL via Supabase | Penyimpanan data relasional dengan pooling connection |
| **ORM** | Prisma ORM 6.19 | Pemetaan skema database dan *type-safe query client* |
| **Autentikasi** | Stateless JWT via `jose` | Sesi terenkripsi dalam HTTP-Only, Secure, SameSite cookie |
| **Keamanan** | `bcryptjs` & Zod | Hashing kata sandi dan validasi data input skema |
| **Payment Gateway** | Midtrans Core & Snap API | Pembayaran QRIS / E-Wallet dengan verifikasi SHA-512 |

---

## 👤 Akun Demo Bawaan (Default Credentials)

Untuk mencoba web app ini secara instan, Anda dapat menggunakan akun yang telah disediakan pada berkas seeding database:

| Peran (Role) | Email | Kata Sandi | Cakupan Akses |
| :--- | :--- | :--- | :--- |
| **OWNER** | `owner@prazspace.cafe` | `password123` | Seluruh Modul, Staf, Pengaturan |
| **ADMIN** | `admin@prazspace.cafe` | `password123` | Dashboard, Produk, Kategori, Laporan |
| **CASHIER 1** | `cashier@prazspace.cafe` | `password123` | Terminal POS & Riwayat Pesanan |
| **CASHIER 2** | `cashier2@prazspace.cafe` | `password123` | Terminal POS & Riwayat Pesanan |

> 💡 *Di halaman login, tersedia tombol pintas demo untuk mengisi kredensial tersebut secara otomatis hanya dengan sekali klik.*

---

## 🚀 Panduan Instalasi Cepat (Quick Start)

Pastikan komputer Anda telah terpasang **Node.js versi 20+** atau yang lebih baru.

### 1. Kloning Repository
```bash
git clone https://github.com/Pras00/praz-space.git
cd praz-space
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Siapkan Environment Variables
Salin template konfigurasi:
```bash
cp .env.example .env
```
Buka berkas `.env` dan masukkan konfigurasi database serta kredensial Anda (lihat panduan konfigurasi di bawah).

### 4. Sinkronkan Skema Database & Lakukan Seeding
Jalankan perintah Prisma untuk membuat tabel di database dan mengisi data contoh cafe (menu, kategori, kasir, dan riwayat pesanan):
```bash
# Sinkronkan skema database
npx prisma db push

# Eksekusi data seed bawaan
npx prisma db seed
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban Anda dan kunjungi **`http://localhost:3000`**. Anda akan diarahkan ke halaman login dan dapat langsung mencoba akun demo yang tersedia.

---

## ⚙️ Konfigurasi Environment (`.env`)

Berikut adalah variabel lingkungan yang diperlukan pada berkas `.env`:

```env
# 1. DATABASE (PostgreSQL / Supabase)
# DATABASE_URL: Menggunakan connection pooler (port 6543 pada Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# DIRECT_URL: Koneksi langsung ke database untuk migrasi skema Prisma (port 5432 pada Supabase)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

# 2. AUTENTIKASI (JWT SECRET)
# Token rahasia minimal 32 karakter acak (buat via: openssl rand -hex 32)
AUTH_SECRET="a58c4f4f1375b93d9410c3cd02841da645f722e27f184f427bc823e2d72677b3"

# 3. MIDTRANS PAYMENT GATEWAY
# Dapatkan dari Dashboard Midtrans (Settings > Access Keys)
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxxxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxxxxxx"
MIDTRANS_IS_PRODUCTION="false"

# 4. BASE URL APLIKASI
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 💳 Panduan Simulasi Pembayaran QRIS

Untuk memudahkan pengujian pembayaran di lingkungan lokal tanpa perlu menyiapkan webhook tunneling (seperti Ngrok):

1. Masuk sebagai **Kasir** atau **Owner** via `/login`.
2. Buka menu **POS / Kasir** (`/pos`).
3. Pilih beberapa menu minuman atau makanan ke keranjang, lalu klik **"Proses Pembayaran"**.
4. Pada modal pembayaran, pilih tab **"QRIS / Midtrans"**.
5. Klik tombol hijau **"Simulasi Bayar QRIS Berhasil"**.
6. Sistem akan otomatis memproses transaksi seolah-olah mendapat sinyal *Settlement* dari Midtrans, pesanan berubah menjadi `PAID`, buku besar transaksi tercatat, dan dialog cetak struk thermal akan langsung terbuka!

---

## 📁 Struktur Direktori Proyek

```text
praz-space/
├── prisma/
│   ├── schema.prisma            # Skema entitas Prisma (User, Product, Order, Transaction, dll.)
│   └── seed.ts                  # Data awal menu cafe, akun staf, dan transaksi contoh
├── public/
│   ├── icon.svg                 # Logo vektor Praz Space
│   └── favicon.ico              # Favicon web
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/           # Halaman login dengan tombol demo instan
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx       # Layout utama dengan validasi sesi & AppShell
│   │   │   ├── error.tsx        # Error boundary penanganan galat area dashboard
│   │   │   ├── dashboard/       # Halaman ringkasan analitik & grafik tren penjualan
│   │   │   ├── pos/             # Terminal kasir POS 2 kolom responsif
│   │   │   ├── orders/          # Riwayat pesanan & detail struk belanja
│   │   │   ├── products/        # Katalog & penambahan menu cafe
│   │   │   ├── categories/      # Manajemen kategori produk
│   │   │   ├── transactions/    # Jurnal buku besar transaksi keuangan
│   │   │   ├── customers/       # Direktori data pelanggan
│   │   │   ├── reports/         # Rekapitulasi laporan operasional & ekspor
│   │   │   ├── users/           # Manajemen staf & peran (Khusus Owner)
│   │   │   └── settings/        # Pengaturan cafe & konfigurasi gateway
│   │   ├── api/                 # Endpoint RESTful Next.js Route Handlers
│   │   ├── global-error.tsx     # Error boundary tingkat akar peramban
│   │   ├── layout.tsx           # Root layout dengan konfigurasi font & theme
│   │   └── globals.css          # Desain tema Tailwind CSS v4
│   ├── components/
│   │   ├── dashboard/           # SalesTrendChart (Area Spline & Bar Chart)
│   │   ├── layout/              # AppShell, Navbar, Sidebar, Logo, ThemeToggle
│   │   ├── pos/                 # Komponen antarmuka kasir & thermal receipt
│   │   └── ui/                  # Komponen shadcn/ui
│   ├── lib/
│   │   ├── auth/                # JWT session signer, verifier, dan password hasher
│   │   ├── db/                  # Prisma singleton client instance
│   │   ├── payments/            # Midtrans Snap client & SHA-512 verifier
│   │   ├── permissions/         # Guard RBAC berbasis peran
│   │   └── utils.ts             # Formatter Rupiah, tanggal lokal, generator nomor seri
│   └── services/                # Layer logika bisnis & query database terisolasi
├── .env.example                 # Contoh variabel lingkungan
├── package.json                 # Dependensi & skrip proyek
└── README.md                    # Dokumentasi lengkap proyek
```

---

## 📜 Daftar Perintah (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server lokal Next.js di `http://localhost:3000` |
| `npm run build` | Melakukan kompilasi build produksi Next.js |
| `npm run start` | Menjalankan build produksi yang telah dikompilasi |
| `npm run lint` | Menjalankan ESLint untuk pemeriksaan kode |
| `npx prisma db push` | Menyinkronkan perubahan skema `schema.prisma` ke database |
| `npx prisma db seed` | Menjalankan skrip seeding data contoh cafe |
| `npx prisma studio` | Membuka GUI interaktif Prisma untuk melihat dan mengedit data database |

---

## 🛡️ Prinsip Desain & Keamanan Finansial

1. **Server-Side Pricing Authority**:
   Klien hanya mengirimkan pasangan `{ productId, quantity }`. Nilai rupiah subtotal, diskon, dan pajak PB1 (10%) dihitung seutuhnya oleh server berdasarkan data terkini di database Supabase.
2. **Snapshot Harga Historis**:
   Setiap pesanan mengabadikan snapshot `unitPrice` dan `productNameSnapshot`. Apabila harga menu diubah di kemudian hari, nilai transaksi masa lampau tetap presisi dan tidak berubah.
3. **Idempotensi Webhook Gateway**:
   Notifikasi pembayaran dari Midtrans diverifikasi menggunakan signature kriptografis `SHA-512`. Jika webhook terkirim berulang kali oleh gateway, status tidak akan memicu duplikasi transaksi.
4. **Buku Besar Transaksi Permanen**:
   Tabel `Transaction` berfungsi sebagai jurnal akuntansi resmi yang merekam mutasi pembayaran lunas secara permanen.

---

<p align="center">
  Dibuat dengan ❤️ untuk <strong>Praz Space Cafe</strong>.<br>
  © 2026 Praz Space. Seluruh hak cipta dilindungi.
</p>
