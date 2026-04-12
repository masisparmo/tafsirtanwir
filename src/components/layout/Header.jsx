import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, GraduationCap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
  const { mode, setMode, setIsSettingsOpen } = useApp();

  return (
    <header className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl shadow-lg border border-emerald-100">
            <img 
              src="/logo-tafsir_tanwir.jpg" 
              alt="Logo Tafsir Tanwir" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600 hidden sm:block">
            Tafsir At Tahrir wat Tanwir
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mode Toggle Selection */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl relative w-64">
            <motion.div
              className="absolute h-[calc(100%-8px)] rounded-xl bg-white shadow-md z-0"
              animate={{
                x: mode === 'pencari' ? 0 : '100%',
              }}
              style={{ width: 'calc(50% - 4px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <button
              onClick={() => setMode('pencari')}
              className={`relative z-10 flex-1 flex items-center justify-center space-x-2 px-2 py-2 transition-colors duration-200 ${
                mode === 'pencari' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Pencari Ilmu</span>
            </button>

            <button
              onClick={() => setMode('ustadz')}
              className={`relative z-10 flex-1 flex items-center justify-center space-x-2 px-2 py-2 transition-colors duration-200 ${
                mode === 'ustadz' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm">Ustadz</span>
            </button>
          </div>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
            title="Pengaturan API"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
