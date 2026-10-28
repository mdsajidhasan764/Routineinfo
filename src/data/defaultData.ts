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

export const INITIAL_STATE: AppState = {
  routines: [],
  departmentSlug: 'computer-science-%26-technology-2022',
  semester: 1,
  instituteName: '',
  departmentName: 'Computer Science & Technology',
  semesterName: '1st Semester',
  shift: '1st Shift',
  section: 'A',
  notifications: DEFAULT_NOTIFICATIONS,
};

export const DAY_TRANSLATION_MAP: Record<string, DayOfWeek> = {
  'শনিবার': 'Saturday',
  'রবিবার': 'Sunday',
  'সোমবার': 'Monday',
  'মঙ্গলবার': 'Tuesday',
  'বুধবার': 'Wednesday',
  'বৃহস্পতিবার': 'Thursday',
  'শুক্রবার': 'Friday',
  'Saturday': 'Saturday',
  'Sunday': 'Sunday',
  'Monday': 'Monday',
  'Tuesday': 'Tuesday',
  'Wednesday': 'Wednesday',
  'Thursday': 'Thursday',
  'Friday': 'Friday',
};
