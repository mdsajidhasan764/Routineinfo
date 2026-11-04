import React from 'react';
import { Home, Bell, Menu } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'home' | 'notifications' | 'menu';
  onSelectTab: (tab: 'home' | 'notifications' | 'menu') => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  unreadCount = 0,
}) => {
  return (
    <div className="fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[84%] max-w-[280px]">
      {/* iOS Floating Ultra-Glass Micro Pill */}
      <nav className="relative bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/50 dark:border-zinc-800/60 shadow-[0_8px_25px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] rounded-full p-0.5 flex items-center justify-around transition-all duration-300 select-none">
        
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all duration-200 cursor-pointer ${
            activeTab === 'home'
              ? 'bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold scale-[1.02]'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium'
          }`}
        >
          <Home className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'home' ? 'stroke-[2.5] scale-105' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] mt-0.5 tracking-tight leading-none">Home</span>
        </button>

        {/* Tab 2: Notification */}
        <button
          type="button"
          onClick={() => onSelectTab('notifications')}
          className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all duration-200 cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold scale-[1.02]'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <Bell className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'notifications' ? 'stroke-[2.5] scale-105' : 'stroke-[1.8]'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full ring-1 ring-white dark:ring-zinc-950 animate-pulse" />
            )}
          </div>
          <span className="text-[9px] mt-0.5 tracking-tight leading-none">Notification</span>
        </button>

        {/* Tab 3: Menu */}
        <button
          type="button"
          onClick={() => onSelectTab('menu')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all duration-200 cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold scale-[1.02]'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium'
          }`}
        >
          <Menu className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'menu' ? 'stroke-[2.5] scale-105' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] mt-0.5 tracking-tight leading-none">Menu</span>
        </button>

      </nav>
    </div>
  );
};
