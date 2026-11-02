import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { activeTab, alerts, setIsAlertsModalOpen, isIncognito, toggleIncognito, setIsProfileModalOpen, profile } = useApp();
  const unreadAlerts = alerts.filter(a => !a.is_read).length;

  const tabTitle = {
    'dashboard': 'Beranda',
    'portfolio': 'Portofolio Saham',
    'fixed-passive': 'Fixed & Pasif',
    'ledger': 'Riwayat Mutasi'
  }[activeTab];

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Logo & Tab Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-outline tracking-wider uppercase">EdWealth</span>
            <span className="text-base font-bold text-on-surface leading-tight">{tabTitle}</span>
          </div>
        </div>

        {/* Right Controls: Incognito, Notifications, Profile */}
        <div className="flex items-center gap-1.5">
          {/* Incognito Balance Masking Button */}
          <button 
            onClick={toggleIncognito}
            aria-label="Sensor Saldo"
            title={isIncognito ? "Tampilkan Saldo" : "Sembunyikan Saldo (Incognito)"}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 ${
              isIncognito 
                ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isIncognito ? 'visibility_off' : 'visibility'}
            </span>
          </button>

          {/* Notifications Bell */}
          <button 
            onClick={() => setIsAlertsModalOpen(true)}
            aria-label="Notifikasi" 
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Profile Avatar Button */}
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            aria-label="Profil Pengguna"
            title="Profil & Pengaturan"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-tertiary-container flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary/20 ml-1 shadow-sm active:scale-95 transition-transform"
          >
            {profile.full_name?.slice(0, 2).toUpperCase() || 'ED'}
          </button>
        </div>
      </div>
    </header>
  );
};
