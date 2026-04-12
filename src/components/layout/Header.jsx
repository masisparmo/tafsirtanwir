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
          <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600 hidden sm:block">
            Tafsir Interaktif
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mode Toggle Selection */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl relative">
            <motion.div
              className="absolute h-[calc(100%-8px)] rounded-xl bg-white shadow-md z-0"
              animate={{
                x: mode === 'pencari' ? 4 : '100%',
                left: mode === 'pencari' ? 0 : -4,
                width: mode === 'pencari' ? 'calc(50% - 4px)' : 'calc(50% - 4px)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <button
              onClick={() => setMode('pencari')}
              className={`relative z-10 flex items-center space-x-2 px-4 py-2 transition-colors duration-200 ${
                mode === 'pencari' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Pencari Ilmu</span>
            </button>

            <button
              onClick={() => setMode('ustadz')}
              className={`relative z-10 flex items-center space-x-2 px-4 py-2 transition-colors duration-200 ${
                mode === 'ustadz' ? 'text-emerald-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Ustadz</span>
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
