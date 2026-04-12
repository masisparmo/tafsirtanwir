import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { quranService, QURAN_METADATA } from '../services/quranService';
import { tafsirService } from '../services/tafsirService';
import { groqService } from '../services/groqService';
import { gasService } from '../services/gasService';
import { tafsirData as initialData } from '../data/tafsirData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- UI State ---
  const [mode, setMode] = useState(() => localStorage.getItem('tafsir_mode') || 'pencari');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('tafsir_active_tab') || 'tafsir');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Quran & Tafsir State ---
  const [currentVerse, setCurrentVerse] = useState({ surah: 5, ayah: 57 }); // Default: Al-Ma'idah 57
  const [activeTafsir, setActiveTafsir] = useState(initialData);
  const [fullDatabase, setFullDatabase] = useState(null);
  
  // --- AI & Energy State ---
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbyRVo38ZvBHGNcH3sAP3J6klNfnXrM9KJguOjOsiHG8cPLhbto0gqpOWf_9qzwX1x87/exec';
  const defaultKeys = ""; 
  const [apiKeys, setApiKeys] = useState(() => localStorage.getItem('groq_api_keys') || defaultKeys);
  const isInitialMount = useRef(true);

  // --- Loading States ---
  const [isLoading, setIsLoading] = useState(false);
  const [dbDownloadProgress, setDbDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Perubahan Mode mempengaruhi Tab
  useEffect(() => {
    localStorage.setItem('tafsir_mode', mode);
    if (mode === 'pencari' && !['tafsir', 'maqashid', 'quiz'].includes(activeTab)) {
      setActiveTab('tafsir');
    } else if (mode === 'ustadz' && !['khutbah', 'kajian'].includes(activeTab)) {
      setActiveTab('khutbah');
    }
  }, [mode, activeTab]);

  useEffect(() => {
    localStorage.setItem('tafsir_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('groq_api_keys', apiKeys);
  }, [apiKeys]);

  // Load Database di Awal (Sesuai permintaan user)
  useEffect(() => {
    const initDB = async () => {
      try {
        setStatusMessage('Mengunduh database tafsir (26MB)...');
        const data = await tafsirService.fetchFullData((progress) => {
          setDbDownloadProgress(progress);
        });
        setFullDatabase(data);
        setStatusMessage('');
      } catch (err) {
        console.error(err);
        setStatusMessage('Gagal memuat database. Periksa koneksi internet.');
      }
    };
    initDB();
  }, []);

  const changeVerse = useCallback(async (surah, ayah) => {
    const surahData = QURAN_METADATA.find(s => s.number === surah);
    setCurrentVerse({ surah, ayah });
    setIsLoading(true);

    try {
      // 1. Cek di IndexedDB (Lokal)
      setStatusMessage('Mencari di database lokal...');
      const localData = await tafsirService.getCachedVerse(surah, ayah);
      
      // Validasi: Pastikan teks Arab benar-benar mengandung karakter Hijaiyah (\u0600-\u06FF)
      const hasArabic = localData && /[\u0600-\u06FF]/.test(localData.arabic);

      if (localData && hasArabic) {
        setActiveTafsir(localData);
        setStatusMessage('');
        setIsLoading(false);
        return;
      }
      if (localData && !hasArabic) console.warn('Cache terdeteksi teks non-Arab, mengambil data baru untuk perbaikan...');

      // 2. Cek di Google Sheets (Cloud)
      if (GAS_URL) {
        setStatusMessage('Mencari di Cloud (Google Sheets)...');
        try {
          const cloudData = await gasService.searchInCloud(GAS_URL, surah, ayah);
          const hasArabicCloud = cloudData && /[\u0600-\u06FF]/.test(cloudData.arabic);
          
          if (cloudData && hasArabicCloud) {
            setActiveTafsir(cloudData);
            // Simpan ke lokal untuk penggunaan offline masa depan
            await tafsirService.saveCachedVerse(surah, ayah, cloudData);
            setStatusMessage('');
            setIsLoading(false);
            return;
          }
          if (cloudData && !hasArabicCloud) console.warn('Data Cloud terdeteksi non-Arab, mengabaikan dan memicu AI baru...');
        } catch (cloudErr) {
          console.warn('Cloud search failed, skipping to AI...', cloudErr);
        }
      }

      // 3. Jika tidak ada di keduanya, Siapkan Placeholder & Pemicu AI
      setActiveTafsir({
        surah: surahData.name,
        ayat: ayah,
        arabic: 'Memuat teks...',
        terjemahan: 'Analisis belum tersedia di Cloud. Memulai AI...',
        isPlaceholder: true,
        asbabunNuzul: '',
        balaghah: [],
        maqashid: [],
        ustadzPoin: [],
        kuis: []
      });

      const fetchedArabic = await quranService.getAyahText(surah, ayah);
      setActiveTafsir(prev => ({ ...prev, arabic: fetchedArabic || 'Teks tidak tersedia.' }));
      
      // Jalankan AI secara otomatis
      await processWithAI({ surah, ayah, arabic: fetchedArabic });

    } catch (err) {
      console.error('Error changing verse:', err);
      setStatusMessage('Error: ' + err.message);
      // Fallback state on total failure
      setActiveTafsir({
        surah: surahData ? surahData.name : 'Unknown',
        ayat: ayah,
        arabic: 'Gagal memuat teks arab.',
        terjemahan: 'Terjadi kesalahan sistem saat memuat atau menganalisis ayat ini.',
        isPlaceholder: true,
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiKeys]);

  const processWithAI = async (autoVerse = null) => {
    const targetVerse = autoVerse || currentVerse;
    
    if (!fullDatabase) {
      setStatusMessage('Menunggu database tafsir siap...');
      return;
    }
    if (!apiKeys || apiKeys.trim() === "") {
      setStatusMessage('API Key belum diatur. Silakan cek Pengaturan.');
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage('AI sedang menganalisis Tafsir At-Tahrir wat-Tanwir...');
    
    try {
      const rawReport = await tafsirService.getTafsirForAyah(fullDatabase, targetVerse.surah, targetVerse.ayah);
      const surahData = QURAN_METADATA.find(s => s.number === targetVerse.surah);
      
      const targetArabic = autoVerse?.arabic && autoVerse.arabic.trim() !== '' 
        ? autoVerse.arabic 
        : 'Teks ayat Arab';

      const result = await groqService.extractTafsirInfo(
        rawReport,
        targetArabic,
        apiKeys,
        surahData.name,
        targetVerse.ayah,
        (msg) => setStatusMessage(msg) // Callback UI untuk menampilkan percobaan key
      );

      // Simpan ke IndexedDB (Lokal)
      await tafsirService.saveCachedVerse(targetVerse.surah, targetVerse.ayah, result);
      
      // Simpan ke Cloud (Google Sheets)
      if (GAS_URL) {
        setStatusMessage('Menyinkronkan ke Cloud...');
        await gasService.saveToCloud(GAS_URL, targetVerse.surah, targetVerse.ayah, result);
      }

      setActiveTafsir(result);
      setStatusMessage('');
    } catch (err) {
      console.error(err);
      setStatusMessage('Gagal AI: ' + err.message);
      // Fallback state on AI failure
      const surahData = QURAN_METADATA.find(s => s.number === targetVerse.surah);
      setActiveTafsir({
        surah: surahData ? surahData.name : 'Unknown',
        ayat: targetVerse.ayah,
        arabic: autoVerse?.arabic || activeTafsir.arabic || 'Gagal memuat teks.',
        terjemahan: `Gagal menganalisis ayat: ${err.message}. Silakan coba lagi.`,
        isPlaceholder: true,
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{ 
      mode, setMode, 
      activeTab, setActiveTab,
      currentVerse, changeVerse,
      activeTafsir,
      apiKeys, setApiKeys,
      gasUrl: GAS_URL,
      isLoading, statusMessage,
      dbDownloadProgress,
      isSettingsOpen, setIsSettingsOpen,
      processWithAI,
      QURAN_METADATA
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
