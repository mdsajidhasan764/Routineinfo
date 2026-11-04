import { RoutineItem, DayOfWeek, DAYS_OF_WEEK } from '../types';

/**
 * Parses time strings like "09:00 AM", "9:30 am", "14:15", "2:00 PM" into minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toUpperCase();

  // Try 12-hour format with AM/PM
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3];

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Try 24-hour format "HH:mm"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
}

/**
 * Formats minute of day back to clean "HH:MM AM/PM"
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours12}:${minStr} ${period}`;
}

export function getCurrentDayName(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 Monday ... 5 Friday, 6 Saturday
  const map: Record<number, DayOfWeek> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Sunday', // Weekend (Friday) defaults to next school week
    6: 'Sunday', // Weekend (Saturday) defaults to next school week
  };
  return map[dayIndex] ?? 'Sunday';
}

/**
 * Play offline institute bell chime via Web Audio API.
 * Synthesizes an authentic 2-tone melodic chime without external audio assets.
 */
export function playBellChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // First Tone (High Bell)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5 note
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    // Second Tone (Harmonic Bell)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now + 0.18); // E5 note
    gain2.gain.setValueAtTime(0.35, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 1.6);
  } catch (e) {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

/**
 * Request browser push notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    return Notification.permission;
  }
}

/**
 * Builds class start notification title matching exact user template:
 * "Computer Office Application - Start At 4:15PM - Network Lab."
 */
export function formatStartNotification(item: RoutineItem): string {
  const roomPart = item.room ? ` - ${item.room}` : '';
  return `${item.subjectName} - Start At ${item.startTime}${roomPart}.`;
}

/**
 * Builds class end notification title matching exact user template:
 * "Computer Office Application - Ended At 5:00PM - Network Lab."
 */
export function formatEndNotification(item: RoutineItem): string {
  const roomPart = item.room ? ` - ${item.room}` : '';
  return `${item.subjectName} - Ended At ${item.endTime}${roomPart}.`;
}

/**
 * Evaluates whether dark mode should be enabled based on user preference or schedule
 */
export function isDarkModeActive(theme?: { mode: 'light' | 'dark' | 'schedule'; scheduleStart?: string; scheduleEnd?: string }): boolean {
  if (!theme || theme.mode === 'light') return false;
  if (theme.mode === 'dark') return true;
  if (theme.mode === 'schedule') {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const [startH = 19, startM = 0] = (theme.scheduleStart || '19:00').split(':').map(Number);
    const [endH = 6, endM = 0] = (theme.scheduleEnd || '06:00').split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin <= endMin) {
      return currentMin >= startMin && currentMin < endMin;
    } else {
      // Over midnight: e.g. 19:00 (7 PM) to 06:00 (6 AM)
      return currentMin >= startMin || currentMin < endMin;
    }
  }
  return false;
}

/**
 * Send an offline browser/PWA native push notification with service worker and device vibration
 */
export function triggerSystemNotification(title: string, options?: NotificationOptions): void {
  // Trigger native device vibration if available
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 350]);
    } catch {
      // ignore
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const nativeOptions: NotificationOptions & Record<string, any> = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      silent: false,
      tag: options?.tag || 'bteb-routine-alert',
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 350],
      ...options,
    };

    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((registration) => {
            registration.showNotification(title, nativeOptions);
          })
          .catch(() => {
            new Notification(title, nativeOptions);
          });
      } else {
        new Notification(title, nativeOptions);
      }
    } catch {
      // Fallback
      try {
        new Notification(title, nativeOptions);
      } catch {
        // blocked by browser
      }
    }
  }
}

export interface LiveRoutineStatus {
  currentClass: RoutineItem | null;
  minutesRemainingInClass: number;
  nextClass: RoutineItem | null;
  minutesUntilNextClass: number;
}

/**
 * Evaluates currently running class and next upcoming class for today
 */
export function getLiveRoutineStatus(todayRoutines: RoutineItem[], now: Date = new Date()): LiveRoutineStatus {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentClass: RoutineItem | null = null;
  let minutesRemainingInClass = 0;

  let nextClass: RoutineItem | null = null;
  let minutesUntilNextClass = Infinity;

  for (const item of todayRoutines) {
    const start = parseTimeToMinutes(item.startTime);
    const end = parseTimeToMinutes(item.endTime);

    if (start === null || end === null) continue;

    // Check if in progress
    if (currentMinutes >= start && currentMinutes < end) {
      currentClass = item;
      minutesRemainingInClass = end - currentMinutes;
    }

    // Check if upcoming
    if (start > currentMinutes) {
      const diff = start - currentMinutes;
      if (diff < minutesUntilNextClass) {
        minutesUntilNextClass = diff;
        nextClass = item;
      }
    }
  }

  return {
    currentClass,
    minutesRemainingInClass,
    nextClass,
    minutesUntilNextClass: minutesUntilNextClass === Infinity ? 0 : minutesUntilNextClass,
  };
}
