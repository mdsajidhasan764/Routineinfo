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
  BookOpen,
  Copy,
  Check,
  UserPlus,
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
}

const BENGALI_DAY_MAP: Record<string, DayOfWeek> = {
  'রবি': 'Sunday',
  'রবিবার': 'Sunday',
  'সোম': 'Monday',
  'সোমবার': 'Monday',
  'মঙ্গল': 'Tuesday',
  'মঙ্গলবার': 'Tuesday',
  'বুধ': 'Wednesday',
  'বুধবার': 'Wednesday',
  'বৃহস্পতি': 'Thursday',
  'বৃহস্পতিবার': 'Thursday',
};

export const RoutineView: React.FC<RoutineViewProps> = ({
  routines,
  selectedDay,
  onChangeDay,
  onOpenEditRoutine,
  onDeleteRoutine,
  searchQuery,
  onClearSearch,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [savedContactId, setSavedContactId] = useState<string | null>(null);

  const handleCopyPhone = async (routineId: string, phone: string) => {
    const ok = await copyPhoneNumber(phone);
    if (ok) {
      setCopiedPhoneId(routineId);
      setTimeout(() => setCopiedPhoneId(null), 1500);
    }
  };

  const handleSaveContact = (routine: RoutineItem) => {
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

  const todayName = getCurrentDayName();
  const isSearching = searchQuery.trim().length > 0;
  const q = searchQuery.toLowerCase().trim();

  // Detect if query specifies a day (English or Bengali)
  let matchedDayFromQuery: DayOfWeek | null = null;
  for (const [bnDay, enDay] of Object.entries(BENGALI_DAY_MAP)) {
    if (q.includes(bnDay)) {
      matchedDayFromQuery = enDay;
      break;
    }
  }

  // Filter routines: If searching, match across all days. If not searching, show selectedDay.
  const filteredRoutines = routines
    .filter((r) => {
      if (!isSearching) {
        return r.day === selectedDay;
      }

      // Substring match
      const matchesSubject = r.subjectName.toLowerCase().includes(q);
      const matchesCode = r.code.toLowerCase().includes(q);
      const matchesRoom = r.room.toLowerCase().includes(q);
      const matchesTeacher = r.teacherName.toLowerCase().includes(q);
      const matchesPhone = r.teacherPhone?.toLowerCase().includes(q) ?? false;
      const matchesNote = r.note?.toLowerCase().includes(q) ?? false;
      const matchesTime = `${r.startTime} ${r.endTime}`.toLowerCase().includes(q);

      // Day match in English or Bengali
      const matchesDayEn = r.day.toLowerCase().includes(q);
      const matchesDayBn = matchedDayFromQuery === r.day;

      return (
        matchesSubject ||
        matchesCode ||
        matchesRoom ||
        matchesTeacher ||
        matchesPhone ||
        matchesNote ||
        matchesTime ||
        matchesDayEn ||
        matchesDayBn
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

  const handleConfirmDelete = (id: string) => {
    onDeleteRoutine(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4">
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
                  className={`py-2 px-1 rounded-xl transition-all text-center select-none ${
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

      {/* Modern Section Header */}
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
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition"
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
          /* Routine Schedule Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredRoutines.map((routine) => {
              const active = isClassActive(routine);
              const isDeleting = confirmDeleteId === routine.id;

              return (
                <div
                  key={routine.id}
                  className={`relative overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between border shadow-xs hover:shadow-md ${
                    active
                      ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Active indicator bar on left */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                  )}

                  <div>
                    {/* Top Row: Day/Code/Room */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {active && (
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            In Session
                          </span>
                        )}

                        {isSearching && (
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {routine.day}
                          </span>
                        )}

                        {routine.code && (
                          <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            #{routine.code}
                          </span>
                        )}
                      </div>

                      {routine.room && (
                        <div className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{routine.room}</span>
                        </div>
                      )}
                    </div>

                    {/* Subject Name */}
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white leading-snug tracking-tight">
                      {routine.subjectName}
                    </h3>

                    {/* Class Time Row */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-mono">
                        {routine.startTime} – {routine.endTime}
                      </span>
                    </div>

                    {/* Teacher & Phone with Copy and Direct Save to Contacts */}
                    {(routine.teacherName || routine.teacherPhone) && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs flex-wrap">
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
                              className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2 py-0.5 rounded-md transition text-xs font-semibold"
                              title="Call Teacher"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{routine.teacherPhone}</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => handleCopyPhone(routine.id, routine.teacherPhone!)}
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
                              onClick={() => handleSaveContact(routine)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition text-[11px] font-medium cursor-pointer"
                              title="Save Teacher Contact with Name directly to Phone"
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

                    {routine.note && (
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        {routine.note}
                      </p>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                      #{routine.id.slice(-4)}
                    </span>

                    {isDeleting ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-2 py-1 rounded-lg">
                        <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">Delete class?</span>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(routine.id)}
                          className="px-2 py-0.5 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 transition"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenEditRoutine(routine)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          title="Edit Class"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(routine.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
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
