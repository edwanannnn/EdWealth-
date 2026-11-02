# PRD & Technical Specification (V3 - Final Edition): EdWealth Mobile App

## 1. Project Overview & Product Vision
**Product Name:** EdWealth  
**Platform:** Mobile Web / Hybrid Mobile App (PWA / Capacitor / React Native / Next.js) — Mobile-First (390px viewport standard).  
**Core Purpose:** Comprehensive Personal Wealth & Investment Tracker yang menggabungkan pencatatan kas harian (liquid cashflow), portofolio saham IDX (dengan cached price fetching & autocomplete emiten BEI), pelacakan pengeluaran pasti (fixed expenses), dan pendapatan pasif (passive income) dalam satu kesatuan perhitungan **Total Net Worth** yang aman, privat, dan offline-first.

---

## 2. Core Architecture & Tech Stack
- **Frontend:** Next.js (App Router) / React + Vite + Tailwind CSS + Lucide React + Plus Jakarta Sans typography.
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Row Level Security, Edge Functions & Cron Triggers).
- **Data Fetching & State:** TanStack Query (React Query) & Zustand (offline caching / optimistic updates).
- **Stock Price Data Source:** Yahoo Finance API (`yahoo-finance2` via Supabase Edge Function) atau GoAPI (IDX stocks).
- **Export & Report Engine:** `@react-pdf/renderer` / `jspdf` + `html2canvas` (client-side PDF generation), SheetJS (`xlsx`) untuk ekspor CSV/Excel.

---

## 3. Database Schema (Supabase PostgreSQL DDL - Final Master Schema)

```sql
-- 1. PROFILES (Pengaturan notifikasi, mata uang, dan sensor saldo)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  currency text default 'IDR',
  monthly_budget numeric default 0,
  alert_budget_threshold integer default 80, -- Trigger alert saat pengeluaran tembus 80%
  email_monthly_report boolean default true,
  hide_balance_default boolean default false, -- Mode sensor saldo aktif saat awal buka app
  default_buy_fee numeric default 0.15, -- Fee broker beli (%)
  default_sell_fee numeric default 0.25, -- Fee broker jual + pajak (%)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. CASH ACCOUNTS (Rekening Bank, RDN Broker, E-Wallet, Dompet Tunai)
create table public.cash_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  account_name text not null, -- e.g. "BCA Utama", "RDN Stockbit", "SeaBank", "Kas Tunai"
  account_type text default 'BANK' check (account_type in ('BANK', 'RDN', 'E_WALLET', 'CASH')),
  balance numeric not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. TRANSACTIONS (Pencatatan Arus Kas Masuk/Keluar, Fixed Expenses & Internal Transfer)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  account_id uuid references public.cash_accounts(id) on delete set null,
  destination_account_id uuid references public.cash_accounts(id) on delete set null, -- Untuk tipe TRANSFER
  title text not null,
  amount numeric not null,
  type text check (type in ('EXPENSE', 'INCOME', 'TRANSFER')),
  category text not null, -- "Makanan", "Tagihan Rutin", "Gaji", "Dividen", "Hasil Jual Saham"
  is_fixed_expense boolean default false,
  due_date integer, -- Tanggal jatuh tempo rutin (1-31)
  is_paid boolean default false, -- Status lunas untuk tagihan rutin bulan berjalan
  transaction_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. IDX STOCKS MASTER (Database Referensi Resmi Seluruh Emiten BEI / IDX)
create table public.idx_stocks_master (
  ticker text primary key, -- e.g. "BBCA", "BBRI", "BMRI", "CUAN", "BUMI", "TLKM"
  company_name text not null, -- e.g. "Bank Central Asia Tbk"
  sector text not null, -- "Financials", "Energy", "Basic Materials", dll.
  logo_url text,
  is_popular boolean default false -- Flag untuk saham LQ45 / Populer
);

-- 5. STOCK MARKET CACHE (Auto-fetched cache dari Yahoo Finance API)
create table public.stock_market_cache (
  ticker text primary key,
  current_price numeric not null,
  previous_close numeric,
  change_amount numeric,
  change_percentage numeric,
  last_updated timestamp with time zone default timezone('utc'::text, now())
);

-- 6. STOCK PORTFOLIO (Kepemilikan Saham Aktif User - Floating Position)
create table public.stock_portfolio (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  ticker text not null references public.idx_stocks_master(ticker),
  lots integer not null check (lots > 0), -- 1 lot = 100 lembar
  avg_price numeric not null check (avg_price > 0), -- Net avg buy price (inc. fee)
  target_take_profit numeric, -- Alert TP
  target_cut_loss numeric, -- Alert CL
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. STOCK TRADE HISTORY (Log Eksekusi Beli & Jual Saham - Realized Profit/Loss)
create table public.stock_trade_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  ticker text not null,
  action text check (action in ('BUY', 'SELL')),
  lots integer not null,
  price numeric not null,
  broker_fee numeric default 0,
  realized_pnl numeric default 0, -- Keuntungan/kerugian terealisasi (hanya saat SELL)
  trade_date date default current_date,
  account_id uuid references public.cash_accounts(id) on delete set null, -- Terhubung ke RDN / Bank
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. PASSIVE INCOMES (Sumber Pendapatan Pasif Rutin)
create table public.passive_incomes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  source_name text not null, -- e.g. "Dividen Saham BBCA", "Bunga Deposito SeaBank", "Kupon SBN ORI024"
  amount numeric not null,
  frequency text default 'MONTHLY' check (frequency in ('MONTHLY', 'QUARTERLY', 'ANNUAL')),
  received_date date default current_date
);

-- 9. FINANCIAL ALERTS (Pusat Log Notifikasi Sistem Cerdas)
create table public.financial_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  type text check (type in ('BILL_DUE', 'BUDGET_OVERRUN', 'STOCK_PRICE', 'DIVIDEND_PAYOUT', 'LOW_CASH', 'MONTHLY_REPORT')),
  reference_id uuid,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 10. MONTHLY REPORTS (Arsip Rekapitulasi Otomatis Bulanan)
create table public.monthly_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  month_year text not null, -- e.g. "2026-11"
  total_income numeric not null,
  total_expense numeric not null,
  net_savings numeric not null,
  savings_rate numeric not null, -- (net_savings / total_income) * 100
  total_net_worth numeric not null,
  coverage_ratio numeric not null, -- Financial Freedom Index
  report_json jsonb not null, -- Rincian per kategori belanja & kinerja portofolio
  generated_at timestamp with time zone default timezone('utc'::text, now())
);
```

---

## 4. Business Logic, Calculations & Formulas

1. **Total Net Worth:**
   $$\text{Total Net Worth} = \sum(\text{Balance Seluruh Akun Kas \& RDN}) + \sum(\text{Lots} \times 100 \times \text{Current Stock Price})$$

2. **Floating Gain / Loss Emiten (Unrealized P/L):**
   $$\text{Gain/Loss (Rp)} = (\text{Current Price} - \text{Avg Price}) \times \text{Lots} \times 100$$
   $$\text{Gain/Loss (\%)} = \left(\frac{\text{Current Price} - \text{Avg Price}}{\text{Avg Price}}\right) \times 100$$

3. **Realisasi Penjualan Saham (Realized P/L):**
   $$\text{Gross Sale} = \text{Lots Dijual} \times 100 \times \text{Selling Price}$$
   $$\text{Net Proceeds} = \text{Gross Sale} - (\text{Gross Sale} \times \text{Sell Fee \%})$$
   $$\text{Cost Basis} = \text{Lots Dijual} \times 100 \times \text{Avg Buy Price}$$
   $$\text{Realized PnL} = \text{Net Proceeds} - \text{Cost Basis}$$
   *(Net Proceeds otomatis ditambahkan ke saldo akun kas/RDN yang dipilih)*

4. **Financial Freedom Health Index (Coverage Ratio):**
   $$\text{Coverage Ratio (\%)} = \left(\frac{\text{Total Monthly Passive Income}}{\text{Total Monthly Fixed Expenses}}\right) \times 100$$

5. **Internal Transfer Logic:**
   - Transfer antar akun (misal: BCA ke RDN Broker): Saldo BCA berkurang, Saldo RDN bertambah dengan nominal sama.
   - **Total Net Worth tidak berubah**, dan transaksi ini **tidak dihitung sebagai expense/income**.

---

## 5. UI Architecture & Navigation (Mobile 4-Tab Layout)

### Tab 1: Beranda (Dashboard Overview)
- **Top Card:** Total Net Worth dengan tombol Incognito Toggle (`Rp ••••••••`).
- **Breakdown Cards:** 
  - Kas Likuid & RDN (Saldo siap pakai).
  - Portofolio Saham (Nilai pasar terkini).
- **Financial Freedom Gauge:** Rasio Passive Income vs Fixed Expenses.
- **Bell Icon Notification:** Notifikasi aktif dari tabel `financial_alerts`.
- **Quick Action Bar:** Shortcut Tambah Transaksi, Beli Saham, Transfer Antar Akun, dan Download Laporan.
- **Recent Activity Ledger:** Mutasi kas dan histori transaksi terakhir.

### Tab 2: Portofolio (Saham & Investasi IDX)
- **Summary Cards:** Total Nilai Portofolio, Modal Pokok Terinvestasi, Total Floating Profit/Loss (Rp & %), dan Realized Gain bulan ini.
- **Action Buttons:** `+ Beli Saham` & `Jual Saham`.
- **Emiten Search & Autocomplete Modal:**
  - Dropdown ticker dari `idx_stocks_master` (misal ketik "CUAN" atau "BUMI").
  - Menampilkan harga live dari cache.
  - Input Lot & Avg Price (auto-kalkulasi estimasi fee sekuritas).
- **List Emiten:** Ticker, Sektor, Lots, Avg Price, Current Price, Gain/Loss (Rp & %).

### Tab 3: Passive & Fixed (Fixed Cost & Passive Income)
- **Financial Freedom Index Card:** Status rasio tertutupi (contoh: 58% tertutupi, sisa target nominal bebas biaya pasti).
- **Section Tagihan Pasti (Fixed Expenses):** Daftar sewa kos, WiFi, listrik, asuransi, jatuh tempo rutin (1-31), checkbox bayar (`is_paid = true`).
- **Section Sumber Pasif:** Dividen rutin, kupon SBN, deposito bank digital.

### Tab 4: Riwayat (Mutasi & Ledger Kas)
- Filter rentang waktu (Bulan ini, Bulan lalu, Kustom), Filter Kategori & Filter Akun Kas.
- Daftar riwayat transaksi pemasukan, pengeluaran, dan transfer internal.

---

## 6. Smart Alerts Engine & Background Cron Triggers

Aplikasi memiliki **6 Trigger Peringatan Otomatis**:
1. **Due Date Bill Reminder:** Peringatan H-3, H-1, dan Hari H tagihan rutin yang belum ditandai bayar (`is_paid = false`).
2. **Budget Burn Rate Alert:** Trigger saat pengeluaran menyentuh threshold (80% & 100%), lengkap dengan proyeksi run-rate harian.
3. **Saham TP & Stop Loss Alert:** Peringatan saat harga pasar menyentuh `target_take_profit` atau `target_cut_loss`.
4. **Dividen Payout Day:** Pengingat saat jadwal pembayaran dividen emiten tiba.
5. **Low Cash Balance Warning:** Peringatan jika kas likuid lebih kecil dari total pengeluaran pasti bulan ini.
6. **Auto-Generate Monthly Report (Tanggal 1):** Agregasi otomatis performa keuangan bulan lalu ke tabel `monthly_reports`.

---

## 7. Zero-Data-Lockin & Fitur Privasi

1. **Local Backup & Restore (JSON / Excel):**
   - 1-Klik tombol "Export JSON Backup" untuk menyimpan seluruh data lokal tanpa ketergantungan cloud.
   - Fitur "Restore from JSON" untuk pemulihan instan.
2. **Incognito Balance Masking:**
   - Ikon mata di header menyamarkan angka nominal (`Rp ••••••••`) saat membuka aplikasi di ruang publik.

---

## 8. Master Prompt untuk AI Builder (Siap Copy-Paste)

```markdown
# Master Prompt: Buat Aplikasi EdWealth Mobile Web (Full-Stack Supabase + Next.js)

Saya ingin membuat aplikasi web mobile-first komprehensif bernama **EdWealth** (Personal Wealth & Stock Portfolio Tracker).
Silakan implementasikan proyek ini secara lengkap dengan spesifikasi berikut:

### 1. Database & Backend (Supabase PostgreSQL):
- Jalankan DDL SQL untuk 10 tabel: `profiles`, `cash_accounts`, `transactions`, `idx_stocks_master`, `stock_market_cache`, `stock_portfolio`, `stock_trade_history`, `passive_incomes`, `financial_alerts`, `monthly_reports`.
- Siapkan Row Level Security (RLS) policies untuk mengisolasi data per `auth.uid()`.
- Sediakan Edge Function / API route untuk fetching harga saham IDX dari Yahoo Finance API (`ticker.JK`).
- Sediakan Edge Function Cron Job untuk auto-generate laporan bulanan tiap tanggal 1 dan notifikasi jatuh tempo tagihan (H-3).

### 2. Fitur Portofolio Saham & Autocomplete:
- Sediakan seed data daftar saham populer BEI di `idx_stocks_master` (BBCA, BBRI, BMRI, TLKM, ASII, BUMI, CUAN, dll).
- Modal "Beli Saham" menggunakan searchable combobox (autocomplete emiten), input Lot, input Avg Price, dan kalkulasi fee broker otomatis (0.15%).
- Modal "Jual Saham": memotong lot di `stock_portfolio`, mencatat Realized P/L di `stock_trade_history`, dan otomatis menambahkan hasil penjualan bersih ke akun RDN/Kas.

### 3. Logika Perhitungan Finansial:
- Total Net Worth = Saldo Seluruh Kas/RDN + Total Nilai Pasar Saham.
- Coverage Ratio = (Total Monthly Passive Income / Total Monthly Fixed Expenses) * 100.
- Transaksi tipe TRANSFER tidak menambah expense maupun income (Net Worth konstan).

### 4. Komponen Frontend (Next.js / React + Tailwind CSS + Lucide Icons):
- Header dengan Incognito Balance Toggle (sensor angka saldo `Rp ••••••••`) dan Lonceng Notifikasi Alert aktif.
- 4 Tab Navigasi Bawah: Beranda, Portofolio, Passive & Fixed, Riwayat.
- Fitur Export & Import JSON lokal di menu Pengaturan / Profil (Zero Data Lock-in).
- Modal Ringkasan Laporan Bulanan dengan tombol 1-Click Download PDF / Excel.
```
