import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  BookOpen,
  Layers,
  Users,
  Search,
  Check,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { RoutineItem, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { uid, cleanTitle } from '../utils/storage';
import { getAllDepartments, BtebSubjectItem } from '../services/btebService';
import { ClockTimePickerModal } from './ClockTimePickerModal';
import { parseTimeToMinutes, formatMinutesToTime } from '../utils/notificationService';

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

  // Department and Semester selection
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

  // Custom Unique Pickers state (No default HTML selects!)
  const [isDeptPickerOpen, setIsDeptPickerOpen] = useState(false);
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [deptSearchText, setDeptSearchText] = useState('');
  const [bookSearchText, setBookSearchText] = useState('');

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

  // Load saved teacher directory from localStorage
  const savedTeachers = useMemo(() => {
    try {
      const raw = localStorage.getItem('bteb_teacher_directory');
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  }, [isOpen]);

  const handleTeacherNameChange = (name: string) => {
    setTeacherName(name);
    const trimmed = name.trim();
    if (savedTeachers[trimmed]) {
      setTeacherPhone(savedTeachers[trimmed]);
    }
  };

  const applyDuration = (minutesToAdd: number) => {
    const startMins = parseTimeToMinutes(startTime);
    if (startMins !== null) {
      const endMins = startMins + minutesToAdd;
      setEndTime(formatMinutesToTime(endMins));
    }
  };

  const matchingTeachers = useMemo(() => {
    const q = teacherName.trim().toLowerCase();
    if (q.length < 1) return [];
    return Object.entries(savedTeachers).filter(([name]) =>
      name.toLowerCase().includes(q)
    );
  }, [teacherName, savedTeachers]);

  // Clock screen time picker state
  const [clockPickerTarget, setClockPickerTarget] = useState<'start' | 'end' | null>(null);

  // Current selected department object
  const currentDept = useMemo(() => {
    return allDepartments.find((d) => d.slug === deptSlug) || allDepartments[0];
  }, [allDepartments, deptSlug]);

  // Find curriculum subjects for the selected department & semester
  const availableBooks = useMemo<BtebSubjectItem[]>(() => {
    if (!currentDept || !currentDept.semesters) return [];
    const subjects = currentDept.semesters[String(semester)] || currentDept.semesters[`semester_${semester}`];
    return Array.isArray(subjects) ? subjects : [];
  }, [currentDept, semester]);

  // Filtered available books for the custom book picker popup
  const filteredAvailableBooks = useMemo(() => {
    if (!bookSearchText.trim()) return availableBooks;
    const q = bookSearchText.toLowerCase().trim();
    return availableBooks.filter(
      (b) => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)
    );
  }, [availableBooks, bookSearchText]);

  // Filtered departments for custom department picker popup
  const filteredDepartmentsList = useMemo(() => {
    if (!deptSearchText.trim()) return allDepartments;
    const q = deptSearchText.toLowerCase().trim();
    return allDepartments.filter(
      (d) => d.title.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q)
    );
  }, [allDepartments, deptSearchText]);

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

  const handleSelectBook = (book: BtebSubjectItem) => {
    setCode(book.code);
    setSubjectName(cleanTitle(book.name));
    setIsBookPickerOpen(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      alert('Please select a subject from the curriculum');
      return;
    }

    if (teacherName.trim() && teacherPhone.trim()) {
      try {
        const dir = savedTeachers;
        dir[teacherName.trim()] = teacherPhone.trim();
        localStorage.setItem('bteb_teacher_directory', JSON.stringify(dir));
      } catch {
        // ignore
      }
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
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 dark:backdrop-blur-md transition-opacity"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-slate-950/80 dark:backdrop-blur-3xl rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/15 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_24px_64px_rgba(0,0,0,0.6)] max-h-[92vh] flex flex-col transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {editingRoutine ? 'Edit Class Routine' : 'Add Class Routine'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* UNIQUE CUSTOM AUTO-FILL & BOOK LIST PICKER (No default HTML selects!) */}
            <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/30 dark:via-white/[0.04] dark:to-transparent dark:backdrop-blur-xl rounded-2xl border border-emerald-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Curriculum Auto Book Selector</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Regulation 2022
                </span>
              </div>

              {/* Department Picker Trigger (Unique custom popup modal trigger) */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Department
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setDeptSearchText('');
                    setIsDeptPickerOpen(true);
                  }}
                  className="w-full p-2.5 rounded-xl border border-emerald-300/80 dark:border-emerald-800 bg-white dark:bg-zinc-800 text-left flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-500 transition cursor-pointer group"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-zinc-900 dark:text-white text-xs truncate">
                      {cleanTitle(currentDept.title)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                    Change
                  </span>
                </button>
              </div>

              {/* Semester Pills (1 to 8) */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Semester ({semester}th Semester)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSemester(s)}
                      className={`py-1.5 px-1 rounded-xl text-center text-xs font-bold transition cursor-pointer ${
                        semester === s
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60'
                      }`}
                    >
                      Sem {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Book Picker Trigger (Opens Unique Custom Book Picker Popup) */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Select Book from Curriculum
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setBookSearchText('');
                    setIsBookPickerOpen(true);
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-2xs transition cursor-pointer group text-left ${
                    subjectName
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-emerald-300/80 dark:border-emerald-800 bg-white dark:bg-zinc-800 hover:border-emerald-500'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    {subjectName ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {subjectName ? (
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-1.5 py-0.5 rounded mr-1.5">
                          #{code}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white text-xs truncate">
                          {subjectName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                        {availableBooks.length > 0
                          ? `Pick subject (${availableBooks.length} available)...`
                          : 'No books found for this semester'}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <span>{subjectName ? 'Change' : 'Browse'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </button>
              </div>
            </div>

            {/* Shift & Group Selection - Directly Above Class Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Shift */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Shift</span>
                </label>
                <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => handleShiftChange('Morning Shift')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                      shift === 'Morning Shift'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
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
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Day
                  </button>
                </div>
              </div>

              {/* Select Group */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Select Group</span>
                </label>
                <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200 dark:border-zinc-700">
                  {(['A', 'B', 'C'] as const).map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setGroup(grp)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                        group === grp
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Group {grp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slot with Shift Constraints */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Class Time Slot ({shift === 'Morning Shift' ? 'Morning' : 'Day'})
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
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-emerald-500 font-mono font-bold cursor-pointer hover:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      Pick Time ⏰
                    </span>
                  </div>
                </div>

                {/* End Time Field - Clock BLOCKED, driven by presets */}
                <div>
                  <div
                    className="relative cursor-not-allowed group opacity-90"
                    title="End time is automatically set via presets below"
                  >
                    <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      value={endTime}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-300 font-mono font-bold cursor-not-allowed select-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      Preset Only 🔒
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Duration Presets */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap text-[11px]">
                <span className="text-zinc-500 dark:text-zinc-400 font-bold">End Time Preset:</span>
                <button
                  type="button"
                  onClick={() => applyDuration(40)}
                  className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
                >
                  Theory (40m) ⏱️
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(45)}
                  className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition cursor-pointer"
                >
                  Theory (45m) ⏱️
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(120)}
                  className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
                >
                  Lab (2 Hours) 🔬
                </button>
                <button
                  type="button"
                  onClick={() => applyDuration(135)}
                  className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer"
                >
                  Lab (2h 15m) 🔬
                </button>
              </div>
            </div>

            {/* Day of Week - Custom Pills instead of select */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Day of Week
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {DAYS_OF_WEEK.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDay(d)}
                    className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition cursor-pointer ${
                      day === d
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Room / Lab */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Room / Lab Number
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Network Lab / Room 402"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Teacher Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Teacher's Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => handleTeacherNameChange(e.target.value)}
                    placeholder="e.g. Sajid Islam"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-emerald-500"
                  />
                  {matchingTeachers.length > 0 && teacherName.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-44 overflow-y-auto">
                      {matchingTeachers.map(([name, phone]) => (
                        <div
                          key={name}
                          onClick={() => {
                            setTeacherName(name);
                            setTeacherPhone(phone);
                          }}
                          className="px-3 py-2.5 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/60 cursor-pointer flex items-center justify-between text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-700/50 last:border-none"
                        >
                          <span className="font-bold">{name}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Teacher's Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono focus:outline-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Note / Lab Instructions (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Bring practical notebook"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
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

      {/* UNIQUE CUSTOM DEPARTMENT PICKER POPUP (No default HTML select!) */}
      {isDeptPickerOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsDeptPickerOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-950/85 dark:backdrop-blur-3xl rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-white/15 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_24px_64px_rgba(0,0,0,0.6)] max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  Select Department (Regulation 2022)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeptPickerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-zinc-100 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02]">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={deptSearchText}
                  onChange={(e) => setDeptSearchText(e.target.value)}
                  placeholder="Search department name..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.06] dark:backdrop-blur-md text-zinc-900 dark:text-white focus:outline-emerald-500 shadow-2xs"
                />
              </div>
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-1.5 max-h-[60vh]">
              {filteredDepartmentsList.map((dept) => {
                const isSelected = dept.slug === deptSlug;
                return (
                  <button
                    key={dept.slug}
                    type="button"
                    onClick={() => {
                      setDeptSlug(dept.slug);
                      setIsDeptPickerOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 dark:border-emerald-700/60 dark:backdrop-blur-md'
                        : 'border-zinc-200/80 dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-md hover:bg-zinc-50 dark:hover:bg-white/[0.08] dark:hover:border-white/20 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm leading-tight">
                        {cleanTitle(dept.title)}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {dept.slug}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* UNIQUE CUSTOM BOOK PICKER POPUP (No default HTML select!) */}
      {isBookPickerOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsBookPickerOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-950/85 dark:backdrop-blur-3xl rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-white/15 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_24px_64px_rgba(0,0,0,0.6)] max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                    Select Subject from Curriculum
                  </h3>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {cleanTitle(currentDept.title)} · Sem {semester} ({availableBooks.length} books)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookPickerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search within available books */}
            <div className="p-3 border-b border-zinc-100 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02]">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookSearchText}
                  onChange={(e) => setBookSearchText(e.target.value)}
                  placeholder="Search subject code or name..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.06] dark:backdrop-blur-md text-zinc-900 dark:text-white focus:outline-emerald-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Book Cards List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-2 max-h-[60vh]">
              {filteredAvailableBooks.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  No subjects found matching your search.
                </div>
              ) : (
                filteredAvailableBooks.map((book, idx) => {
                  const isSelected = code === book.code;
                  return (
                    <div
                      key={`${book.code}-${idx}`}
                      onClick={() => handleSelectBook(book)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 ring-1 ring-emerald-500/30 dark:border-emerald-700/60 dark:backdrop-blur-md'
                          : 'border-zinc-200/80 dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-md hover:bg-zinc-50 dark:hover:bg-white/[0.08] dark:hover:border-white/20'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800/80">
                            #{book.code}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                          {book.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 font-mono">
                          <span>{book.credit} Credits</span>
                          {book.marks && <span>· {book.marks} Marks</span>}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition">
                            Select
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clock Time Picker Modal */}
      {clockPickerTarget && (
        <ClockTimePickerModal
          isOpen={true}
          onClose={() => setClockPickerTarget(null)}
          onSelectTime={(newTime) => {
            if (clockPickerTarget === 'start') {
              setStartTime(newTime);
              const oldStart = parseTimeToMinutes(startTime);
              const oldEnd = parseTimeToMinutes(endTime);
              const dur = (oldStart !== null && oldEnd !== null && oldEnd > oldStart) ? (oldEnd - oldStart) : 45;
              const newStartM = parseTimeToMinutes(newTime);
              if (newStartM !== null) {
                setEndTime(formatMinutesToTime(newStartM + dur));
              }
            } else {
              setEndTime(newTime);
            }
          }}
          initialTime={clockPickerTarget === 'start' ? startTime : endTime}
          title={clockPickerTarget === 'start' ? 'Select Start Time' : 'Select End Time'}
          departmentName={currentDept.title || 'Computer Science & Technology'}
          shift={shift}
        />
      )}
    </>
  );
};
