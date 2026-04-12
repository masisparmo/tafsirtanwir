import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { BookText, ShieldCheck, PenTool, LayoutList, BookOpen } from 'lucide-react';

const ContentTabs = () => {
  const { mode, activeTab, setActiveTab } = useApp();

  const pencariTabs = [
    { id: 'tafsir', label: 'Tafsir & Balaghah', icon: BookText },
    { id: 'maqashid', label: 'Maqashid Syariah', icon: ShieldCheck },
    { id: 'quiz', label: 'Uji Pemahaman', icon: PenTool },
  ];

  const ustadzTabs = [
    { id: 'khutbah', label: 'Materi Khutbah', icon: LayoutList },
    { id: 'kajian', label: 'Kajian Mendalam', icon: BookOpen },
  ];

  const tabs = mode === 'pencari' ? pencariTabs : ustadzTabs;

  return (
    <div className="border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 -mb-px overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all relative whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ContentTabs;
