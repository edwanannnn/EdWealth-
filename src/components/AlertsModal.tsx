import React from 'react';
import { useApp } from '../context/AppContext';

export const AlertsModal: React.FC = () => {
  const { isAlertsModalOpen, setIsAlertsModalOpen, alerts } = useApp();

  if (!isAlertsModalOpen) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'BILL_DUE': return 'alarm';
      case 'STOCK_PRICE': return 'trending_up';
      case 'BUDGET_OVERRUN': return 'warning';
      case 'LOW_CASH': return 'account_balance';
      default: return 'notifications';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">notifications_active</span>
            <h2 className="text-lg font-bold text-on-surface">Pusat Peringatan & Notifikasi</h2>
          </div>
          <button 
            onClick={() => setIsAlertsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 mt-4">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-outline">
              <span className="material-symbols-outlined text-4xl mb-2">done_all</span>
              <p className="text-sm">Tidak ada notifikasi aktif saat ini.</p>
            </div>
          ) : (
            alerts.map(alt => (
              <div 
                key={alt.id}
                className="p-3.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">{getAlertIcon(alt.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-on-surface truncate">{alt.title}</h4>
                    <span className="text-[10px] text-outline">Hari Ini</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{alt.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => setIsAlertsModalOpen(false)}
          className="w-full mt-5 py-3 rounded-full bg-surface-container text-primary font-bold text-xs active:scale-95 transition-transform"
        >
          Tutup Notifikasi
        </button>
      </div>
    </div>
  );
};
