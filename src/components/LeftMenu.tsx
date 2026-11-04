import React from 'react';
import {
  X,
  Plus,
  BookOpen,
  Settings,
  Calendar,
  Smartphone,
  Fingerprint,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { UserAccount } from '../utils/authDatabase';

interface LeftMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddClass: () => void;
  onOpenBtebHub: () => void;
  onOpenSettings: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({
  isOpen,
  onClose,
  onOpenAddClass,
  onOpenBtebHub,
  onOpenSettings,
  currentUser,
  onOpenAuth,
  onLogout,
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
          {/* USER ACCOUNT & FINGERPRINT AUTH CARD */}
          {currentUser ? (
            /* Logged In Profile Card */
            <div className="bg-zinc-50 dark:bg-zinc-900/90 rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                      {currentUser.fullName || 'Student'}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {currentUser.phoneNumber}
                    </div>
                  </div>
                </div>

                <div
                  className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                  title="Biometric Fingerprint Verified"
                >
                  <Fingerprint className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Biometric Verified</span>
                </span>
                <span className="text-zinc-400 font-medium">
                  {currentUser.routines?.length || 0} classes
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('login');
                  }}
                  className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition text-center"
                >
                  Switch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            /* Not Logged In - Biometric Login CTA */
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl p-3.5 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Fingerprint className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                    Fingerprint Login
                  </div>
                  <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                    Phone & Biometric (No password)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('login');
                  }}
                  className="py-2 px-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('register');
                  }}
                  className="py-2 px-2 text-xs font-bold rounded-xl bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 transition text-center cursor-pointer"
                >
                  Register
                </button>
              </div>
            </div>
          )}

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
