import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export const AuthScreen: React.FC<{ onSkipDemo?: () => void }> = ({ onSkipDemo }) => {
  const { setProfile } = (useApp() as any);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        // Use current URL origin so mobile phone redirects to phone's active address instead of localhost
        const redirectUrl = window.location.origin;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName || email.split('@')[0],
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg('Pendaftaran berhasil! Mengarahkan ke dashboard...');
        } else if (data.user) {
          setSuccessMsg('Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi atau coba langsung masuk.');
          setIsRegister(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg('Berhasil masuk! Memuat data Anda...');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 max-w-lg mx-auto animate-fadeIn">
      {/* Brand Header */}
      <div className="relative flex flex-col items-center pt-2 pb-5 text-center w-full">
        <div className="absolute -top-4 w-44 h-44 bg-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-2 w-32 h-32 bg-secondary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>

        {/* Emblem */}
        <div className="relative z-10 w-20 h-20 mb-3 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-white shadow-xl shadow-primary/25">
          <span className="material-symbols-outlined text-[42px]">account_balance_wallet</span>
        </div>

        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary mb-2 shadow-sm">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Smart Voice & Stock Ledger</span>
        </div>

        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">EdWealth</h1>
        <p className="text-xs text-on-surface-variant max-w-xs mt-1 leading-relaxed">
          Pencatatan kas harian & portofolio saham BEI dengan suara. Terkoneksi aman ke Supabase.
        </p>
      </div>

      {/* Feature Pills Carousel */}
      <div className="w-full mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20">
            <div className="w-7 h-7 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-on-surface leading-tight">Input Suara Cerdas</p>
              <p className="text-[10px] text-outline">Tanpa API Key</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20">
            <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[16px]">query_stats</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-on-surface leading-tight">Saham BEI Live</p>
              <p className="text-[10px] text-outline">Auto-Hitung Cuan</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20">
            <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">lock</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-on-surface leading-tight">Privat & Aman</p>
              <p className="text-[10px] text-outline">Supabase RLS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Card Form */}
      <div className="w-full bg-surface-container-lowest rounded-3xl p-5 shadow-lg border border-outline-variant/20 flex flex-col gap-3.5">
        {/* Toggle Login vs Register */}
        <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-2xl mb-1">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              !isRegister ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              isRegister ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Alerts / Error messages */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-3">
          {/* Full Name (if registering) */}
          {isRegister && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-on-surface-variant px-1 uppercase">Nama Lengkap</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-[18px] text-outline">person</span>
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-on-surface-variant px-1 uppercase">Email Akun</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 material-symbols-outlined text-[18px] text-outline">alternate_email</span>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-on-surface-variant px-1 uppercase">Kata Sandi</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 material-symbols-outlined text-[18px] text-outline">key</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-outline hover:text-on-surface focus:outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full h-12 rounded-full bg-primary text-white font-bold text-xs shadow-md shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {loading ? (
              <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
            ) : (
              <>
                <span>{isRegister ? 'Daftar & Buat Akun' : 'Masuk ke EdWealth'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Mode Button (Allow exploring without registering) */}
        <div className="pt-2 border-t border-outline-variant/20 text-center">
          <button
            type="button"
            onClick={onSkipDemo}
            className="text-xs font-bold text-outline hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Jelajahi Dulu (Mode Demo / Tamu)</span>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-outline text-center mt-4 px-4 leading-relaxed">
        Tersambung langsung ke database Supabase Anda yang terisolasi dengan Row Level Security.
      </p>
    </div>
  );
};
