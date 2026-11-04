import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  MapPin,
  User,
  Phone,
  Calendar,
  Layers,
  Users,
  Copy,
  Check,
  UserPlus,
  Edit3,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { RoutineItem } from '../types';
import { parseTimeToMinutes, getCurrentDayName } from '../utils/notificationService';
import { copyPhoneNumber, saveContactToPhone } from '../utils/contactService';

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: RoutineItem | null;
  onEditRoutine: (routine: RoutineItem) => void;
  onDeleteRoutine: (id: string) => void;
}

export const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  isOpen,
  onClose,
  routine,
  onEditRoutine,
  onDeleteRoutine,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Current time for live status
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (!isOpen) {
      setConfirmDelete(false);
      setCopiedPhone(false);
      return;
    }
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

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

  const todayName = getCurrentDayName(routine.shift, now);
  const isToday = routine.day === todayName;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let liveStatus: 'active' | 'upcoming' | 'completed' | 'other_day' = 'other_day';
  let statusDetail = '';

  if (isToday) {
    if (currentMinutes >= startMin && currentMinutes < endMin) {
      liveStatus = 'active';
      const remaining = endMin - currentMinutes;
      statusDetail = `${remaining}m remaining in class`;
    } else if (currentMinutes < startMin) {
      liveStatus = 'upcoming';
      const diff = startMin - currentMinutes;
      const hDiff = Math.floor(diff / 60);
      const mDiff = diff % 60;
      statusDetail = `Starts in ${hDiff > 0 ? `${hDiff}h ` : ''}${mDiff}m`;
    } else {
      liveStatus = 'completed';
      statusDetail = 'Class finished today';
    }
  } else {
    statusDetail = `Scheduled for ${routine.day}`;
  }

  const shiftLabel = (routine.shift || '').toLowerCase().includes('day') || (routine.shift || '').toLowerCase().includes('2nd')
    ? 'Day Shift (12:30 PM - 06:30 PM)'
    : 'Morning Shift (08:00 AM - 01:30 PM)';

  const isMorning = !((routine.shift || '').toLowerCase().includes('day') || (routine.shift || '').toLowerCase().includes('2nd'));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[92vh] flex flex-col transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                isMorning
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
              }`}
            >
              <span>{isMorning ? '☀️ Morning Shift' : '🌅 Day Shift'}</span>
            </span>

            {routine.group && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                <Users className="w-3.5 h-3.5" />
                <span>Group {routine.group}</span>
              </span>
            )}

            {routine.code && (
              <span className="font-mono text-xs font-semibold px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                #{routine.code}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Live Status Badge */}
          <div
            className={`p-3 rounded-2xl flex items-center justify-between gap-2 border transition ${
              liveStatus === 'active'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : liveStatus === 'upcoming'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              {liveStatus === 'active' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />}
              {liveStatus === 'upcoming' && <Clock className="w-4 h-4 text-amber-500" />}
              {liveStatus === 'completed' && <Check className="w-4 h-4 text-zinc-500" />}
              {liveStatus === 'other_day' && <Calendar className="w-4 h-4 text-blue-500" />}
              <span>
                {liveStatus === 'active' && 'Class in Session'}
                {liveStatus === 'upcoming' && 'Upcoming Class'}
                {liveStatus === 'completed' && 'Completed Today'}
                {liveStatus === 'other_day' && `${routine.day} Routine`}
              </span>
            </div>
            <span className="text-xs font-medium opacity-90">{statusDetail}</span>
          </div>

          {/* Subject Full Name */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight">
              {routine.subjectName}
            </h2>
          </div>

          {/* Core Info Grid: Time, Room, Shift */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Time Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold mb-1">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Class Timing</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                {routine.startTime} – {routine.endTime}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Duration: {durationText}
              </div>
            </div>

            {/* Room / Lab Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-semibold mb-1">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Room / Lab</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                {routine.room || 'Not Specified'}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {routine.day}
              </div>
            </div>
          </div>

           {/* Teacher Contact Section */}
          {(routine.teacherName || routine.teacherPhone) && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-zinc-900 dark:to-transparent border border-emerald-500/20 dark:border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {(routine.teacherName || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white text-sm">
                      {routine.teacherName || 'Course Teacher'}
                    </div>
                    {routine.teacherPhone && (
                      <div className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {routine.teacherPhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Native Action Buttons */}
              {routine.teacherPhone && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* 1. Direct Call */}
                  <a
                    href={`tel:${routine.teacherPhone}`}
                    className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-98"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  {/* 2. Copy Phone Number */}
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="py-2.5 px-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 shadow-2xs transition active:scale-98 cursor-pointer"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notes Card (if present) */}
          {routine.note && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Notes & Instructions
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {routine.note}
              </p>
            </div>
          )}

          {/* Delete Confirmation Box */}
          {confirmDelete && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                Delete "{routine.subjectName}" from routine?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteRoutine(routine.id);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 font-semibold rounded-xl text-xs hover:bg-zinc-50 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditRoutine(routine);
              }}
              className="py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Edit Routine</span>
            </button>

            {!confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs shadow-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
