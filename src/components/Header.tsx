import React, { useState } from 'react';
import { Calendar, Bell, BellOff, Volume2, Settings, BookOpen, Plus } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { NotificationSettings } from '../types';
import { playBellChime, requestNotificationPermission } from '../utils/notificationService';

interface HeaderProps {
  departmentName?: string;
  semesterName?: string;
  notifications: NotificationSettings;
  onUpdateNotifications: (updated: NotificationSettings) => void;
  onOpenAddClass: () => void;
  onOpenBtebHub: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  departmentName,
  semesterName,
  notifications,
  onUpdateNotifications,
  onOpenAddClass,
  onOpenBtebHub,
  onOpenSettings,
}) => {
  const [bellPlaying, setBellPlaying] = useState(false);

  const handleToggleNotifications = async () => {
    if (!notifications.enabled) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        onUpdateNotifications({ ...notifications, enabled: true });
      } else {
        alert('Notification permission was blocked in browser settings.');
      }
    } else {
      onUpdateNotifications({ ...notifications, enabled: false });
    }
  };

  const handleTestChime = () => {
    setBellPlaying(true);
    playBellChime();
    setTimeout(() => setBellPlaying(false), 1200);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none truncate">
              Routine Manager
            </h1>
            {departmentName && (
              <p className="text-[11px] text-slate-500 truncate mt-1">
                {departmentName} {semesterName ? `· ${semesterName}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <PWAInstallButton />

          <button
            onClick={handleTestChime}
            className={`p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition ${
              bellPlaying ? 'bg-emerald-100 text-emerald-800' : 'bg-white'
            }`}
            title="Test Bell Chime"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleNotifications}
            className={`p-2 rounded-xl border transition ${
              notifications.enabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-400'
            }`}
            title={notifications.enabled ? 'Notifications Active' : 'Enable Notifications'}
          >
            {notifications.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenBtebHub}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">BTEB Books</span>
          </button>

          <button
            onClick={onOpenAddClass}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-2xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Class</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
            title="Settings & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
