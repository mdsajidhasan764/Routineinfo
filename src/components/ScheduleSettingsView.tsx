import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings,
  Bell,
  Volume2,
  Check,
  Fingerprint,
  ShieldCheck,
  LogOut,
  LogIn,
  Send,
  Smartphone,
  Trash2,
  Moon,
  Sun,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AppState, NotificationSettings } from '../types';
import {
  playBellChime,
  requestNotificationPermission,
  triggerSystemNotification,
} from '../utils/notificationService';
import { UserAccount } from '../utils/authDatabase';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ScheduleSettingsViewProps {
  onBackToHome: () => void;
  state: AppState;
  onUpdateState: (updated: Partial<AppState>) => void;
  onResetRoutines?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const ScheduleSettingsView: React.FC<ScheduleSettingsViewProps> = ({
  onBackToHome,
  state,
  onUpdateState,
  onResetRoutines,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [notifications, setNotifications] = useState<NotificationSettings>(state.notifications);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [bellPlaying, setBellPlaying] = useState(false);
  const [testPushSent, setTestPushSent] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const { isInstallable, install } = usePWAInstall();

  const handleTogglePushNotifications = async (val: boolean) => {
    setNotifError(null);
    if (val) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        const updated = { ...notifications, enabled: true };
        setNotifications(updated);
        onUpdateState({ notifications: updated });
      } else {
        setNotifError('Notification permission was blocked in device settings. Please allow notifications.');
        const updated = { ...notifications, enabled: false };
        setNotifications(updated);
        onUpdateState({ notifications: updated });
      }
    } else {
      const updated = { ...notifications, enabled: false };
      setNotifications(updated);
      onUpdateState({ notifications: updated });
    }
  };

  const handleUpdateNotificationOption = (key: keyof NotificationSettings, val: boolean) => {
    const updated = { ...notifications, [key]: val };
    setNotifications(updated);
    onUpdateState({ notifications: updated });
  };

  const handleTestChime = () => {
    setBellPlaying(true);
    playBellChime();
    setTimeout(() => setBellPlaying(false), 1200);
  };

  const handleTestPushNotification = async () => {
    setNotifError(null);
    setTestPushSent(false);

    let currentPerm = typeof Notification !== 'undefined' ? Notification.permission : 'denied';
    if (currentPerm !== 'granted') {
      currentPerm = await requestNotificationPermission();
      if (currentPerm === 'granted') {
        const updated = { ...notifications, enabled: true };
        setNotifications(updated);
        onUpdateState({ notifications: updated });
      }
    }

    playBellChime();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 350]);
    }

    triggerSystemNotification('Computer Office Application - Start At 4:15PM - Network Lab.', {
      body: 'Teacher: Sajid Islam · Room: Network Lab (Test Push Alert)',
    });

    setTestPushSent(true);
    setTimeout(() => setTestPushSent(false), 4000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.36)] flex items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
            <Settings className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
              Schedule Settings
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Theme, Push Notifications, Biometrics & Routine Controls
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Theme Mode */}
      <div className="bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.36)] space-y-3 transition-all">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            App Theme Mode
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] dark:backdrop-blur-md border border-zinc-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={() => onUpdateState({ theme: { ...state.theme, mode: 'light' } })}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              state.theme.mode === 'light'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateState({ theme: { ...state.theme, mode: 'dark' } })}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              state.theme.mode === 'dark' || (state.theme.mode as string) === 'glass'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-zinc-200" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateState({ theme: { ...state.theme, mode: 'schedule' } })}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              state.theme.mode === 'schedule'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-300" />
            <span>Auto Night</span>
          </button>
        </div>
      </div>

      {/* Section 2: Account & Fingerprint Security */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:via-white/[0.04] dark:to-transparent dark:backdrop-blur-2xl rounded-3xl p-4 sm:p-5 border border-emerald-500/20 dark:border-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.36)] space-y-3 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              Biometric Fingerprint & Account (Cloud Sync)
            </h2>
          </div>
          {currentUser && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified
            </span>
          )}
        </div>

        {currentUser ? (
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.04] dark:backdrop-blur-md border border-emerald-500/20 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-mono font-black text-zinc-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                {currentUser.phoneNumber}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                All routines and preferences are synced with your cloud account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onLogout?.()}
              className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.04] dark:backdrop-blur-md border border-emerald-500/20 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] space-y-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Password-free instant login with your mobile phone number and biometric fingerprint. Keeps your routine synced across devices.
            </p>
            <button
              type="button"
              onClick={() => onOpenAuth?.('login')}
              className="w-full sm:w-auto py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Register with Fingerprint</span>
            </button>
          </div>
        )}
      </div>

      {/* Section 3: Push Notifications & Bells */}
      <div className="bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.36)] space-y-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              Push Notifications & Alerts (Offline Ready)
            </h2>
          </div>

          <button
            type="button"
            onClick={handleTestChime}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              bellPlaying
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 dark:bg-white/[0.06] text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-white/10 hover:bg-emerald-100 dark:hover:bg-white/[0.1] dark:backdrop-blur-md'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{bellPlaying ? 'Ringing...' : 'Test Bell Sound'}</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-md border border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] space-y-3.5">
          {/* Main Switch */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                Enable Push Notifications
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Receive offline notifications when class starts and concludes
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.enabled}
              onChange={(e) => handleTogglePushNotifications(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </label>

          {notifError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {notifError}
            </div>
          )}

          {/* Test Push Button */}
          <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={handleTestPushNotification}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test Push Alert</span>
            </button>
            {testPushSent && (
              <div className="mt-2 p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-center rounded-xl text-xs animate-in fade-in flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Test notification sent! Check your notification bar and listen for the chime.</span>
              </div>
            )}
          </div>

          {/* Sub Options */}
          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-zinc-200/80 dark:border-zinc-700/80">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                Institute Bell Chime
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Plays a melodic chime sound at class time
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.soundEnabled}
              onChange={(e) => handleUpdateNotificationOption('soundEnabled', e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-zinc-200/80 dark:border-zinc-700/80">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                Notify on Class Start
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Alert with subject name, room, and start time
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.notifyOnStart}
              onChange={(e) => handleUpdateNotificationOption('notifyOnStart', e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-zinc-200/80 dark:border-zinc-700/80">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                Notify on Class End
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Alerts right as the class concludes
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.notifyOnEnd}
              onChange={(e) => handleUpdateNotificationOption('notifyOnEnd', e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Section 4: Mobile App Install */}
      {isInstallable && (
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Install Mobile App (PWA)</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Add to home screen for fast offline access and push notifications.
            </p>
          </div>
          <button
            type="button"
            onClick={install}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-700 transition cursor-pointer shrink-0"
          >
            Install
          </button>
        </div>
      )}

      {/* Section 5: Routine Reset / Danger Zone */}
      {onResetRoutines && (
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-rose-200/80 dark:border-rose-900/60 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Trash2 className="w-4 h-4" />
            <h3 className="text-sm font-bold">Reset Routine Database (Danger Zone)</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Permanently clear all scheduled classes from this device.
          </p>

          {confirmClearOpen ? (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-2xl border border-rose-300 dark:border-rose-800 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-200">
                Are you sure you want to clear all routines?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetRoutines();
                    setConfirmClearOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
                >
                  Yes, Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold text-xs transition cursor-pointer"
            >
              Clear All Routines
            </button>
          )}
        </div>
      )}

      {/* Done / Return to Home Bottom Button */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={onBackToHome}
          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-[0.98] cursor-pointer"
        >
          ← Return to Routine Schedule
        </button>
      </div>
    </div>
  );
};
