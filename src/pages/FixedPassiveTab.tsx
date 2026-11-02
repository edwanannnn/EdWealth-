import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const FixedPassiveTab: React.FC = () => {
  const { 
    fixedExpenses, passiveIncomes, financialFreedomRatio,
    markFixedExpensePaid, cashAccounts, isIncognito
  } = useApp();

  const [payingExpenseId, setPayingExpenseId] = useState<string | null>(null);
  const [selectedPayAccount, setSelectedPayAccount] = useState<string>(cashAccounts[0]?.id || '');

  const formatMoney = (val: number) => {
    if (isIncognito) return 'Rp ••••••••';
    return `Rp ${Math.round(val).toLocaleString('id-ID')}`;
  };

  const totalFixed = fixedExpenses.reduce((sum, f) => sum + f.amount, 0);
  const totalPassive = passiveIncomes.reduce((sum, p) => sum + p.amount, 0);

  const handleConfirmPay = () => {
    if (payingExpenseId && selectedPayAccount) {
      markFixedExpensePaid(payingExpenseId, selectedPayAccount);
      setPayingExpenseId(null);
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 px-4 pt-3 space-y-4 animate-fadeIn">
      {/* 1. Financial Freedom Index Card */}
      <div className="bg-gradient-to-br from-tertiary-container to-tertiary text-white p-5 rounded-3xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            Financial Freedom Index
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
            Target 100%
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight">{financialFreedomRatio}%</span>
          <span className="text-xs font-medium text-white/90">Tertutupi Pendapatan Pasif</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-tertiary-fixed h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, financialFreedomRatio)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-xs text-white/90">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/70 block">Total Pasif Bulanan</span>
            <span className="font-extrabold text-sm">{formatMoney(totalPassive)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-white/70 block">Total Biaya Pasti</span>
            <span className="font-extrabold text-sm">{formatMoney(totalFixed)}</span>
          </div>
        </div>
      </div>

      {/* 2. Fixed Expenses Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div>
            <h3 className="text-xs font-bold text-outline uppercase tracking-wider">
              Tagihan & Beban Pasti (Fixed Expenses)
            </h3>
            <span className="text-[11px] text-outline">Centang untuk bayar otomatis & potong saldo</span>
          </div>
          <span className="text-xs font-extrabold text-error">{formatMoney(totalFixed)}</span>
        </div>

        <div className="space-y-2.5">
          {fixedExpenses.map(item => (
            <div 
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                item.is_paid 
                  ? 'bg-surface-container-low border-outline-variant/20 opacity-75' 
                  : 'bg-surface-container-lowest border-outline-variant/30 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Checkbox Bayar */}
                <button
                  onClick={() => {
                    if (!item.is_paid) {
                      setPayingExpenseId(item.id);
                    }
                  }}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    item.is_paid 
                      ? 'bg-green-600 text-white shadow-sm' 
                      : 'border-2 border-outline hover:border-primary'
                  }`}
                >
                  {item.is_paid && <span className="material-symbols-outlined text-[16px]">check</span>}
                </button>

                <div className="min-w-0">
                  <h4 className={`text-xs font-bold truncate ${item.is_paid ? 'line-through text-outline' : 'text-on-surface'}`}>
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-outline mt-0.5">
                    <span>Jatuh Tempo: Tgl {item.due_date || 1}</span>
                    <span>•</span>
                    <span className={item.is_paid ? 'text-green-700 font-bold' : 'text-amber-700 font-bold'}>
                      {item.is_paid ? 'Lunas Bulan Ini' : 'Belum Dibayar'}
                    </span>
                  </div>
                </div>
              </div>

              <span className={`text-xs font-extrabold ${item.is_paid ? 'text-outline line-through' : 'text-on-surface'}`}>
                {formatMoney(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Passive Income Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div>
            <h3 className="text-xs font-bold text-outline uppercase tracking-wider">
              Sumber Pendapatan Pasif (Passive Income)
            </h3>
            <span className="text-[11px] text-outline">Dividen saham, kupon SBN, dan bunga deposito</span>
          </div>
          <span className="text-xs font-extrabold text-green-700">{formatMoney(totalPassive)}</span>
        </div>

        <div className="space-y-2.5">
          {passiveIncomes.map(item => (
            <div 
              key={item.id}
              className="p-3.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-on-surface truncate">{item.source_name}</h4>
                  <span className="text-[10px] text-outline uppercase font-semibold">
                    Frekuensi: {item.frequency}
                  </span>
                </div>
              </div>

              <span className="text-xs font-extrabold text-green-700">
                +{formatMoney(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Deduct Confirmation Modal */}
      {payingExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-surface rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[24px]">price_check</span>
              <h3 className="font-bold text-base text-on-surface">Konfirmasi Bayar Tagihan</h3>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Tandai tagihan sebagai lunas dan potong saldo secara otomatis dari rekening Anda:
            </p>

            <div>
              <label className="text-[11px] font-bold text-outline uppercase">Pilih Rekening Pembayar</label>
              <select
                value={selectedPayAccount}
                onChange={(e) => setSelectedPayAccount(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 bg-surface-container-low rounded-xl text-xs font-bold focus:outline-none border border-outline-variant/30"
              >
                {cashAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name} (Saldo: Rp {acc.balance.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingExpenseId(null)}
                className="py-2.5 rounded-full bg-surface-container text-on-surface font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmPay}
                className="py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-md shadow-primary/20"
              >
                Potong & Lunas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
