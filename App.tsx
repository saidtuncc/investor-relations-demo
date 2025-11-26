import React, { useState } from 'react';
import { LayoutDashboard, List, MessageSquareText } from 'lucide-react';
import { Tab } from './types';
import { Dashboard } from './components/Dashboard';
import { KapList } from './components/KapList';
import { Assistant } from './components/Assistant';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard />;
      case Tab.KAP:
        return <KapList />;
      case Tab.ASSISTANT:
        return <Assistant />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#881506FF] text-white border-b border-slate-800/40 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
                src="https://tskb-app.fra1.digitaloceanspaces.com/files/logo/logo_image_file_url_1/ff4705ef-29e9-4768-a05c-d53eb4872383.svg?1688739387131"
                alt="TSKB GYO"
                className="h-20 w-auto object-contain"
              />
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-wide">
                TSKB GYO
              </h1>
              <p className="text-xs text-white/70">
                Yatırımcı İlişkileri Portalı · Demo
              </p>
            </div>
          </div>

          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab(Tab.DASHBOARD)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                activeTab === Tab.DASHBOARD
                  ? 'bg-white/15 text-white'
                  : 'text-slate-100 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Özet</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.KAP)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                activeTab === Tab.KAP
                  ? 'bg-white/15 text_white'
                  : 'text-slate-100 hover:bg-white/10'
              }`.replace('text_white', 'text-white')}
            >
              <List className="w-4 h-4" />
              <span>KAP Bildirimleri</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.ASSISTANT)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                activeTab === Tab.ASSISTANT
                  ? 'bg-white/15 text-white'
                  : 'text-slate-100 hover:bg-white/10'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>IR Asistanı</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-400 text-sm">
          &copy; 2025 TSGYO Demo Project. Veriler tanıtım amaçlı olarak kullanılmaktadır.
        </div>
      </footer>
    </div>
  );
};

export default App;
