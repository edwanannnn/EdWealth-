import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const LedgerTab: React.FC = () => {
  const { transactions, isIncognito, setIsAddTxModalOpen } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const formatMoney = (val: number) => {
    if (isIncognito) return 'Rp ••••••••';
    return `Rp ${Math.round(val).toLocaleString('id-ID')}`;
  };

  // Filter transactions
  const filtered = transactions.filter(tx => {
    if (activeFilter !== 'ALL' && tx.type !== activeFilter) return false;
    if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return tx.title.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
    }
    return true;
  });

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <div className="flex flex-col w-full pb-36 px-4 pt-3 space-y-4 animate-fadeIn">
      {/* 1. Monthly Flow Summary Header */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center gap-1.5 text-green-800 text-[10px] font-bold uppercase">
            <span className="material-symbols-outlined text-[14px]">south_west</span>
            Total Pemasukan
          </div>
          <span className="text-base font-extrabold text-green-900 mt-1 block">
            +{formatMoney(totalIncome)}
          </span>
        </div>

        <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200">
          <div className="flex items-center gap-1.5 text-red-800 text-[10px] font-bold uppercase">
            <span className="material-symbols-outlined text-[14px]">north_east</span>
            Total Pengeluaran
          </div>
          <span className="text-base font-extrabold text-red-900 mt-1 block">
            -{formatMoney(totalExpense)}
          </span>
        </div>
      </div>

      {/* 2. Search & Filters */}
      <div className="space-y-2.5">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari transaksi (e.g. kopi, gaji, bensin)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
          />
          <span className="absolute left-3.5 top-2.5 material-symbols-outlined text-outline text-[18px]">search</span>
        </div>

        {/* Type Pill Filter */}
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'EXPENSE', label: 'Pengeluaran' },
            { id: 'INCOME', label: 'Pemasukan' },
            { id: 'TRANSFER', label: 'Transfer' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto py-0.5">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                selectedCategory === 'ALL' ? 'bg-outline-variant text-on-surface' : 'bg-surface-container-low text-outline'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-outline-variant text-on-surface' : 'bg-surface-container-low text-outline'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Transaction List */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-outline uppercase tracking-wider">
            Histori Mutasi ({filtered.length})
          </span>
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="text-xs font-bold text-primary flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Catat Manual
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/20 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-outline">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline">receipt</span>
              <p className="text-sm font-bold text-on-surface">Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
            filtered.map(tx => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-surface-container/40 transition-colors">
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
                    <div className="flex items-center gap-1.5 text-[10px] text-outline mt-0.5">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.account_name || 'Kas'}</span>
                      <span>•</span>
                      <span>{tx.transaction_date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <span className={`text-xs font-extrabold ${
                    tx.type === 'INCOME' ? 'text-green-700' : tx.type === 'TRANSFER' ? 'text-blue-700' : 'text-error'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : tx.type === 'TRANSFER' ? '⇄' : '-'}{formatMoney(tx.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
