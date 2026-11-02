import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchStockPriceFromYahoo } from '../lib/stockApi';

const POPULAR_STOCKS = [
  { ticker: 'BBCA', name: 'Bank Central Asia Tbk', sector: 'Financials' },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', sector: 'Financials' },
  { ticker: 'BMRI', name: 'Bank Mandiri Tbk', sector: 'Financials' },
  { ticker: 'BBNI', name: 'Bank Negara Indonesia Tbk', sector: 'Financials' },
  { ticker: 'BRIS', name: 'Bank Syariah Indonesia Tbk', sector: 'Financials' },
  { ticker: 'TLKM', name: 'Telkom Indonesia Tbk', sector: 'Infrastructure' },
  { ticker: 'ASII', name: 'Astra International Tbk', sector: 'Industrials' },
  { ticker: 'AMMN', name: 'Amman Mineral Internasional Tbk', sector: 'Basic Materials' },
  { ticker: 'BUMI', name: 'Bumi Resources Tbk', sector: 'Energy' },
  { ticker: 'CUAN', name: 'Petrindo Jaya Kreasi Tbk', sector: 'Energy' },
  { ticker: 'ADRO', name: 'Adaro Energy Indonesia Tbk', sector: 'Energy' },
  { ticker: 'ANTM', name: 'Aneka Tambang Tbk', sector: 'Basic Materials' },
  { ticker: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', sector: 'Technology' },
  { ticker: 'UNVR', name: 'Unilever Indonesia Tbk', sector: 'Consumer Non-Cyclicals' },
  { ticker: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk', sector: 'Consumer Non-Cyclicals' },
  { ticker: 'KLBF', name: 'Kalbe Farma Tbk', sector: 'Healthcare' },
  { ticker: 'PTBA', name: 'Bukit Asam Tbk', sector: 'Energy' },
  { ticker: 'MDKA', name: 'Merdeka Copper Gold Tbk', sector: 'Basic Materials' },
];

export const BuyStockModal: React.FC = () => {
  const { isBuyStockModalOpen, setIsBuyStockModalOpen, buyStock, cashAccounts, profile, stockCache } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<{ ticker: string; name: string } | null>(null);
  const [lots, setLots] = useState<number>(5);
  const [buyPrice, setBuyPrice] = useState<number>(9000);
  const [targetTp, setTargetTp] = useState<string>('');
  const [targetCl, setTargetCl] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    return cashAccounts.find(a => a.account_type === 'RDN')?.id || cashAccounts[0]?.id || '';
  });

  const filteredStocks = POPULAR_STOCKS.filter(s => 
    s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectStock = async (stock: { ticker: string; name: string }) => {
    setSelectedStock(stock);
    setSearchQuery(stock.ticker);
    
    // Check cached price
    const cached = stockCache[stock.ticker];
    if (cached) {
      setBuyPrice(cached.current_price);
    } else {
      const live = await fetchStockPriceFromYahoo(stock.ticker);
      if (live) setBuyPrice(live.current_price);
    }
  };

  const grossCost = (lots || 0) * 100 * (buyPrice || 0);
  const brokerFee = grossCost * (profile.default_buy_fee / 100);
  const totalCost = grossCost + brokerFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTicker = selectedStock?.ticker || searchQuery.toUpperCase().trim();
    if (!finalTicker || lots <= 0 || buyPrice <= 0) return;

    buyStock({
      ticker: finalTicker,
      companyName: selectedStock?.name || `${finalTicker} Tbk`,
      lots: Number(lots),
      avgPrice: Number(buyPrice),
      targetTp: targetTp ? Number(targetTp) : undefined,
      targetCl: targetCl ? Number(targetCl) : undefined,
      accountId: selectedAccountId,
    });

    setIsBuyStockModalOpen(false);
    setSelectedStock(null);
    setSearchQuery('');
  };

  if (!isBuyStockModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">add_circle</span>
            <h2 className="text-lg font-bold text-on-surface">Beli Saham BEI / IDX</h2>
          </div>
          <button 
            onClick={() => setIsBuyStockModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Ticker Search & Autocomplete */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase">Kode Emiten Saham</label>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Cari kode saham (e.g. BBCA, CUAN)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                required
              />
              <span className="absolute right-3 top-2.5 material-symbols-outlined text-outline text-[20px]">search</span>
            </div>

            {/* Autocomplete Dropdown List */}
            {searchQuery && !selectedStock && filteredStocks.length > 0 && (
              <div className="mt-1 max-h-40 overflow-y-auto bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg divide-y divide-outline-variant/20">
                {filteredStocks.map(stock => (
                  <button
                    key={stock.ticker}
                    type="button"
                    onClick={() => handleSelectStock(stock)}
                    className="w-full px-3 py-2 text-left hover:bg-surface-container flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-extrabold text-sm text-primary">{stock.ticker}</span>
                      <p className="text-[11px] text-on-surface-variant line-clamp-1">{stock.name}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-outline uppercase bg-surface-container px-2 py-0.5 rounded">
                      {stock.sector}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid Lot & Harga Beli */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase">Jumlah Lot (1 lot = 100)</label>
              <input
                type="number"
                min="1"
                value={lots}
                onChange={(e) => setLots(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                required
              />
              <span className="text-[10px] text-outline mt-0.5 block">{lots * 100} lembar saham</span>
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase">Harga Beli / Lembar (Rp)</label>
              <input
                type="number"
                min="1"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                required
              />
              <span className="text-[10px] text-outline mt-0.5 block">Rp {buyPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Potong Saldo Akun Kas / RDN */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase">Potong Saldo Dari Rekening</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
            >
              {cashAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name} (Saldo: Rp {acc.balance.toLocaleString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          {/* Optional Alerts: Take Profit & Cut Loss */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-green-700 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">flag</span>
                Target TP (Opsional)
              </label>
              <input
                type="number"
                placeholder="Contoh: 11000"
                value={targetTp}
                onChange={(e) => setTargetTp(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-surface-container-low rounded-xl text-xs font-medium focus:outline-none border border-outline-variant/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-red-700 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Target Stop Loss (Opsional)
              </label>
              <input
                type="number"
                placeholder="Contoh: 8500"
                value={targetCl}
                onChange={(e) => setTargetCl(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-surface-container-low rounded-xl text-xs font-medium focus:outline-none border border-outline-variant/30"
              />
            </div>
          </div>

          {/* Summary Box & Fee Calculation */}
          <div className="p-3 bg-surface-container rounded-2xl space-y-1.5 text-xs border border-outline-variant/20">
            <div className="flex justify-between text-on-surface-variant">
              <span>Nilai Pokok Pembelian</span>
              <span className="font-semibold">Rp {grossCost.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Fee Broker Beli ({profile.default_buy_fee}%)</span>
              <span className="font-semibold">Rp {Math.round(brokerFee).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-on-surface pt-1 border-t border-outline-variant/30">
              <span>Total Modal Dikeluarkan</span>
              <span className="text-primary font-extrabold">Rp {Math.round(totalCost).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            <span>Beli Saham & Simpan ke Portofolio</span>
          </button>
        </form>
      </div>
    </div>
  );
};
