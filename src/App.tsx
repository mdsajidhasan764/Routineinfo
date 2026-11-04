/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppState, RoutineItem, DayOfWeek, DAYS_OF_WEEK, ThemeMode } from './types';
import { loadAppState, saveAppState, uid } from './utils/storage';
import {
  getCurrentDayName,
  parseTimeToMinutes,
  playBellChime,
  triggerSystemNotification,
  formatStartNotification,
  formatEndNotification,
  isDarkModeActive,
  requestNotificationPermission,
} from './utils/notificationService';
import { Header } from './components/Header';
import { LeftMenu } from './components/LeftMenu';
import { LiveClassBar } from './components/LiveClassBar';
import { RoutineView } from './components/RoutineView';
import { RoutineModal } from './components/RoutineModal';
import { BtebBooklistModal } from './components/BtebBooklistModal';
import { ScheduleSettingsModal } from './components/ScheduleSettingsModal';
import { ClassDetailsModal } from './components/ClassDetailsModal';
import { DepartmentBackground } from './components/DepartmentBackground';
import { BiometricAuthModal } from './components/BiometricAuthModal';
import { Toast, ToastMessage } from './components/Toast';
import {
  getCurrentUser,
  logoutUser,
  syncCurrentAccount,
  UserAccount,
} from './utils/authDatabase';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getCurrentDayName(loadAppState().shift));

  // Logged-in User Account State (Phone & Biometric)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
  }>({
    isOpen: false,
    mode: 'login',
  });

  // Search State driven from Top Header
  const [searchQuery, setSearchQuery] = useState('');

  // Left Sidebar / Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  const [detailsRoutine, setDetailsRoutine] = useState<RoutineItem | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ id: uid('toast'), text, type });
  };

  // Sync state to LocalStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Dark Mode calculation & immediate DOM synchronization
  const isDark = isDarkModeActive(state.theme);

  useEffect(() => {
    const applyTheme = () => {
      const darkActive = isDarkModeActive(state.theme);
      if (darkActive) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    // In schedule mode, re-evaluate every 15 seconds
    const timer = setInterval(applyTheme, 15000);
    return () => clearInterval(timer);
  }, [state.theme]);

  // Auto-request push notification permission on first app entry
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission().then((perm) => {
        if (perm === 'granted') {
          setState((prev) => {
            const next = {
              ...prev,
              notifications: { ...prev.notifications, enabled: true },
            };
            saveAppState(next);
            return next;
          });
        }
      });
    }
  }, []);

  // Check if app was opened via notification click or search parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const routineIdParam = params.get('routineId');
    if (routineIdParam && state.routines.length > 0) {
      const found = state.routines.find((r) => r.id === routineIdParam);
      if (found) {
        setDetailsRoutine(found);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }
    }

    const pendingId = localStorage.getItem('bteb_pending_notification_routine');
    const pendingTime = Number(localStorage.getItem('bteb_pending_notification_time') || '0');
    if (pendingId && Date.now() - pendingTime < 60 * 60 * 1000 && state.routines.length > 0) {
      const found = state.routines.find((r) => r.id === pendingId);
      if (found) {
        setDetailsRoutine(found);
        localStorage.removeItem('bteb_pending_notification_routine');
        localStorage.removeItem('bteb_pending_notification_time');
      }
    }
  }, [state.routines]);



  // Instant 1-tap Theme Switcher
  const handleToggleTheme = () => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    if (nextMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setState((prev) => {
      const nextState: AppState = {
        ...prev,
        theme: {
          ...prev.theme,
          mode: nextMode,
        },
      };
      saveAppState(nextState);
      return nextState;
    });

    showToast(nextMode === 'dark' ? 'Dark Mode Enabled 🌙' : 'Light Mode Enabled ☀️', 'info');
  };

  // Instant Notification Permission Request & Toggle
  const handleToggleNotifications = async () => {
    if (!state.notifications.enabled) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        const nextNotifications = { ...state.notifications, enabled: true };
        setState((prev) => {
          const next = { ...prev, notifications: nextNotifications };
          saveAppState(next);
          return next;
        });
        playBellChime();
        triggerSystemNotification('Push Notifications Active! 🔔', {
          body: 'You will receive offline alerts when class starts and ends.',
        });
        showToast('Push Notifications Allowed! 🔔', 'success');
      } else {
        showToast('Notification permission was blocked in browser settings', 'error');
      }
    } else {
      const nextNotifications = { ...state.notifications, enabled: false };
      setState((prev) => {
        const next = { ...prev, notifications: nextNotifications };
        saveAppState(next);
        return next;
      });
      showToast('Notifications disabled', 'info');
    }
  };

  // Track fired notifications so we don't spam within the same minute
  const firedAlertsRef = useRef<Set<string>>(new Set());

  // Date tracking for automatic Midnight (12:00 AM) rollover
  const lastDateKeyRef = useRef<string>(
    `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
  );

  // Background ticker for 12:00 AM rollover & offline class start/end push notifications & bell chimes
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentDateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      // Midnight or Shift-End Rollover Check:
      const targetAcademicDay = getCurrentDayName(state.shift, now);

      if (lastDateKeyRef.current !== currentDateKey) {
        lastDateKeyRef.current = currentDateKey;
        setSelectedDay(targetAcademicDay);
        firedAlertsRef.current.clear();
      } else {
        // Automatic rollover to Next Day after Shift finishes (1:30 PM for Morning Shift, 6:30 PM for Day Shift)
        const isDayShift = (state.shift || '').toLowerCase().includes('day') || (state.shift || '').toLowerCase().includes('2nd');
        const cutoffMinutes = isDayShift ? 18 * 60 + 30 : 13 * 60 + 30;
        const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

        if (currentMinutesNow >= cutoffMinutes && selectedDay !== targetAcademicDay) {
          setSelectedDay(targetAcademicDay);
        }
      }

      const todayRoutines = state.routines.filter((r) => r.day === targetAcademicDay);

      if (!state.notifications.enabled) return;

      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const item of todayRoutines) {
        const startMin = parseTimeToMinutes(item.startTime);
        const endMin = parseTimeToMinutes(item.endTime);

        // Check Class Start Notification: "Subject - Start At Time - Room/Lab."
        if (startMin !== null && currentMinutes === startMin) {
          const alertKey = `start_${item.id}_${currentDateKey}_${startMin}`;
          if (!firedAlertsRef.current.has(alertKey)) {
            firedAlertsRef.current.add(alertKey);
            if (state.notifications.notifyOnStart) {
              const startMsg = formatStartNotification(item);
              localStorage.setItem('bteb_pending_notification_routine', item.id);
              localStorage.setItem('bteb_pending_notification_time', String(Date.now()));
              triggerSystemNotification(startMsg, {
                body: item.teacherName ? `Teacher: ${item.teacherName}` : 'Class is starting now!',
                data: { routineId: item.id },
              });
              if (state.notifications.soundEnabled) {
                playBellChime();
              }
            }
          }
        }

        // Check Class End Notification: "Subject - Ended At Time - Room/Lab."
        if (endMin !== null && currentMinutes === endMin) {
          const alertKey = `end_${item.id}_${currentDateKey}_${endMin}`;
          if (!firedAlertsRef.current.has(alertKey)) {
            firedAlertsRef.current.add(alertKey);
            if (state.notifications.notifyOnEnd) {
              const endMsg = formatEndNotification(item);
              localStorage.setItem('bteb_pending_notification_routine', item.id);
              localStorage.setItem('bteb_pending_notification_time', String(Date.now()));
              triggerSystemNotification(endMsg, {
                body: 'Class has concluded. Break or next session!',
                data: { routineId: item.id },
              });
              if (state.notifications.soundEnabled) {
                playBellChime();
              }
            }
          }
        }
      }
    };

    checkSchedule();
    const timer = setInterval(checkSchedule, 5000);
    return () => clearInterval(timer);
  }, [state.routines, state.notifications]);

  // Routine Handlers with immediate LocalStorage and Auth Database persistence
  const handleSaveRoutine = (savedRoutine: RoutineItem) => {
    setState((prev) => {
      const exists = prev.routines.some((r) => r.id === savedRoutine.id);
      const updated = exists
        ? prev.routines.map((r) => (r.id === savedRoutine.id ? savedRoutine : r))
        : [...prev.routines, savedRoutine];
      const nextState = { ...prev, routines: updated };
      saveAppState(nextState);
      syncCurrentAccount(updated, nextState);
      return nextState;
    });
    showToast('Class saved to routine 📅', 'success');
  };

  const handleDeleteRoutine = (routineId: string) => {
    setState((prev) => {
      const updated = prev.routines.filter((r) => r.id !== routineId);
      const nextState = { ...prev, routines: updated };
      saveAppState(nextState);
      syncCurrentAccount(updated, nextState);
      return nextState;
    });
    showToast('Class deleted from routine', 'info');
  };

  const handleUpdateAppState = (updated: Partial<AppState>) => {
    setState((prev) => {
      const nextState = { ...prev, ...updated };
      saveAppState(nextState);
      syncCurrentAccount(nextState.routines, nextState);
      return nextState;
    });
    showToast('Settings saved successfully', 'success');
  };

  const handleResetRoutines = () => {
    setState((prev) => {
      const nextState = { ...prev, routines: [] };
      saveAppState(nextState);
      syncCurrentAccount([], nextState);
      return nextState;
    });
    showToast('All class routines cleared', 'info');
  };

  // Auth Handlers for Phone & Biometric Fingerprint
  const handleLoginSuccess = (account: UserAccount) => {
    setCurrentUser(account);
    if (account.routines && account.routines.length > 0) {
      setState((prev) => {
        const next = {
          ...prev,
          routines: account.routines,
          departmentName: account.department || prev.departmentName,
          semesterName: account.semester || prev.semesterName,
          shift: account.shift || prev.shift,
        };
        saveAppState(next);
        return next;
      });
    }
    showToast(`Logged in as ${account.phoneNumber} 🛡️`, 'success');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast('Logged out of account', 'info');
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-x-hidden transition-colors relative">
      {/* Dynamic Department Themed Ambient Background */}
      <DepartmentBackground departmentName={state.departmentName} />

      {/* Top Header with Hamburger Menu and Search Bar */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Left Sidebar Menu Drawer */}
      <LeftMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
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
        currentUser={currentUser}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode: mode || 'login' })}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-5 py-3 sm:py-4 space-y-4 relative z-10">
        {/* Real-Time Live Status Bar (No "Live" text) */}
        <LiveClassBar routines={state.routines} />

        {/* Clear, Pure Routine Schedule View */}
        <RoutineView
          routines={state.routines}
          selectedDay={selectedDay}
          onChangeDay={setSelectedDay}
          onOpenEditRoutine={(routine) =>
            setRoutineModal({
              isOpen: true,
              editingRoutine: routine,
              defaultDay: routine.day,
              prefilledSubject: null,
            })
          }
          onDeleteRoutine={handleDeleteRoutine}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          onSelectRoutine={(routine) => setDetailsRoutine(routine)}
        />
      </main>

      {/* Routine Add / Edit Modal with Android DeskClock Time Picker */}
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

      {/* Class Full In-Detail Pop-up Window */}
      {detailsRoutine && (
        <ClassDetailsModal
          isOpen={!!detailsRoutine}
          onClose={() => setDetailsRoutine(null)}
          routine={detailsRoutine}
          onEditRoutine={(routine) => {
            setDetailsRoutine(null);
            setRoutineModal({
              isOpen: true,
              editingRoutine: routine,
              defaultDay: routine.day,
              prefilledSubject: null,
            });
          }}
          onDeleteRoutine={(id) => {
            handleDeleteRoutine(id);
            setDetailsRoutine(null);
          }}
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

      {/* Settings Modal */}
      {settingsModalOpen && (
        <ScheduleSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          state={state}
          onUpdateState={handleUpdateAppState}
          onResetRoutines={handleResetRoutines}
          currentUser={currentUser}
          onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode: mode || 'login' })}
          onLogout={handleLogout}
        />
      )}

      {/* Passwordless Biometric Fingerprint Auth Modal */}
      {authModal.isOpen && (
        <BiometricAuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
          initialMode={authModal.mode}
          onLoginSuccess={handleLoginSuccess}
          currentRoutines={state.routines}
          appState={state}
        />
      )}

      {/* Global In-App Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
