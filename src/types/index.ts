export type DayOfWeek =
  | 'Saturday'
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export interface RoutineItem {
  id: string;
  code: string;
  subjectName: string;
  day: DayOfWeek;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "10:30 AM"
  room: string;      // e.g. "Room 402"
  teacherName: string; // e.g. "Engr. Monirul Islam"
  teacherPhone?: string; // e.g. "017XXXXXXXX"
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
