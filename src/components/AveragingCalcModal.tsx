import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AveragingCalcModal: React.FC = () => {
  const { isAveragingModalOpen, setIsAveragingModalOpen, portfolio, profile } = useApp();

  const [selectedTicker, setSelectedTicker] = useState<string>(portfolio[0]?.ticker || 'BBCA');
  const [currentLots, setCurrentLots] = useState<string>(portfolio[0] ? String(portfolio[0].lots) : '10');
  const [currentAvgPrice, setCurrentAvgPrice] = useState<string>(portfolio[0] ? String(portfolio[0].avg_price) : '9000');
  
  const [newLots, setNewLots] = useState<string>('10');
  const [newBuyPrice, setNewBuyPrice] = useState<string>('8500');

  const handleSelectStock = (ticker: string) => {
    setSelectedTicker(ticker);
    const item = portfolio.find(p => p.ticker === ticker);
    if (item) {
      setCurrentLots(String(item.lots));
      setCurrentAvgPrice(String(item.avg_price));
    }
  };

  // Calculations
  const numCurrentLots = Number(currentLots) || 0;
  const numCurrentAvgPrice = Number(currentAvgPrice) || 0;
  const numNewLots = Number(newLots) || 0;
  const numNewBuyPrice = Number(newBuyPrice) || 0;

  const currentCost = numCurrentLots * 100 * numCurrentAvgPrice;
  const newGrossCost = numNewLots * 100 * numNewBuyPrice;
  const newFee = newGrossCost * (profile.default_buy_fee / 100);
  const totalNewCapital = newGrossCost + newFee;

  const totalCombinedLots = numCurrentLots + numNewLots;
  const combinedCost = currentCost + newGrossCost;
  const newAvgPrice = totalCombinedLots > 0 ? Math.round(combinedCost / (totalCombinedLots * 100)) : 0;
  
  const avgDiff = newAvgPrice - numCurrentAvgPrice;
  const avgDiffPct = numCurrentAvgPrice > 0 ? (avgDiff / numCurrentAvgPrice) * 100 : 0;

  if (!isAveragingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">calculate</span>
            <h2 className="text-lg font-bold text-on-surface">Kalkulator Averaging Saham</h2>
          </div>
          <button 
            onClick={() => setIsAveragingModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Stock Quick Selector */}
        {portfolio.length > 0 && (
          <div className="mt-3">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Pilih dari Portofolio</label>
            <div className="flex gap-2 overflow-x-auto py-2">
              {portfolio.map(p => (
                <button
                  key={p.ticker}
                  type="button"
                  onClick={() => handleSelectStock(p.ticker)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedTicker === p.ticker
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {p.ticker} ({p.lots} Lot)
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-2">
          {/* Current Position */}
          <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <span className="text-xs font-bold text-primary uppercase block mb-2">Posisi Saat Ini</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-outline uppercase">Lot Sekarang</label>
                <input
                  type="number"
                  min="1"
                  value={currentLots}
                  onChange={(e) => setCurrentLots(e.target.value)}
                  placeholder="1"
                  className="w-full mt-0.5 px-3 py-2 bg-surface rounded-xl text-sm font-bold focus:outline-none border border-outline-variant/30"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-outline uppercase">Avg Price Sekarang</label>
                <input
                  type="number"
                  min="1"
                  value={currentAvgPrice}
                  onChange={(e) => setCurrentAvgPrice(e.target.value)}
                  placeholder="0"
                  className="w-full mt-0.5 px-3 py-2 bg-surface rounded-xl text-sm font-bold focus:outline-none border border-outline-variant/30"
                />
              </div>
            </div>
          </div>

          {/* New Planned Buy */}
          <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <span className="text-xs font-bold text-tertiary-container uppercase block mb-2">Rencana Beli Baru (Averaging)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-outline uppercase">Tambah Lot</label>
                <input
                  type="number"
                  min="1"
                  value={newLots}
                  onChange={(e) => setNewLots(e.target.value)}
                  placeholder="1"
                  className="w-full mt-0.5 px-3 py-2 bg-surface rounded-xl text-sm font-bold focus:outline-none border border-outline-variant/30"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-outline uppercase">Harga Beli Baru (Rp)</label>
                <input
                  type="number"
                  min="1"
                  value={newBuyPrice}
                  onChange={(e) => setNewBuyPrice(e.target.value)}
                  placeholder="0"
                  className="w-full mt-0.5 px-3 py-2 bg-surface rounded-xl text-sm font-bold focus:outline-none border border-outline-variant/30"
                />
              </div>
            </div>
          </div>

          {/* Result Card: New Average Price & Projection */}
          <div className="p-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl shadow-lg space-y-2">
            <div className="flex justify-between items-center text-xs opacity-90">
              <span>Hasil Estimasi Harga Rata-Rata Baru:</span>
              <span className="font-bold">{totalCombinedLots} Lot Total</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">
                Rp {newAvgPrice.toLocaleString('id-ID')}
              </span>
              <span className="text-sm font-semibold opacity-90">/ lembar</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/20 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-bold ${
                avgDiff <= 0 ? 'bg-green-400 text-green-950' : 'bg-amber-300 text-amber-950'
              }`}>
                {avgDiff <= 0 ? 'Turun' : 'Naik'} {Math.abs(avgDiff).toLocaleString('id-ID')} ({Math.abs(avgDiffPct).toFixed(2)}%)
              </span>
              <span className="opacity-80 text-[11px]">dari harga awal Rp {numCurrentAvgPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Modal Required Breakdown */}
          <div className="p-3 bg-surface-container rounded-2xl space-y-1.5 text-xs border border-outline-variant/20">
            <div className="flex justify-between text-on-surface-variant">
              <span>Dana Beli Baru</span>
              <span className="font-semibold">Rp {newGrossCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Estimasi Fee Beli ({profile.default_buy_fee}%)</span>
              <span className="font-semibold">Rp {Math.round(newFee).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-on-surface pt-1 border-t border-outline-variant/30">
              <span>Total Dana Yang Dibutuhkan</span>
              <span className="text-primary font-extrabold">Rp {Math.round(totalNewCapital).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            onClick={() => setIsAveragingModalOpen(false)}
            className="w-full py-3 px-4 rounded-full bg-surface-container-highest text-primary font-bold text-xs active:scale-95 transition-transform"
          >
            Tutup Kalkulator
          </button>
        </div>
      </div>
    </div>
  );
};
