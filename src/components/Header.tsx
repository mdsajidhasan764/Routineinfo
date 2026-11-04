import React from 'react';
import { Calendar, Search, X, Menu, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenMenu?: () => void;
  currentView?: 'home' | 'bteb' | 'settings';
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenMenu,
  currentView = 'home',
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-3xl border-b border-zinc-200/60 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left Side: Hamburger Menu Button, Back Button (if on sub-screen), and Title */}
        <div className="flex items-center gap-2 shrink-0">
          {currentView !== 'home' && onNavigateHome ? (
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.12] text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-white/10 transition cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
              title="Return to Schedule"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
          ) : (
            onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                className="w-8 h-8 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.08] border border-transparent hover:border-zinc-200/60 dark:hover:border-white/10 transition cursor-pointer flex items-center justify-center shrink-0"
                title="Open Navigation Menu"
              >
                <Menu className="w-4 h-4 stroke-[2.2]" />
              </button>
            )
          )}

          <div
            onClick={currentView !== 'home' ? onNavigateHome : undefined}
            className={`flex items-center gap-2 ${
              currentView !== 'home' ? 'cursor-pointer hover:opacity-80 transition' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-none whitespace-nowrap">
              {currentView === 'bteb'
                ? 'BTEB Books'
                : currentView === 'settings'
                ? 'Settings'
                : 'Routine Info'}
            </h1>
          </div>
        </div>

        {/* Right Side: Search (Only on Home screen) */}
        <div className="flex items-center gap-2 ml-auto">
          {currentView === 'home' && (
            <div className="w-[180px] sm:w-[240px] relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search classes..."
                className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-zinc-100/80 dark:bg-white/[0.06] dark:backdrop-blur-xl hover:bg-zinc-100 dark:hover:bg-white/[0.09] focus:bg-white dark:focus:bg-white/[0.1] rounded-xl border border-zinc-200/80 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40 transition shadow-2xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
