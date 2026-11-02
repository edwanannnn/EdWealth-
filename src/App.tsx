import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardTab } from './pages/DashboardTab';
import { PortfolioTab } from './pages/PortfolioTab';
import { FixedPassiveTab } from './pages/FixedPassiveTab';
import { LedgerTab } from './pages/LedgerTab';
import { AuthScreen } from './pages/AuthScreen';

// Modals
import { VoiceModal } from './components/VoiceModal';
import { BuyStockModal } from './components/BuyStockModal';
import { SellStockModal } from './components/SellStockModal';
import { AveragingCalcModal } from './components/AveragingCalcModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AlertsModal } from './components/AlertsModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { ProfileModal } from './components/ProfileModal';

export const AppContent: React.FC = () => {
  const { 
    user, isGuestMode, setIsGuestMode, activeTab,
    isProfileModalOpen, setIsProfileModalOpen
  } = useApp();

  // If user is not logged in and not in guest mode, show the Onboarding & Login Screen!
  if (!user && !isGuestMode) {
    return (
      <AuthScreen 
        onSkipDemo={() => {
          setIsGuestMode(true);
          localStorage.setItem('edwealth_guest_mode', 'true');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans max-w-lg mx-auto relative shadow-2xl overflow-x-hidden">
      {/* Top Header */}
      <Header />

      {/* Main Tab Content */}
      <main className="flex-1 w-full pt-16">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'fixed-passive' && <FixedPassiveTab />}
        {activeTab === 'ledger' && <LedgerTab />}
      </main>

      {/* Bottom 4-Tab Navigation + Center Voice FAB */}
      <BottomNav />

      {/* Global Modals */}
      <VoiceModal />
      <BuyStockModal />
      <SellStockModal />
      <AveragingCalcModal />
      <AddTransactionModal />
      <AlertsModal />
      <MonthlyReportModal />
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};
