import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Profile, CashAccount, Transaction, TransactionType, StockPortfolioItem, 
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
  { id: 'acc-1', user_id: 'demo-user', account_name: 'BCA Utama', account_type: 'BANK', balance: 0 },
  { id: 'acc-2', user_id: 'demo-user', account_name: 'RDN Stockbit', account_type: 'RDN', balance: 0 },
  { id: 'acc-3', user_id: 'demo-user', account_name: 'SeaBank QRIS', account_type: 'E_WALLET', balance: 0 },
  { id: 'acc-4', user_id: 'demo-user', account_name: 'Kas Dompet Tunai', account_type: 'CASH', balance: 0 },
];

const DEMO_PORTFOLIO: StockPortfolioItem[] = [];

const DEMO_TRANSACTIONS: Transaction[] = [];

const DEMO_FIXED_EXPENSES: Transaction[] = [];

const DEMO_PASSIVE_INCOMES: PassiveIncome[] = [];

const DEMO_ALERTS: FinancialAlert[] = [];

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
  addTxDefaultType: TransactionType;
  setAddTxDefaultType: (type: TransactionType) => void;
  isAlertsModalOpen: boolean;
  setIsAlertsModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isManageAccountsModalOpen: boolean;
  setIsManageAccountsModalOpen: (open: boolean) => void;
  isAddPassiveModalOpen: boolean;
  setIsAddPassiveModalOpen: (open: boolean) => void;
  isAddFixedModalOpen: boolean;
  setIsAddFixedModalOpen: (open: boolean) => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
  updateAccountBalance: (accountId: string, newBalance: number) => void;
  addCashAccount: (account: { account_name: string; account_type: 'BANK' | 'RDN' | 'E_WALLET' | 'CASH'; balance: number }) => void;
  addPassiveIncome: (item: { source_name: string; amount: number; frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'; received_date?: string }) => void;
  addFixedExpense: (item: { title: string; amount: number; due_date: number; category?: string }) => void;
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
  const [addTxDefaultType, setAddTxDefaultType] = useState<TransactionType>('EXPENSE');
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isManageAccountsModalOpen, setIsManageAccountsModalOpen] = useState(false);
  const [isAddPassiveModalOpen, setIsAddPassiveModalOpen] = useState(false);
  const [isAddFixedModalOpen, setIsAddFixedModalOpen] = useState(false);

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
    setTransactions([]);
    setFixedExpenses([]);
    setPortfolio([]);
    setPassiveIncomes([]);
    setAlerts([]);
    setStockCache({});
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

      // 3. Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', activeUser.id)
        .order('transaction_date', { ascending: false });

      const txList = txData || [];
      setTransactions(txList);

      if (accountsData && accountsData.length > 0) {
        // Anti-Phantom Safeguard: If new user (0 transactions) has any dummy balances > 0, auto-reset to 0!
        if (txList.length === 0 && accountsData.some(a => Number(a.balance) > 0)) {
          for (const acc of accountsData) {
            if (Number(acc.balance) > 0) {
              await supabase.from('cash_accounts').update({ balance: 0 }).eq('id', acc.id);
              acc.balance = 0;
            }
          }
        }
        setCashAccounts(accountsData);
      } else {
        // If SQL trigger hasn't fired or fresh, create initial clean accounts with 0 balance
        const initialAccounts: CashAccount[] = [
          { id: 'acc-' + Date.now() + '-1', user_id: activeUser.id, account_name: 'BCA Utama', account_type: 'BANK', balance: 0 },
          { id: 'acc-' + Date.now() + '-2', user_id: activeUser.id, account_name: 'RDN Stockbit', account_type: 'RDN', balance: 0 },
          { id: 'acc-' + Date.now() + '-3', user_id: activeUser.id, account_name: 'Kas Dompet Tunai', account_type: 'CASH', balance: 0 },
        ];
        setCashAccounts(initialAccounts);
        for (const acc of initialAccounts) {
          try {
            await supabase.from('cash_accounts').insert({
              id: acc.id,
              user_id: activeUser.id,
              account_name: acc.account_name,
              account_type: acc.account_type,
              balance: 0,
            });
          } catch {}
        }
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

  // Update Account Balance (for starting balance adjustments or edits)
  const updateAccountBalance = (accountId: string, newBalance: number) => {
    const val = Number(newBalance) || 0;
    setCashAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, balance: val } : acc));
    if (user) {
      Promise.resolve(
        supabase.from('cash_accounts').update({ balance: val }).eq('id', accountId)
      ).catch(err => console.warn('Supabase update balance error:', err));
    }
  };

  // Add New Cash/Bank/RDN/Wallet Account
  const addCashAccount = (accountData: { account_name: string; account_type: 'BANK' | 'RDN' | 'E_WALLET' | 'CASH'; balance: number }) => {
    const newId = 'acc-' + Date.now();
    const currentUserId = user?.id || profile.id;
    const newAcc: CashAccount = {
      id: newId,
      user_id: currentUserId,
      account_name: accountData.account_name,
      account_type: accountData.account_type,
      balance: Number(accountData.balance) || 0,
    };
    setCashAccounts(prev => [...prev, newAcc]);
    if (user) {
      Promise.resolve(
        supabase.from('cash_accounts').insert({
          id: newId,
          user_id: user.id,
          account_name: newAcc.account_name,
          account_type: newAcc.account_type,
          balance: newAcc.balance,
        })
      ).catch(err => console.warn('Supabase insert account error:', err));
    }
  };

  // Add Passive Income Source (Dividen, Deposito, SBN, Sewa Properti)
  const addPassiveIncome = (item: { source_name: string; amount: number; frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'; received_date?: string }) => {
    const newId = 'pass-' + Date.now();
    const currentUserId = user?.id || profile.id;
    const newPassive: PassiveIncome = {
      id: newId,
      user_id: currentUserId,
      source_name: item.source_name,
      amount: Number(item.amount),
      frequency: item.frequency,
      received_date: item.received_date || new Date().toISOString().split('T')[0],
    };
    setPassiveIncomes(prev => [...prev, newPassive]);
    if (user) {
      Promise.resolve(
        supabase.from('passive_incomes').insert({
          id: newId,
          user_id: user.id,
          source_name: newPassive.source_name,
          amount: newPassive.amount,
          frequency: newPassive.frequency,
          received_date: newPassive.received_date,
        })
      ).catch(err => console.warn('Supabase insert passive income error:', err));
    }
  };

  // Add Fixed Recurring Expense (Tagihan Rutin)
  const addFixedExpense = (item: { title: string; amount: number; due_date: number; category?: string }) => {
    const newId = 'fix-' + Date.now();
    const currentUserId = user?.id || profile.id;
    const newFixed: Transaction = {
      id: newId,
      user_id: currentUserId,
      title: item.title,
      amount: Number(item.amount),
      type: 'EXPENSE',
      category: item.category || 'Tagihan Rutin',
      is_fixed_expense: true,
      due_date: Number(item.due_date),
      is_paid: false,
      transaction_date: new Date().toISOString().split('T')[0],
    };
    setFixedExpenses(prev => [...prev, newFixed]);
    if (user) {
      Promise.resolve(
        supabase.from('transactions').insert({
          id: newId,
          user_id: user.id,
          title: newFixed.title,
          amount: newFixed.amount,
          type: newFixed.type,
          category: newFixed.category,
          is_fixed_expense: true,
          due_date: newFixed.due_date,
          is_paid: false,
          transaction_date: newFixed.transaction_date,
        })
      ).catch(err => console.warn('Supabase insert fixed expense error:', err));
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
      addTxDefaultType,
      setAddTxDefaultType,
      isAlertsModalOpen,
      setIsAlertsModalOpen,
      isReportModalOpen,
      setIsReportModalOpen,
      isProfileModalOpen,
      setIsProfileModalOpen,
      isManageAccountsModalOpen,
      setIsManageAccountsModalOpen,
      isAddPassiveModalOpen,
      setIsAddPassiveModalOpen,
      isAddFixedModalOpen,
      setIsAddFixedModalOpen,

      addTransaction,
      updateAccountBalance,
      addCashAccount,
      addPassiveIncome,
      addFixedExpense,
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
