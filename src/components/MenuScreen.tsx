import React from 'react';
import {
  Plus,
  BookOpen,
  Settings,
  Smartphone,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MenuScreenProps {
  onOpenAddClass: () => void;
  onOpenBtebHub: () => void;
  onOpenSettings: () => void;
  currentUser?: any;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  onOpenAddClass,
  onOpenBtebHub,
  onOpenSettings,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <div className="space-y-2.5 animate-in fade-in duration-200">
      {/* Menu Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">
            Menu
          </h2>
        </div>
      </div>

      {/* Account / User Card */}
      <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-2xl p-2.5 border border-white/40 dark:border-zinc-800/50 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-zinc-900 dark:text-white truncate">
              {currentUser ? currentUser.phoneNumber : 'Guest User'}
            </div>
            <div className="text-[9px] text-zinc-500 dark:text-zinc-400 flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
              <span>{currentUser ? 'Biometric Sync Active' : 'Offline Mode'}</span>
            </div>
          </div>
        </div>

        {currentUser ? (
          onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer text-[10px] font-semibold flex items-center gap-0.5"
              title="Logout"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          )
        ) : (
          onOpenAuth && (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[10px] hover:bg-emerald-700 transition cursor-pointer shadow-2xs"
            >
              Sync
            </button>
          )
        )}
      </div>

      {/* Primary Action Button: Add Class Routine */}
      <button
        type="button"
        onClick={onOpenAddClass}
        className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs transition active:scale-[0.99] text-[11px] cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold shrink-0">
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>Add New Class Routine</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 opacity-80" />
      </button>

      {/* Grid of Compact Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Option 1: BTEB Book List */}
        <button
          type="button"
          onClick={onOpenBtebHub}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/40 dark:border-zinc-800/50 hover:bg-white/60 dark:hover:bg-zinc-900/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-3 h-3" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-zinc-900 dark:text-white">BTEB Book List</div>
              <div className="text-[9px] text-zinc-400">Syllabus & subject books</div>
            </div>
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
        </button>

        {/* Option 2: Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl border border-white/40 dark:border-zinc-800/50 hover:bg-white/60 dark:hover:bg-zinc-900/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
              <Settings className="w-3 h-3" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-zinc-900 dark:text-white">Settings</div>
              <div className="text-[9px] text-zinc-400">Department, Theme, Backup</div>
            </div>
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
        </button>

        {/* Option 3: Install App if installable */}
        {isInstallable && (
          <button
            type="button"
            onClick={install}
            className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/90 dark:bg-zinc-800/90 text-white transition cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-zinc-800 dark:bg-zinc-700 text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-3 h-3" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold">Install Mobile App</div>
                <div className="text-[9px] text-zinc-400">Fast offline access</div>
              </div>
            </div>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          </button>
        )}
      </div>
    </div>
  );
};
