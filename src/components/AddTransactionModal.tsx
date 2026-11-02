import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionType } from '../types';

export const AddTransactionModal: React.FC = () => {
  const { isAddTxModalOpen, setIsAddTxModalOpen, addTxDefaultType, addTransaction, cashAccounts } = useApp();

  const [type, setType] = useState<TransactionType>(addTxDefaultType || 'EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Makanan');
  const [accountId, setAccountId] = useState(cashAccounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState(cashAccounts[1]?.id || '');

  const expenseCategories = ['Makanan', 'Transportasi', 'Tagihan Rutin', 'Belanja', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lain-lain'];
  const incomeCategories = ['Gaji', 'Dividen', 'Bonus & THR', 'Bisnis', 'Hasil Investasi', 'Pemasukan Lain'];

  useEffect(() => {
    if (isAddTxModalOpen) {
      setType(addTxDefaultType);
      if (addTxDefaultType === 'INCOME') {
        setCategory('Gaji');
      } else if (addTxDefaultType === 'TRANSFER') {
        setCategory('Transfer Internal');
      } else {
        setCategory('Makanan');
      }
      if (!accountId && cashAccounts.length > 0) {
        setAccountId(cashAccounts[0].id);
      }
    }
  }, [isAddTxModalOpen, addTxDefaultType, cashAccounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0 || !accountId) return;

    addTransaction({
      account_id: accountId,
      destination_account_id: type === 'TRANSFER' ? destinationAccountId : undefined,
      title,
      amount: Number(amount),
      type,
      category: type === 'TRANSFER' ? 'Transfer Internal' : category,
      transaction_date: new Date().toISOString().split('T')[0],
    });

    setIsAddTxModalOpen(false);
    setTitle('');
    setAmount(0);
  };

  if (!isAddTxModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">post_add</span>
            <h2 className="text-lg font-bold text-on-surface">Catat Transaksi Manual</h2>
          </div>
          <button 
            onClick={() => setIsAddTxModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Type Selector (Tabs: Pengeluaran, Pemasukan, Transfer) */}
        <div className="grid grid-cols-3 gap-2 mt-3 p-1 bg-surface-container-low rounded-2xl">
          <button
            type="button"
            onClick={() => { setType('EXPENSE'); setCategory('Makanan'); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'EXPENSE' ? 'bg-error text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => { setType('INCOME'); setCategory('Gaji'); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'INCOME' ? 'bg-green-600 text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setType('TRANSFER')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'TRANSFER' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Transfer Antar Akun
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3">
          {/* Nominal Input */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase">Nominal Transaksi (Rp)</label>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-2.5 font-extrabold text-sm text-outline">Rp</span>
              <input
                type="number"
                min="100"
                placeholder="0"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-lg font-extrabold focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                required
              />
            </div>
          </div>

          {/* Judul / Keterangan */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase">Keterangan / Judul</label>
            <input
              type="text"
              placeholder="Contoh: Makan siang, Kopi, Beli Bensin..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-surface-container-low rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
              required
            />
          </div>

          {/* Kategori (if not transfer) */}
          {type !== 'TRANSFER' && (
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-sm font-semibold focus:outline-none border border-outline-variant/30"
              >
                {(type === 'EXPENSE' ? expenseCategories : incomeCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Akun Sumber */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase">
              {type === 'TRANSFER' ? 'Dari Akun (Sumber Dana)' : 'Rekening / Dompet'}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-sm font-semibold focus:outline-none border border-outline-variant/30"
            >
              {cashAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name} (Saldo: Rp {acc.balance.toLocaleString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          {/* Akun Tujuan (if transfer) */}
          {type === 'TRANSFER' && (
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase">
                Ke Akun (Tujuan Transfer)
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-sm font-semibold focus:outline-none border border-outline-variant/30"
              >
                {cashAccounts.filter(a => a.id !== accountId).map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name} (Saldo: Rp {acc.balance.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>Simpan Transaksi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
