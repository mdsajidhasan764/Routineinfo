/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppState, RoutineItem, DayOfWeek, DAYS_OF_WEEK } from './types';
import { loadAppState, saveAppState, uid } from './utils/storage';
import {
  getCurrentDayName,
  getLiveRoutineStatus,
  parseTimeToMinutes,
  playBellChime,
  triggerSystemNotification,
  LiveRoutineStatus,
} from './utils/notificationService';
import { Header } from './components/Header';
import { LiveClassBanner } from './components/LiveClassBanner';
import { RoutineView } from './components/RoutineView';
import { RoutineModal } from './components/RoutineModal';
import { BtebBooklistModal } from './components/BtebBooklistModal';
import { ScheduleSettingsModal } from './components/ScheduleSettingsModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getCurrentDayName());

  // Modal states
  const [routineModal, setRoutineModal] = useState<{
    isOpen: boolean;
    editingRoutine?: RoutineItem | null;
    defaultDay?: DayOfWeek;
    prefilledSubject?: { code: string; name: string } | null;
  }>({
    isOpen: false,
    editingRoutine: null,
    defaultDay: getCurrentDayName(),
    prefilledSubject: null,
  });

  const [btebModalOpen, setBtebModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ id: uid('toast'), text, type });
  };

  // Sync state to LocalStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Track fired notifications so we don't spam within the same minute
  const firedAlertsRef = useRef<Set<string>>(new Set());

  // Live Routine calculation
  const [liveStatus, setLiveStatus] = useState<LiveRoutineStatus>({
    currentClass: null,
    minutesRemainingInClass: 0,
    nextClass: null,
    minutesUntilNextClass: 0,
  });

  // Background ticker for live class status & offline class start/end push notifications
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentDay = getCurrentDayName();
      const todayRoutines = state.routines.filter((r) => r.day === currentDay);
      const status = getLiveRoutineStatus(todayRoutines, now);
      setLiveStatus(status);

      if (!state.notifications.enabled) return;

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      for (const item of todayRoutines) {
        const startMin = parseTimeToMinutes(item.startTime);
        const endMin = parseTimeToMinutes(item.endTime);

        // Check Class Start Notification
        if (startMin !== null && currentMinutes === startMin) {
          const alertKey = `start_${item.id}_${dateKey}_${startMin}`;
          if (!firedAlertsRef.current.has(alertKey)) {
            firedAlertsRef.current.add(alertKey);
            if (state.notifications.notifyOnStart) {
              triggerSystemNotification(`Class Started: ${item.subjectName}`, {
                body: `Time: ${item.startTime} – ${item.endTime}${item.room ? ' • ' + item.room : ''}${item.teacherName ? ' • ' + item.teacherName : ''}`,
              });
              if (state.notifications.soundEnabled) {
                playBellChime();
              }
              showToast(`🔔 Class Started: ${item.subjectName} (${item.room || 'Room N/A'})`, 'info');
            }
          }
        }

        // Check Class End Notification
        if (endMin !== null && currentMinutes === endMin) {
          const alertKey = `end_${item.id}_${dateKey}_${endMin}`;
          if (!firedAlertsRef.current.has(alertKey)) {
            firedAlertsRef.current.add(alertKey);
            if (state.notifications.notifyOnEnd) {
              triggerSystemNotification(`Class Ended: ${item.subjectName}`, {
                body: `Ended at ${item.endTime}. Next session or break time!`,
              });
              if (state.notifications.soundEnabled) {
                playBellChime();
              }
              showToast(`🔔 Class Ended: ${item.subjectName}`, 'info');
            }
          }
        }
      }
    };

    // Run initially
    checkSchedule();

    // Check every 10 seconds for precise time matching
    const timer = setInterval(checkSchedule, 10000);
    return () => clearInterval(timer);
  }, [state.routines, state.notifications]);

  // Routine Handlers
  const handleSaveRoutine = (savedRoutine: RoutineItem) => {
    setState((prev) => {
      const exists = prev.routines.some((r) => r.id === savedRoutine.id);
      const updated = exists
        ? prev.routines.map((r) => (r.id === savedRoutine.id ? savedRoutine : r))
        : [...prev.routines, savedRoutine];
      return { ...prev, routines: updated };
    });
    showToast('Class routine saved successfully! 📅', 'success');
  };

  const handleDeleteRoutine = (routineId: string) => {
    setState((prev) => ({
      ...prev,
      routines: prev.routines.filter((r) => r.id !== routineId),
    }));
    showToast('Class removed from routine', 'info');
  };

  const handleUpdateNotifications = (updated: AppState['notifications']) => {
    setState((prev) => ({ ...prev, notifications: updated }));
    showToast(
      updated.enabled ? 'Push notifications active 🔔' : 'Notifications disabled',
      'info'
    );
  };

  const handleUpdateAppState = (updated: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updated }));
    showToast('Settings saved successfully', 'success');
  };

  const handleResetRoutines = () => {
    setState((prev) => ({ ...prev, routines: [] }));
    showToast('All class routines cleared', 'info');
  };

  const handleSelectBtebSubject = (subject: { code: string; name: string }) => {
    setRoutineModal({
      isOpen: true,
      editingRoutine: null,
      defaultDay: selectedDay,
      prefilledSubject: subject,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* App Header */}
      <Header
        departmentName={state.departmentName}
        semesterName={state.semesterName}
        notifications={state.notifications}
        onUpdateNotifications={handleUpdateNotifications}
        onOpenAddClass={() =>
          setRoutineModal({
            isOpen: true,
            editingRoutine: null,
            defaultDay: selectedDay,
            prefilledSubject: null,
          })
        }
        onOpenBtebHub={() => setBtebModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-5 space-y-4">
        {/* Live Class in Progress / Upcoming Next Alert */}
        <LiveClassBanner status={liveStatus} />

        {/* Weekly Routine Manager View */}
        <RoutineView
          routines={state.routines}
          selectedDay={selectedDay}
          onChangeDay={setSelectedDay}
          onOpenAddRoutine={(day) =>
            setRoutineModal({
              isOpen: true,
              editingRoutine: null,
              defaultDay: day || selectedDay,
              prefilledSubject: null,
            })
          }
          onOpenEditRoutine={(routine) =>
            setRoutineModal({
              isOpen: true,
              editingRoutine: routine,
              defaultDay: routine.day,
              prefilledSubject: null,
            })
          }
          onDeleteRoutine={handleDeleteRoutine}
          onOpenBteb={() => setBtebModalOpen(true)}
        />
      </main>

      {/* Routine Add / Edit Modal */}
      {routineModal.isOpen && (
        <RoutineModal
          isOpen={routineModal.isOpen}
          onClose={() =>
            setRoutineModal({
              isOpen: false,
              editingRoutine: null,
              defaultDay: selectedDay,
              prefilledSubject: null,
            })
          }
          onSaveRoutine={handleSaveRoutine}
          editingRoutine={routineModal.editingRoutine}
          defaultDay={routineModal.defaultDay || selectedDay}
          defaultDeptSlug={state.departmentSlug}
          defaultSemester={state.semester}
          prefilledSubject={routineModal.prefilledSubject}
        />
      )}

      {/* BTEB Booklist Hub Modal */}
      {btebModalOpen && (
        <BtebBooklistModal
          isOpen={btebModalOpen}
          onClose={() => setBtebModalOpen(false)}
          onSelectSubjectForRoutine={handleSelectBtebSubject}
        />
      )}

      {/* Settings & Offline Alerts Modal */}
      {settingsModalOpen && (
        <ScheduleSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          state={state}
          onUpdateState={handleUpdateAppState}
          onResetRoutines={handleResetRoutines}
        />
      )}

      {/* Global In-App Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-700">
            Routine Manager
          </div>
          <div className="text-slate-400">
            Offline Ready • PWA
          </div>
        </div>
      </footer>
    </div>
  );
}
