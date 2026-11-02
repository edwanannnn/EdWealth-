import React from 'react';
import { useApp } from '../context/AppContext';

export const PortfolioTab: React.FC = () => {
  const { 
    portfolio, stockCache, isRefreshingStocks, refreshStockPrices,
    totalStockMarketValue, totalFloatingGainLoss,
    setIsBuyStockModalOpen, setIsSellStockModalOpen, setSelectedStockToSell,
    setIsAveragingModalOpen, isIncognito
  } = useApp();

  const formatMoney = (val: number) => {
    if (isIncognito) return 'Rp ••••••••';
    return `Rp ${Math.round(val).toLocaleString('id-ID')}`;
  };

  const totalInvested = portfolio.reduce((sum, item) => sum + (item.lots * 100 * item.avg_price), 0);

  return (
    <div className="flex flex-col w-full pb-28 px-4 pt-3 space-y-4 animate-fadeIn">
      {/* 1. Portfolio Value & PnL Summary Banner */}
      <div className="bg-gradient-to-br from-surface-container-highest to-surface-container p-4 rounded-3xl shadow-sm border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider">
            Total Nilai Portofolio Saham
          </span>
          <button
            onClick={refreshStockPrices}
            disabled={isRefreshingStocks}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest text-primary text-xs font-bold shadow-sm active:scale-95 transition-transform"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshingStocks ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isRefreshingStocks ? 'Memperbarui...' : 'Perbarui Harga'}</span>
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-on-surface tracking-tight">
            {formatMoney(totalStockMarketValue)}
          </span>
        </div>

        {/* Floating Gain/Loss Metric */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/30 text-xs">
          <div>
            <span className="text-outline text-[10px] uppercase font-bold block">Modal Pokok Terbeli</span>
            <span className="font-extrabold text-on-surface">{formatMoney(totalInvested)}</span>
          </div>
          <div>
            <span className="text-outline text-[10px] uppercase font-bold block">Total Floating P/L</span>
            <span className={`font-extrabold flex items-center gap-0.5 ${
              totalFloatingGainLoss.amount >= 0 ? 'text-green-700' : 'text-error'
            }`}>
              <span className="material-symbols-outlined text-[14px]">
                {totalFloatingGainLoss.amount >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span>
                {totalFloatingGainLoss.amount >= 0 ? '+' : ''}{formatMoney(totalFloatingGainLoss.amount)} ({totalFloatingGainLoss.percentage}%)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setIsBuyStockModalOpen(true)}
          className="py-3 px-4 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ Beli Saham Baru</span>
        </button>

        <button
          onClick={() => setIsAveragingModalOpen(true)}
          className="py-3 px-4 rounded-full bg-surface-container text-primary font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">calculate</span>
          <span>Kalkulator Averaging</span>
        </button>
      </div>

      {/* 3. Owned Stocks List */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-outline uppercase tracking-wider">
            Emiten Dalam Portofolio ({portfolio.length})
          </span>
          <span className="text-[10px] text-outline font-semibold">Terkoneksi BEI (.JK)</span>
        </div>

        <div className="space-y-3">
          {portfolio.length === 0 ? (
            <div className="py-12 text-center text-outline bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
              <span className="material-symbols-outlined text-4xl mb-2 text-primary">add_chart</span>
              <p className="text-sm font-bold text-on-surface">Belum ada saham di portofolio</p>
              <p className="text-xs text-outline mt-1">Tap tombol "+ Beli Saham Baru" di atas untuk mulai mencatat.</p>
            </div>
          ) : (
            portfolio.map(stock => {
              const liveData = stockCache[stock.ticker];
              const currentPrice = liveData?.current_price || stock.avg_price;
              const marketValue = stock.lots * 100 * currentPrice;
              const costBasis = stock.lots * 100 * stock.avg_price;
              const pnl = marketValue - costBasis;
              const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

              return (
                <div 
                  key={stock.id}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-sm space-y-3"
                >
                  {/* Top Bar: Ticker, Name, and Jual Button */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-primary">{stock.ticker}</span>
                        <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-0.5 rounded-full uppercase">
                          {stock.sector || 'IDX'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-1">{stock.company_name}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedStockToSell(stock);
                        setIsSellStockModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-full bg-secondary-fixed/50 hover:bg-secondary-fixed text-secondary font-bold text-xs active:scale-95 transition-all"
                    >
                      Jual
                    </button>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-outline uppercase font-bold block">Kepemilikan</span>
                      <span className="font-extrabold text-on-surface">{stock.lots} Lot</span>
                      <span className="text-[10px] text-outline block">{stock.lots * 100} lembar</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-outline uppercase font-bold block">Avg Beli</span>
                      <span className="font-bold text-on-surface">Rp {stock.avg_price.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-outline block">Harga Masuk</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-outline uppercase font-bold block">Harga Terkini</span>
                      <span className="font-bold text-on-surface">Rp {currentPrice.toLocaleString('id-ID')}</span>
                      <span className={`text-[10px] font-bold block ${
                        liveData?.change_percentage && liveData.change_percentage >= 0 ? 'text-green-700' : 'text-error'
                      }`}>
                        {liveData?.change_percentage ? `${liveData.change_percentage >= 0 ? '+' : ''}${liveData.change_percentage}%` : 'Live'}
                      </span>
                    </div>
                  </div>

                  {/* Value & Gain/Loss Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-xs">
                    <div>
                      <span className="text-[10px] text-outline uppercase font-bold block">Nilai Pasar</span>
                      <span className="font-extrabold text-on-surface">{formatMoney(marketValue)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-outline uppercase font-bold block">Floating Cuan/Rugi</span>
                      <span className={`font-extrabold text-sm ${pnl >= 0 ? 'text-green-700' : 'text-error'}`}>
                        {pnl >= 0 ? '+' : ''}{formatMoney(pnl)} ({pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
