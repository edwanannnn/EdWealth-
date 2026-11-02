import React from 'react';
import { useApp } from '../context/AppContext';
import jsPDF from 'jspdf';

export const MonthlyReportModal: React.FC = () => {
  const { 
    isReportModalOpen, setIsReportModalOpen, 
    transactions, totalNetWorth, financialFreedomRatio,
    exportBackupJson
  } = useApp();

  if (!isReportModalOpen) return null;

  // Calculate monthly stats
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Laporan Keuangan & Investasi EdWealth', 14, 22);
    doc.setFontSize(11);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
    doc.text(`Total Net Worth: Rp ${totalNetWorth.toLocaleString('id-ID')}`, 14, 42);
    doc.text(`Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}`, 14, 50);
    doc.text(`Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}`, 14, 58);
    doc.text(`Tabungan Bersih: Rp ${netSavings.toLocaleString('id-ID')} (${savingsRate}%)`, 14, 66);
    doc.text(`Coverage Ratio (Financial Freedom): ${financialFreedomRatio}%`, 14, 74);
    
    doc.setFontSize(14);
    doc.text('Ringkasan Transaksi Terakhir:', 14, 90);
    doc.setFontSize(9);
    transactions.slice(0, 15).forEach((tx, idx) => {
      const y = 100 + (idx * 8);
      doc.text(`${tx.transaction_date} | ${tx.type} | ${tx.title} | Rp ${tx.amount.toLocaleString('id-ID')}`, 14, y);
    });

    doc.save(`Laporan-Keuangan-EdWealth-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EdWealth-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">assessment</span>
            <h2 className="text-lg font-bold text-on-surface">Rekap Laporan Bulanan</h2>
          </div>
          <button 
            onClick={() => setIsReportModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Metrics */}
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-2xl border border-green-200">
              <span className="text-[10px] font-bold text-green-800 uppercase">Pemasukan</span>
              <p className="text-base font-extrabold text-green-900 mt-0.5">
                Rp {totalIncome.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
              <span className="text-[10px] font-bold text-red-800 uppercase">Pengeluaran</span>
              <p className="text-base font-extrabold text-red-900 mt-0.5">
                Rp {totalExpense.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="p-4 bg-surface-container rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Tabungan Bersih (Net Savings)</span>
              <span className="font-bold text-on-surface">Rp {netSavings.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Tingkat Tabungan (Savings Rate)</span>
              <span className="font-bold text-primary">{savingsRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Financial Freedom Coverage</span>
              <span className="font-bold text-tertiary-container">{financialFreedomRatio}%</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30 text-sm font-bold">
              <span>Total Net Worth Terkini</span>
              <span className="text-primary font-extrabold">Rp {totalNetWorth.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleDownloadPDF}
              className="w-full py-3.5 px-4 rounded-full bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Download Laporan PDF (1-Klik)</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="w-full py-3 px-4 rounded-full bg-surface-container text-on-surface font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Backup Data JSON (Zero Data Lock-in)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
