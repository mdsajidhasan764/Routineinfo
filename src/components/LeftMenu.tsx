import React from 'react';
import {
  X,
  Plus,
  BookOpen,
  Settings,
  Calendar,
  Smartphone,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface LeftMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddClass: () => void;
  onOpenBtebHub: () => void;
  onOpenSettings: () => void;
  currentUser?: any;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({
  isOpen,
  onClose,
  onOpenAddClass,
  onOpenBtebHub,
  onOpenSettings,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Left Drawer Menu */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[82vw] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-r border-zinc-200/80 dark:border-zinc-800/80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight leading-none">
              Menu
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Menu Body */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Main Action: Add Class Routine */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAddClass();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs transition active:scale-[0.99] text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Class Routine</span>
          </button>

          {/* Navigation Links */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBtebHub();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium transition text-xs sm:text-sm cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>BTEB Book List</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium transition text-xs sm:text-sm cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <span>Settings</span>
            </button>
          </div>

          {/* PWA In-App Install (if available) */}
          {isInstallable && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-700 shadow-xs transition cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Install Mobile App</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
