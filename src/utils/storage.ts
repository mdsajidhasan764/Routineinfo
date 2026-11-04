import { AppState, RoutineItem, DayOfWeek, DAYS_OF_WEEK } from '../types';
import {
  DEFAULT_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  INITIAL_STATE,
  DAY_TRANSLATION_MAP,
  DEFAULT_NOTIFICATIONS,
} from '../data/defaultData';

export function uid(prefix: string = 'rt'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function cleanTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

export function normalizeDay(rawDay: string | undefined): DayOfWeek {
  if (!rawDay) return 'Sunday';
  const mapped = DAY_TRANSLATION_MAP[rawDay.trim()];
  if (mapped) return mapped;
  const match = DAYS_OF_WEEK.find((d) => d.toLowerCase() === rawDay.toLowerCase());
  return match || 'Sunday';
}

export function sanitizeRoutineItem(r: any, idx: number): RoutineItem {
  let shift: 'Morning Shift' | 'Day Shift' = 'Morning Shift';
  if (r.shift) {
    const s = String(r.shift).toLowerCase();
    if (s.includes('day') || s.includes('2nd')) {
      shift = 'Day Shift';
    } else {
      shift = 'Morning Shift';
    }
  }

  let group: 'A' | 'B' | 'C' = 'A';
  if (r.group === 'B' || r.group === 'C') {
    group = r.group;
  }

  return {
    id: r.id || uid(`r_${idx}`),
    shift,
    group,
    code: (r.code || '').trim(),
    subjectName: cleanTitle((r.subjectName || r.name || 'Untitled Subject').trim()),
    day: normalizeDay(r.day),
    startTime: (r.startTime || (shift === 'Day Shift' ? '12:30 PM' : '08:00 AM')).trim(),
    endTime: (r.endTime || (shift === 'Day Shift' ? '02:00 PM' : '09:30 AM')).trim(),
    room: (r.room || '').trim(),
    teacherName: (r.teacherName || '').trim(),
    teacherPhone: (r.teacherPhone || '').trim(),
    color: r.color || undefined,
    note: r.note || '',
  };
}

export function loadAppState(): AppState {
  try {
    let raw = localStorage.getItem(DEFAULT_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (!raw) return INITIAL_STATE;

    const parsed = JSON.parse(raw);
    if (!parsed) return INITIAL_STATE;

    const rawRoutines = Array.isArray(parsed.routines) ? parsed.routines : [];
    const routines: RoutineItem[] = rawRoutines.map(sanitizeRoutineItem);

    const notifications = {
      enabled: parsed.notifications?.enabled ?? DEFAULT_NOTIFICATIONS.enabled,
      soundEnabled: parsed.notifications?.soundEnabled ?? DEFAULT_NOTIFICATIONS.soundEnabled,
      notifyOnStart: parsed.notifications?.notifyOnStart ?? DEFAULT_NOTIFICATIONS.notifyOnStart,
      notifyOnEnd: parsed.notifications?.notifyOnEnd ?? DEFAULT_NOTIFICATIONS.notifyOnEnd,
      advanceMinutes: typeof parsed.notifications?.advanceMinutes === 'number' ? parsed.notifications.advanceMinutes : 0,
    };

    const rawShift = String(parsed.shift || '').toLowerCase();
    const normalizedShift = rawShift.includes('day') || rawShift.includes('2nd') ? 'Day Shift' : 'Morning Shift';

    return {
      routines,
      departmentSlug: parsed.departmentSlug || INITIAL_STATE.departmentSlug,
      semester: typeof parsed.semester === 'number' && parsed.semester >= 1 && parsed.semester <= 8 ? parsed.semester : 1,
      instituteName: parsed.instituteName || parsed.settings?.semesterName || '',
      departmentName: cleanTitle(parsed.departmentName || INITIAL_STATE.departmentName),
      semesterName: parsed.semesterName || '1st Semester',
      shift: normalizedShift,
      section: parsed.section || 'A',
      notifications,
      theme: {
        mode: parsed.theme?.mode || 'light',
        scheduleStart: parsed.theme?.scheduleStart || '19:00',
        scheduleEnd: parsed.theme?.scheduleEnd || '06:00',
      },
    };
  } catch (err) {
    console.error('Failed to load routine state from localStorage:', err);
    return INITIAL_STATE;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save routine state to localStorage:', err);
  }
}

export function exportRoutineJson(state: AppState): void {
  const payload = {
    ...state,
    exportedAt: new Date().toISOString(),
    app: 'BTEB Routine Manager',
    version: '2.0.0',
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `bteb-class-routine-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseRoutineBackup(file: File): Promise<AppState> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (!parsed || (!Array.isArray(parsed.routines) && !Array.isArray(parsed.subjects))) {
    throw new Error('Invalid backup file. Missing routine schedule.');
  }

  const rawRoutines = Array.isArray(parsed.routines) ? parsed.routines : [];
  const routines: RoutineItem[] = rawRoutines.map(sanitizeRoutineItem);

  return {
    routines,
    departmentSlug: parsed.departmentSlug || INITIAL_STATE.departmentSlug,
    semester: typeof parsed.semester === 'number' ? parsed.semester : 1,
    instituteName: parsed.instituteName || '',
    departmentName: cleanTitle(parsed.departmentName || ''),
    semesterName: parsed.semesterName || '',
    shift: parsed.shift || '1st Shift',
    section: parsed.section || 'A',
    notifications: {
      enabled: parsed.notifications?.enabled ?? DEFAULT_NOTIFICATIONS.enabled,
      soundEnabled: parsed.notifications?.soundEnabled ?? DEFAULT_NOTIFICATIONS.soundEnabled,
      notifyOnStart: parsed.notifications?.notifyOnStart ?? DEFAULT_NOTIFICATIONS.notifyOnStart,
      notifyOnEnd: parsed.notifications?.notifyOnEnd ?? DEFAULT_NOTIFICATIONS.notifyOnEnd,
      advanceMinutes: parsed.notifications?.advanceMinutes ?? 0,
    },
    theme: {
      mode: parsed.theme?.mode || 'light',
      scheduleStart: parsed.theme?.scheduleStart || '19:00',
      scheduleEnd: parsed.theme?.scheduleEnd || '06:00',
    },
  };
}
