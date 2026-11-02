import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { parseVoiceTransaction, ParsedVoiceResult } from '../lib/voiceParser';
import confetti from 'canvas-confetti';

export const VoiceModal: React.FC = () => {
  const { isVoiceModalOpen, setIsVoiceModalOpen, addTransaction, cashAccounts } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceResult | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');

  // Editable fields in review card
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [customAccountId, setCustomAccountId] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Reset state when modal opens/closes without auto-starting
  useEffect(() => {
    if (!isVoiceModalOpen) {
      stopListening();
      setTranscript('');
      setParsedResult(null);
      setIsSaved(false);
      setRecordingSeconds(0);
      setMicNotice(null);
      setTextInput('');
      return;
    }

    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);

    // Initial default account selection
    if (cashAccounts.length > 0 && !customAccountId) {
      setCustomAccountId(cashAccounts[0].id);
    }

    return () => {
      stopListening();
    };
  }, [isVoiceModalOpen, cashAccounts]);

  const triggerSample = (sampleText: string) => {
    setTranscript(sampleText);
    const parsed = parseVoiceTransaction(sampleText);
    applyParsedResult(parsed);
  };

  const startListening = () => {
    setMicNotice(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    // In mobile browsers over HTTP, Web Speech is often blocked by Chrome security policy
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setMicNotice('Browser Anda tidak mendukung Web Speech API di HTTP. Coba gunakan sampel atau jalankan di APK.');
      triggerSample('Beli nasi padang 25 ribu pakai QRIS SeaBank barusan');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        // Realtime parse
        if (currentText.trim().length > 3) {
          const parsed = parseVoiceTransaction(currentText);
          applyParsedResult(parsed);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error/status:', e.error);
        stopListening();
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setMicNotice('Mikrofon fisik memerlukan koneksi HTTPS / Aplikasi APK. Di browser web saat ini, Anda bisa langsung ketik kalimat suara atau ketuk sampel pintar di bawah.');
          // Auto-trigger sample so user sees result immediately
          if (!parsedResult) {
            triggerSample('Beli nasi padang 25 ribu pakai QRIS SeaBank barusan');
          }
        }
      };

      recognition.onend = () => {
        stopListening();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
      setMicNotice('Mikrofon fisik memerlukan aplikasi APK (karena HTTPS). Silakan coba sampel pintar di bawah!');
      triggerSample('Beli nasi padang 25 ribu pakai QRIS SeaBank barusan');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const applyParsedResult = (parsed: ParsedVoiceResult) => {
    setParsedResult(parsed);
    setCustomAmount(parsed.amount);
    setCustomTitle(parsed.title);
    setCustomCategory(parsed.category);
    const matchAcc = cashAccounts.find(a => a.account_name.toLowerCase().includes(parsed.accountKeyword.toLowerCase())) || cashAccounts[0];
    setCustomAccountId(matchAcc?.id || '');
  };

  const handleRetry = () => {
    stopListening();
    setTranscript('');
    setParsedResult(null);
    setRecordingSeconds(0);
    setMicNotice(null);
    startListening();
  };

  const handleConfirmSave = () => {
    const finalAmount = customAmount || parsedResult?.amount || 0;
    const finalTitle = customTitle || parsedResult?.title || 'Pengeluaran Suara AI';
    const finalCategory = customCategory || parsedResult?.category || 'Lain-lain';
    const finalAccountId = customAccountId || cashAccounts[0]?.id || '';
    const finalType = parsedResult?.type || 'EXPENSE';

    if (finalAmount <= 0) return;

    addTransaction({
      account_id: finalAccountId,
      title: finalTitle,
      amount: finalAmount,
      type: finalType,
      category: finalCategory,
      transaction_date: new Date().toISOString().split('T')[0],
    });

    setIsSaved(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setIsVoiceModalOpen(false);
    }, 1200);
  };

  if (!isVoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto flex flex-col p-5 shadow-2xl transition-all">
        {/* Top Header & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">mic</span>
            <h2 className="text-lg font-bold text-on-surface">Voice AI Smart Logger</h2>
          </div>
          <button 
            onClick={() => setIsVoiceModalOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* State Pill Bar */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full shadow-sm">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${isListening ? 'bg-error animate-ping' : 'bg-primary'}`}></span>
            <span className="text-xs font-semibold text-on-surface">
              {isListening ? `Mendengarkan... [00:0${recordingSeconds}]` : parsedResult ? 'Selesai Merekam' : 'Siap Merekam'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-on-surface-variant">Mode Otomatis</span>
            <button 
              onClick={() => setIsAutoMode(!isAutoMode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isAutoMode ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isAutoMode ? 'translate-x-4' : 'translate-x-1'}`}></span>
            </button>
          </div>
        </div>

        {/* Informative notice if browser blocks mic over HTTP */}
        {micNotice && (
          <div className="my-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">info</span>
            <p className="leading-snug text-[11px]">{micNotice}</p>
          </div>
        )}

        {/* Interactive Big Microphone Button (User explicitly presses to trigger recording) */}
        <div className="flex flex-col items-center justify-center my-2 py-1">
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute -inset-2 rounded-full bg-error/25 animate-ping pointer-events-none"></div>
                <div className="absolute -inset-4 rounded-full bg-error/15 animate-pulse pointer-events-none"></div>
              </>
            )}

            <button
              type="button"
              onClick={toggleListening}
              className={`relative z-10 w-22 h-22 rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all duration-200 cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-error to-red-400 text-white shadow-error/40 scale-105 ring-4 ring-error/30'
                  : 'bg-gradient-to-tr from-primary to-primary-container text-white shadow-primary/30 hover:scale-105 ring-4 ring-primary/20'
              }`}
            >
              <span className={`material-symbols-outlined text-[34px] ${isListening ? 'animate-pulse' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {isListening ? 'stop' : 'mic'}
              </span>
              <span className="text-[10px] font-extrabold mt-0.5 uppercase tracking-wider">
                {isListening ? 'Berhenti' : 'Bicara'}
              </span>
            </button>
          </div>

          <div className="text-center mt-2.5">
            <p className="text-xs font-bold text-on-surface">
              {isListening 
                ? 'Sedang mendengarkan... Ketuk tombol merah untuk selesai' 
                : 'Ketuk tombol Mic di atas jika sudah siap bicara'}
            </p>
          </div>
        </div>

        {/* Quick Testing Chips & Direct Sentence Input (Works 100% on Mobile Web & APK) */}
        <div className="w-full my-2 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              Coba Sampel Suara (1-Ketuk Tes AI):
            </span>
            <span className="text-[10px] text-primary font-bold">Instan</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: '🍛 Nasi Padang 25rb QRIS', text: 'Beli nasi padang 25 ribu pakai QRIS SeaBank' },
              { label: '💼 Gaji Masuk 15jt BCA', text: 'Dapat gaji bulanan 15 juta masuk ke rekening BCA' },
              { label: '⛽ Bensin 50rb Tunai', text: 'Isi bensin pertamax 50 ribu uang tunai' },
              { label: '📈 Dividen 1jt RDN', text: 'Dapat dividen saham 1 juta masuk ke RDN Stockbit' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => triggerSample(chip.text)}
                className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-primary/10 text-on-surface text-[11px] font-bold border border-outline-variant/20 active:scale-95 transition-all text-left truncate"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Direct Text Input for testing without physical mic on HTTP */}
          <div className="flex gap-1.5 pt-1">
            <input 
              type="text"
              placeholder="Atau ketik ucapan: e.g. makan bakso 20000 tunai..."
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && textInput.trim()) {
                  triggerSample(textInput.trim());
                  setTextInput('');
                }
              }}
              className="flex-1 px-3 py-1.5 bg-surface-container rounded-xl text-xs font-semibold border border-outline-variant/40 focus:outline-none focus:border-primary text-on-surface"
            />
            <button
              type="button"
              onClick={() => {
                if (textInput.trim()) {
                  triggerSample(textInput.trim());
                  setTextInput('');
                }
              }}
              className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 shadow-xs"
            >
              Proses
            </button>
          </div>
        </div>

        {/* Real-time Waveform & Audio Transcription Bubble */}
        <div className="rounded-2xl bg-inverse-surface p-3 shadow-xl text-inverse-on-surface flex flex-col items-center relative overflow-hidden mb-2.5">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-tertiary-container/10 to-transparent pointer-events-none"></div>
          
          {/* Animated Waveform Frequency Bars */}
          <div className="flex items-center justify-center gap-1.5 h-8 w-full my-0.5">
            {[12, 22, 34, 38, 28, 34, 18, 10].map((h, idx) => (
              <span 
                key={idx}
                style={{ 
                  height: isListening ? `${Math.max(6, (h + (Math.sin(recordingSeconds * 3 + idx) * 12)))}px` : '6px' 
                }}
                className="w-1.5 bg-gradient-to-t from-tertiary-fixed to-primary-container rounded-full transition-all duration-200"
              />
            ))}
          </div>

          {/* Live Transcribed Text Bubble */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-2 text-center mt-1">
            <p className="text-xs text-inverse-on-surface font-medium leading-relaxed italic">
              {transcript ? `“${transcript}”` : isListening ? "Mendengarkan suara Anda..." : "Transkrip suara / hasil ketikan akan muncul di sini..."}
            </p>
          </div>
        </div>

        {/* Live AI Entity Extraction Card */}
        {parsedResult && (
          <div className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm border border-outline-variant/20 space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span>Terdeteksi Otomatis oleh FinAI</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Hari Ini</span>
            </div>

            {/* Nominal Display */}
            <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Transaksi</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-sm font-bold ${parsedResult.type === 'INCOME' ? 'text-green-600' : 'text-error'}`}>Rp</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className={`text-xl font-extrabold text-center bg-transparent border-b border-dashed border-outline-variant focus:outline-none w-44 ${
                    parsedResult.type === 'INCOME' ? 'text-green-600' : 'text-error'
                  }`}
                />
              </div>
              <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                parsedResult.type === 'INCOME' 
                  ? 'bg-green-100 text-green-800' 
                  : parsedResult.type === 'TRANSFER' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-error-container text-on-error-container'
              }`}>
                {parsedResult.type === 'INCOME' ? 'Pemasukan (Income)' : parsedResult.type === 'TRANSFER' ? 'Transfer Antar Akun' : 'Pengeluaran (Expense)'}
              </span>
            </div>

            {/* Structured Grid: Kategori & Akun Kas */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface-container-low rounded-xl p-2 flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Kategori</span>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-0.5 font-bold text-xs text-on-surface bg-transparent border-b border-outline-variant/30 focus:outline-none"
                />
              </div>

              <div className="bg-surface-container-low rounded-xl p-2 flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Metode / Akun</span>
                <select
                  value={customAccountId}
                  onChange={(e) => setCustomAccountId(e.target.value)}
                  className="mt-0.5 font-bold text-xs text-on-surface bg-transparent border-b border-outline-variant/30 focus:outline-none"
                >
                  {cashAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.account_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catatan / Deskripsi */}
            <div className="bg-surface-container-low rounded-xl p-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[16px]">edit_note</span>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Catatan transaksi..."
                className="w-full text-xs font-medium text-on-surface bg-transparent focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Bottom CTA Actions */}
        <div className="space-y-2 mt-auto pt-1">
          <button
            onClick={handleConfirmSave}
            disabled={isSaved || (!parsedResult && customAmount <= 0)}
            className={`w-full py-3 px-4 rounded-full font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
              isSaved 
                ? 'bg-green-600 text-white' 
                : 'bg-primary text-white hover:bg-primary-container shadow-primary/20'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isSaved ? 'check_circle' : 'task_alt'}
            </span>
            <span>{isSaved ? 'Tersimpan ke Buku Kas!' : 'Konfirmasi & Simpan Transaksi'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRetry}
              className="py-2 px-3 rounded-full bg-surface-container text-primary font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">replay</span>
              <span>Ulangi Rekaman</span>
            </button>

            <button
              onClick={() => {
                if (!parsedResult) {
                  triggerSample('Beli sarapan pagi 20000');
                }
              }}
              className="py-2 px-3 rounded-full bg-surface-container text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              <span>Sampel Manual</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
