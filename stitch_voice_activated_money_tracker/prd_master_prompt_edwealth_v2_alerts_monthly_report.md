# PRD & Technical Specification (V2): EdWealth Mobile App

## 1. Project Overview & Product Vision
**Product Name:** EdWealth  
**Platform:** Mobile Web / Hybrid Mobile App (PWA / Capacitor / React Native / Next.js)  
**Core Purpose:** Comprehensive Personal Wealth & Investment Tracker yang menggabungkan pencatatan kas harian (liquid cashflow), portofolio saham IDX (dengan cached price fetching), pelacakan pengeluaran pasti (fixed expenses), dan pendapatan pasif (passive income) dalam satu kesatuan perhitungan **Total Net Worth** yang aman, privat, dan offline-first.

---

## 2. Core Architecture & Tech Stack
- **Frontend:** Next.js (App Router) / React + Vite + Tailwind CSS + Lucide React + Plus Jakarta Sans font.
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Row Level Security, Edge Functions & Cron triggers).
- **Data Fetching & State:** TanStack Query (React Query) & Zustand (offline caching).
- **Export & Report Engine:** `@react-pdf/renderer` atau `jspdf` + `html2canvas` (client-side PDF generation), SheetJS (`xlsx`) untuk ekspor CSV/Excel.
- **Stock Price Data Source:** Yahoo Finance API (`yahoo-finance2` via Supabase Edge Function) atau GoAPI (IDX stocks).

---

## 3. Database Schema (Supabase PostgreSQL DDL Tambahan)

```sql
-- 1. PROFILES (Pengaturan notifikasi & preferensi laporan)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  currency text default 'IDR',
  monthly_budget numeric default 0,
  alert_budget_threshold integer default 80, -- Notif saat pengeluaran tembus 80%
  email_monthly_report boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. CASH ACCOUNTS (Rekening / Dompet Kas)
create table public.cash_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  account_name text not null, -- e.g. "BCA", "SeaBank", "Cash Dompet"
  balance numeric not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. TRANSACTIONS (Pencatatan Arus Kas Harian & Fixed Cost)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  account_id uuid references public.cash_accounts(id) on delete set null,
  title text not null,
  amount numeric not null,
  type text check (type in ('EXPENSE', 'INCOME', 'TRANSFER')),
  category text not null, -- "Makanan", "Tagihan Rutin", "Gaji", "Dividen"
  is_fixed_expense boolean default false,
  due_date integer, -- Tanggal jatuh tempo rutin (1-31)
  is_paid boolean default false, -- Status bayar untuk tagihan rutin
  transaction_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. STOCK PORTFOLIO (Portofolio Saham IDX)
create table public.stock_portfolio (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  ticker text not null, -- e.g. "BBCA", "BBRI", "ADRO", "ASII"
  lots integer not null check (lots > 0), -- 1 lot = 100 lembar
  avg_price numeric not null check (avg_price > 0),
  target_take_profit numeric, -- Alert TP
  target_cut_loss numeric, -- Alert CL
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. STOCK MARKET CACHE (Auto-fetched dari Yahoo Finance API)
create table public.stock_market_cache (
  ticker text primary key,
  current_price numeric not null,
  previous_close numeric,
  change_amount numeric,
  change_percentage numeric,
  last_updated timestamp with time zone default timezone('utc'::text, now())
);

-- 6. PASSIVE INCOMES (Sumber Pendapatan Pasif)
create table public.passive_incomes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  source_name text not null, -- e.g. "Dividen Saham BBCA", "Bunga Deposito", "SBN"
  amount numeric not null,
  frequency text default 'MONTHLY' check (frequency in ('MONTHLY', 'QUARTERLY', 'ANNUAL')),
  received_date date default current_date
);

-- 7. NOTIFICATIONS / SYSTEM ALERTS (Pusat Peringatan Finansial)
create table public.financial_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  type text check (type in ('BILL_DUE', 'BUDGET_OVERRUN', 'STOCK_PRICE', 'DIVIDEND_PAYOUT', 'MONTHLY_REPORT')),
  reference_id uuid, -- relasi ke id transaksi / saham jika ada
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. MONTHLY REPORTS (Arsip Laporan Otomatis Bulanan)
create table public.monthly_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  month_year text not null, -- e.g. "2026-11"
  total_income numeric not null,
  total_expense numeric not null,
  net_savings numeric not null,
  total_net_worth numeric not null,
  coverage_ratio numeric not null, -- Financial Freedom Index
  report_json jsonb not null, -- Detail ringkasan per kategori & portofolio
  generated_at timestamp with time zone default timezone('utc'::text, now())
);
```

---

## 4. Sistem Alert & Notifikasi Cerdas (Smart Alerts Engine)

Aplikasi memiliki **5 Jenis Alert Otomatis**:
1. **Pengingat Jatuh Tempo Tagihan Pasti (Due Date Bill Reminder):**
   - H-3, H-1, dan Hari H sebelum tanggal jatuh tempo (`due_date`) tagihan sewa kos, WiFi, listrik, asuransi yang statusnya masih `is_paid = false`.
2. **Peringatan Anggaran Boros (Budget Burn Rate Alert):**
   - Trigger jika total pengeluaran bulan berjalan sudah menyentuh 80% atau 100% dari target anggaran bulanan pengguna.
   - Peringatan run-rate: *"Pengeluaran harian rata-rata Anda Rp 250rb, diproyeksikan melebihi budget dalam 8 hari ke depan."*
3. **Saham TP / CL Alert (Take Profit & Stop Loss Alert):**
   - Notifikasi ketika harga saham terkini melampaui target jual atau turun di bawah batas toleransi rugi.
4. **Dividen & Passive Income Masuk (Dividend Payout Day):**
   - Reminder pencatatan saat jadwal dividen cum-date / payment date tiba.
5. **Peringatan Saldo Kas Kritis (Low Cash Balance Alert):**
   - Alert jika saldo kas likuid lebih kecil dari total pengeluaran pasti bulan ini.

---

## 5. Fitur Auto-Generate Laporan Bulanan (Monthly Report Engine)

1. **Auto-Run Setiap Akhir/Awal Bulan:**
   - Supabase Edge Function (Cron) atau background job di aplikasi yang merangkum transaksi bulan sebelumnya pada tanggal 1 setiap bulan.
2. **Isi Laporan Bulanan (Monthly Financial Health Recap):**
   - **Executive Summary:** Total Pemasukan vs Pengeluaran, Rasio Tabungan (Savings Rate %), Kenaikan/Penurunan Net Worth.
   - **Kategori Terboros (Top 3 Spending Categories):** Diagram pie visual kategori terbesar.
   - **Kinerja Investasi Saham:** Realized & Unrealized P/L saham bulan ini + akumulasi dividen yang diterima.
   - **Financial Freedom Index Update:** Apakah rasio pasif income Anda naik atau turun dibanding bulan lalu.
3. **Format Output:**
   - **Visual Story Recap di App:** Tampilan card ringkasan bulanan interaktif bergaya slide/recap.
   - **Download PDF / Excel:** 1-klik unduh rekap resmi untuk arsip pribadi atau pelaporan pajak.

---

## 6. Fitur Esensial Lain yang WAJIB Ada Sebelum Diberikan ke AI Builder

1. **Backup & Restore Data Lokal (Zero-Data-Lockin):**
   - Tombol *Export JSON Data* & *Import JSON Data* lokal. Jika koneksi cloud mati atau user ingin memindahkan data, data tetap 100% milik pengguna.
2. **Mode Privasi & Sensor Saldo (Incognito Balance Toggle):**
   - Tombol ikon mata di header untuk menyamarkan nominal (`Rp ••••••••`) saat membuka aplikasi di tempat umum/kereta.
3. **Quick Transfer Antar Akun (Internal Transfer):**
   - Pindah dana dari BCA ke SeaBank atau dari Kas ke Rekening Dana Nasabah (RDN) tanpa dihitung sebagai pengeluaran/expense baru.
4. **Multi-Currency / Kurs Simpanan (IDR & USD):**
   - Konversi otomatis kurs USD/IDR jika ada simpanan kas asing atau saham global.
5. **Search & Bulk Category Filter:**
   - Pencarian cepat histori mutasi berdasarkan nama merchant / keyword ("indomaret", "gofood", "dividen").

---

## 7. Master Prompt Tambahan untuk AI Builder

```markdown
Tolong implementasikan modul **Smart Alerts** dan **Auto Monthly Report** di aplikasi EdWealth:

1. **Tabel Database Tambahan:**
   - `financial_alerts`: Menyimpan log notifikasi (BILL_DUE, BUDGET_OVERRUN, STOCK_PRICE, MONTHLY_REPORT).
   - `monthly_reports`: Menyimpan arsip data JSON laporan per bulan.

2. **Cron Job / Trigger:**
   - Function pengecekan tagihan belum bayar (H-3 jatuh tempo).
   - Auto-generator ringkasan bulanan tiap tanggal 1: kalkulasi total income, total expense, savings rate, dan snapshot total net worth.

3. **Komponen Frontend:**
   - Dropdown / Lonceng Notifikasi di Header (`EdWealth Header`) yang menampilkan badge notif aktif.
   - Halaman Modal "Laporan Bulanan" dengan opsi Download PDF (menggunakan jspdf / react-pdf) dan visualisasi grafik sederhana.
   - Toggle tombol Sensor Saldo di Header (masking angka jadi bintang-bintang).
```
