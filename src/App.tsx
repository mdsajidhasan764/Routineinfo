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
  getNotificationHistory,
  saveNotificationRecord,
  clearNotificationHistory,
} from './utils/notificationService';
import { Header } from './components/Header';
import { LeftMenu } from './components/LeftMenu';
import { LiveClassBar } from './components/LiveClassBar';
import { RoutineView } from './components/RoutineView';
import { RoutineModal } from './components/RoutineModal';
import { BtebBooklistView } from './components/BtebBooklistView';
import { ScheduleSettingsView } from './components/ScheduleSettingsView';
import { ClassDetailsModal } from './components/ClassDetailsModal';
import { NotificationHistoryModal } from './components/NotificationHistoryModal';
import { ManageRoutinesModal } from './components/ManageRoutinesModal';
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

  // Current Active App Screen/View: 'home' | 'bteb' | 'settings'
  const [currentView, setCurrentView] = useState<'home' | 'bteb' | 'settings'>('home');

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

  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState(() => getNotificationHistory());
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
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    applyTheme();
    // In schedule mode, re-evaluate every 15 seconds
    const timer = setInterval(applyTheme, 15000);
    return () => clearInterval(timer);
  }, [state.theme]);

  // When user minimizes app, switches tabs, locks screen, and returns, ALWAYS reset to Home Screen!
  useEffect(() => {
    const resetToHomeScreen = () => {
      setCurrentView('home');
      setIsMenuOpen(false);
      setRoutineModal({
        isOpen: false,
        editingRoutine: null,
        defaultDay: selectedDay,
        prefilledSubject: null,
      });
      setDetailsRoutine(null);
      setManageModalOpen(false);
      setNotificationsModalOpen(false);
      setAuthModal({ isOpen: false, mode: 'login' });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetToHomeScreen();
      }
    };

    const handlePageShow = () => {
      resetToHomeScreen();
    };

    const handleWindowFocus = () => {
      if (document.visibilityState === 'visible') {
        resetToHomeScreen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [selectedDay]);

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
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
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

  // Track fired notifications so we don't spam within the same minute
  const firedAlertsRef = useRef<Set<string>>(new Set());

  // Date tracking for automatic Midnight (12:00 AM) rollover
  const lastDateKeyRef = useRef<string>(
    `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
  );

  // Background ticker for offline class start/end push notifications & bell chimes
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentDateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      // Midnight (12:00 AM) Rollover Check
      if (lastDateKeyRef.current !== currentDateKey) {
        lastDateKeyRef.current = currentDateKey;
        const targetAcademicDay = getCurrentDayName(state.shift, now);
        setSelectedDay(targetAcademicDay);
        firedAlertsRef.current.clear();
      }

      // Live academic day calculation for notifications
      const targetAcademicDay = getCurrentDayName(state.shift, now);
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
              saveNotificationRecord(startMsg, item.teacherName ? `Teacher: ${item.teacherName}` : 'Class started', item.id);
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
              saveNotificationRecord(endMsg, 'Class concluded', item.id);
              localStorage.setItem('bteb_pending_notification_routine', item.id);
              localStorage.setItem('bteb_pending_notification_time', String(Date.now()));
              triggerSystemNotification(endMsg, {
                body: 'Class has concluded. Upcoming class soon!',
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
    const timer = setInterval(checkSchedule, 1000);
    return () => clearInterval(timer);
  }, [state.routines, state.notifications, state.shift]);

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

  const handleBulkDeleteRoutines = (ids: string[]) => {
    setState((prev) => {
      const updated = prev.routines.filter((r) => !ids.includes(r.id));
      const nextState = { ...prev, routines: updated };
      saveAppState(nextState);
      syncCurrentAccount(updated, nextState);
      return nextState;
    });
    showToast(`${ids.length} classes deleted`, 'info');
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

  const todayAcademicDay = getCurrentDayName(state.shift, new Date());

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-x-hidden transition-colors relative">
      {/* Dynamic Department Themed Ambient Background */}
      <DepartmentBackground departmentName={state.departmentName} />

      {/* FIXED / STICKY TOP ZONE: Header + LiveClassBar + 5 Day Tabs
          Pinned at top so routine cards scroll smoothly underneath without hiding the dashboard */}
      <div className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-950/70 backdrop-blur-3xl border-b border-zinc-200/70 dark:border-white/10 shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] transition-all">
        {/* Top Header */}
        <Header
          onOpenMenu={() => setIsMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentView={currentView}
          onNavigateHome={() => setCurrentView('home')}
        />

        {/* When in Home View: Fixed Live Status Bar & Day Selector Tabs */}
        {currentView === 'home' && (
          <div className="max-w-5xl mx-auto px-3 sm:px-5 pt-1 pb-2 space-y-2">
            {/* Live Class Bar */}
            <LiveClassBar routines={state.routines} />

            {/* Day Selector Tabs (Sunday to Thursday) - Stays Fixed at Top */}
            {!searchQuery.trim() && (
              <div className="bg-white/85 dark:bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-1.5 border border-zinc-200/80 dark:border-white/10 shadow-2xs dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.3)] transition-all">
                <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const count = state.routines.filter((r) => r.day === day).length;
                    const isSelected = selectedDay === day;
                    const isToday = todayAcademicDay === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`py-1.5 px-1 rounded-xl transition-all text-center select-none cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs font-bold dark:shadow-[0_2px_12px_rgba(16,185,129,0.35)]'
                            : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 text-xs sm:text-sm">
                          <span>{day.slice(0, 3)}</span>
                          {isToday && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-emerald-500'
                              } animate-pulse`}
                            />
                          )}
                        </div>
                        <div className="text-[10px] mt-0.5 opacity-85 font-mono tracking-tight">
                          {count} cls
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Left Sidebar Menu Drawer */}
      <LeftMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentView={currentView}
        onNavigateHome={() => setCurrentView('home')}
        onOpenAddClass={() =>
          setRoutineModal({
            isOpen: true,
            editingRoutine: null,
            defaultDay: selectedDay,
            prefilledSubject: null,
          })
        }
        onOpenManageRoutines={() => setManageModalOpen(true)}
        onOpenBtebHub={() => setCurrentView('bteb')}
        onOpenSettings={() => setCurrentView('settings')}
        onOpenNotifications={() => {
          setNotificationHistory(getNotificationHistory());
          setNotificationsModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode: mode || 'login' })}
        onLogout={handleLogout}
      />

      {/* Main Content Area (Scrolls Underneath the Fixed Top Zone) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-5 py-3 sm:py-4 space-y-4 relative z-10">
        {currentView === 'home' && (
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
            hideDayTabs={true}
          />
        )}

        {/* Integrated BTEB Book List View (Pure Book Viewing, English-only, in-app view) */}
        {currentView === 'bteb' && (
          <BtebBooklistView
            onBackToHome={() => setCurrentView('home')}
            initialDeptSlug={state.departmentSlug}
            initialSemester={state.semester}
          />
        )}

        {/* Integrated Settings View (In-App View, English-only, NO popup) */}
        {currentView === 'settings' && (
          <ScheduleSettingsView
            onBackToHome={() => setCurrentView('home')}
            state={state}
            onUpdateState={handleUpdateAppState}
            onResetRoutines={handleResetRoutines}
            currentUser={currentUser}
            onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode: mode || 'login' })}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Routine Add / Edit Modal with Unique Custom Pickers (No default HTML selects) */}
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

      {/* Notification History Modal */}
      {notificationsModalOpen && (
        <NotificationHistoryModal
          isOpen={notificationsModalOpen}
          onClose={() => setNotificationsModalOpen(false)}
          notifications={notificationHistory}
          onClearHistory={() => {
            clearNotificationHistory();
            setNotificationHistory([]);
            showToast('Notification history cleared', 'info');
          }}
        />
      )}

      {/* Manage & Bulk Delete Routines Modal */}
      {manageModalOpen && (
        <ManageRoutinesModal
          isOpen={manageModalOpen}
          onClose={() => setManageModalOpen(false)}
          routines={state.routines}
          onDeleteRoutines={handleBulkDeleteRoutines}
          onResetAllRoutines={handleResetRoutines}
        />
      )}

      {/* Global In-App Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
