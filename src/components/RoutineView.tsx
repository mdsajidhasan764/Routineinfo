import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  X,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';
import { RoutineItem, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { getCurrentDayName, parseTimeToMinutes } from '../utils/notificationService';
import { copyPhoneNumber, saveContactToPhone } from '../utils/contactService';

interface RoutineViewProps {
  routines: RoutineItem[];
  selectedDay: DayOfWeek;
  onChangeDay: (day: DayOfWeek) => void;
  onOpenEditRoutine: (routine: RoutineItem) => void;
  onDeleteRoutine: (id: string) => void;
  searchQuery: string;
  onClearSearch: () => void;
  onSelectRoutine: (routine: RoutineItem) => void;
  hideDayTabs?: boolean;
}

export const RoutineView: React.FC<RoutineViewProps> = ({
  routines,
  selectedDay,
  onChangeDay,
  onDeleteRoutine,
  searchQuery,
  onClearSearch,
  onSelectRoutine,
  hideDayTabs = false,
}) => {
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const handleCopyPhone = async (e: React.MouseEvent, routineId: string, phone: string) => {
    e.stopPropagation();
    const ok = await copyPhoneNumber(phone);
    if (ok) {
      setCopiedPhoneId(routineId);
      setTimeout(() => setCopiedPhoneId(null), 1500);
    }
  };

  // Real-time current minutes for highlighting active class in schedule
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentMinutes(d.getHours() * 60 + d.getMinutes());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const todayName = getCurrentDayName(undefined, new Date());
  const isSearching = searchQuery.trim().length > 0;
  const q = searchQuery.toLowerCase().trim();

  // Filter routines:
  const filteredRoutines = routines
    .filter((r) => {
      if (!isSearching && r.day !== selectedDay) {
        return false;
      }

      if (!isSearching) return true;

      // Search match
      const matchesSubject = r.subjectName.toLowerCase().includes(q);
      const matchesCode = r.code.toLowerCase().includes(q);
      const matchesRoom = r.room.toLowerCase().includes(q);
      const matchesTeacher = r.teacherName.toLowerCase().includes(q);
      const matchesPhone = r.teacherPhone?.toLowerCase().includes(q) ?? false;
      const matchesNote = r.note?.toLowerCase().includes(q) ?? false;
      const matchesTime = `${r.startTime} ${r.endTime}`.toLowerCase().includes(q);
      const matchesDayEn = r.day.toLowerCase().includes(q);

      return (
        matchesSubject ||
        matchesCode ||
        matchesRoom ||
        matchesTeacher ||
        matchesPhone ||
        matchesNote ||
        matchesTime ||
        matchesDayEn
      );
    })
    .sort((a, b) => {
      if (isSearching && a.day !== b.day) {
        return DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      }
      const startA = parseTimeToMinutes(a.startTime) ?? 0;
      const startB = parseTimeToMinutes(b.startTime) ?? 0;
      return startA - startB;
    });

  const isClassActive = (routine: RoutineItem) => {
    if (routine.day !== todayName) return false;
    const start = parseTimeToMinutes(routine.startTime);
    const end = parseTimeToMinutes(routine.endTime);
    if (start === null || end === null) return false;
    return currentMinutes >= start && currentMinutes < end;
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Day Selector Tabs (if not rendered in fixed top bar) */}
      {!hideDayTabs && !isSearching && (
        <div className="bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl rounded-2xl p-1.5 border border-white/40 dark:border-zinc-800/50 shadow-2xs transition-colors">
          <div className="grid grid-cols-5 gap-1.5">
            {DAYS_OF_WEEK.map((day) => {
              const count = routines.filter((r) => r.day === day).length;
              const isSelected = selectedDay === day;
              const isToday = todayName === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onChangeDay(day)}
                  className={`py-2 px-1 rounded-xl transition-all text-center select-none cursor-pointer ${
                    isSelected
                      ? 'bg-white/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-white shadow-2xs font-bold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-zinc-800/30 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-xs sm:text-sm">
                    <span>{day.slice(0, 3)}</span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[10px] mt-0.5 opacity-75 font-mono tracking-tight">
                    {count} cls
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight">
            {isSearching ? (
              <span>
                Results for <span className="text-emerald-600 dark:text-emerald-400">"{searchQuery}"</span>
              </span>
            ) : (
              <span>{selectedDay} Schedule</span>
            )}
          </h2>
          <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-300 bg-white/50 dark:bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-800/60">
            {filteredRoutines.length} {filteredRoutines.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {isSearching && (
          <button
            type="button"
            onClick={onClearSearch}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Routine Cards Grid */}
      <div>
        {filteredRoutines.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl border border-zinc-200/80 dark:border-white/10 p-8 sm:p-12 text-center text-zinc-400 dark:text-zinc-500 shadow-xs dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.36)] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.05] dark:border dark:border-white/10 flex items-center justify-center mx-auto mb-3 text-zinc-400 dark:text-zinc-400">
              <Calendar className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              {isSearching
                ? `No classes matching "${searchQuery}"`
                : `No classes scheduled for ${selectedDay}`}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {isSearching
                ? 'Try searching by subject name, code, room, teacher or day.'
                : 'Tap the menu on top-left to add a new class routine.'}
            </p>
          </div>
        ) : (
          /* Routine Schedule Cards - Clickable to open full in-details pop-up */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredRoutines.map((routine) => {
              const active = isClassActive(routine);
              const isMorning = !((routine.shift || '').toLowerCase().includes('day') || (routine.shift || '').toLowerCase().includes('2nd'));

              return (
                <div
                  key={routine.id}
                  onClick={() => onSelectRoutine(routine)}
                  className={`group relative overflow-hidden bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl p-3.5 sm:p-4.5 transition-all duration-200 flex flex-col justify-between border shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.99] select-none ${
                    active
                      ? 'border-emerald-500/80 ring-1 ring-emerald-500/30 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_12px_32px_rgba(16,185,129,0.25)]'
                      : 'border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.36)] hover:border-emerald-400/60 dark:hover:border-white/25 dark:hover:bg-slate-900/70'
                  }`}
                  title="Click to view full class details"
                >
                  {/* Active indicator bar on left */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                  )}

                  <div>
                    {/* Top Row: Shift Pill, Group, Room */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {active && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 dark:backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            In Session
                          </span>
                        )}

                        {/* Shift Badge: Morning / Day */}
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                            isMorning
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50 dark:backdrop-blur-md'
                              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50 dark:backdrop-blur-md'
                          }`}
                        >
                          {isMorning ? '☀️ Morning' : '🌅 Day'}
                        </span>

                        {routine.group && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 dark:backdrop-blur-md">
                            Group {routine.group}
                          </span>
                        )}

                        {routine.code && (
                          <span className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-white/[0.05] dark:backdrop-blur-md px-2 py-0.5 rounded-lg border border-emerald-200/50 dark:border-white/10">
                            #{routine.code}
                          </span>
                        )}
                      </div>

                      {routine.room && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-white/[0.06] dark:backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-200/60 dark:border-white/10 shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{routine.room}</span>
                        </div>
                      )}
                    </div>

                    {/* Subject Name */}
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {routine.subjectName}
                    </h3>

                    {/* Class Time Row - Sleek frosted inner card */}
                    <div className="mt-2.5 p-2.5 rounded-2xl bg-zinc-50/80 dark:bg-white/[0.04] dark:backdrop-blur-md border border-zinc-100 dark:border-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex items-center justify-between text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-mono font-semibold">
                          {routine.startTime} – {routine.endTime}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 flex items-center gap-0.5 transition font-medium">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Teacher & Phone with Direct Actions */}
                    {(routine.teacherName || routine.teacherPhone) && (
                      <div
                        className="mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-white/[0.08] flex items-center justify-between gap-2 text-xs sm:text-sm flex-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {routine.teacherName ? (
                          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                            <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{routine.teacherName}</span>
                          </div>
                        ) : (
                          <div />
                        )}

                        {routine.teacherPhone && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <a
                              href={`tel:${routine.teacherPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-white/[0.05] dark:backdrop-blur-md hover:bg-emerald-100 dark:hover:bg-white/[0.1] border border-emerald-200/60 dark:border-white/10 px-2.5 py-1 rounded-xl transition text-xs font-semibold"
                              title="Call Teacher"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{routine.teacherPhone}</span>
                            </a>

                            <button
                              type="button"
                              onClick={(e) => handleCopyPhone(e, routine.id, routine.teacherPhone!)}
                              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
                              title="Copy Number"
                            >
                              {copiedPhoneId === routine.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
