import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';
import { AppState, NotificationSettings } from '../types';
import {
  playBellChime,
  requestNotificationPermission,
  triggerSystemNotification,
} from '../utils/notificationService';
import { UserAccount } from '../utils/authDatabase';

interface ScheduleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateState: (updated: Partial<AppState>) => void;
  onResetRoutines?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const ScheduleSettingsModal: React.FC<ScheduleSettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [notifications, setNotifications] = useState<NotificationSettings>(state.notifications);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [bellPlaying, setBellPlaying] = useState(false);
  const [testPushSent, setTestPushSent] = useState(false);

  if (!isOpen) return null;

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

  // Immediate Push Notification Test with Vibration & Chime
  const handleTestPushNotification = async () => {
    setNotifError(null);
    setTestPushSent(false);

    // Ensure permission is granted or requested
    let currentPerm = typeof Notification !== 'undefined' ? Notification.permission : 'denied';
    if (currentPerm !== 'granted') {
      currentPerm = await requestNotificationPermission();
      if (currentPerm === 'granted') {
        const updated = { ...notifications, enabled: true };
        setNotifications(updated);
        onUpdateState({ notifications: updated });
      }
    }

    // Play Bell Sound
    playBellChime();

    // Trigger Phone Vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 350]);
    }

    // Trigger Native Push Notification
    triggerSystemNotification('Computer Office Application - Start At 4:15PM - Network Lab.', {
      body: 'Teacher: Sajid Islam · Room: Network Lab (Test Push Notification)',
    });

    setTestPushSent(true);
    setTimeout(() => setTestPushSent(false), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - STRICTLY Finger Login & Push Notifications ONLY */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[80vh] text-xs">
          {/* Section 1: Account & Biometric Security */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-500/20 dark:border-emerald-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold uppercase text-[11px] tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Account & Fingerprint Login
              </span>
              {currentUser && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    {currentUser.phoneNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Routines and preferences synced to database
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogout?.();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Log in directly with your phone number and fingerprint sensor. Password-free and automatically syncs your routines to the database.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth?.('login');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Register with Fingerprint</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Push Notifications & Bell */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                Push Notifications & Alerts
              </span>
              <button
                type="button"
                onClick={handleTestChime}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                  bellPlaying
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{bellPlaying ? 'Ringing...' : 'Test Bell'}</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Push Notifications (Offline Ready)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Receive alert when class starts and ends
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.enabled}
                  onChange={(e) => handleTogglePushNotifications(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </label>

              {notifError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] font-medium">
                  {notifError}
                </div>
              )}

              {/* Instant Test Push Notification Button */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleTestPushNotification}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Push Notification</span>
                </button>
                {testPushSent && (
                  <div className="mt-2 p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-center rounded-lg text-[11px] animate-in fade-in flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Notification sent! Check your notification bar and listen for the chime.</span>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Institute Bell Chime</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Plays melodic bell sound at class time</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.soundEnabled}
                  onChange={(e) => handleUpdateNotificationOption('soundEnabled', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-300">Notify on Class Start</span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Instant push when a class begins</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.notifyOnStart}
                  onChange={(e) => handleUpdateNotificationOption('notifyOnStart', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-300">Notify on Class End</span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Alert 5 minutes before class ends</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.notifyOnEnd}
                  onChange={(e) => handleUpdateNotificationOption('notifyOnEnd', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
