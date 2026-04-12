import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Key, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = () => {
  const { 
    apiKeys, setApiKeys, 
    isSettingsOpen, setIsSettingsOpen 
  } = useApp();
  const [tempKeys, setTempKeys] = useState(apiKeys);

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
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

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Step by Step Guide */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Cara Mendapatkan API Key Groq:
              </h4>
              <ol className="text-xs text-emerald-800 space-y-2 list-decimal ml-4">
                <li>Buka <strong><a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">Console Groq Keys</a></strong></li>
                <li>Login dengan akun Google/Gmail Anda.</li>
                <li>Klik tombol <strong>"Create API Key"</strong>.</li>
                <li>Beri nama bebas (misal: "Tafsir App") lalu klik <strong>Submit</strong>.</li>
                <li>Salin kode (diawali <code>gsk_</code>) dan tempel di bawah ini.</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Groq API Keys (Pisahkan dengan koma)
              </label>
              <textarea
                value={tempKeys}
                onChange={(e) => setTempKeys(e.target.value)}
                placeholder="gsk_..., gsk_..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-mono"
              />
              <div className="mt-3 flex items-start bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 shrink-0" />
                <p className="text-xs text-blue-700 leading-tight">
                  Disarankan memasukkan beberapa key sekaligus untuk menghindari <strong>Rate Limit</strong>. Sistem akan otomatis merotasi kunci.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl flex items-start border border-amber-100">
               <span className="text-amber-600 mr-2 text-sm">⚠️</span>
               <p className="text-xs text-amber-700 italic leading-snug">
                 Kunci API disimpan secara lokal di browser Anda (localStorage). Jangan gunakan pada komputer publik.
               </p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
            <button
              onClick={() => {
                setApiKeys(tempKeys);
                setIsSettingsOpen(false);
              }}
              className="w-full sm:w-auto px-10 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
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
