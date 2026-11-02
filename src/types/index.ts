export type AccountType = 'BANK' | 'RDN' | 'E_WALLET' | 'CASH';
export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';
export type TradeAction = 'BUY' | 'SELL';
export type PassiveFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type AlertType = 'BILL_DUE' | 'BUDGET_OVERRUN' | 'STOCK_PRICE' | 'DIVIDEND_PAYOUT' | 'LOW_CASH' | 'MONTHLY_REPORT';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  currency: string;
  monthly_budget: number;
  alert_budget_threshold: number;
  email_monthly_report: boolean;
  hide_balance_default: boolean;
  default_buy_fee: number;
  default_sell_fee: number;
  created_at?: string;
}

export interface CashAccount {
  id: string;
  user_id: string;
  account_name: string;
  account_type: AccountType;
  balance: number;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  destination_account_id?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  is_fixed_expense?: boolean;
  due_date?: number;
  is_paid?: boolean;
  transaction_date: string;
  created_at?: string;
  // Joined fields for display
  account_name?: string;
  destination_account_name?: string;
}

export interface IdxStockMaster {
  ticker: string;
  company_name: string;
  sector: string;
  logo_url?: string;
  is_popular?: boolean;
}

export interface StockMarketCache {
  ticker: string;
  current_price: number;
  previous_close?: number;
  change_amount?: number;
  change_percentage?: number;
  last_updated?: string;
}

export interface StockPortfolioItem {
  id: string;
  user_id: string;
  ticker: string;
  lots: number;
  avg_price: number;
  target_take_profit?: number;
  target_cut_loss?: number;
  notes?: string;
  created_at?: string;
  // Joined live cache
  company_name?: string;
  sector?: string;
  current_price?: number;
  change_percentage?: number;
  market_value?: number;
  unrealized_pnl?: number;
  unrealized_pnl_pct?: number;
}

export interface StockTradeHistory {
  id: string;
  user_id: string;
  ticker: string;
  action: TradeAction;
  lots: number;
  price: number;
  broker_fee: number;
  realized_pnl: number;
  trade_date: string;
  account_id?: string;
  created_at?: string;
}

export interface PassiveIncome {
  id: string;
  user_id: string;
  source_name: string;
  amount: number;
  frequency: PassiveFrequency;
  received_date: string;
}

export interface FinancialAlert {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: AlertType;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface MonthlyReport {
  id: string;
  user_id: string;
  month_year: string;
  total_income: number;
  total_expense: number;
  net_savings: number;
  savings_rate: number;
  total_net_worth: number;
  coverage_ratio: number;
  report_json: any;
  generated_at?: string;
}
