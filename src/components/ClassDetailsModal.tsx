import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  Phone,
  Copy,
  Check,
  Calendar,
  Users,
} from 'lucide-react';
import { RoutineItem } from '../types';
import { parseTimeToMinutes, getCurrentDayName } from '../utils/notificationService';
import { copyPhoneNumber } from '../utils/contactService';

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: RoutineItem | null;
  onEditRoutine?: (routine: RoutineItem) => void;
  onDeleteRoutine?: (id: string) => void;
}

export const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  isOpen,
  onClose,
  routine,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen || !routine) return null;

  const handleCopyPhone = async () => {
    if (!routine.teacherPhone) return;
    const ok = await copyPhoneNumber(routine.teacherPhone);
    if (ok) {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // Time & Status Calculations
  const startMin = parseTimeToMinutes(routine.startTime) ?? 0;
  const endMin = parseTimeToMinutes(routine.endTime) ?? 0;
  const durationMin = Math.max(0, endMin - startMin);
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;
  const durationText = `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim() || `${durationMin}m`;

  const now = new Date();
  const todayName = getCurrentDayName(routine.shift, now);
  const isToday = routine.day === todayName;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let liveStatus: 'active' | 'upcoming' | 'completed' | 'other_day' = 'other_day';
  let statusDetail = '';

  if (isToday) {
    if (currentMinutes >= startMin && currentMinutes < endMin) {
      liveStatus = 'active';
      const remaining = endMin - currentMinutes;
      statusDetail = `${remaining}m remaining`;
    } else if (currentMinutes < startMin) {
      liveStatus = 'upcoming';
      const diff = startMin - currentMinutes;
      const hDiff = Math.floor(diff / 60);
      const mDiff = diff % 60;
      statusDetail = `Starts in ${hDiff > 0 ? `${hDiff}h ` : ''}${mDiff}m`;
    } else {
      liveStatus = 'completed';
      statusDetail = 'Completed today';
    }
  }

  const isMorning = !((routine.shift || '').toLowerCase().includes('day') || (routine.shift || '').toLowerCase().includes('2nd'));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 dark:backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-950/80 dark:backdrop-blur-3xl rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-200/90 dark:border-white/15 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_24px_64px_rgba(0,0,0,0.6)] flex flex-col transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. TOP: Shift, Group & Day on very top */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-zinc-50/90 dark:bg-white/[0.04] dark:backdrop-blur-md border-b border-zinc-100 dark:border-white/[0.08] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Shift Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                isMorning
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 dark:backdrop-blur-md'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50 dark:backdrop-blur-md'
              }`}
            >
              <span>{isMorning ? '☀️ Morning' : '🌅 Day'}</span>
            </span>

            {/* Group Badge */}
            {routine.group && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-700/50 dark:backdrop-blur-md">
                <Users className="w-3.5 h-3.5" />
                <span>Group {routine.group}</span>
              </span>
            )}

            {/* Day Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 border border-transparent dark:border-white/10 dark:backdrop-blur-md">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{routine.day}</span>
            </span>
          </div>

          {/* Clean Close X Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* 2. BODY CONTENT */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Live Status Pill (if class is today) */}
          {isToday && (
            <div
              className={`px-3 py-1.5 rounded-xl flex items-center justify-between gap-2 text-xs font-medium border ${
                liveStatus === 'active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 dark:backdrop-blur-md'
                  : liveStatus === 'upcoming'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 dark:backdrop-blur-md'
                  : 'bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 dark:backdrop-blur-md'
              }`}
            >
              <span className="flex items-center gap-1.5 font-bold">
                {liveStatus === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                {liveStatus === 'active' && 'Now in Session'}
                {liveStatus === 'upcoming' && 'Upcoming Today'}
                {liveStatus === 'completed' && 'Class Completed'}
              </span>
              <span className="font-mono text-[11px] opacity-90">{statusDetail}</span>
            </div>
          )}

          {/* Subject Name with Code */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug tracking-tight">
              {routine.subjectName}
              {routine.code && (
                <span className="ml-2 font-mono text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-white/[0.06] border border-transparent dark:border-white/10 px-2 py-0.5 rounded-md inline-block align-middle dark:backdrop-blur-md">
                  #{routine.code}
                </span>
              )}
            </h2>
          </div>

          {/* Room / Lab & Class Timing (Side by Side) - Frosted glass inner slab */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] grid grid-cols-2 gap-3 items-center">
            {/* Room / Lab */}
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Room / Lab</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                {routine.room || 'Not Specified'}
              </div>
            </div>

            {/* Timing */}
            <div className="min-w-0 border-l border-zinc-200 dark:border-white/10 pl-3">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Class Timing</span>
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                {routine.startTime} – {routine.endTime}
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                {durationText}
              </div>
            </div>
          </div>

          {/* Teacher Details with Call & Copy - Frosted glass inner card */}
          {(routine.teacherName || routine.teacherPhone) && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:via-white/[0.04] dark:to-transparent dark:backdrop-blur-xl border border-emerald-500/20 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] space-y-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {(routine.teacherName || 'T').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm truncate">
                    {routine.teacherName || 'Course Teacher'}
                  </div>
                  {routine.teacherPhone && (
                    <div className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300 truncate">
                      {routine.teacherPhone}
                    </div>
                  )}
                </div>
              </div>

              {routine.teacherPhone && (
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <a
                    href={`tel:${routine.teacherPhone}`}
                    className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-98"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="py-2 px-2.5 rounded-xl bg-white dark:bg-white/[0.06] dark:backdrop-blur-md border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-white/[0.1] shadow-2xs transition active:scale-98 cursor-pointer"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notes (if any) */}
          {routine.note && (
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-md border border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                Note
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                {routine.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
