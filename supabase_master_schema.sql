-- ====================================================================
-- EDWEALTH / FINFLOW MASTER DATABASE SCHEMA (V3 - FINAL SPEC)
-- Jalankan seluruh script ini di Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste -> Run
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES (Pengaturan notifikasi, mata uang, dan sensor saldo)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  currency text default 'IDR',
  monthly_budget numeric default 10000000,
  alert_budget_threshold integer default 80, -- Trigger alert saat pengeluaran tembus 80%
  email_monthly_report boolean default true,
  hide_balance_default boolean default false, -- Mode sensor saldo aktif saat awal buka app
  default_buy_fee numeric default 0.15, -- Fee broker beli (%)
  default_sell_fee numeric default 0.25, -- Fee broker jual + pajak (%)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. CASH ACCOUNTS (Rekening Bank, RDN Broker, E-Wallet, Dompet Tunai)
create table if not exists public.cash_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_name text not null, -- e.g. "BCA Utama", "RDN Stockbit", "SeaBank", "Kas Tunai"
  account_type text default 'BANK' check (account_type in ('BANK', 'RDN', 'E_WALLET', 'CASH')),
  balance numeric not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. IDX STOCKS MASTER (Database Referensi Resmi Seluruh Emiten BEI / IDX)
create table if not exists public.idx_stocks_master (
  ticker text primary key, -- e.g. "BBCA", "BBRI", "BMRI", "CUAN", "BUMI", "TLKM"
  company_name text not null, -- e.g. "Bank Central Asia Tbk"
  sector text not null, -- "Financials", "Energy", "Basic Materials", dll.
  logo_url text,
  is_popular boolean default false -- Flag untuk saham LQ45 / Populer
);

-- 5. STOCK MARKET CACHE (Auto-fetched cache dari Yahoo Finance API)
create table if not exists public.stock_market_cache (
  ticker text primary key,
  current_price numeric not null,
  previous_close numeric,
  change_amount numeric,
  change_percentage numeric,
  last_updated timestamp with time zone default timezone('utc'::text, now())
);

-- 6. STOCK PORTFOLIO (Kepemilikan Saham Aktif User - Floating Position)
create table if not exists public.stock_portfolio (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  ticker text not null references public.idx_stocks_master(ticker) on delete cascade,
  lots integer not null check (lots > 0), -- 1 lot = 100 lembar
  avg_price numeric not null check (avg_price > 0), -- Net avg buy price (inc. fee)
  target_take_profit numeric, -- Alert TP
  target_cut_loss numeric, -- Alert CL
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. STOCK TRADE HISTORY (Log Eksekusi Beli & Jual Saham - Realized Profit/Loss)
create table if not exists public.stock_trade_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
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

-- 8. TRANSACTIONS (Pencatatan Arus Kas Masuk/Keluar, Fixed Expenses & Internal Transfer)
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.cash_accounts(id) on delete set null,
  destination_account_id uuid references public.cash_accounts(id) on delete set null, -- Untuk tipe TRANSFER
  title text not null,
  amount numeric not null,
  type text check (type in ('EXPENSE', 'INCOME', 'TRANSFER')),
  category text not null, -- "Makanan", "Tagihan Rutin", "Gaji", "Dividen", "Hasil Jual Saham", dll.
  is_fixed_expense boolean default false,
  due_date integer check (due_date between 1 and 31), -- Tanggal jatuh tempo rutin (1-31)
  is_paid boolean default false, -- Status lunas untuk tagihan rutin bulan berjalan
  transaction_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 9. PASSIVE INCOMES (Sumber Pendapatan Pasif Rutin)
create table if not exists public.passive_incomes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  source_name text not null, -- e.g. "Dividen Saham BBCA", "Bunga Deposito SeaBank", "Kupon SBN ORI024"
  amount numeric not null,
  frequency text default 'MONTHLY' check (frequency in ('MONTHLY', 'QUARTERLY', 'ANNUAL')),
  received_date date default current_date
);

-- 10. FINANCIAL ALERTS (Pusat Log Notifikasi Sistem Cerdas)
create table if not exists public.financial_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  type text check (type in ('BILL_DUE', 'BUDGET_OVERRUN', 'STOCK_PRICE', 'DIVIDEND_PAYOUT', 'LOW_CASH', 'MONTHLY_REPORT')),
  reference_id uuid,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 11. MONTHLY REPORTS (Arsip Rekapitulasi Otomatis Bulanan)
create table if not exists public.monthly_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
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

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.cash_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.idx_stocks_master enable row level security;
alter table public.stock_market_cache enable row level security;
alter table public.stock_portfolio enable row level security;
alter table public.stock_trade_history enable row level security;
alter table public.passive_incomes enable row level security;
alter table public.financial_alerts enable row level security;
alter table public.monthly_reports enable row level security;

-- Profiles Policies
create policy "Allow user to view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Allow user to update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow user to insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Cash Accounts Policies
create policy "Allow user to view own cash accounts" on public.cash_accounts for select using (auth.uid() = user_id);
create policy "Allow user to manage own cash accounts" on public.cash_accounts for all using (auth.uid() = user_id);

-- Transactions Policies
create policy "Allow user to view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Allow user to manage own transactions" on public.transactions for all using (auth.uid() = user_id);

-- Stocks Master Policies (Bisa dibaca semua orang terotentikasi)
create policy "Allow anyone to read idx stocks master" on public.idx_stocks_master for select using (true);
create policy "Allow authenticated to insert idx stocks" on public.idx_stocks_master for insert with check (auth.role() = 'authenticated');

-- Stock Market Cache Policies (Bisa dibaca & diupdate oleh user terotentikasi)
create policy "Allow anyone to read stock cache" on public.stock_market_cache for select using (true);
create policy "Allow authenticated to upsert stock cache" on public.stock_market_cache for all using (true);

-- Stock Portfolio Policies
create policy "Allow user to view own portfolio" on public.stock_portfolio for select using (auth.uid() = user_id);
create policy "Allow user to manage own portfolio" on public.stock_portfolio for all using (auth.uid() = user_id);

-- Stock Trade History Policies
create policy "Allow user to view own trades" on public.stock_trade_history for select using (auth.uid() = user_id);
create policy "Allow user to manage own trades" on public.stock_trade_history for all using (auth.uid() = user_id);

-- Passive Incomes Policies
create policy "Allow user to view own passive incomes" on public.passive_incomes for select using (auth.uid() = user_id);
create policy "Allow user to manage own passive incomes" on public.passive_incomes for all using (auth.uid() = user_id);

-- Financial Alerts Policies
create policy "Allow user to view own alerts" on public.financial_alerts for select using (auth.uid() = user_id);
create policy "Allow user to manage own alerts" on public.financial_alerts for all using (auth.uid() = user_id);

-- Monthly Reports Policies
create policy "Allow user to view own monthly reports" on public.monthly_reports for select using (auth.uid() = user_id);
create policy "Allow user to manage own monthly reports" on public.monthly_reports for all using (auth.uid() = user_id);

-- ====================================================================
-- AUTOMATIC USER INITIALIZATION TRIGGER
-- Saat user mendaftar lewat Auth, otomatis buat Profile & Akun Kas awal
-- ====================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Buat Profil Default
  insert into public.profiles (id, full_name, email, monthly_budget)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    10000000
  );

  -- 2. Buat Rekening Kas Awal
  insert into public.cash_accounts (user_id, account_name, account_type, balance)
  values
    (new.id, 'BCA Utama', 'BANK', 12500000),
    (new.id, 'RDN Stockbit', 'RDN', 25000000),
    (new.id, 'SeaBank QRIS', 'E_WALLET', 2500000),
    (new.id, 'Kas Dompet Tunai', 'CASH', 750000);

  -- 3. Buat Notifikasi Selamat Datang
  insert into public.financial_alerts (user_id, title, message, type)
  values (
    new.id,
    'Selamat Datang di EdWealth!',
    'Akun kas & portofolio Anda telah siap. Coba fitur voice recording untuk mencatat pengeluaran pertama Anda.',
    'MONTHLY_REPORT'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger pada auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================================
-- SEED DATA: DAFTAR SAHAM BEI POPULER (LQ45 & BIG CAPS)
-- ====================================================================

insert into public.idx_stocks_master (ticker, company_name, sector, is_popular)
values
  ('BBCA', 'Bank Central Asia Tbk', 'Financials', true),
  ('BBRI', 'Bank Rakyat Indonesia (Persero) Tbk', 'Financials', true),
  ('BMRI', 'Bank Mandiri (Persero) Tbk', 'Financials', true),
  ('BBNI', 'Bank Negara Indonesia (Persero) Tbk', 'Financials', true),
  ('BRIS', 'Bank Syariah Indonesia Tbk', 'Financials', true),
  ('ARTO', 'Bank Jago Tbk', 'Financials', false),
  ('TLKM', 'Telkom Indonesia (Persero) Tbk', 'Infrastructure', true),
  ('ASII', 'Astra International Tbk', 'Industrials', true),
  ('AMMN', 'Amman Mineral Internasional Tbk', 'Basic Materials', true),
  ('BUMI', 'Bumi Resources Tbk', 'Energy', true),
  ('CUAN', 'Petrindo Jaya Kreasi Tbk', 'Energy', true),
  ('BRPT', 'Barito Pacific Tbk', 'Basic Materials', true),
  ('TPIA', 'Chandra Asri Pacific Tbk', 'Basic Materials', false),
  ('ADRO', 'Adaro Energy Indonesia Tbk', 'Energy', true),
  ('PTBA', 'Bukit Asam Tbk', 'Energy', true),
  ('ITMG', 'Indo Tambangraya Megah Tbk', 'Energy', false),
  ('PGAS', 'Perusahaan Gas Negara Tbk', 'Energy', true),
  ('MEDC', 'Medco Energi Internasional Tbk', 'Energy', false),
  ('ANTM', 'Aneka Tambang Tbk', 'Basic Materials', true),
  ('MDKA', 'Merdeka Copper Gold Tbk', 'Basic Materials', true),
  ('INCO', 'Vale Indonesia Tbk', 'Basic Materials', false),
  ('GOTO', 'GoTo Gojek Tokopedia Tbk', 'Technology', true),
  ('BUKA', 'Bukalapak.com Tbk', 'Technology', false),
  ('UNVR', 'Unilever Indonesia Tbk', 'Consumer Non-Cyclicals', true),
  ('ICBP', 'Indofood CBP Sukses Makmur Tbk', 'Consumer Non-Cyclicals', true),
  ('INDF', 'Indofood Sukses Makmur Tbk', 'Consumer Non-Cyclicals', true),
  ('KLBF', 'Kalbe Farma Tbk', 'Healthcare', true),
  ('CPIN', 'Charoen Pokphand Indonesia Tbk', 'Consumer Non-Cyclicals', false),
  ('JPFA', 'Japfa Comfeed Indonesia Tbk', 'Consumer Non-Cyclicals', false),
  ('JSMR', 'Jasa Marga (Persero) Tbk', 'Infrastructure', true),
  ('SMGR', 'Semen Indonesia (Persero) Tbk', 'Basic Materials', false),
  ('TOWR', 'Sarana Menara Nusantara Tbk', 'Infrastructure', false),
  ('TBIG', 'Tower Bersama Infrastructure Tbk', 'Infrastructure', false),
  ('EXCL', 'XL Axiata Tbk', 'Infrastructure', false),
  ('ISAT', 'Indosat Ooredoo Hutchison Tbk', 'Infrastructure', false),
  ('ACES', 'Aspirasi Hidup Indonesia Tbk (Ace)', 'Consumer Cyclicals', false),
  ('MAPI', 'Mitra Adiperkasa Tbk', 'Consumer Cyclicals', false),
  ('MIDI', 'Midi Utama Indonesia Tbk', 'Consumer Non-Cyclicals', false),
  ('MYOR', 'Mayora Indah Tbk', 'Consumer Non-Cyclicals', false),
  ('SIDO', 'Industri Jamu dan Farmasi Sido Muncul Tbk', 'Healthcare', false),
  ('ESSA', 'Essence Pertiwi Tbk', 'Basic Materials', false)
on conflict (ticker) do nothing;

-- ====================================================================
-- SEED DATA: HARGA AWAL CACHE PASAR SAHAM (BASELINE CACHE)
-- ====================================================================

insert into public.stock_market_cache (ticker, current_price, previous_close, change_amount, change_percentage)
values
  ('BBCA', 9950, 9850, 100, 1.02),
  ('BBRI', 4750, 4700, 50, 1.06),
  ('BMRI', 6550, 6500, 50, 0.77),
  ('BBNI', 5250, 5200, 50, 0.96),
  ('TLKM', 2850, 2900, -50, -1.72),
  ('ASII', 5100, 5050, 50, 0.99),
  ('AMMN', 9250, 9100, 150, 1.65),
  ('BUMI', 142, 138, 4, 2.90),
  ('CUAN', 7400, 7150, 250, 3.50),
  ('GOTO', 68, 67, 1, 1.49),
  ('ADRO', 3700, 3650, 50, 1.37),
  ('ANTM', 1580, 1550, 30, 1.94),
  ('UNVR', 2350, 2370, -20, -0.84),
  ('ICBP', 12100, 12000, 100, 0.83)
on conflict (ticker) do update set
  current_price = excluded.current_price,
  change_percentage = excluded.change_percentage,
  last_updated = now();
