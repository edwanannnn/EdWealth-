import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { profile, setProfile, exportBackupJson, importBackupJson, user, handleLogout } = (useApp() as any);

  const [fullName, setFullName] = useState(profile?.full_name || 'Investor Pintar');
  const [budget, setBudget] = useState(profile?.monthly_budget || 10000000);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setProfile((prev: any) => ({
      ...prev,
      full_name: fullName,
      monthly_budget: Number(budget)
    }));
    onClose();
  };

  const handleDoImport = () => {
    if (importBackupJson(importJsonText)) {
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        setShowImport(false);
        onClose();
      }, 1000);
    }
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
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 shadow-2xl flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">manage_accounts</span>
            <h2 className="text-lg font-bold text-on-surface">Profil & Pengaturan</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-surface-container-low rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base shadow-md">
            {profile.full_name?.slice(0, 2).toUpperCase() || 'ED'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-sm text-on-surface truncate">{profile.full_name}</h4>
            <span className="text-xs text-outline truncate block">{user?.email || profile.email}</span>
            <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">
              {user ? 'Akun Terhubung ke Supabase' : 'Mode Tamu / Demo Offline'}
            </span>
          </div>
        </div>

        {/* Settings Form */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase">Nama Tampilan</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-surface-container-low rounded-xl text-xs font-semibold focus:outline-none border border-outline-variant/30"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase">Target Anggaran Bulanan (Rp)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 bg-surface-container-low rounded-xl text-xs font-semibold focus:outline-none border border-outline-variant/30"
            />
          </div>

          {/* Backup & Restore Section */}
          <div className="p-3 bg-surface-container rounded-2xl space-y-2">
            <span className="text-xs font-bold text-on-surface uppercase block">Zero Data Lock-in</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="py-2 px-3 rounded-xl bg-surface-container-lowest text-xs font-bold text-primary flex items-center justify-center gap-1 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImport(!showImport)}
                className="py-2 px-3 rounded-xl bg-surface-container-lowest text-xs font-bold text-on-surface flex items-center justify-center gap-1 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                <span>Restore JSON</span>
              </button>
            </div>

            {showImport && (
              <div className="pt-2 space-y-2">
                <textarea
                  rows={3}
                  placeholder="Paste isi data JSON backup di sini..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full p-2 bg-surface-container-lowest rounded-xl text-[10px] font-mono border border-outline-variant/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleDoImport}
                  className="w-full py-1.5 rounded-xl bg-primary text-white font-bold text-xs"
                >
                  {importSuccess ? 'Berhasil Di-restore!' : 'Proses Restore'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 active:scale-95 transition-transform"
          >
            Simpan Perubahan
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="w-full py-2.5 rounded-full bg-red-100 text-error font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>{user ? 'Keluar / Logout Akun' : 'Keluar dari Mode Demo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
