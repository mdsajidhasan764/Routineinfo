import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  User,
  Phone,
  Coffee,
  CheckCircle2,
  Calendar,
  Copy,
  Check,
  UserPlus,
} from 'lucide-react';
import { RoutineItem } from '../types';
import { parseTimeToMinutes } from '../utils/notificationService';
import { copyPhoneNumber, saveContactToPhone } from '../utils/contactService';

interface LiveClassBarProps {
  routines: RoutineItem[];
}

const REAL_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const LiveClassBar: React.FC<LiveClassBarProps> = ({ routines }) => {
  const [now, setNow] = useState<Date>(new Date());
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [savedContact, setSavedContact] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyPhone = async (phone: string) => {
    const ok = await copyPhoneNumber(phone);
    if (ok) {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleSaveContact = (name: string, phone: string, subject: string) => {
    const ok = saveContactToPhone(name, phone, subject);
    if (ok) {
      setSavedContact(true);
      setTimeout(() => setSavedContact(false), 2000);
    }
  };

  const realDayIndex = now.getDay(); // 0 = Sun, 1 = Mon ... 5 = Fri, 6 = Sat
  const todayRealName = REAL_DAY_NAMES[realDayIndex];
  const isSchoolDay = realDayIndex >= 0 && realDayIndex <= 4; // Sunday to Thursday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sortByStartTime = (items: RoutineItem[]) => {
    return [...items].sort((a, b) => {
      const startA = parseTimeToMinutes(a.startTime) ?? 0;
      const startB = parseTimeToMinutes(b.startTime) ?? 0;
      return startA - startB;
    });
  };

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // CASE 1: Weekend / Off-day
  if (!isSchoolDay) {
    const sundayClasses = sortByStartTime(routines.filter((r) => r.day === 'Sunday'));
    const firstSundayClass = sundayClasses[0];
    const isSaturday = realDayIndex === 6;
    const upcomingDayLabel = isSaturday ? 'Tomorrow (Sunday)' : 'Sunday';

    return (
      <div className="bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl border border-zinc-200/80 dark:border-white/10 shadow-xs dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden transition-all">
        {/* Sleek Top Header Bar */}
        <div className="px-4 py-2.5 bg-zinc-100/70 dark:bg-white/[0.04] dark:backdrop-blur-md border-b border-zinc-200/60 dark:border-white/[0.08] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
            <span>{todayRealName}</span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-500 dark:text-zinc-400">Weekend</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Upcoming: {upcomingDayLabel}
                </span>
                <span className="text-zinc-400">·</span>
                <span className="text-zinc-500 dark:text-zinc-400">Classes resume Sunday</span>
              </div>

              {firstSundayClass ? (
                <div className="mt-2">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {firstSundayClass.subjectName}
                    {firstSundayClass.code ? ` · #${firstSundayClass.code}` : ''}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    <span>{firstSundayClass.startTime} – {firstSundayClass.endTime}</span>
                    {firstSundayClass.room && <span>· {firstSundayClass.room}</span>}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  No classes scheduled yet for Sunday.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper to determine next academic day name and label
  const getNextAcademicDayInfo = (currentDay: string) => {
    switch (currentDay) {
      case 'Sunday':
        return { name: 'Monday' as const, label: 'Tomorrow (Monday)' };
      case 'Monday':
        return { name: 'Tuesday' as const, label: 'Tomorrow (Tuesday)' };
      case 'Tuesday':
        return { name: 'Wednesday' as const, label: 'Tomorrow (Wednesday)' };
      case 'Wednesday':
        return { name: 'Thursday' as const, label: 'Tomorrow (Thursday)' };
      case 'Thursday':
        return { name: 'Sunday' as const, label: 'Sunday (Next Week)' };
      default:
        return { name: 'Sunday' as const, label: 'Sunday' };
    }
  };

  // CASE 1: Weekend / Off-day (Friday or Saturday)
  if (!isSchoolDay) {
    const sundayClasses = sortByStartTime(routines.filter((r) => r.day === 'Sunday'));
    const firstSundayClass = sundayClasses[0];
    const isSaturday = realDayIndex === 6;
    const upcomingDayLabel = isSaturday ? 'Tomorrow (Sunday)' : 'Sunday';

    return (
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden transition-all">
        {/* Sleek Top Header Bar */}
        <div className="px-4 py-2.5 bg-zinc-100/70 dark:bg-zinc-800/50 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
            <span>{todayRealName}</span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-500 dark:text-zinc-400">Weekend Off</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Upcoming: {upcomingDayLabel}
                </span>
                <span className="text-zinc-400">·</span>
                <span className="text-zinc-500 dark:text-zinc-400">Classes resume Sunday</span>
              </div>

              {firstSundayClass ? (
                <div className="mt-2">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {firstSundayClass.subjectName}
                    {firstSundayClass.code ? ` · #${firstSundayClass.code}` : ''}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    <span>{firstSundayClass.startTime} – {firstSundayClass.endTime}</span>
                    {firstSundayClass.room && <span>· {firstSundayClass.room}</span>}
                    {firstSundayClass.teacherName && <span>· {firstSundayClass.teacherName}</span>}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  No classes scheduled yet for Sunday.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: Sunday to Thursday (Academic Day)
  const todayClasses = sortByStartTime(routines.filter((r) => r.day === todayRealName));

  let currentClass: RoutineItem | null = null;
  let currentClassStartMin = 0;
  let currentClassEndMin = 0;

  let nextClass: RoutineItem | null = null;
  let minWaitMinutes = Infinity;

  for (const item of todayClasses) {
    const start = parseTimeToMinutes(item.startTime);
    const end = parseTimeToMinutes(item.endTime);

    if (start === null || end === null) continue;

    if (currentMinutes >= start && currentMinutes < end) {
      currentClass = item;
      currentClassStartMin = start;
      currentClassEndMin = end;
    } else if (start > currentMinutes) {
      const diff = start - currentMinutes;
      if (diff < minWaitMinutes) {
        minWaitMinutes = diff;
        nextClass = item;
      }
    }
  }

  const allCompleted = todayClasses.length > 0 && !currentClass && !nextClass;

  const nextDayInfo = getNextAcademicDayInfo(todayRealName);
  const nextDayClasses = sortByStartTime(routines.filter((r) => r.day === nextDayInfo.name));
  const firstNextDayClass = nextDayClasses[0];

  const classDuration = Math.max(1, currentClassEndMin - currentClassStartMin);
  const classElapsed = Math.max(0, Math.min(classDuration, currentMinutes - currentClassStartMin));
  const progressPercent = Math.min(100, Math.max(0, Math.round((classElapsed / classDuration) * 100)));
  const minutesRemaining = Math.max(0, currentClassEndMin - currentMinutes);

  return (
    <div className="bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl border border-zinc-200/80 dark:border-white/10 shadow-xs dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden transition-all">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-zinc-100/70 dark:bg-white/[0.04] dark:backdrop-blur-md border-b border-zinc-200/60 dark:border-white/[0.08] flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
          <span className="font-semibold">{todayRealName}</span>
          <span className="text-zinc-400">·</span>
          <span className="text-zinc-500 dark:text-zinc-400">{todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'}</span>
        </div>
      </div>

      {/* Main Dynamic Status */}
      <div className="p-4 sm:p-5">
        {currentClass ? (
          /* Class in Session */
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2.5 min-w-0">
              <div className="min-w-0 shrink">
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                  In Session ({minutesRemaining}m remaining)
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white tracking-tight leading-snug truncate">
                  {currentClass.subjectName}
                  {currentClass.code ? ` · #${currentClass.code}` : ''}
                </h3>
              </div>
              {currentClass.room && (
                <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
                  {currentClass.room}
                </span>
              )}
            </div>
            {/* Smooth Progress Bar & % Display */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                {progressPercent}%
              </span>
            </div>
          </div>
        ) : nextClass ? (
          /* Break / Next Class */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Next class in {minWaitMinutes}m
                </span>
                <span className="text-zinc-400">·</span>
                <span className="text-zinc-500 dark:text-zinc-400 font-mono">Starts at {nextClass.startTime}</span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">
                {nextClass.subjectName} {nextClass.code ? `· #${nextClass.code}` : ''}
              </h3>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {nextClass.room && <span className="font-medium text-emerald-600 dark:text-emerald-400">{nextClass.room}</span>}
                {nextClass.teacherName && <span>· {nextClass.teacherName}</span>}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-zinc-100 dark:bg-white/[0.05] dark:backdrop-blur-md border border-transparent dark:border-white/10 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Clock className="w-4 h-4 text-amber-500" />
              <div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">Upcoming</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{minWaitMinutes}m wait</div>
              </div>
            </div>
          </div>
        ) : allCompleted ? (
          /* All Today's Classes Completed */
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/40">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-zinc-900 dark:text-white">
                  All classes for today completed 🎉
                </div>
                <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  {firstNextDayClass
                    ? `Upcoming: ${nextDayInfo.label} at ${firstNextDayClass.startTime}`
                    : "No classes scheduled for tomorrow."}
                </div>
              </div>
            </div>

            {firstNextDayClass && (
              <div className="ml-12 p-3 bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-white/10 text-xs sm:text-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {firstNextDayClass.subjectName}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 font-mono ml-2">
                  ({firstNextDayClass.startTime} – {firstNextDayClass.endTime})
                </span>
                {firstNextDayClass.room && (
                  <span className="text-emerald-600 dark:text-emerald-400 ml-2 font-medium">
                    · {firstNextDayClass.room}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Overview */
          <div className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-zinc-900 dark:text-white">
                {todayRealName}
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {todayClasses.length > 0
                  ? `${todayClasses.length} classes scheduled for today.`
                  : 'No classes scheduled for today.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
