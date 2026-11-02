import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsVoiceModalOpen } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-lg mx-auto px-4 flex items-center justify-between relative">
        {/* Tab 1: Beranda */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            activeTab === 'dashboard' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span 
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}
          >
            home
          </span>
          <span className="text-[11px] mt-0.5">Beranda</span>
        </button>

        {/* Tab 2: Portofolio */}
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            activeTab === 'portfolio' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span 
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'portfolio' ? "'FILL' 1" : "'FILL' 0" }}
          >
            query_stats
          </span>
          <span className="text-[11px] mt-0.5">Portofolio</span>
        </button>

        {/* CENTER FLOATING ACTION BUTTON (FAB): SMART VOICE RECORDER */}
        <div className="flex-1 flex justify-center -mt-7">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            aria-label="Catat Keuangan dengan Suara"
            title="Catat Keuangan dengan Suara"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center shadow-lg shadow-primary/40 ring-4 ring-surface active:scale-90 hover:scale-105 transition-all duration-150 animate-bounce hover:animate-none"
          >
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              mic
            </span>
          </button>
        </div>

        {/* Tab 3: Fixed & Pasif */}
        <button
          onClick={() => setActiveTab('fixed-passive')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            activeTab === 'fixed-passive' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span 
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'fixed-passive' ? "'FILL' 1" : "'FILL' 0" }}
          >
            savings
          </span>
          <span className="text-[11px] mt-0.5">Pasif & Tagihan</span>
        </button>

        {/* Tab 4: Riwayat Mutasi */}
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            activeTab === 'ledger' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span 
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: activeTab === 'ledger' ? "'FILL' 1" : "'FILL' 0" }}
          >
            receipt_long
          </span>
          <span className="text-[11px] mt-0.5">Riwayat</span>
        </button>
      </div>
    </nav>
  );
};
