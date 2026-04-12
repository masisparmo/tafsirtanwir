import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Key, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = () => {
  const { 
    apiKeys, setApiKeys, 
    gasUrl, setGasUrl,
    isSettingsOpen, setIsSettingsOpen 
  } = useApp();
  const [tempKeys, setTempKeys] = useState(apiKeys);
  const [tempGasUrl, setTempGasUrl] = useState(gasUrl);

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <Key className="w-5 h-5 mr-2 text-emerald-600" />
              Pengaturan API
            </h3>
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Google Sheets GAS URL (Cloud Sync)</label>
              <input
                type="text"
                value={tempGasUrl}
                onChange={(e) => setTempGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                Masukkan URL hasil deploy Web App dari Google Apps Script Anda.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Groq API Keys (Pisahkan dengan koma)
              </label>
              <textarea
                value={tempKeys}
                onChange={(e) => setTempKeys(e.target.value)}
                placeholder="gsk_..., gsk_..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-mono"
              />
              <div className="mt-3 flex items-start bg-blue-50 p-3 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 shrink-0" />
                <p className="text-xs text-blue-700 leading-tight">
                  Masukkan beberapa key sekaligus untuk menghindari batas rate-limit pada akun gratis. Sistem akan melakukan rotasi setiap kali limit tercapai.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg flex items-start">
               <span className="text-amber-600 mr-2">⚠️</span>
               <p className="text-xs text-amber-700 italic">
                 Kunci API disimpan secara lokal di browser Anda (localStorage). Jangan gunakan pada komputer publik.
               </p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                setApiKeys(tempKeys);
                setGasUrl(tempGasUrl);
                setIsSettingsOpen(false);
              }}
              className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
            >
              Simpan & Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
