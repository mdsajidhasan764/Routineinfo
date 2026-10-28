import React, { useState } from 'react';
import { X, Settings, Bell, Download, Upload, Trash2, Volume2, Check } from 'lucide-react';
import { AppState, NotificationSettings } from '../types';
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
  const [notifications, setNotifications] = useState<NotificationSettings>(state.notifications);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState({
      instituteName: instituteName.trim(),
      departmentName: departmentName.trim(),
      semesterName: semesterName.trim(),
      notifications,
    });
    onClose();
  };

  const handleTogglePushNotifications = async (val: boolean) => {
    if (val) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setNotifications((prev) => ({ ...prev, enabled: true }));
      } else {
        alert('Browser notification permission was blocked or denied.');
        setNotifications((prev) => ({ ...prev, enabled: false }));
      }
    } else {
      setNotifications((prev) => ({ ...prev, enabled: false }));
    }
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
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSaveInfo} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Details */}
          <div className="space-y-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Institute Name
              </label>
              <input
                type="text"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                placeholder="e.g. Dhaka Polytechnic Institute"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  value={semesterName}
                  onChange={(e) => setSemesterName(e.target.value)}
                  placeholder="e.g. 5th Semester"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Notifications & Bell Chime</span>
              <button
                type="button"
                onClick={playBellChime}
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Chime</span>
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-800">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.enabled}
                  onChange={(e) => handleTogglePushNotifications(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-800">Bell Chime Audio (Offline)</span>
                <input
                  type="checkbox"
                  checked={notifications.soundEnabled}
                  onChange={(e) => setNotifications({ ...notifications, soundEnabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-800">Notify on Class Start</span>
                <input
                  type="checkbox"
                  checked={notifications.notifyOnStart}
                  onChange={(e) => setNotifications({ ...notifications, notifyOnStart: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-800">Notify on Class End</span>
                <input
                  type="checkbox"
                  checked={notifications.notifyOnEnd}
                  onChange={(e) => setNotifications({ ...notifications, notifyOnEnd: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Backup */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="font-bold text-slate-700 block">Backup</span>

            {importStatus && (
              <div className="p-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{importStatus}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportRoutineJson(state)}
                className="flex items-center gap-1 px-3 py-1.5 font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center gap-1 px-3 py-1.5 font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all routines?')) {
                  onResetRoutines();
                  onClose();
                }
              }}
              className="font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Routines</span>
            </button>
          </div>

          {/* Footer Save */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
