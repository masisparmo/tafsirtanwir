import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import VerseSelector from './VerseSelector';
import { Loader2 } from 'lucide-react';

const Hero = () => {
  const { 
    activeTafsir, 
    dbDownloadProgress, 
    statusMessage, 
    isLoading 
  } = useApp();

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Database Download Status */}
        {dbDownloadProgress > 0 && dbDownloadProgress < 100 && (
          <div className="max-w-md mx-auto mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-pulse">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Mengunduh Database Tafsir...</span>
              <span>{dbDownloadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300" 
                style={{ width: `${dbDownloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="flex items-center justify-center mb-6 text-emerald-700 text-sm font-medium bg-emerald-50 py-2 px-4 rounded-full w-fit mx-auto border border-emerald-100">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {statusMessage}
          </div>
        )}

        <div className="text-center mb-10">
          <VerseSelector />
        </div>

        <motion.div 
          key={activeTafsir.arabic}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-4 border border-emerald-200 uppercase tracking-widest">
            Surah {activeTafsir.surah} • Ayat {activeTafsir.ayat}
          </span>
          
          <div className="relative inline-block py-6 px-4 md:px-8 w-full">
            {/* Arabic Text */}
            <motion.div 
              dir="rtl" 
              className="text-4xl md:text-5xl lg:text-5xl font-arabic text-emerald-950 leading-[1.8] md:leading-[2] text-center"
            >
              {activeTafsir.arabic}
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          key={activeTafsir.terjemahan}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className={`bg-white/40 p-6 md:p-8 rounded-2xl border ${activeTafsir.isPlaceholder ? 'border-amber-100 bg-amber-50/20' : 'border-emerald-100'} shadow-premium backdrop-blur-sm`}>
            <p className="text-lg md:text-xl text-slate-700 italic text-center leading-relaxed">
               {activeTafsir.isPlaceholder 
                 ? (activeTafsir.terjemahan || 'Menunggu analisis...') 
                 : activeTafsir.terjemahan ? `"${activeTafsir.terjemahan}"` : 'Terjemahan tidak tersedia.'}
            </p>
          </div>

          {activeTafsir.tags && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {activeTafsir.tags.map((tag, idx) => (
                <motion.span 
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100 cursor-default"
                >
                  <span>{tag}</span>
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
