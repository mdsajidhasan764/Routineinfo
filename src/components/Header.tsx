import React from 'react';
import { Menu, Calendar, Search, X } from 'lucide-react';

interface HeaderProps {
  onOpenMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Menu button & App Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-2 -ml-1 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition flex items-center gap-1.5 focus:outline-none cursor-pointer"
            title="Open Menu"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 stroke-[2]" />
            <span className="hidden xs:inline text-xs font-semibold text-zinc-700 dark:text-zinc-300">Menu</span>
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden xs:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white tracking-tight leading-none whitespace-nowrap hidden sm:block">
              Class Routine
            </h1>
          </div>
        </div>

        {/* Center / Right: Clean Search Bar */}
        <div className="flex-1 max-w-md ml-auto relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search class, code, room, teacher..."
            className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
