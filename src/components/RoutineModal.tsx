import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, BookOpen, Layers, Users } from 'lucide-react';
import { RoutineItem, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { uid, cleanTitle } from '../utils/storage';
import { getAllDepartments, BtebSubjectItem } from '../services/btebService';
import { ClockTimePickerModal } from './ClockTimePickerModal';

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

export const RoutineModal: React.FC<RoutineModalProps> = ({
  isOpen,
  onClose,
  onSaveRoutine,
  editingRoutine,
  defaultDay = 'Sunday',
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
  const [shift, setShift] = useState<'Morning Shift' | 'Day Shift'>('Morning Shift');
  const [group, setGroup] = useState<'A' | 'B' | 'C'>('A');
  const [code, setCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('09:30 AM');
  const [room, setRoom] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [note, setNote] = useState('');

  // Clock screen time picker state
  const [clockPickerTarget, setClockPickerTarget] = useState<'start' | 'end' | null>(null);

  // Prefill when editing or initializing
  useEffect(() => {
    if (editingRoutine) {
      const isDay = (editingRoutine.shift || '').toLowerCase().includes('day') || (editingRoutine.shift || '').toLowerCase().includes('2nd');
      const normalizedShift: 'Morning Shift' | 'Day Shift' = isDay ? 'Day Shift' : 'Morning Shift';
      setShift(normalizedShift);
      setGroup(editingRoutine.group || 'A');
      setCode(editingRoutine.code || '');
      setSubjectName(editingRoutine.subjectName || '');
      setDay(editingRoutine.day || defaultDay);
      setStartTime(editingRoutine.startTime || (isDay ? '12:30 PM' : '08:00 AM'));
      setEndTime(editingRoutine.endTime || (isDay ? '02:00 PM' : '09:30 AM'));
      setRoom(editingRoutine.room || '');
      setTeacherName(editingRoutine.teacherName || '');
      setTeacherPhone(editingRoutine.teacherPhone || '');
      setNote(editingRoutine.note || '');
    } else {
      setShift('Morning Shift');
      setGroup('A');
      setCode(prefilledSubject?.code || '');
      setSubjectName(prefilledSubject?.name || '');
      setDay(defaultDay);
      setStartTime('08:00 AM');
      setEndTime('09:30 AM');
      setRoom('');
      setTeacherName('');
      setTeacherPhone('');
      setNote('');
    }
  }, [editingRoutine, defaultDay, prefilledSubject, isOpen]);

  // Handle shift switch to keep times within shift range
  const handleShiftChange = (newShift: 'Morning Shift' | 'Day Shift') => {
    setShift(newShift);
    if (newShift === 'Morning Shift') {
      setStartTime('08:00 AM');
      setEndTime('09:30 AM');
    } else {
      setStartTime('12:30 PM');
      setEndTime('02:00 PM');
    }
  };

  // Find curriculum subjects for the selected department & semester
  const availableBooks = useMemo<BtebSubjectItem[]>(() => {
    const dept = allDepartments.find((d) => d.slug === deptSlug);
    if (!dept || !dept.semesters) return [];
    const subjects = dept.semesters[String(semester)] || dept.semesters[`semester_${semester}`];
    return Array.isArray(subjects) ? subjects : [];
  }, [allDepartments, deptSlug, semester]);

  const handleSelectBook = (bookCode: string) => {
    const book = availableBooks.find((b: BtebSubjectItem) => b.code === bookCode);
    if (book) {
      setCode(book.code);
      setSubjectName(cleanTitle(book.name));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      alert('Please enter a subject name');
      return;
    }

    const item: RoutineItem = {
      id: editingRoutine ? editingRoutine.id : uid('class'),
      shift,
      group,
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
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingRoutine ? 'Edit Class Routine' : 'Add Class Routine'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* Auto Fill */}
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Auto Fill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-8">
                  <select
                    value={deptSlug}
                    onChange={(e) => setDeptSlug(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                  >
                    {allDepartments.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {cleanTitle(d.title)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <select
                  onChange={(e) => handleSelectBook(e.target.value)}
                  defaultValue=""
                  className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-emerald-950 dark:text-emerald-300 focus:outline-emerald-500"
                >
                  <option value="" disabled>
                    {availableBooks.length > 0 ? 'Select a book from Auto Fill...' : 'No books in this semester'}
                  </option>
                  {availableBooks.map((b: BtebSubjectItem) => (
                    <option key={b.code} value={b.code}>
                      [{b.code}] {b.name} ({b.credit} Cr)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject Code & Subject Name (Manual Input Disabled) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={code}
                  readOnly
                  placeholder="Auto-filled"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-mono cursor-not-allowed select-none"
                />
              </div>

              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subjectName}
                  readOnly
                  placeholder="Select a book from Auto Fill above"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-medium cursor-not-allowed select-none"
                  required
                />
              </div>
            </div>

            {/* Day of Week */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Day of Week
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
                required
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot with Shift Constraints */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Class Time Slot ({shift === 'Morning Shift' ? 'Morning' : 'DAY'})
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Start Time Field */}
                <div>
                  <div
                    onClick={() => setClockPickerTarget('start')}
                    className="relative cursor-pointer group"
                  >
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 group-hover:scale-110 transition" />
                    <input
                      type="text"
                      readOnly
                      value={startTime}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-mono font-bold cursor-pointer hover:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      Pick Time ⏰
                    </span>
                  </div>
                </div>

                {/* End Time Field */}
                <div>
                  <div
                    onClick={() => setClockPickerTarget('end')}
                    className="relative cursor-pointer group"
                  >
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 group-hover:scale-110 transition" />
                    <input
                      type="text"
                      readOnly
                      value={endTime}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-mono font-bold cursor-pointer hover:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      Pick Time ⏰
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Room / Lab */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Room / Lab Number
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Network Lab / Room 402"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Shift & Group Selection - Directly Above Teacher's Name (Compact & Sleek) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Shift */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Shift</span>
                </label>
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleShiftChange('Morning Shift')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                      shift === 'Morning Shift'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Morning
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShiftChange('Day Shift')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                      shift === 'Day Shift'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Day
                  </button>
                </div>
              </div>

              {/* Select Group */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Select Group</span>
                </label>
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  {(['A', 'B', 'C'] as const).map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setGroup(grp)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                        group === grp
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Group {grp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Teacher Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher's Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="e.g. Sajid Islam"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher's Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Note / Lab Instructions (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Bring practical notebook"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition cursor-pointer"
              >
                {editingRoutine ? 'Update Routine' : 'Save Routine'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Clock Time Picker Modal */}
      {clockPickerTarget && (
        <ClockTimePickerModal
          isOpen={true}
          onClose={() => setClockPickerTarget(null)}
          onSelectTime={(newTime) => {
            if (clockPickerTarget === 'start') {
              setStartTime(newTime);
            } else {
              setEndTime(newTime);
            }
          }}
          initialTime={clockPickerTarget === 'start' ? startTime : endTime}
          title={clockPickerTarget === 'start' ? 'Select Start Time' : 'Select End Time'}
          departmentName={allDepartments.find((d) => d.slug === deptSlug)?.title || 'Computer Science & Technology'}
          shift={shift}
        />
      )}
    </>
  );
};
