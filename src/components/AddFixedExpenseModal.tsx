import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AddFixedExpenseModal: React.FC = () => {
  const { isAddFixedModalOpen, setIsAddFixedModalOpen, addFixedExpense } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<number>(5);
  const [category, setCategory] = useState('Tagihan Rutin');

  if (!isAddFixedModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || !num || num <= 0) return;

    addFixedExpense({
      title: title.trim(),
      amount: num,
      due_date: Number(dueDate) || 1,
      category,
    });

    setTitle('');
    setAmount('');
    setIsAddFixedModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">calendar_today</span>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Tambah Tagihan Rutin</h2>
              <p className="text-[11px] text-outline">Kewajiban bulanan tetap (Kos, WiFi, Listrik, dsb)</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddFixedModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-[11px] font-bold text-outline uppercase block mb-1">
              Nama Tagihan / Pengeluaran Rutin
            </label>
            <input 
              type="text"
              required
              placeholder="Contoh: Sewa Kos, WiFi Indihome, Listrik PLN"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-outline uppercase block mb-1">
              Nominal Tagihan (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-outline">Rp</span>
              <input 
                type="number"
                required
                placeholder="500000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-outline uppercase block mb-1">
                Tanggal Jatuh Tempo
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-outline font-bold">Tiap tgl</span>
                <input 
                  type="number"
                  min="1"
                  max="31"
                  value={dueDate}
                  onChange={e => setDueDate(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs font-bold focus:outline-none text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-outline uppercase block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs font-semibold focus:outline-none"
              >
                <option value="Tagihan Rutin">Tagihan Rutin</option>
                <option value="Tempat Tinggal">Tempat Tinggal</option>
                <option value="Internet & Utilitas">Internet & Utilitas</option>
                <option value="Langganan">Langganan Digital</option>
                <option value="Asuransi">Asuransi / Kesehatan</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white text-xs font-bold rounded-2xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              <span>Simpan Tagihan Rutin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
