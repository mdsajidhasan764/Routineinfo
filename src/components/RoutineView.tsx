import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Edit3,
  Trash2,
  X,
  Copy,
  Check,
  UserPlus,
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
}

export const RoutineView: React.FC<RoutineViewProps> = ({
  routines,
  selectedDay,
  onChangeDay,
  onOpenEditRoutine,
  onDeleteRoutine,
  searchQuery,
  onClearSearch,
  onSelectRoutine,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [savedContactId, setSavedContactId] = useState<string | null>(null);

  const handleCopyPhone = async (e: React.MouseEvent, routineId: string, phone: string) => {
    e.stopPropagation();
    const ok = await copyPhoneNumber(phone);
    if (ok) {
      setCopiedPhoneId(routineId);
      setTimeout(() => setCopiedPhoneId(null), 1500);
    }
  };

  const handleSaveContact = (e: React.MouseEvent, routine: RoutineItem) => {
    e.stopPropagation();
    if (!routine.teacherPhone) return;
    saveContactToPhone(routine.teacherName || 'Teacher', routine.teacherPhone, routine.subjectName);
    setSavedContactId(routine.id);
    setTimeout(() => setSavedContactId(null), 1500);
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
      // Day filter
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

  const handleConfirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteRoutine(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Modern Day Selector Tabs (Sunday to Thursday) */}
      {!isSearching && (
        <div className="bg-zinc-200/50 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-1.5 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs transition-colors">
          <div className="grid grid-cols-5 gap-1">
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
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-zinc-800/40 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-xs sm:text-sm">
                    <span>{day.slice(0, 3)}</span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[10px] mt-0.5 opacity-70">
                    {count} {count === 1 ? 'class' : 'classes'}
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
          <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white tracking-tight">
            {isSearching ? (
              <span>
                Search results for <span className="text-emerald-600 dark:text-emerald-400">"{searchQuery}"</span>
              </span>
            ) : (
              <span>{selectedDay} Schedule</span>
            )}
          </h2>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            {filteredRoutines.length}
          </span>
        </div>

        {isSearching && (
          <button
            type="button"
            onClick={onClearSearch}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear search</span>
          </button>
        )}
      </div>

      {/* Routine Cards Grid */}
      <div>
        {filteredRoutines.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 sm:p-12 text-center text-zinc-400 dark:text-zinc-500 shadow-xs transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center mx-auto mb-3 text-zinc-400 dark:text-zinc-500">
              <Calendar className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {isSearching
                ? `No classes matching "${searchQuery}"`
                : `No classes scheduled for ${selectedDay}`}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
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
              const isDeleting = confirmDeleteId === routine.id;
              const isMorning = !((routine.shift || '').toLowerCase().includes('day') || (routine.shift || '').toLowerCase().includes('2nd'));

              return (
                <div
                  key={routine.id}
                  onClick={() => onSelectRoutine(routine)}
                  className={`group relative overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between border shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99] select-none ${
                    active
                      ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-400/60 dark:hover:border-emerald-500/50'
                  }`}
                  title="Click to view full class details"
                >
                  {/* Active indicator bar on left */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                  )}

                  <div>
                    {/* Top Row: Shift Pill, Group, Room */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {active && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            In Session
                          </span>
                        )}

                        {/* Shift Badge: Morning / Day */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isMorning
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {isMorning ? '☀️ Morning' : '🌅 Day'}
                        </span>

                        {routine.group && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            Group {routine.group}
                          </span>
                        )}

                        {routine.code && (
                          <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            #{routine.code}
                          </span>
                        )}
                      </div>

                      {routine.room && (
                        <div className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-md shrink-0">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{routine.room}</span>
                        </div>
                      )}
                    </div>

                    {/* Subject Name */}
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-snug tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {routine.subjectName}
                    </h3>

                    {/* Class Time Row */}
                    <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-mono">
                          {routine.startTime} – {routine.endTime}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 flex items-center gap-0.5 transition">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Teacher & Phone with Direct Actions */}
                    {(routine.teacherName || routine.teacherPhone) && (
                      <div
                        className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs flex-wrap"
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
                          <div className="flex items-center gap-1 flex-wrap">
                            <a
                              href={`tel:${routine.teacherPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2 py-0.5 rounded-md transition text-xs font-semibold"
                              title="Call Teacher"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{routine.teacherPhone}</span>
                            </a>

                            <button
                              type="button"
                              onClick={(e) => handleCopyPhone(e, routine.id, routine.teacherPhone!)}
                              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Copy Number"
                            >
                              {copiedPhoneId === routine.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleSaveContact(e, routine)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition text-[11px] font-medium cursor-pointer"
                              title="Directly opens phone Contacts app to save without downloading file"
                            >
                              {savedContactId === routine.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-600 dark:text-emerald-400">Saved!</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3 text-blue-500" />
                                  <span>Save Contact</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Row (Edit, Delete) */}
                  <div
                    className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                      #{routine.id.slice(-4)}
                    </span>

                    {isDeleting ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-2 py-1 rounded-lg">
                        <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">Delete class?</span>
                        <button
                          type="button"
                          onClick={(e) => handleConfirmDelete(e, routine.id)}
                          className="px-2 py-0.5 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 transition cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEditRoutine(routine);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          title="Edit Class"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(routine.id);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
