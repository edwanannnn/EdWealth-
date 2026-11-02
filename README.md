# EdWealth — Smart Voice-Activated Personal Wealth & IDX Stock Tracker

<p align="center">
  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOZ7o7jWuKnXVGINUiJXR477GfxDBpo3d_Hsbsmf5DlvdxFZDTm96nSBqP6FQwTUvLAEKW-P10e1xgX9qtPu6T_Rt81A4CY7YKAuB9XWf5hQ-O4uMwm-34TKyH-dq4jpiorkwgAKj21kV8nry7LnF8N7e0tu6EPZHZsh4ir3EMvAxPgQg6ClJqbMeav98Eoh4kR6ipczNn05rLAPO3Y8u-h_mBuq8kmrkhr6A5UyZ2" alt="EdWealth Logo" width="96" height="96" />
</p>

<p align="center">
  <b>A comprehensive, privacy-first mobile wealth management platform combining on-device AI voice expense logging, real-time Indonesia Stock Exchange (IDX) portfolio tracking, and financial freedom ratio indexing.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20Web%20(PWA)-blue?style=for-the-badge&logo=android" alt="Platform" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Backend-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Market%20Data-Yahoo%20Finance%20(BEI)-720E9E?style=for-the-badge&logo=yahoo" alt="Yahoo Finance" />
</p>

<p align="center">
  <a href="https://github.com/edwanannnn/EdWealth-/releases/latest">
    <img src="https://img.shields.io/badge/Download-Android%20APK%20(Direct)-success?style=for-the-badge&logo=android&logoColor=white" alt="Download APK" />
  </a>
</p>

---

## 🌟 Highlights & Core Philosophy

EdWealth (formerly designed as FinFlow) is built to eliminate the friction of personal financial bookkeeping. Instead of navigating tedious forms, users can log daily transactions using natural Indonesian speech in milliseconds, track their equity positions on the Indonesia Stock Exchange (IDX / BEI) with automatic floating profit/loss recalculations, and monitor their progress towards complete financial independence.

- **0 External API Cost:** On-device Web Speech API + deterministic regex/NLP parser handles speech parsing without third-party LLM costs.
- **Offline-First:** All ledger mutations, cash balances, and offline records sync seamlessly to Supabase PostgreSQL when connectivity is restored.
- **Bank-Grade Data Isolation:** Row Level Security (RLS) ensures total privacy at the PostgreSQL engine level.
- **Zero Data Lock-in:** 1-Click JSON backup export/restore and downloadable client-side PDF financial statements.

---

## 🚀 Key Features

### 1. 🎙️ AI Voice Smart Logger (0 API Key Required)
- **Native Speech-to-Text:** Uses browser/webview `SpeechRecognition` configured for Indonesian (`id-ID`).
- **Entity Extraction Engine:** Instantly parses natural Indonesian phrasing:
  - Nominal recognition: `"1,5 juta"`, `"50 ribu"`, `"250rb"`, `"100k"`.
  - Transaction typing: Automatic discrimination between *Expense*, *Income*, and *Internal Account Transfer*.
  - Category mapping: Auto-classifies food, transport, bills, healthcare, shopping, etc.
  - Payment method binding: Recognizes keywords like *BCA, SeaBank, QRIS, Tunai, RDN*.
- **Review & Confirm Safety Card:** Visual inspection card prevents accidental state mutations before database commits.

### 2. 📈 Live IDX / BEI Stock Portfolio Tracking
- **Automated Price Ingestion:** Connects directly to global Yahoo Finance market feeds using `.JK` tickers (e.g., `BBCA.JK`, `BMRI.JK`, `CUAN.JK`, `AMMN.JK`, `BUMI.JK`).
- **1-Time Purchase Input:** Enter purchase price and lots once. Real-time floating profit/loss (in IDR & %) updates automatically against market fluctuations.
- **Realized P/L Execution:** Real-time brokerage fee calculations (0.15% buy, 0.25% sell + levy). Selling an equity position automatically transfers net proceeds back to RDN/Bank cash reserves and archives the trade in `stock_trade_history`.
- **Averaging Down/Up Calculator:** Interactive simulator computes the projected new average price, required capital, and break-even points before executing market orders.

### 3. 🎯 Financial Freedom Health Index (Coverage Ratio)
$$\text{Coverage Ratio (\%)} = \left(\frac{\text{Total Monthly Passive Income}}{\text{Total Monthly Fixed Expenses}}\right) \times 100$$
- Visual gauge tracks passive income streams (stock dividends, digital bank deposits, SBN bond coupons) against recurring living liabilities (rent, utilities, insurance).
- **Auto-Deduct Checklist:** Ticking a fixed recurring expense as paid automatically prompts the user to select the debiting account and creates an expense ledger entry.

### 4. 💼 Total Net Worth & Liquid Cashflow Engine
$$\text{Total Net Worth} = \sum(\text{Liquid Cash \& RDN Balances}) + \sum(\text{Stock Lots} \times 100 \times \text{Current Market Price})$$
- **Incognito Privacy Toggle:** 1-tap balance masking (`Rp ••••••••`) prevents shoulder surfing in public spaces.
- **Internal Transfer Neutrality:** Moving capital (e.g., Bank BCA to Broker RDN) updates individual account balances without skewing net worth or expense statistics.

### 5. 📑 Export & Monthly Archive Engine
- Client-side vector PDF generation using `jspdf`.
- 1-Click full backup & restore JSON export adhering to the Zero-Data-Lockin principle.

---

## 🛠️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   Android APK (Capacitor)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │        React 19 + TypeScript + Vite              │  │
│  │    Tailwind CSS (Material 3 Dynamic Minimalist)  │  │
│  │       Web Speech API + Custom NLP Parser         │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               │                         │
               ▼                         ▼
   ┌───────────────────────┐ ┌───────────────────────┐
   │ Yahoo Finance (.JK)   │ │  Supabase Cloud DB    │
   │ Real-time IDX Quotes  │ │  PostgreSQL 15 + RLS  │
   │ No API Key Required   │ │  Auth & Auto-Triggers │
   └───────────────────────┘ └───────────────────────┘
```

- **Frontend Framework:** React 19, TypeScript, Vite
- **Design System:** Tailwind CSS, Material Symbols Outlined, Lucide Icons, Plus Jakarta Sans typography
- **Mobile Runtime:** Capacitor 7 (Android SDK Target 34)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, PL/pgSQL Triggers)
- **CI/CD Pipeline:** GitHub Actions automated Android APK compiler (`assembleDebug`)

---

## 🗄️ Database Architecture (PostgreSQL Master DDL)

The database consists of 10 fully relational tables managed under Supabase PostgreSQL:

1. `profiles` — User preferences, monthly budget, alert threshold, incognito defaults, and broker fee presets.
2. `cash_accounts` — Liquidity accounts (Bank, RDN Broker, E-Wallet, Cash).
3. `transactions` — Financial mutations (Expenses, Income, Internal Transfers).
4. `idx_stocks_master` — Master directory of Indonesian public companies (BBCA, BBRI, BMRI, CUAN, etc.).
5. `stock_market_cache` — Caching layer for real-time market prices, previous close, and percentage deltas.
6. `stock_portfolio` — Active floating positions (lots, net average buy price, target TP/SL).
7. `stock_trade_history` — Execution audit log for realized profits/losses.
8. `passive_incomes` — Recurring passive yields (dividends, interest, coupon bonds).
9. `financial_alerts` — Smart notification center (bill due dates, stock TP/SL triggers, budget overruns).
10. `monthly_reports` — Historical monthly financial health snapshots.

---

## 📦 Getting Started & Local Development

### Prerequisites
- Node.js (v20+ recommended)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/edwanannnn/EdWealth-.git
cd EdWealth-
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` on your workstation or mobile browser on the same Wi-Fi network.

### 4. Build Production Bundle & Sync Capacitor
```bash
npm run build
npx cap sync android
```

---

## 🤖 Automated Cloud APK Generation (GitHub Actions)

This repository includes a turnkey CI/CD workflow at [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml).
Whenever changes are pushed to `main`:
1. GitHub runners spin up an Ubuntu environment with Java 17 and Android SDK.
2. The web bundle is compiled and synced with Capacitor.
3. Gradle builds the native Android debug binary (`./gradlew assembleDebug`).
4. The downloadable APK artifact is available directly under the **Actions** tab on GitHub!

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
