export interface ParsedVoiceResult {
  rawTranscript: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  category: string;
  accountKeyword: string;
  title: string;
  confidence: number;
}

/**
 * Parse Indonesian number words to numeric integer
 * e.g. "1,5 juta" -> 1500000, "50 ribu" -> 50000, "sejuta lima ratus" -> 1500000
 */
export function parseIndonesianAmount(text: string): number {
  const clean = text.toLowerCase().trim();

  // 1. Direct digits with dots or k/rb (e.g. 50.000, 50k, 50rb, 100000)
  const directMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb|k)?/i);
  
  // Check for Indonesian millions phrasing: "1,5 juta", "2 juta", "1.2 jt"
  const jutaMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)/i);
  if (jutaMatch) {
    const num = parseFloat(jutaMatch[1].replace(',', '.'));
    return Math.round(num * 1000000);
  }

  // Check for "sejuta lima ratus" or "sejuta"
  if (clean.includes('sejuta')) {
    if (clean.includes('lima ratus')) return 1500000;
    if (clean.includes('dua ratus')) return 1200000;
    return 1000000;
  }

  // Check for Indonesian thousands phrasing: "50 ribu", "25 rb", "100k"
  const ribuMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)/i);
  if (ribuMatch) {
    const num = parseFloat(ribuMatch[1].replace(',', '.'));
    return Math.round(num * 1000);
  }

  // Check for word numbers (dua puluh lima ribu, dll.)
  const wordsMap: Record<string, number> = {
    'sepuluh ribu': 10000,
    'dua puluh ribu': 20000,
    'dua puluh lima ribu': 25000,
    'tiga puluh ribu': 30000,
    'lima puluh ribu': 50000,
    'tujuh puluh lima ribu': 75000,
    'seratus ribu': 100000,
    'seratus lima puluh ribu': 150000,
    'dua ratus ribu': 200000,
    'dua ratus lima puluh ribu': 250000,
    'lima ratus ribu': 500000,
    'satu juta': 1000000,
    'dua juta': 2000000,
    'tiga juta': 3000000,
    'lima juta': 5000000,
    'sepuluh juta': 10000000,
  };

  for (const [phrase, val] of Object.entries(wordsMap)) {
    if (clean.includes(phrase)) {
      return val;
    }
  }

  // Plain number extraction (e.g. "Rp 15000", "15.000")
  const rawNumberMatch = clean.match(/(\d{1,3}(?:\.\d{3})+|\d+)/);
  if (rawNumberMatch) {
    const rawDigits = rawNumberMatch[1].replace(/\./g, '');
    const num = parseInt(rawDigits, 10);
    if (!isNaN(num) && num > 0) return num;
  }

  return 0;
}

/**
 * Main parser extracting transaction properties from voice transcript
 */
export function parseVoiceTransaction(transcript: string): ParsedVoiceResult {
  const lower = transcript.toLowerCase();

  // 1. Detect Amount
  const amount = parseIndonesianAmount(lower);

  // 2. Detect Transaction Type
  let type: 'EXPENSE' | 'INCOME' | 'TRANSFER' = 'EXPENSE';
  if (lower.includes('transfer') || lower.includes('kirim uang') || lower.includes('top up') || lower.includes('tf ')) {
    type = 'TRANSFER';
  } else if (lower.includes('gaji') || lower.includes('dapat uang') || lower.includes('pemasukan') || lower.includes('dividen') || lower.includes('cuan') || lower.includes('hasil jual')) {
    type = 'INCOME';
  }

  // 3. Detect Category
  let category = 'Lain-lain';
  if (type === 'TRANSFER') {
    category = 'Transfer Internal';
  } else if (type === 'INCOME') {
    if (lower.includes('gaji') || lower.includes('bonus') || lower.includes('thr')) category = 'Gaji';
    else if (lower.includes('dividen') || lower.includes('bunga')) category = 'Dividen';
    else category = 'Pemasukan Lain';
  } else {
    // Expense categories
    if (/makan|nasi|kopi|kape|resto|sarapan|siang|malam|bakso|mie|ayam|jajan|snack|minum/.test(lower)) {
      category = 'Makanan';
    } else if (/bensin|pertalite|pertamax|solar|parkir|tol|ojol|gojek|grab|taxi|angkot|service/.test(lower)) {
      category = 'Transportasi';
    } else if (/wifi|indihome|listrik|pln|token|pulsa|kuota|air|pdam|kos|kontrakan|asuransi|bpjs|tagihan/.test(lower)) {
      category = 'Tagihan Rutin';
    } else if (/belanja|beli|supermarket|indomaret|alfamart|baju|sepatu|tokopedia|shopee/.test(lower)) {
      category = 'Belanja';
    } else if (/nonton|bioskop|netflix|spotify|game|steam|liburan|hiburan/.test(lower)) {
      category = 'Hiburan';
    } else if (/obat|dokter|klinik|apotek|rs|vitamin|sehat/.test(lower)) {
      category = 'Kesehatan';
    }
  }

  // 4. Detect Payment Method / Cash Account keyword
  let accountKeyword = 'BCA Utama';
  if (lower.includes('seabank')) accountKeyword = 'SeaBank QRIS';
  else if (lower.includes('stockbit') || lower.includes('rdn')) accountKeyword = 'RDN Stockbit';
  else if (lower.includes('tunai') || lower.includes('cash') || lower.includes('dompet')) accountKeyword = 'Kas Dompet Tunai';
  else if (lower.includes('gopay')) accountKeyword = 'GoPay';
  else if (lower.includes('shopeepay')) accountKeyword = 'ShopeePay';
  else if (lower.includes('bca') || lower.includes('qris')) accountKeyword = 'BCA Utama';

  // 5. Clean Title / Description
  // Try to remove amount and account words to leave the core item description
  let title = transcript
    .replace(/(?:sebesar|nominal|seharga|pakai|pake|lewat|dari|ke|dengan|qris|bca|seabank|tunai|cash|ribu|rb|juta|jt|\d+)/gi, '')
    .trim();
  
  if (!title || title.length < 3) {
    title = category === 'Makanan' ? 'Beli Makanan' : (transcript.slice(0, 30) || 'Transaksi Baru');
  } else {
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    rawTranscript: transcript,
    amount: amount || 25000, // fallback default if couldn't parse
    type,
    category,
    accountKeyword,
    title,
    confidence: amount > 0 ? 0.98 : 0.85
  };
}
