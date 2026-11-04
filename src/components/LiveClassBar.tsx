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
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden transition-all">
        {/* Sleek Top Header Bar */}
        <div className="px-4 py-2.5 bg-zinc-100/70 dark:bg-zinc-800/50 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
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

  // CASE 2: Sunday to Thursday (Academic Day)
  const todayClasses = sortByStartTime(routines.filter((r) => r.day === todayRealName));

  let currentClass: RoutineItem | null = null;
  let currentClassStartMin = 0;
  let currentClassEndMin = 0;

  let nextClass: RoutineItem | null = null;
  let minWaitMinutes = Infinity;
  let allCompleted = todayClasses.length > 0;

  for (const item of todayClasses) {
    const start = parseTimeToMinutes(item.startTime);
    const end = parseTimeToMinutes(item.endTime);

    if (start === null || end === null) continue;

    if (currentMinutes >= start && currentMinutes < end) {
      currentClass = item;
      currentClassStartMin = start;
      currentClassEndMin = end;
      allCompleted = false;
    } else if (start > currentMinutes) {
      allCompleted = false;
      const diff = start - currentMinutes;
      if (diff < minWaitMinutes) {
        minWaitMinutes = diff;
        nextClass = item;
      }
    }
  }

  const classDuration = Math.max(1, currentClassEndMin - currentClassStartMin);
  const classElapsed = Math.max(0, Math.min(classDuration, currentMinutes - currentClassStartMin));
  const progressPercent = Math.min(100, Math.max(0, Math.round((classElapsed / classDuration) * 100)));
  const minutesRemaining = Math.max(0, currentClassEndMin - currentMinutes);

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden transition-all">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-zinc-100/70 dark:bg-zinc-800/50 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
          <span>{todayRealName}</span>
          <span className="text-zinc-400">·</span>
          <span className="text-zinc-500 dark:text-zinc-400">{todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'} today</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Main Dynamic Status */}
      <div className="p-4">
        {currentClass ? (
          /* Class in Session */
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Session
                  </span>
                  {currentClass.code && (
                    <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                      #{currentClass.code}
                    </span>
                  )}
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    · {minutesRemaining}m remaining
                  </span>
                </div>

                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mt-1.5 tracking-tight">
                  {currentClass.subjectName}
                </h3>

                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-mono">{currentClass.startTime} – {currentClass.endTime}</span>
                  {currentClass.room && <span>· {currentClass.room}</span>}
                  {currentClass.teacherName && <span>· {currentClass.teacherName}</span>}
                </div>
              </div>

              {currentClass.teacherPhone && (
                <div className="shrink-0 flex items-center gap-1.5 flex-wrap">
                  <a
                    href={`tel:${currentClass.teacherPhone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-medium text-xs hover:bg-emerald-700 transition shadow-xs"
                    title={`কল করুন: ${currentClass.teacherName || 'Teacher'}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>কল</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(currentClass.teacherPhone!)}
                    className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition flex items-center gap-1 text-xs font-semibold"
                    title="নম্বর কপি করুন"
                  >
                    {copiedPhone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    )}
                    <span>{copiedPhone ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveContact(
                        currentClass.teacherName || 'Teacher',
                        currentClass.teacherPhone!,
                        currentClass.subjectName
                      )
                    }
                    className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition flex items-center gap-1 text-xs font-semibold"
                    title="ফোনে সেভ করুন (Save to Contacts)"
                  >
                    {savedContact ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                    <span>{savedContact ? 'সেভড' : 'সেভ'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Smooth Progress Bar */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mb-1">
                <span>{progressPercent}% completed</span>
                <span>{classElapsed}m / {classDuration}m</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : nextClass ? (
          /* Break / Next Class */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Next class in {minWaitMinutes}m
                </span>
                <span className="text-zinc-400">·</span>
                <span className="text-zinc-500 dark:text-zinc-400 font-mono">Starts at {nextClass.startTime}</span>
              </div>

              <h3 className="text-base font-semibold text-zinc-900 dark:text-white mt-1 tracking-tight">
                {nextClass.subjectName} {nextClass.code ? `· #${nextClass.code}` : ''}
              </h3>

              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                {nextClass.room && <span>{nextClass.room}</span>}
                {nextClass.teacherName && <span>· {nextClass.teacherName}</span>}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-2 rounded-xl text-xs">
              <Coffee className="w-4 h-4 text-amber-500" />
              <div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">Break</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">{minWaitMinutes}m wait</div>
              </div>
            </div>
          </div>
        ) : allCompleted ? (
          /* All Classes Completed */
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                All classes for today completed
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Check tomorrow's schedule in the tabs below.
              </div>
            </div>
          </div>
        ) : (
          /* Overview */
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                {todayRealName}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
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
