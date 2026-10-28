import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Edit3,
  Trash2,
  BookOpen,
  Search,
  ExternalLink,
} from 'lucide-react';
import { RoutineItem, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { getCurrentDayName } from '../utils/notificationService';

interface RoutineViewProps {
  routines: RoutineItem[];
  selectedDay: DayOfWeek;
  onChangeDay: (day: DayOfWeek) => void;
  onOpenAddRoutine: (day?: DayOfWeek) => void;
  onOpenEditRoutine: (routine: RoutineItem) => void;
  onDeleteRoutine: (id: string) => void;
  onOpenBteb: () => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({
  routines,
  selectedDay,
  onChangeDay,
  onOpenAddRoutine,
  onOpenEditRoutine,
  onDeleteRoutine,
  onOpenBteb,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'all'>('day');

  const todayName = getCurrentDayName();

  const filteredRoutines = routines.filter((r) => {
    const matchesDay = viewMode === 'all' || r.day === selectedDay;
    if (!matchesDay) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.subjectName.toLowerCase().includes(query) ||
      r.code.toLowerCase().includes(query) ||
      r.room.toLowerCase().includes(query) ||
      r.teacherName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Search & Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search class by subject, code, room, or teacher..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'day' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'all' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={() => onOpenAddRoutine(selectedDay)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Day Selector (Saturday to Friday) */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {DAYS_OF_WEEK.map((day) => {
              const count = routines.filter((r) => r.day === day).length;
              const isSelected = selectedDay === day;
              const isToday = todayName === day;

              return (
                <button
                  key={day}
                  onClick={() => onChangeDay(day)}
                  className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl transition text-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <span>{day}</span>
                    {isToday && (
                      <span
                        className={`text-[9px] px-1 rounded-full font-bold uppercase ${
                          isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Today
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {count} {count === 1 ? 'class' : 'classes'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Class List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{viewMode === 'day' ? `${selectedDay} Classes` : 'Full Week Schedule'}</span>
            <span className="text-xs font-normal text-slate-500">
              ({filteredRoutines.length})
            </span>
          </h2>

          {viewMode === 'day' && (
            <button
              onClick={() => onOpenAddRoutine(selectedDay)}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add for {selectedDay}</span>
            </button>
          )}
        </div>

        {filteredRoutines.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">
              {searchQuery ? 'No classes matching your search' : `No classes scheduled for ${selectedDay}`}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a class or choose subjects from BTEB curriculum books.
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => onOpenAddRoutine(selectedDay)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class</span>
              </button>
              <button
                onClick={onOpenBteb}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>BTEB Books</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredRoutines.map((routine) => (
              <div
                key={routine.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {viewMode === 'all' && (
                        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {routine.day}
                        </span>
                      )}
                      {routine.code ? (
                        <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                          {routine.code}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Class</span>
                      )}
                    </div>

                    {routine.room && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{routine.room}</span>
                      </span>
                    )}
                  </div>

                  {/* Subject Name - wrapped cleanly */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug break-words whitespace-normal mt-1">
                    {routine.subjectName}
                  </h3>

                  {/* Time */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {routine.startTime} – {routine.endTime}
                    </span>
                  </div>

                  {/* Teacher & Phone */}
                  {(routine.teacherName || routine.teacherPhone) && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                      {routine.teacherName ? (
                        <div className="flex items-center gap-1 text-slate-700 font-medium break-words">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="break-words">{routine.teacherName}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      {routine.teacherPhone && (
                        <a
                          href={`tel:${routine.teacherPhone}`}
                          className="flex items-center gap-1 font-mono text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg font-bold text-xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{routine.teacherPhone}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {routine.note && (
                    <p className="mt-2 text-xs text-slate-500 italic bg-amber-50/50 p-1.5 rounded border border-amber-100">
                      {routine.note}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[10px] font-mono">
                    ID: {routine.id.slice(-5)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditRoutine(routine)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${routine.subjectName}" from routine?`)) {
                          onDeleteRoutine(routine.id);
                        }
                      }}
                      className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clean minimal source link */}
      <div className="pt-4 text-center text-xs text-slate-400 border-t border-slate-200">
        Source: {' '}
        <a
          href="https://btebresultszone.com/booklists"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 font-semibold hover:underline"
        >
          btebresultszone.com/booklists
        </a>
      </div>
    </div>
  );
};
