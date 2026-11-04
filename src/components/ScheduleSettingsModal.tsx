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
} from 'lucide-react';
import { AppState, NotificationSettings, ThemeMode } from '../types';
import { exportRoutineJson, parseRoutineBackup } from '../utils/storage';
import { playBellChime, requestNotificationPermission } from '../utils/notificationService';

interface ScheduleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateState: (updated: Partial<AppState>) => void;
  onResetRoutines: () => void;
}

export const ScheduleSettingsModal: React.FC<ScheduleSettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onResetRoutines,
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
        setNotifError('Notification permission was blocked in browser settings. Please allow notifications.');
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
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings</h2>
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
          {/* Section 1: Dark Mode & Schedule Theme */}
          <div className="space-y-2.5">
            <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-400 dark:text-slate-500 block">
              Appearance & Dark Mode
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

            {/* Schedule time selector (visible when Schedule Dark Mode is chosen) */}
            {themeMode === 'schedule' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Scheduled Dark Mode Hours:</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Start Dark Mode
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
                      End Dark Mode
                    </label>
                    <input
                      type="time"
                      value={scheduleEnd}
                      onChange={(e) => setScheduleEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Dark mode turns on automatically between {scheduleStart} and {scheduleEnd}.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Institute & Class Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-400 dark:text-slate-500 block">
              Institute & Class Details
            </span>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institute Name
              </label>
              <input
                type="text"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                placeholder="e.g. Dhaka Polytechnic Institute"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Technology
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  value={semesterName}
                  onChange={(e) => setSemesterName(e.target.value)}
                  placeholder="e.g. 5th Semester"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shift
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
                  Section / Group
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. A, B, or C"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bell & Offline Push Alerts */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-400 dark:text-slate-500">
                Push Alerts & Bell
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
                <span>{bellPlaying ? 'Ringing...' : 'Test Bell'}</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Push Notifications (Offline Ready)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Class start and end alerts</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.enabled}
                  onChange={(e) => handleTogglePushNotifications(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              {notifError && (
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px]">
                  {notifError}
                </div>
              )}

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Institute Bell Sound (Offline)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Synthesizes bell chime audio</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.soundEnabled}
                  onChange={(e) => setNotifications({ ...notifications, soundEnabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-300">Notify on Class Start</span>
                <input
                  type="checkbox"
                  checked={notifications.notifyOnStart}
                  onChange={(e) => setNotifications({ ...notifications, notifyOnStart: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-300">Notify on Class End</span>
                <input
                  type="checkbox"
                  checked={notifications.notifyOnEnd}
                  onChange={(e) => setNotifications({ ...notifications, notifyOnEnd: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Section 4: Backup & Sync */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="font-extrabold uppercase text-[11px] tracking-wider text-slate-400 dark:text-slate-500 block">
              Backup & Sync
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
          </div>

          {/* Section 5: Clear All Routines */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {confirmReset ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2">
                <p className="font-bold text-rose-700 dark:text-rose-300">Are you sure you want to clear all routines?</p>
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
                    Yes, Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
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
                <span>Clear All Routines</span>
              </button>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
