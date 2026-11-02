import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AddPassiveModal: React.FC = () => {
  const { isAddPassiveModalOpen, setIsAddPassiveModalOpen, addPassiveIncome } = useApp();

  const [sourceName, setSourceName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<'MONTHLY' | 'QUARTERLY' | 'ANNUAL'>('MONTHLY');
  const [receivedDate, setReceivedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isAddPassiveModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!sourceName.trim() || !num || num <= 0) return;

    addPassiveIncome({
      source_name: sourceName.trim(),
      amount: num,
      frequency,
      received_date: receivedDate,
    });

    setSourceName('');
    setAmount('');
    setIsAddPassiveModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600 text-[24px]">payments</span>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Tambah Sumber Pasif</h2>
              <p className="text-[11px] text-outline">Dividen saham, kupon SBN, deposito, sewa properti</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddPassiveModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-[11px] font-bold text-outline uppercase block mb-1">
              Nama Sumber Penghasilan Pasif
            </label>
            <input 
              type="text"
              required
              placeholder="Contoh: Dividen BBCA, Deposito SeaBank, Sewa Kos"
              value={sourceName}
              onChange={e => setSourceName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs font-semibold focus:outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-outline uppercase block mb-1">
              Nominal Estimasi Penghasilan (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-outline">Rp</span>
              <input 
                type="number"
                required
                placeholder="500000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs font-bold focus:outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-outline uppercase block mb-1">
                Frekuensi Penerimaan
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs font-semibold focus:outline-none"
              >
                <option value="MONTHLY">Bulanan (Monthly)</option>
                <option value="QUARTERLY">Tiap 3 Bulan (Quarterly)</option>
                <option value="ANNUAL">Tahunan (Annual)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-outline uppercase block mb-1">
                Tanggal Terakhir / Mulai
              </label>
              <input 
                type="date"
                value={receivedDate}
                onChange={e => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-green-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Simpan Sumber Pasif</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
