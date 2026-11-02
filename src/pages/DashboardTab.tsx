import React from 'react';
import { useApp } from '../context/AppContext';

export const DashboardTab: React.FC = () => {
  const { 
    totalNetWorth, totalCashBalance, totalStockMarketValue, 
    totalFloatingGainLoss, financialFreedomRatio,
    isIncognito, toggleIncognito,
    transactions, setActiveTab,
    setIsAddTxModalOpen, setIsBuyStockModalOpen, setIsReportModalOpen, setIsVoiceModalOpen
  } = useApp();

  const formatMoney = (val: number) => {
    if (isIncognito) return 'Rp ••••••••';
    return `Rp ${Math.round(val).toLocaleString('id-ID')}`;
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-col w-full pb-28 animate-fadeIn">
      {/* 1. Dynamic Blue Hero Header Section */}
      <div className="relative bg-primary text-on-primary px-4 pt-4 pb-10 rounded-b-3xl shadow-md overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-tertiary-fixed-dim/20 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-primary-container/40 blur-xl pointer-events-none"></div>

        {/* Top Greeting Bar */}
        <div className="relative z-10 flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-white flex items-center gap-1.5">
              Hai Fin-e! <span className="text-lg">👋</span>
            </span>
            <span className="material-symbols-outlined text-tertiary-fixed text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>

          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white text-xs font-semibold backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            <span>Rekap Bulanan</span>
          </button>
        </div>

        {/* Total Net Worth Balance Card */}
        <div className="relative z-10 mt-2">
          <div className="flex items-center gap-2 text-white/80">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Net Worth (Kekayaan Bersih)</span>
            <button 
              onClick={toggleIncognito}
              className="flex items-center text-white/80 hover:text-white active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isIncognito ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {formatMoney(totalNetWorth)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              totalFloatingGainLoss.amount >= 0 ? 'bg-green-400/25 text-green-200' : 'bg-red-400/25 text-red-200'
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {totalFloatingGainLoss.amount >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span>
                {totalFloatingGainLoss.amount >= 0 ? '+' : ''}{totalFloatingGainLoss.percentage}% Floating Saham
              </span>
            </span>
            <span className="text-[10px] text-white/70">Terkoneksi BEI & Kas</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5 space-y-4 relative z-20">
        {/* 2. Breakdown Cards: Kas Likuid & Portofolio Saham */}
        <div className="grid grid-cols-2 gap-3">
          {/* Kas & RDN */}
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-outline mb-1">
              <span className="material-symbols-outlined text-[18px] text-primary">account_balance</span>
              <span className="text-[11px] font-bold uppercase">Kas & RDN</span>
            </div>
            <div>
              <span className="text-base font-extrabold text-on-surface">
                {formatMoney(totalCashBalance)}
              </span>
              <span className="text-[10px] text-outline block mt-0.5">Saldo Siap Pakai</span>
            </div>
          </div>

          {/* Portofolio Saham */}
          <div 
            onClick={() => setActiveTab('portfolio')}
            className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-between text-outline mb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">show_chart</span>
                <span className="text-[11px] font-bold uppercase">Saham BEI</span>
              </div>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </div>
            <div>
              <span className="text-base font-extrabold text-on-surface">
                {formatMoney(totalStockMarketValue)}
              </span>
              <span className="text-[10px] text-green-700 font-bold block mt-0.5">
                {totalFloatingGainLoss.amount >= 0 ? '+' : ''}Rp {Math.round(totalFloatingGainLoss.amount).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Financial Freedom Index Card */}
        <div 
          onClick={() => setActiveTab('fixed-passive')}
          className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/20 cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[16px]">savings</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-on-surface">Financial Freedom Index</h3>
                <p className="text-[10px] text-outline">Rasio Pasif vs Tagihan Rutin</p>
              </div>
            </div>
            <span className="text-sm font-extrabold text-tertiary-container">{financialFreedomRatio}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-tertiary to-tertiary-fixed-dim h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, financialFreedomRatio)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-on-surface-variant mt-1.5 font-medium">
            <span>{financialFreedomRatio >= 100 ? 'Bebas Finansial Tercapai! 🎉' : `${financialFreedomRatio}% Tertutupi dari Pasif`}</span>
            <span>Target 100%</span>
          </div>
        </div>

        {/* 4. Quick Actions Shortcut Grid */}
        <div>
          <span className="text-xs font-bold text-outline uppercase tracking-wider block mb-2 px-1">
            Menu Tindakan Cepat
          </span>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface text-center">Suara AI</span>
            </button>

            <button
              onClick={() => setIsBuyStockModalOpen(true)}
              className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">add_chart</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface text-center">Beli Saham</span>
            </button>

            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">sync_alt</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface text-center">Transfer</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">download</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface text-center">Laporan</span>
            </button>
          </div>
        </div>

        {/* 5. Recent Activity Ledger */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-outline uppercase tracking-wider">
              Transaksi Terakhir
            </span>
            <button 
              onClick={() => setActiveTab('ledger')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/20 shadow-sm overflow-hidden">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-surface-container/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'INCOME' 
                      ? 'bg-green-100 text-green-700' 
                      : tx.type === 'TRANSFER' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-red-100 text-error'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {tx.type === 'INCOME' ? 'arrow_downward' : tx.type === 'TRANSFER' ? 'swap_horiz' : 'arrow_upward'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-on-surface truncate">{tx.title}</h4>
                    <span className="text-[10px] text-outline">{tx.category} • {tx.transaction_date}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-extrabold ${
                    tx.type === 'INCOME' ? 'text-green-700' : tx.type === 'TRANSFER' ? 'text-blue-700' : 'text-error'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : tx.type === 'TRANSFER' ? '⇄' : '-'}{formatMoney(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
