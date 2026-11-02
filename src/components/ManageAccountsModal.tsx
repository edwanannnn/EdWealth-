import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ManageAccountsModal: React.FC = () => {
  const { 
    isManageAccountsModalOpen, setIsManageAccountsModalOpen,
    cashAccounts, updateAccountBalance, addCashAccount, isIncognito
  } = useApp();

  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState<string>('');
  
  // New account form
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'BANK' | 'RDN' | 'E_WALLET' | 'CASH'>('BANK');
  const [newBalance, setNewBalance] = useState<string>('0');

  if (!isManageAccountsModalOpen) return null;

  const handleStartEdit = (id: string, currentBalance: number) => {
    setEditingAccountId(id);
    setEditBalanceValue(currentBalance.toString());
  };

  const handleSaveEdit = (id: string) => {
    const num = parseFloat(editBalanceValue) || 0;
    updateAccountBalance(id, num);
    setEditingAccountId(null);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addCashAccount({
      account_name: newName.trim(),
      account_type: newType,
      balance: parseFloat(newBalance) || 0,
    });

    setNewName('');
    setNewBalance('0');
    setIsAddingNew(false);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'BANK': return 'account_balance';
      case 'RDN': return 'candlestick_chart';
      case 'E_WALLET': return 'account_balance_wallet';
      case 'CASH': return 'payments';
      default: return 'credit_card';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">account_balance</span>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Kelola Rekening & Saldo</h2>
              <p className="text-[11px] text-outline">Atur saldo awal atau rekening riil Anda</p>
            </div>
          </div>
          <button 
            onClick={() => setIsManageAccountsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Account List */}
        <div className="space-y-3 mt-4">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider block">
            Daftar Rekening Terdaftar
          </span>

          {cashAccounts.length === 0 ? (
            <div className="p-4 text-center text-outline text-xs bg-surface-container-low rounded-2xl">
              Belum ada rekening kas. Tambahkan rekening baru di bawah.
            </div>
          ) : (
            cashAccounts.map(acc => (
              <div 
                key={acc.id}
                className="p-3.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/25 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">{getAccountIcon(acc.account_type)}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">{acc.account_name}</h4>
                      <span className="text-[10px] text-outline uppercase font-semibold">{acc.account_type}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-on-surface block">
                      {isIncognito ? 'Rp ••••••••' : `Rp ${Math.round(acc.balance).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>

                {editingAccountId === acc.id ? (
                  <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-xs font-bold text-outline">Rp</span>
                      <input 
                        type="number"
                        value={editBalanceValue}
                        onChange={e => setEditBalanceValue(e.target.value)}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-container border border-primary text-xs font-bold text-on-surface focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleSaveEdit(acc.id)}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingAccountId(null)}
                      className="px-2.5 py-1.5 bg-surface-container-high text-on-surface text-xs font-bold rounded-xl active:scale-95"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleStartEdit(acc.id, acc.balance)}
                      className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Ubah Saldo</span>
                    </button>

                    <button
                      onClick={() => updateAccountBalance(acc.id, 0)}
                      className="text-[10px] text-outline hover:text-error transition-colors"
                      title="Setel ulang saldo ke Rp 0"
                    >
                      Reset Rp 0
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Account Section */}
        <div className="mt-4 pt-3 border-t border-outline-variant/30">
          {!isAddingNew ? (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 text-xs font-bold active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Tambah Rekening / Dompet Baru</span>
            </button>
          ) : (
            <form onSubmit={handleCreateAccount} className="p-3.5 bg-surface-container-lowest rounded-2xl border border-primary/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Tambah Rekening Baru</span>
                <button 
                  type="button" 
                  onClick={() => setIsAddingNew(false)}
                  className="text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-outline uppercase block mb-1">Nama Rekening / Bank</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Bank Mandiri, GoPay, Bibit"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Tipe Rekening</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs font-semibold focus:outline-none"
                  >
                    <option value="BANK">Bank Umum</option>
                    <option value="RDN">RDN Sekuritas</option>
                    <option value="E_WALLET">E-Wallet (QRIS)</option>
                    <option value="CASH">Uang Tunai (Kas)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Saldo Awal (Rp)</label>
                  <input 
                    type="number"
                    value={newBalance}
                    onChange={e => setNewBalance(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs font-bold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md active:scale-95 transition-transform"
                >
                  Simpan Rekening
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        <button
          onClick={() => setIsManageAccountsModalOpen(false)}
          className="w-full mt-4 py-2.5 bg-surface-container-high text-on-surface text-xs font-bold rounded-2xl active:scale-95 transition-transform"
        >
          Selesai & Tutup
        </button>
      </div>
    </div>
  );
};
