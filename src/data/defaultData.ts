import { AppState, DayOfWeek } from '../types';

export const DEFAULT_STORAGE_KEY = 'bteb_routine_manager_v2';
export const LEGACY_STORAGE_KEY = 'semesterProgressTracker_v1';

export const DEFAULT_NOTIFICATIONS = {
  enabled: true,
  soundEnabled: true,
  notifyOnStart: true,
  notifyOnEnd: true,
  advanceMinutes: 0,
};

export const DEFAULT_THEME = {
  mode: 'light' as const,
  scheduleStart: '19:00',
  scheduleEnd: '06:00',
};

export const INITIAL_STATE: AppState = {
  routines: [],
  departmentSlug: 'computer-science-%26-technology-2022',
  semester: 1,
  instituteName: '',
  departmentName: '',
  semesterName: '1st Semester',
  shift: '1st Shift',
  section: 'A',
  notifications: DEFAULT_NOTIFICATIONS,
  theme: DEFAULT_THEME,
};

export const DAY_TRANSLATION_MAP: Record<string, DayOfWeek> = {
  'রবিবার': 'Sunday',
  'রবি': 'Sunday',
  'Sunday': 'Sunday',
  'Sun': 'Sunday',

  'সোমবার': 'Monday',
  'সোম': 'Monday',
  'Monday': 'Monday',
  'Mon': 'Monday',

  'মঙ্গলবার': 'Tuesday',
  'মঙ্গল': 'Tuesday',
  'Tuesday': 'Tuesday',
  'Tue': 'Tuesday',

  'বুধবার': 'Wednesday',
  'বুধ': 'Wednesday',
  'Wednesday': 'Wednesday',
  'Wed': 'Wednesday',

  'বৃহস্পতিবার': 'Thursday',
  'বৃহস্পতি': 'Thursday',
  'Thursday': 'Thursday',
  'Thu': 'Thursday',

  // Fallbacks for weekend
  'শনিবার': 'Sunday',
  'Saturday': 'Sunday',
  'শুক্রবার': 'Sunday',
  'Friday': 'Sunday',
};
