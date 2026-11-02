import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const SellStockModal: React.FC = () => {
  const { 
    isSellStockModalOpen, setIsSellStockModalOpen, 
    selectedStockToSell, sellStock, 
    cashAccounts, profile, stockCache 
  } = useApp();

  const [lotsToSell, setLotsToSell] = useState<string>('1');
  const [sellPrice, setSellPrice] = useState<string>('0');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    if (selectedStockToSell) {
      setLotsToSell(String(selectedStockToSell.lots));
      const livePrice = stockCache[selectedStockToSell.ticker]?.current_price || selectedStockToSell.avg_price;
      setSellPrice(String(livePrice));
      const rdn = cashAccounts.find(a => a.account_type === 'RDN') || cashAccounts[0];
      setSelectedAccountId(rdn?.id || '');
    }
  }, [selectedStockToSell, stockCache]);

  if (!isSellStockModalOpen || !selectedStockToSell) return null;

  const numLotsToSell = Number(lotsToSell) || 0;
  const numSellPrice = Number(sellPrice) || 0;
  const grossSale = numLotsToSell * 100 * numSellPrice;
  const sellFee = grossSale * (profile.default_sell_fee / 100);
  const netProceeds = grossSale - sellFee;
  const costBasis = numLotsToSell * 100 * selectedStockToSell.avg_price;
  const realizedPnl = netProceeds - costBasis;
  const realizedPnlPct = costBasis > 0 ? (realizedPnl / costBasis) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numLotsToSell <= 0 || numLotsToSell > selectedStockToSell.lots || numSellPrice <= 0 || !selectedAccountId) return;

    sellStock({
      portfolioId: selectedStockToSell.id,
      ticker: selectedStockToSell.ticker,
      lotsToSell: numLotsToSell,
      sellPrice: numSellPrice,
      accountId: selectedAccountId,
    });

    setIsSellStockModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">sell</span>
            <h2 className="text-lg font-bold text-on-surface">Jual Saham {selectedStockToSell.ticker}</h2>
          </div>
          <button 
            onClick={() => setIsSellStockModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Stock Info Bar */}
        <div className="mt-3 p-3 bg-surface-container-low rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-primary">{selectedStockToSell.ticker}</span>
            <p className="text-[11px] text-on-surface-variant line-clamp-1">{selectedStockToSell.company_name}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-on-surface">{selectedStockToSell.lots} Lot Tersedia</span>
            <p className="text-[11px] text-outline">Avg: Rp {selectedStockToSell.avg_price.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Grid Lot & Harga Jual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase">Lot Yang Dijual</label>
              <input
                type="number"
                min="1"
                max={selectedStockToSell.lots}
                value={lotsToSell}
                onChange={(e) => setLotsToSell(e.target.value)}
                placeholder="1"
                className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                required
              />
              <span className="text-[10px] text-outline mt-0.5 block">{numLotsToSell * 100} lembar</span>
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase">Harga Jual / Lembar (Rp)</label>
              <input
                type="number"
                min="1"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0"
                className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                required
              />
              <span className="text-[10px] text-outline mt-0.5 block">Rp {numSellPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Rekening Tujuan Hasil Penjualan */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase">Kirim Hasil Penjualan Bersih Ke</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
            >
              {cashAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name} ({acc.account_type})
                </option>
              ))}
            </select>
          </div>

          {/* Realized Profit / Loss Highlight Card */}
          <div className={`p-4 rounded-2xl border text-center space-y-1 ${
            realizedPnl >= 0 
              ? 'bg-green-50/80 border-green-200 text-green-900' 
              : 'bg-red-50/80 border-red-200 text-red-900'
          }`}>
            <span className="text-xs font-bold tracking-wider uppercase">
              {realizedPnl >= 0 ? 'Potensi Realized Profit (Cuan)' : 'Potensi Realized Cut Loss'}
            </span>
            <div className="flex items-center justify-center gap-1.5 text-xl font-extrabold">
              <span>{realizedPnl >= 0 ? '+' : ''}Rp {Math.round(realizedPnl).toLocaleString('id-ID')}</span>
              <span className="text-sm font-bold">({realizedPnlPct >= 0 ? '+' : ''}{realizedPnlPct.toFixed(2)}%)</span>
            </div>
          </div>

          {/* Fee Calculation Breakdown */}
          <div className="p-3 bg-surface-container rounded-2xl space-y-1.5 text-xs border border-outline-variant/20">
            <div className="flex justify-between text-on-surface-variant">
              <span>Nilai Kotor Penjualan</span>
              <span className="font-semibold">Rp {grossSale.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Fee Broker & Pajak ({profile.default_sell_fee}%)</span>
              <span className="font-semibold">- Rp {Math.round(sellFee).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-on-surface pt-1 border-t border-outline-variant/30">
              <span>Hasil Penjualan Bersih Masuk Saldo</span>
              <span className="text-green-700 font-extrabold">Rp {Math.round(netProceeds).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-full bg-secondary text-white font-bold text-sm shadow-lg shadow-secondary/25 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">check</span>
            <span>Konfirmasi Jual & Realisasi Dana</span>
          </button>
        </form>
      </div>
    </div>
  );
};
