import React from 'react';
import Header from './components/layout/Header';
import Hero from './components/features/Hero';
import ContentTabs from './components/layout/ContentTabs';
import MainContent from './components/features/MainContent';
import SettingsModal from './components/layout/SettingsModal';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Hero />
          <ContentTabs />
          <MainContent />
        </main>
        
        <SettingsModal />

        <footer className="bg-slate-900 text-slate-400 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm">© 2026 Tafsir At Tahrir wat Tanwir</p>
            <p className="text-xs mt-2 italic text-slate-500">
              "Lisanul Arabiyah Huwa Miftaahu Fahmil Qur'an"
            </p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;
