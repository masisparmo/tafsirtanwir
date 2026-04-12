import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, ChevronDown } from 'lucide-react';

const VerseSelector = () => {
  const { QURAN_METADATA, currentVerse, changeVerse, isLoading } = useApp();
  
  const [selectedSurah, setSelectedSurah] = useState(currentVerse.surah);
  const [selectedAyah, setSelectedAyah] = useState(currentVerse.ayah);

  // List ayat berdasarkan surah terpilih
  const currentSurahData = QURAN_METADATA.find(s => s.number === selectedSurah);
  const totalAyahs = currentSurahData ? currentSurahData.ayahs : 0;
  const ayahsList = Array.from({ length: totalAyahs }, (_, i) => i + 1);

  const handleSurahChange = (e) => {
    const val = parseInt(e.target.value);
    setSelectedSurah(val);
    setSelectedAyah(1); // Reset ke ayat 1 saat ganti surah
  };

  const handleAyahChange = (e) => {
    setSelectedAyah(parseInt(e.target.value));
  };

  const handleGo = () => {
    changeVerse(selectedSurah, selectedAyah);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl">
      <div className="relative">
        <select
          value={selectedSurah}
          onChange={handleSurahChange}
          className="appearance-none bg-slate-900/40 text-white pl-4 pr-10 py-2 rounded-xl outline-none border border-white/10 focus:border-emerald-400 text-sm font-medium transition-all cursor-pointer min-w-[150px]"
        >
          {QURAN_METADATA.map((surah) => (
            <option key={surah.number} value={surah.number} className="bg-slate-800 text-white">
              {surah.number}. {surah.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={selectedAyah}
          onChange={handleAyahChange}
          className="appearance-none bg-slate-900/40 text-white pl-4 pr-10 py-2 rounded-xl outline-none border border-white/10 focus:border-emerald-400 text-sm font-medium transition-all cursor-pointer min-w-[80px]"
        >
          {ayahsList.map((num) => (
            <option key={num} value={num} className="bg-slate-800 text-white">
               Ayat {num}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
      </div>

      <button
        onClick={handleGo}
        disabled={isLoading || (currentVerse.surah === selectedSurah && currentVerse.ayah === selectedAyah)}
        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-slate-900 font-bold rounded-xl transition-all flex items-center shadow-lg shadow-emerald-900/20"
      >
        <Search className="w-4 h-4 mr-2" />
        Buka
      </button>
    </div>
  );
};

export default VerseSelector;
