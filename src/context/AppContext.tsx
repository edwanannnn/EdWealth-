import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Profile, CashAccount, Transaction, StockPortfolioItem, 
  StockMarketCache, PassiveIncome, FinancialAlert 
} from '../types';
import { supabase } from '../lib/supabase';
import { fetchStockPriceFromYahoo, batchFetchStockPrices } from '../lib/stockApi';
import type { User } from '@supabase/supabase-js';

// Initial Mock/Demo State for instant demo mode if user chooses to explore as guest
const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  full_name: 'Investor Pintar',
  email: 'tamu@edwealth.app',
  currency: 'IDR',
  monthly_budget: 10000000,
  alert_budget_threshold: 80,
  email_monthly_report: true,
  hide_balance_default: false,
  default_buy_fee: 0.15,
  default_sell_fee: 0.25,
};

const DEMO_ACCOUNTS: CashAccount[] = [
  { id: 'acc-1', user_id: 'demo-user', account_name: 'BCA Utama', account_type: 'BANK', balance: 14850000 },
  { id: 'acc-2', user_id: 'demo-user', account_name: 'RDN Stockbit', account_type: 'RDN', balance: 28500000 },
  { id: 'acc-3', user_id: 'demo-user', account_name: 'SeaBank QRIS', account_type: 'E_WALLET', balance: 3200000 },
  { id: 'acc-4', user_id: 'demo-user', account_name: 'Kas Dompet Tunai', account_type: 'CASH', balance: 650000 },
];

const DEMO_PORTFOLIO: StockPortfolioItem[] = [
  {
    id: 'port-1',
    user_id: 'demo-user',
    ticker: 'BBCA',
    lots: 15,
    avg_price: 9250,
    company_name: 'Bank Central Asia Tbk',
    sector: 'Financials',
    target_take_profit: 11000,
    target_cut_loss: 8500,
  },
  {
    id: 'port-2',
    user_id: 'demo-user',
    ticker: 'BMRI',
    lots: 25,
    avg_price: 6100,
    company_name: 'Bank Mandiri (Persero) Tbk',
    sector: 'Financials',
    target_take_profit: 7500,
    target_cut_loss: 5800,
  },
  {
    id: 'port-3',
    user_id: 'demo-user',
    ticker: 'AMMN',
    lots: 10,
    avg_price: 8800,
    company_name: 'Amman Mineral Internasional Tbk',
    sector: 'Basic Materials',
    target_take_profit: 10500,
    target_cut_loss: 8000,
  },
  {
    id: 'port-4',
    user_id: 'demo-user',
    ticker: 'CUAN',
    lots: 20,
    avg_price: 6900,
    company_name: 'Petrindo Jaya Kreasi Tbk',
    sector: 'Energy',
    target_take_profit: 9000,
    target_cut_loss: 6200,
  }
];

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    user_id: 'demo-user',
    account_id: 'acc-3',
    account_name: 'SeaBank QRIS',
    title: 'Beli Nasi Padang & Es Teh',
    amount: 25000,
    type: 'EXPENSE',
    category: 'Makanan',
    transaction_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'tx-2',
    user_id: 'demo-user',
    account_id: 'acc-1',
    account_name: 'BCA Utama',
    title: 'Gaji Bulanan & Tunjangan',
    amount: 15000000,
    type: 'INCOME',
    category: 'Gaji',
    transaction_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'tx-3',
    user_id: 'demo-user',
    account_id: 'acc-1',
    account_name: 'BCA Utama',
    title: 'WiFi Indihome 50Mbps',
    amount: 375000,
    type: 'EXPENSE',
    category: 'Tagihan Rutin',
    is_fixed_expense: true,
    due_date: 15,
    is_paid: true,
    transaction_date: new Date().toISOString().split('T')[0],
  }
];

const DEMO_FIXED_EXPENSES: Transaction[] = [
  {
    id: 'fix-1',
    user_id: 'demo-user',
    title: 'Sewa Apartemen / Kos',
    amount: 2500000,
    type: 'EXPENSE',
    category: 'Tagihan Rutin',
    is_fixed_expense: true,
    due_date: 5,
    is_paid: false,
    transaction_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'fix-2',
    user_id: 'demo-user',
    title: 'WiFi Indihome & TV',
    amount: 375000,
    type: 'EXPENSE',
    category: 'Tagihan Rutin',
    is_fixed_expense: true,
    due_date: 15,
    is_paid: true,
    transaction_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'fix-3',
    user_id: 'demo-user',
    title: 'BPJS Kesehatan & Asuransi',
    amount: 450000,
    type: 'EXPENSE',
    category: 'Tagihan Rutin',
    is_fixed_expense: true,
    due_date: 10,
    is_paid: false,
    transaction_date: new Date().toISOString().split('T')[0],
  }
];

const DEMO_PASSIVE_INCOMES: PassiveIncome[] = [
  {
    id: 'pass-1',
    user_id: 'demo-user',
    source_name: 'Dividen Saham BBCA & BMRI (Est. Bulanan)',
    amount: 1450000,
    frequency: 'MONTHLY',
    received_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'pass-2',
    user_id: 'demo-user',
    source_name: 'Bunga Deposito Digital SeaBank (6% p.a)',
    amount: 350000,
    frequency: 'MONTHLY',
    received_date: new Date().toISOString().split('T')[0],
  }
];

const DEMO_ALERTS: FinancialAlert[] = [
  {
    id: 'alt-1',
    user_id: 'demo-user',
    title: 'Jatuh Tempo Tagihan Kos (H-2)',
    message: 'Tagihan Sewa Apartemen / Kos Rp 2.500.000 jatuh tempo pada tanggal 5.',
    type: 'BILL_DUE',
    is_read: false,
    created_at: new Date().toISOString(),
  }
];

interface AppContextType {
  user: User | null;
  isGuestMode: boolean;
  setIsGuestMode: (guest: boolean) => void;
  handleLogout: () => Promise<void>;

  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  isIncognito: boolean;
  toggleIncognito: () => void;
  activeTab: 'dashboard' | 'portfolio' | 'fixed-passive' | 'ledger';
  setActiveTab: (tab: 'dashboard' | 'portfolio' | 'fixed-passive' | 'ledger') => void;
  cashAccounts: CashAccount[];
  transactions: Transaction[];
  fixedExpenses: Transaction[];
  portfolio: StockPortfolioItem[];
  stockCache: Record<string, StockMarketCache>;
  passiveIncomes: PassiveIncome[];
  alerts: FinancialAlert[];
  isRefreshingStocks: boolean;

  // Modals
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  isBuyStockModalOpen: boolean;
  setIsBuyStockModalOpen: (open: boolean) => void;
  isSellStockModalOpen: boolean;
  setIsSellStockModalOpen: (open: boolean) => void;
  selectedStockToSell: StockPortfolioItem | null;
  setSelectedStockToSell: (stock: StockPortfolioItem | null) => void;
  isAveragingModalOpen: boolean;
  setIsAveragingModalOpen: (open: boolean) => void;
  isAddTxModalOpen: boolean;
  setIsAddTxModalOpen: (open: boolean) => void;
  isAlertsModalOpen: boolean;
  setIsAlertsModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
  buyStock: (params: { ticker: string; companyName: string; lots: number; avgPrice: number; targetTp?: number; targetCl?: number; accountId?: string }) => void;
  sellStock: (params: { portfolioId: string; ticker: string; lotsToSell: number; sellPrice: number; accountId: string }) => void;
  markFixedExpensePaid: (fixedExpenseId: string, accountId: string) => void;
  refreshStockPrices: () => Promise<void>;
  exportBackupJson: () => string;
  importBackupJson: (json: string) => boolean;

  // Calculated totals
  totalCashBalance: number;
  totalStockMarketValue: number;
  totalNetWorth: number;
  totalFloatingGainLoss: { amount: number; percentage: number };
  financialFreedomRatio: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('edwealth_guest_mode') === 'true';
  });

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('edwealth_profile');
    return saved ? JSON.parse(saved) : DEMO_PROFILE;
  });

  const [isIncognito, setIsIncognito] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'fixed-passive' | 'ledger'>('dashboard');

  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<StockPortfolioItem[]>([]);
  const [stockCache, setStockCache] = useState<Record<string, StockMarketCache>>({});
  const [isRefreshingStocks, setIsRefreshingStocks] = useState<boolean>(false);
  const [passiveIncomes, setPassiveIncomes] = useState<PassiveIncome[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isBuyStockModalOpen, setIsBuyStockModalOpen] = useState(false);
  const [isSellStockModalOpen, setIsSellStockModalOpen] = useState(false);
  const [selectedStockToSell, setSelectedStockToSell] = useState<StockPortfolioItem | null>(null);
  const [isAveragingModalOpen, setIsAveragingModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Monitor Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserDataFromSupabase(session.user);
      } else if (isGuestMode) {
        loadDemoData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuestMode(false);
        localStorage.removeItem('edwealth_guest_mode');
        loadUserDataFromSupabase(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [isGuestMode]);

  const loadDemoData = () => {
    setProfile(DEMO_PROFILE);
    setCashAccounts(DEMO_ACCOUNTS);
    setTransactions(DEMO_TRANSACTIONS);
    setFixedExpenses(DEMO_FIXED_EXPENSES);
    setPortfolio(DEMO_PORTFOLIO);
    setPassiveIncomes(DEMO_PASSIVE_INCOMES);
    setAlerts(DEMO_ALERTS);

    // Initial stock prices fetch
    batchFetchStockPrices(DEMO_PORTFOLIO.map(p => p.ticker)).then(prices => {
      setStockCache(prev => ({ ...prev, ...prices }));
    });
  };

  const loadUserDataFromSupabase = async (activeUser: User) => {
    try {
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', activeUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      } else {
        // Fallback default profile for user
        setProfile({
          id: activeUser.id,
          full_name: activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'Investor',
          email: activeUser.email || '',
          currency: 'IDR',
          monthly_budget: 10000000,
          alert_budget_threshold: 80,
          email_monthly_report: true,
          hide_balance_default: false,
          default_buy_fee: 0.15,
          default_sell_fee: 0.25,
        });
      }

      // 2. Fetch Cash Accounts
      const { data: accountsData } = await supabase
        .from('cash_accounts')
        .select('*')
        .eq('user_id', activeUser.id);

      if (accountsData && accountsData.length > 0) {
        setCashAccounts(accountsData);
      } else {
        // If SQL trigger hasn't fired or fresh, create initial clean accounts
        const initialAccounts: CashAccount[] = [
          { id: 'acc-' + Date.now() + '-1', user_id: activeUser.id, account_name: 'BCA Utama', account_type: 'BANK', balance: 5000000 },
          { id: 'acc-' + Date.now() + '-2', user_id: activeUser.id, account_name: 'RDN Stockbit', account_type: 'RDN', balance: 10000000 },
          { id: 'acc-' + Date.now() + '-3', user_id: activeUser.id, account_name: 'Kas Dompet Tunai', account_type: 'CASH', balance: 500000 },
        ];
        setCashAccounts(initialAccounts);
      }

      // 3. Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', activeUser.id)
        .order('transaction_date', { ascending: false });

      if (txData) {
        setTransactions(txData);
      } else {
        setTransactions([]);
      }

      // 4. Fetch Portfolio
      const { data: portData } = await supabase
        .from('stock_portfolio')
        .select('*')
        .eq('user_id', activeUser.id);

      if (portData) {
        setPortfolio(portData);
        if (portData.length > 0) {
          batchFetchStockPrices(portData.map(p => p.ticker)).then(prices => {
            setStockCache(prev => ({ ...prev, ...prices }));
          });
        }
      } else {
        setPortfolio([]);
      }

      // 5. Fetch Passive Incomes
      const { data: passiveData } = await supabase
        .from('passive_incomes')
        .select('*')
        .eq('user_id', activeUser.id);

      if (passiveData) {
        setPassiveIncomes(passiveData);
      } else {
        setPassiveIncomes([]);
      }

      // 6. Fetch Alerts
      const { data: alertData } = await supabase
        .from('financial_alerts')
        .select('*')
        .eq('user_id', activeUser.id);

      if (alertData) {
        setAlerts(alertData);
      } else {
        setAlerts([]);
      }

    } catch (err) {
      console.warn('Error loading data from Supabase, staying offline:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsGuestMode(false);
    localStorage.removeItem('edwealth_guest_mode');
    setCashAccounts([]);
    setTransactions([]);
    setPortfolio([]);
    setFixedExpenses([]);
    setPassiveIncomes([]);
    setAlerts([]);
  };

  const toggleIncognito = () => setIsIncognito(prev => !prev);

  // Refresh stock prices on demand
  const refreshStockPrices = async () => {
    setIsRefreshingStocks(true);
    try {
      const tickers = portfolio.map(p => p.ticker);
      if (tickers.length > 0) {
        const prices = await batchFetchStockPrices(tickers);
        setStockCache(prev => ({ ...prev, ...prices }));
      }
    } finally {
      setIsRefreshingStocks(false);
    }
  };

  // Add Transaction & Update Account Balance
  const addTransaction = (txData: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    const newId = 'tx-' + Date.now();
    const currentUserId = user?.id || profile.id;
    const newTx: Transaction = {
      ...txData,
      id: newId,
      user_id: currentUserId,
      created_at: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update Cash Account Balances
    setCashAccounts(prev => prev.map(acc => {
      if (acc.id === txData.account_id) {
        if (txData.type === 'EXPENSE' || txData.type === 'TRANSFER') {
          return { ...acc, balance: acc.balance - txData.amount };
        } else if (txData.type === 'INCOME') {
          return { ...acc, balance: acc.balance + txData.amount };
        }
      }
      if (txData.type === 'TRANSFER' && acc.id === txData.destination_account_id) {
        return { ...acc, balance: acc.balance + txData.amount };
      }
      return acc;
    }));

    // Sync to Supabase in background
    if (user) {
      Promise.resolve(
        supabase.from('transactions').insert({
          id: newId,
          user_id: user.id,
          account_id: txData.account_id || null,
          destination_account_id: txData.destination_account_id || null,
          title: txData.title,
          amount: txData.amount,
          type: txData.type,
          category: txData.category,
          is_fixed_expense: txData.is_fixed_expense || false,
          transaction_date: txData.transaction_date,
        })
      ).catch(() => {});
    }
  };

  // Buy Stock Action
  const buyStock = (params: {
    ticker: string;
    companyName: string;
    lots: number;
    avgPrice: number;
    targetTp?: number;
    targetCl?: number;
    accountId?: string;
  }) => {
    const cleanTicker = params.ticker.toUpperCase().trim();
    const grossCost = params.lots * 100 * params.avgPrice;
    const brokerFee = grossCost * (profile.default_buy_fee / 100);
    const totalCost = grossCost + brokerFee;

    const targetAccId = params.accountId || cashAccounts.find(a => a.account_type === 'RDN')?.id || cashAccounts[0]?.id;
    if (targetAccId) {
      setCashAccounts(prev => prev.map(acc => {
        if (acc.id === targetAccId) {
          return { ...acc, balance: acc.balance - totalCost };
        }
        return acc;
      }));

      addTransaction({
        account_id: targetAccId,
        title: `Beli Saham ${cleanTicker} (${params.lots} Lot @ Rp ${params.avgPrice.toLocaleString('id-ID')})`,
        amount: totalCost,
        type: 'EXPENSE',
        category: 'Investasi Saham',
        transaction_date: new Date().toISOString().split('T')[0],
      });
    }

    setPortfolio(prev => {
      const existing = prev.find(p => p.ticker === cleanTicker);
      if (existing) {
        const totalLots = existing.lots + params.lots;
        const newAvg = ((existing.lots * existing.avg_price) + (params.lots * params.avgPrice)) / totalLots;
        return prev.map(p => p.ticker === cleanTicker ? {
          ...p,
          lots: totalLots,
          avg_price: Math.round(newAvg),
          target_take_profit: params.targetTp || p.target_take_profit,
          target_cut_loss: params.targetCl || p.target_cut_loss,
        } : p);
      } else {
        return [...prev, {
          id: 'port-' + Date.now(),
          user_id: user?.id || profile.id,
          ticker: cleanTicker,
          company_name: params.companyName,
          lots: params.lots,
          avg_price: params.avgPrice,
          target_take_profit: params.targetTp,
          target_cut_loss: params.targetCl,
          created_at: new Date().toISOString()
        }];
      }
    });

    fetchStockPriceFromYahoo(cleanTicker).then(res => {
      if (res) {
        setStockCache(prev => ({ ...prev, [cleanTicker]: res }));
      }
    });
  };

  // Sell Stock Action
  const sellStock = (params: {
    portfolioId: string;
    ticker: string;
    lotsToSell: number;
    sellPrice: number;
    accountId: string;
  }) => {
    const item = portfolio.find(p => p.id === params.portfolioId);
    if (!item) return;

    const grossProceeds = params.lotsToSell * 100 * params.sellPrice;
    const sellFee = grossProceeds * (profile.default_sell_fee / 100);
    const netProceeds = grossProceeds - sellFee;
    const costBasis = params.lotsToSell * 100 * item.avg_price;
    const realizedPnl = netProceeds - costBasis;

    setCashAccounts(prev => prev.map(acc => {
      if (acc.id === params.accountId) {
        return { ...acc, balance: acc.balance + netProceeds };
      }
      return acc;
    }));

    addTransaction({
      account_id: params.accountId,
      title: `Jual Saham ${params.ticker} (${params.lotsToSell} Lot @ Rp ${params.sellPrice.toLocaleString('id-ID')})`,
      amount: netProceeds,
      type: 'INCOME',
      category: 'Hasil Jual Saham',
      transaction_date: new Date().toISOString().split('T')[0],
    });

    setPortfolio(prev => {
      if (params.lotsToSell >= item.lots) {
        return prev.filter(p => p.id !== params.portfolioId);
      } else {
        return prev.map(p => p.id === params.portfolioId ? {
          ...p,
          lots: p.lots - params.lotsToSell
        } : p);
      }
    });

    const alertMsg = realizedPnl >= 0 
      ? `Realisasi CUAN Rp ${Math.round(realizedPnl).toLocaleString('id-ID')} dari penjualan saham ${params.ticker}!`
      : `Realisasi Loss Rp ${Math.abs(Math.round(realizedPnl)).toLocaleString('id-ID')} dari penjualan saham ${params.ticker}.`;
    
    setAlerts(prev => [{
      id: 'alt-' + Date.now(),
      user_id: user?.id || profile.id,
      title: realizedPnl >= 0 ? 'Profit Saham Terealisasi' : 'Cut Loss Terealisasi',
      message: alertMsg,
      type: 'STOCK_PRICE',
      is_read: false,
      created_at: new Date().toISOString()
    }, ...prev]);
  };

  const markFixedExpensePaid = (fixedExpenseId: string, accountId: string) => {
    const expense = fixedExpenses.find(f => f.id === fixedExpenseId);
    if (!expense) return;

    setFixedExpenses(prev => prev.map(f => f.id === fixedExpenseId ? { ...f, is_paid: true } : f));

    setCashAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, balance: acc.balance - expense.amount };
      }
      return acc;
    }));

    addTransaction({
      account_id: accountId,
      title: `Bayar Tagihan: ${expense.title}`,
      amount: expense.amount,
      type: 'EXPENSE',
      category: 'Tagihan Rutin',
      is_fixed_expense: true,
      transaction_date: new Date().toISOString().split('T')[0],
    });
  };

  const totalCashBalance = cashAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const totalStockMarketValue = portfolio.reduce((sum, item) => {
    const livePrice = stockCache[item.ticker]?.current_price || item.avg_price;
    return sum + (item.lots * 100 * livePrice);
  }, 0);

  const totalInvestedCapital = portfolio.reduce((sum, item) => {
    return sum + (item.lots * 100 * item.avg_price);
  }, 0);

  const totalNetWorth = totalCashBalance + totalStockMarketValue;

  const floatingGainLossAmount = totalStockMarketValue - totalInvestedCapital;
  const floatingGainLossPercentage = totalInvestedCapital > 0 
    ? Number(((floatingGainLossAmount / totalInvestedCapital) * 100).toFixed(2)) 
    : 0;

  const totalFloatingGainLoss = {
    amount: floatingGainLossAmount,
    percentage: floatingGainLossPercentage
  };

  const totalMonthlyPassive = passiveIncomes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalMonthlyFixed = fixedExpenses.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const financialFreedomRatio = totalMonthlyFixed > 0 
    ? Number(((totalMonthlyPassive / totalMonthlyFixed) * 100).toFixed(1))
    : 0;

  const exportBackupJson = () => {
    const backupData = {
      version: 'EdWealth-V3',
      exportDate: new Date().toISOString(),
      profile,
      cashAccounts,
      transactions,
      fixedExpenses,
      portfolio,
      passiveIncomes,
      alerts
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.cashAccounts) setCashAccounts(data.cashAccounts);
      if (data.transactions) setTransactions(data.transactions);
      if (data.fixedExpenses) setFixedExpenses(data.fixedExpenses);
      if (data.portfolio) setPortfolio(data.portfolio);
      if (data.passiveIncomes) setPassiveIncomes(data.passiveIncomes);
      if (data.profile) setProfile(data.profile);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      isGuestMode,
      setIsGuestMode,
      handleLogout,

      profile,
      setProfile,
      isIncognito,
      toggleIncognito,
      activeTab,
      setActiveTab,
      cashAccounts,
      transactions,
      fixedExpenses,
      portfolio,
      stockCache,
      passiveIncomes,
      alerts,
      isRefreshingStocks,

      isVoiceModalOpen,
      setIsVoiceModalOpen,
      isBuyStockModalOpen,
      setIsBuyStockModalOpen,
      isSellStockModalOpen,
      setIsSellStockModalOpen,
      selectedStockToSell,
      setSelectedStockToSell,
      isAveragingModalOpen,
      setIsAveragingModalOpen,
      isAddTxModalOpen,
      setIsAddTxModalOpen,
      isAlertsModalOpen,
      setIsAlertsModalOpen,
      isReportModalOpen,
      setIsReportModalOpen,
      isProfileModalOpen,
      setIsProfileModalOpen,

      addTransaction,
      buyStock,
      sellStock,
      markFixedExpensePaid,
      refreshStockPrices,
      exportBackupJson,
      importBackupJson,

      totalCashBalance,
      totalStockMarketValue,
      totalNetWorth,
      totalFloatingGainLoss,
      financialFreedomRatio,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
