import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Target, Highlighter, Wand2, Loader2 } from 'lucide-react';
import Quiz from './Quiz';
import UstadzPoints from './UstadzPoints';

const MainContent = () => {
  const { 
    mode, activeTab, activeTafsir, isLoading, 
    processWithAI, statusMessage, apiKeys, setIsSettingsOpen 
  } = useApp();

  const renderContent = () => {
    if (activeTafsir.isPlaceholder || isLoading) {
      return (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex flex-col items-center justify-center py-20 text-center space-y-6"
        >
           <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
              <Loader2 className="w-10 h-10 animate-spin" />
           </div>
           <div className="max-w-md">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {isLoading ? 'Sedang Memproses...' : 'Menyiapkan Data'}
              </h3>
              <p className="text-slate-500">
                {statusMessage || 'Aplikasi sedang mencari data di Cloud atau memicu AI untuk memberikan analisis terbaik untuk Anda.'}
              </p>
           </div>
           {!isLoading && !apiKeys && (
             <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-6 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors"
             >
                Atur API Key untuk Memulai
             </button>
           )}
        </motion.div>
      );
    }

    if (activeTafsir.isError) {
      return (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex flex-col items-center justify-center py-20 text-center space-y-6"
        >
           <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 shadow-inner">
              <span className="text-3xl">⚠️</span>
           </div>
           <div className="max-w-md">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Peringatan Sistem</h3>
              <p className="text-slate-500">{activeTafsir.terjemahan}</p>
           </div>
        </motion.div>
      );
    }

    switch (activeTab) {
      case 'tafsir':
        return (
          <motion.div
            key="tafsir"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <BookOpen className="w-6 h-6 text-emerald-600 mr-2" />
                Tafsir & Asbabun Nuzul
              </h3>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {activeTafsir.asbabunNuzul}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <Sparkles className="w-6 h-6 text-amber-500 mr-2" />
                Mutiara Balaghah (Sastra Al-Qur'an)
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {activeTafsir.balaghah.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm hover:border-amber-200 transition-colors">
                    <h4 className="font-bold text-emerald-800 mb-2">{item.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        );

      case 'maqashid':
        return (
          <motion.div
            key="maqashid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Maqashid Syariah & Intisari Hukum</h3>
              <p className="text-slate-500">Memahami tujuan luhur di balik pensyariatan hukum dalam ayat ini.</p>
            </div>
            <div className="grid gap-6">
              {activeTafsir.maqashid.map((item, idx) => (
                <div key={idx} className="flex group">
                  <div className="mt-1 bg-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-100">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-6 bg-white p-6 rounded-2xl border border-emerald-50 flex-1 shadow-sm group-hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'quiz':
        return (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Quiz />
          </motion.div>
        );

      case 'khutbah':
        return (
          <motion.div
            key="khutbah"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <UstadzPoints />
          </motion.div>
        );

      case 'kajian':
        return (
          <motion.div
            key="kajian"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="p-8 bg-emerald-900 rounded-3xl text-white relative overflow-hidden">
               <Highlighter className="absolute top-4 right-4 w-12 h-12 text-emerald-700/50" />
               <h3 className="text-3xl font-bold mb-4">Kajian Mendalam untuk Pengajar</h3>
               <p className="text-emerald-100 leading-relaxed max-w-xl">
                 Digabungkan untuk memudahkan penyampaian materi kurikulum. Fokus pada aspek Balaghah sebagai pendekatan utama Ibnu 'Asyur dalam Tafsir At-Tahrir wat-Tanwir.
               </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
                    Aspek Sastrawi (Balaghah)
                  </h4>
                  {activeTafsir.balaghah.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                      <h5 className="font-bold text-emerald-700 mb-1">{item.title}</h5>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  ))}
               </div>
               <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-emerald-600" />
                    Aspek Filosofis (Maqashid)
                  </h4>
                  {activeTafsir.maqashid.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                      <h5 className="font-bold text-emerald-700 mb-1">{item.title}</h5>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};

export default MainContent;
