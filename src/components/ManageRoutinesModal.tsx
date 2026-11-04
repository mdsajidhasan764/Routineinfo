import React, { useState } from 'react';
import {
  X,
  Trash2,
  CheckSquare,
  Square,
  Search,
  Check,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { RoutineItem, DayOfWeek, DAYS_OF_WEEK } from '../types';

interface ManageRoutinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  routines: RoutineItem[];
  onDeleteRoutines: (ids: string[]) => void;
  onResetAllRoutines: () => void;
}

export const ManageRoutinesModal: React.FC<ManageRoutinesModalProps> = ({
  isOpen,
  onClose,
  routines,
  onDeleteRoutines,
  onResetAllRoutines,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDayFilter, setActiveDayFilter] = useState<string>('all');
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  if (!isOpen) return null;

  const filteredRoutines = routines.filter((item) => {
    const matchesDay =
      activeDayFilter === 'all' || item.day === activeDayFilter;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesDay;

    const matchesSearch =
      item.subjectName.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.room.toLowerCase().includes(q) ||
      item.teacherName.toLowerCase().includes(q) ||
      item.day.toLowerCase().includes(q);

    return matchesDay && matchesSearch;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRoutines.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRoutines.map((r) => r.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    onDeleteRoutines(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 dark:backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-950/80 dark:backdrop-blur-3xl rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/15 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_24px_64px_rgba(0,0,0,0.6)] max-h-[90vh] flex flex-col transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-white/[0.08] bg-zinc-50/80 dark:bg-white/[0.04] dark:backdrop-blur-md flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span>Manage & Bulk Delete Routines</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Select multiple classes to delete at once.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Day Filter, Bulk Delete Action */}
        <div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-white/[0.02] space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search classes to delete..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-white/[0.06] dark:backdrop-blur-md rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40 shadow-2xs"
              />
            </div>

            {/* Selection Status & Delete Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.06] dark:backdrop-blur-md text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-white/[0.1] transition cursor-pointer shrink-0"
              >
                {selectedIds.size > 0 &&
                selectedIds.size === filteredRoutines.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedIds.size > 0
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-400 cursor-not-allowed border border-transparent dark:border-white/5'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.size})</span>
              </button>
            </div>
          </div>

          {/* Day Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveDayFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                activeDayFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-transparent dark:border-white/10'
              }`}
            >
              All Days ({routines.length})
            </button>
            {DAYS_OF_WEEK.map((d) => {
              const count = routines.filter((r) => r.day === d).length;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveDayFilter(d)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                    activeDayFilter === d
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-transparent dark:border-white/10'
                  }`}
                >
                  {d.slice(0, 3)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Routines List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[50vh]">
          {filteredRoutines.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm">
              No classes match your current selection.
            </div>
          ) : (
            filteredRoutines.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 dark:backdrop-blur-md'
                      : 'bg-zinc-50/80 dark:bg-white/[0.04] dark:backdrop-blur-xl border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-zinc-300 dark:hover:bg-white/[0.08] dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(item.id);
                      }}
                      className="text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {item.subjectName}
                        </span>
                        {item.code && (
                          <span className="font-mono text-xs text-zinc-500">
                            #{item.code}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono">
                          {item.day}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-500" />
                          {item.startTime} – {item.endTime}
                        </span>
                        {item.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            {item.room}
                          </span>
                        )}
                        {item.teacherName && (
                          <span className="truncate">· {item.teacherName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoutines([item.id]);
                    }}
                    className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/80 rounded-xl transition cursor-pointer shrink-0"
                    title="Delete this class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Reset All Clear Button */}
        <div className="p-3 sm:p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-2">
          {confirmResetAll ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-rose-600 dark:text-rose-400">
                Are you sure to clear ALL classes?
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetAllRoutines();
                  setConfirmResetAll(false);
                  onClose();
                }}
                className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition cursor-pointer"
              >
                Yes, Clear All
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetAll(false)}
                className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg hover:bg-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmResetAll(true)}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Clear Entire Routine Database
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
