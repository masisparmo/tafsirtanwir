import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Copy, Check, Lightbulb } from 'lucide-react';

const UstadzPoints = () => {
  const { activeTafsir } = useApp();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!activeTafsir.ustadzPoin) return;
    const text = activeTafsir.ustadzPoin.map((p, i) => `${i + 1}. ${p}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeTafsir.ustadzPoin || !activeTafsir.ustadzPoin.length) return null;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
          <Lightbulb className="w-6 h-6 text-amber-500 mr-2" />
          Poin Utama untuk Syarah/Khutbah
        </h3>
        <p className="text-slate-500 text-sm">Gunakan poin-poin berikut sebagai bahan ajar atau materi khutbah.</p>
      </div>

      <div className="grid gap-4">
        {activeTafsir.ustadzPoin.map((point, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 hover:shadow-sm transition-shadow"
          >
            <div className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 mr-3">
              {idx + 1}
            </div>
            <p className="text-slate-700 leading-relaxed font-medium">
              {point}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="pt-6">
        <button
          onClick={copyToClipboard}
          className={`flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
            copied 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 hover:shadow-emerald-300'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              <span>Materi Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Salin Materi (Copy)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UstadzPoints;
