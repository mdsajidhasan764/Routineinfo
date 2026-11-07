import React from 'react';
import {
  X,
  Plus,
  BookOpen,
  Settings,
  Calendar,
  Smartphone,
  Bell,
  LogOut,
  User,
  Edit3,
  Home,
  Users,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface LeftMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView?: 'home' | 'bteb' | 'settings' | 'teachers';
  onNavigateHome?: () => void;
  onOpenAddClass: () => void;
  onOpenManageRoutines?: () => void;
  onOpenBtebHub: () => void;
  onOpenTeacherList?: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  currentUser?: any;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({
  isOpen,
  onClose,
  currentView = 'home',
  onNavigateHome,
  onOpenAddClass,
  onOpenManageRoutines,
  onOpenBtebHub,
  onOpenTeacherList,
  onOpenSettings,
  onOpenNotifications,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <>
      {/* iOS Glass Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Left Drawer Menu with iOS Glassmorphism */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[82vw] bg-white/95 dark:bg-slate-950/85 backdrop-blur-3xl text-zinc-900 dark:text-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col transform transition-transform duration-300 ease-out border-r border-zinc-200/80 dark:border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="p-4 border-b border-zinc-200/70 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
                Routine Info
              </h2>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Navigation Menu</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
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
              if (onNavigateHome) onNavigateHome();
              onOpenAddClass();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs dark:shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition active:scale-[0.98] text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Class Routine</span>
          </button>

          {/* Navigation Links */}
          <div className="space-y-1.5 pt-1">
            {/* Home / Class Routine Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateHome) onNavigateHome();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium transition text-xs sm:text-sm cursor-pointer ${
                currentView === 'home'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-700/50 dark:backdrop-blur-md'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] hover:dark:text-white'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  currentView === 'home'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Home className="w-4 h-4" />
              </div>
              <span>Class Routine (Home)</span>
            </button>

            {/* BTEB Book List */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBtebHub();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium transition text-xs sm:text-sm cursor-pointer ${
                currentView === 'bteb'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-700/50 dark:backdrop-blur-md'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] hover:dark:text-white'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  currentView === 'bteb'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-white/[0.06] text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <span>BTEB Book List</span>
            </button>

            {/* Teacher List (Jashore Polytechnic) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenTeacherList) {
                  onOpenTeacherList();
                } else if ((window as any).__onOpenTeacherList) {
                  (window as any).__onOpenTeacherList();
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium transition text-xs sm:text-sm cursor-pointer ${
                currentView === 'teachers'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-700/50 dark:backdrop-blur-md'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] hover:dark:text-white'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-white/[0.06] text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span>Teacher List</span>
            </button>

            {/* Manage Routines (Edit & Delete) */}
            {onOpenManageRoutines && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManageRoutines();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] hover:dark:text-white font-medium transition text-xs sm:text-sm cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-white/[0.06] text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Edit3 className="w-4 h-4" />
                </div>
                <span>Manage Routines (Edit/Delete)</span>
              </button>
            )}

            {/* Notifications History */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNotifications();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] hover:dark:text-white font-medium transition text-xs sm:text-sm cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-white/[0.06] text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <span>Notifications History</span>
            </button>

            {/* Settings (In-App View, NO Popup) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium transition text-xs sm:text-sm cursor-pointer ${
                currentView === 'settings'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-700/50 dark:backdrop-blur-md'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] hover:dark:text-white'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  currentView === 'settings'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Settings className="w-4 h-4" />
              </div>
              <span>Settings</span>
            </button>
          </div>

          {/* Account / User Section */}
          {currentUser ? (
            <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.08]">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-md border border-zinc-200/60 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {currentUser.phoneNumber}
                  </span>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            onOpenAuth && (
              <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-white/[0.06] dark:backdrop-blur-md transition flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-emerald-500" />
                  <span>Login / Sync Account</span>
                </button>
              </div>
            )
          )}

          {/* PWA In-App Install (if available) */}
          {isInstallable && (
            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-700 shadow-xs transition cursor-pointer"
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
