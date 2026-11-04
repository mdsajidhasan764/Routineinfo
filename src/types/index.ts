export type DayOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
];

export type ShiftType = 'Morning Shift' | 'Day Shift' | '1st Shift' | '2nd Shift';

export interface RoutineItem {
  id: string;
  code: string;
  subjectName: string;
  day: DayOfWeek;
  startTime: string; // e.g. "08:00 AM"
  endTime: string;   // e.g. "09:30 AM"
  room: string;      // e.g. "Room 402" / "Network Lab"
  teacherName: string; // e.g. "Sajid Islam"
  teacherPhone?: string; // e.g. "017XXXXXXXX"
  shift?: ShiftType;
  group?: 'A' | 'B' | 'C';
  color?: string;
  note?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  notifyOnStart: boolean;
  notifyOnEnd: boolean;
  advanceMinutes: number;
}

export type ThemeMode = 'light' | 'dark' | 'glass' | 'schedule';

export interface ThemeSettings {
  mode: ThemeMode;
  scheduleStart: string; // e.g. "19:00"
  scheduleEnd: string;   // e.g. "06:00"
}

export interface AppState {
  routines: RoutineItem[];
  departmentSlug: string;
  semester: number;
  instituteName: string;
  departmentName: string;
  semesterName: string;
  shift: string;
  section: string;
  notifications: NotificationSettings;
  theme: ThemeSettings;
}

// Backward compatibility types for btebService.ts exports
export type SubjectCategory = string;

export interface Chapter {
  id: string;
  name: string;
  done: boolean;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  completedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  category: SubjectCategory;
  code?: string;
  credit?: number;
  chapters: Chapter[];
  color?: string;
}

export interface StudyLog {
  id: string;
  subjectId: string;
  topic: string;
  date: string;
  minutes: number;
  status: 'done' | 'partial' | 'pending';
  notes?: string;
  timestamp?: number;
}

export interface SemesterSettings {
  semesterName: string;
  examDate: string;
  semesterGoal: string;
  dailyGoalMinutes?: number;
  targetGpa?: number;
}
