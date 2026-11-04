import React, { useState } from 'react';
import {
  X,
  Settings,
  Bell,
  Download,
  Upload,
  Trash2,
  Volume2,
  Check,
  Moon,
  Sun,
  Clock,
  Fingerprint,
  ShieldCheck,
  LogOut,
  LogIn,
  Send,
  Building,
} from 'lucide-react';
import { AppState, NotificationSettings, ThemeMode } from '../types';
import { exportRoutineJson, parseRoutineBackup } from '../utils/storage';
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
  onResetRoutines: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const ScheduleSettingsModal: React.FC<ScheduleSettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onResetRoutines,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [instituteName, setInstituteName] = useState(state.instituteName || '');
  const [departmentName, setDepartmentName] = useState(state.departmentName || '');
  const [semesterName, setSemesterName] = useState(state.semesterName || '');
  const [shift, setShift] = useState(state.shift || '1st Shift');
  const [section, setSection] = useState(state.section || 'A');

  // Theme & Scheduled Dark Mode State
  const [themeMode, setThemeMode] = useState<ThemeMode>(state.theme?.mode || 'light');
  const [scheduleStart, setScheduleStart] = useState<string>(state.theme?.scheduleStart || '19:00');
  const [scheduleEnd, setScheduleEnd] = useState<string>(state.theme?.scheduleEnd || '06:00');

  const [notifications, setNotifications] = useState<NotificationSettings>(state.notifications);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [bellPlaying, setBellPlaying] = useState(false);
  const [testPushSent, setTestPushSent] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState({
      instituteName: instituteName.trim(),
      departmentName: departmentName.trim(),
      semesterName: semesterName.trim(),
      shift,
      section,
      notifications,
      theme: {
        mode: themeMode,
        scheduleStart,
        scheduleEnd,
      },
    });
    onClose();
  };

  const handleTogglePushNotifications = async (val: boolean) => {
    setNotifError(null);
    if (val) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setNotifications((prev) => ({ ...prev, enabled: true }));
      } else {
        setNotifError('নোটিফিকেশন পারমিশন ব্লক করা আছে। ব্রাউজার বা অ্যাপ সেটিংস থেকে এলাও করুন।');
        setNotifications((prev) => ({ ...prev, enabled: false }));
      }
    } else {
      setNotifications((prev) => ({ ...prev, enabled: false }));
    }
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

    // Ensure permission is granted
    let currentPerm = typeof Notification !== 'undefined' ? Notification.permission : 'denied';
    if (currentPerm !== 'granted') {
      currentPerm = await requestNotificationPermission();
      if (currentPerm === 'granted') {
        setNotifications((prev) => ({ ...prev, enabled: true }));
      } else {
        setNotifError('নোটিফিকেশন পারমিশন পাওয়া যায়নি। নোটিফিকেশন এলাও করুন।');
        return;
      }
    }

    // Play Bell Sound
    playBellChime();

    // Trigger Phone Vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 350]);
    }

    // Trigger Native Push Notification with exact user requested template
    triggerSystemNotification('Computer Office Application - Start At 4:15PM - Network Lab.', {
      body: 'Teacher: Sajid Islam · Room: Network Lab (Test Push Notification)',
    });

    setTestPushSent(true);
    setTimeout(() => setTestPushSent(false), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseRoutineBackup(file);
      onUpdateState(parsed);
      setImportStatus('Backup restored successfully!');
      setTimeout(() => setImportStatus(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to parse backup file');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">সেটিংস (Settings)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSaveAll} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Section: Account & Biometric Login */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-500/20 dark:border-emerald-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold uppercase text-[11px] tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                লগিন ও একাউন্ট (Biometric Account)
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
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {currentUser.phoneNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    রুটিন ও ডেটা সুরক্ষিতভাবে সেভ করা আছে
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogout?.();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  পাসওয়ার্ডের ঝামেলা ছাড়া সরাসরি ফোন নম্বর ও ফিঙ্গারপ্রিন্ট দিয়ে লগিন করুন। রুটিন স্বয়ংক্রিয়ভাবে ক্লাউড ডেটাবেজে সিঙ্ক থাকবে।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth?.('login');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ফিঙ্গারপ্রিন্ট দিয়ে লগিন / রেজিস্টার করুন</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Push Notification & Offline Bell */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                পুশ নোটিফিকেশন ও বেল (Push Alerts & Bell)
              </span>
              <button
                type="button"
                onClick={handleTestChime}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                  bellPlaying
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{bellPlaying ? 'বাজছে...' : 'বেল টেস্ট'}</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    পুশ নোটিফিকেশন চালু রাখুন (Offline Ready)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    ক্লাস শুরুর সময় ও শেষ হলে অটো নোটিফিকেশন আসবে
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.enabled}
                  onChange={(e) => handleTogglePushNotifications(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
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
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>টেস্ট পুশ নোটিফিকেশন পাঠান (Test Notification)</span>
                </button>
                {testPushSent && (
                  <div className="mt-2 p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-center rounded-lg text-[11px] animate-in fade-in flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>পুশ নোটিফিকেশন পাঠানো হয়েছে! ফোনের নোটিফিকেশন বার চেক করুন।</span>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">বেল সাউন্ড (Bell Chime)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">ক্লাস শুরুর সময় বেল বাজা</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.soundEnabled}
                  onChange={(e) => setNotifications({ ...notifications, soundEnabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-800 dark:text-slate-300">ক্লাস শুরুর নোটিফিকেশন</span>
                <input
                  type="checkbox"
                  checked={notifications.notifyOnStart}
                  onChange={(e) => setNotifications({ ...notifications, notifyOnStart: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-medium text-slate-800 dark:text-slate-300">ক্লাস শেষের নোটিফিকেশন</span>
                <input
                  type="checkbox"
                  checked={notifications.notifyOnEnd}
                  onChange={(e) => setNotifications({ ...notifications, notifyOnEnd: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Section: Dark Mode & Theme */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-400 dark:text-slate-500 block">
              থিম ও ডার্ক মুড (Appearance & Theme)
            </span>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 transition font-bold ${
                  themeMode === 'light'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 transition font-bold ${
                  themeMode === 'dark'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('schedule')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 transition font-bold ${
                  themeMode === 'schedule'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Schedule</span>
              </button>
            </div>

            {/* Schedule time selector */}
            {themeMode === 'schedule' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Scheduled Dark Mode Time:</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={scheduleStart}
                      onChange={(e) => setScheduleStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={scheduleEnd}
                      onChange={(e) => setScheduleEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Institute & Class Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-400 dark:text-slate-500 block">
              ইনস্টিটিউট ও ক্লাস তথ্য (Institute Details)
            </span>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ইনস্টিটিউট এর নাম (Institute Name)
              </label>
              <input
                type="text"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                placeholder="e.g. Dhaka Polytechnic Institute"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ডিপার্টমেন্ট (Department)
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  সেমিস্টার (Semester)
                </label>
                <input
                  type="text"
                  value={semesterName}
                  onChange={(e) => setSemesterName(e.target.value)}
                  placeholder="e.g. 5th Semester"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  শিফট (Shift)
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                >
                  <option value="1st Shift">1st Shift</option>
                  <option value="2nd Shift">2nd Shift</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  গ্রুপ / সেকশন (Section)
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. A or B"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Backup & Clear */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-400 dark:text-slate-500 block">
              ব্যাকআপ ও ডেটা (Backup & Sync)
            </span>

            {importStatus && (
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{importStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => exportRoutineJson(state)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 shadow-2xs transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Export Routine</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 py-2 px-3 font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 shadow-2xs transition cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Import Routine</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-2">
              {confirmReset ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2">
                  <p className="font-bold text-rose-700 dark:text-rose-300">সব রুটিন মুছে ফেলতে চান?</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetRoutines();
                        setConfirmReset(false);
                        onClose();
                      }}
                      className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition"
                    >
                      হ্যাঁ, সব মুছুন
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5 py-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>সব রুটিন ক্লিয়ার করুন (Clear All Routines)</span>
                </button>
              )}
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition"
            >
              সেভ করুন (Save Settings)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
