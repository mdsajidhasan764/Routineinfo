import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, BookOpen, Plus, Check } from 'lucide-react';
import { RoutineItem, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { uid, cleanTitle } from '../utils/storage';
import { getAllDepartments, BtebDepartment, BtebSubjectItem } from '../services/btebService';

interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoutine: (routine: RoutineItem) => void;
  editingRoutine?: RoutineItem | null;
  defaultDay?: DayOfWeek;
  defaultDeptSlug?: string;
  defaultSemester?: number;
  prefilledSubject?: { code: string; name: string } | null;
}

const COMMON_START_TIMES = ['08:00 AM', '09:00 AM', '10:30 AM', '11:15 AM', '12:00 PM', '01:30 PM', '02:15 PM', '03:00 PM'];
const COMMON_END_TIMES = ['09:00 AM', '09:45 AM', '10:30 AM', '12:00 PM', '01:15 PM', '02:15 PM', '03:00 PM', '04:30 PM'];

export const RoutineModal: React.FC<RoutineModalProps> = ({
  isOpen,
  onClose,
  onSaveRoutine,
  editingRoutine,
  defaultDay = 'Saturday',
  defaultDeptSlug,
  defaultSemester = 1,
  prefilledSubject,
}) => {
  const allDepartments = useMemo(() => {
    return getAllDepartments().filter((dept) => dept.regulation === '2022');
  }, []);

  // Department and Semester selection inside the modal for auto-filling subjects
  const [deptSlug, setDeptSlug] = useState<string>(() => {
    if (defaultDeptSlug && allDepartments.some((d) => d.slug === defaultDeptSlug)) {
      return defaultDeptSlug;
    }
    const defaultDept =
      allDepartments.find((d) => d.slug.includes('computer-science')) ||
      allDepartments.find((d) => d.slug.includes('electrical')) ||
      allDepartments[0];
    return defaultDept?.slug || '';
  });

  const [semester, setSemester] = useState<number>(defaultSemester || 1);

  // Form Fields
  const [code, setCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [room, setRoom] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [note, setNote] = useState('');

  // Active department & subjects for selected department and semester
  const activeDept = useMemo(() => {
    return allDepartments.find((d) => d.slug === deptSlug) || allDepartments[0];
  }, [allDepartments, deptSlug]);

  const availableBooks: BtebSubjectItem[] = useMemo(() => {
    if (!activeDept || !activeDept.semesters) return [];
    return activeDept.semesters[String(semester)] || [];
  }, [activeDept, semester]);

  useEffect(() => {
    if (editingRoutine) {
      setCode(editingRoutine.code || '');
      setSubjectName(editingRoutine.subjectName || '');
      setDay(editingRoutine.day || defaultDay);
      setStartTime(editingRoutine.startTime || '09:00 AM');
      setEndTime(editingRoutine.endTime || '10:30 AM');
      setRoom(editingRoutine.room || '');
      setTeacherName(editingRoutine.teacherName || '');
      setTeacherPhone(editingRoutine.teacherPhone || '');
      setNote(editingRoutine.note || '');
    } else if (prefilledSubject) {
      setCode(prefilledSubject.code || '');
      setSubjectName(prefilledSubject.name || '');
      setDay(defaultDay);
      setStartTime('09:00 AM');
      setEndTime('10:30 AM');
      setRoom('');
      setTeacherName('');
      setTeacherPhone('');
      setNote('');
    } else {
      setCode('');
      setSubjectName('');
      setDay(defaultDay);
      setStartTime('09:00 AM');
      setEndTime('10:30 AM');
      setRoom('');
      setTeacherName('');
      setTeacherPhone('');
      setNote('');
    }
  }, [editingRoutine, prefilledSubject, defaultDay, isOpen]);

  if (!isOpen) return null;

  // Auto-fill from selected book
  const handleSelectBook = (bookCode: string) => {
    const book = availableBooks.find((b) => b.code === bookCode);
    if (book) {
      setCode(book.code);
      setSubjectName(book.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      alert('Please enter or select a subject name');
      return;
    }

    const item: RoutineItem = {
      id: editingRoutine?.id || uid('class'),
      code: code.trim(),
      subjectName: subjectName.trim(),
      day,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      room: room.trim(),
      teacherName: teacherName.trim(),
      teacherPhone: teacherPhone.trim(),
      note: note.trim(),
    };

    onSaveRoutine(item);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {editingRoutine ? 'Edit Class Routine' : 'Add Class Routine'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* BTEB Auto-Fill Subject Picker */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-fill from BTEB Curriculum</span>
              </span>
              <a
                href="https://btebresultszone.com/booklists"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
              >
                Source: btebresultszone.com
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* Department selector */}
              <div className="sm:col-span-8">
                <select
                  value={deptSlug}
                  onChange={(e) => setDeptSlug(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-emerald-500"
                >
                  {allDepartments.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {cleanTitle(d.title)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester selector */}
              <div className="sm:col-span-4">
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-emerald-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Book picker dropdown */}
            <div>
              <select
                onChange={(e) => handleSelectBook(e.target.value)}
                defaultValue=""
                className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-emerald-300 bg-white text-emerald-950 focus:outline-emerald-500"
              >
                <option value="" disabled>
                  {availableBooks.length > 0 ? 'Select a book to auto-fill code & name...' : 'No books in this semester'}
                </option>
                {availableBooks.map((b) => (
                  <option key={b.code} value={b.code}>
                    [{b.code}] {b.name} ({b.credit} Cr)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Code & Subject Name */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="28541"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:outline-emerald-500"
              />
            </div>

            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-emerald-500"
                required
              />
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Day of Week <span className="text-rose-500">*</span>
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              required
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot (Start Time & End Time) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500 font-mono"
                />
              </div>
              <div className="flex gap-1 mt-1 overflow-x-auto pb-1 scrollbar-none">
                {COMMON_START_TIMES.slice(0, 4).map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setStartTime(time)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                End Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="10:30 AM"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500 font-mono"
                />
              </div>
              <div className="flex gap-1 mt-1 overflow-x-auto pb-1 scrollbar-none">
                {COMMON_END_TIMES.slice(1, 5).map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setEndTime(time)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Room / Lab */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Room / Lab Number
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Room 402, Lab 2"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Teacher Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teacher Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. Engr. Anisur Rahman"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teacher Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{editingRoutine ? 'Update Class' : 'Save Class'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
