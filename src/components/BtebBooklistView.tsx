import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { getAllDepartments, BtebDepartment, BtebSubjectItem } from '../services/btebService';
import { cleanTitle } from '../utils/storage';

interface BtebBooklistViewProps {
  onBackToHome: () => void;
  initialDeptSlug?: string;
  initialSemester?: number;
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SEMESTER_NAMES: Record<number, string> = {
  1: '1st Semester',
  2: '2nd Semester',
  3: '3rd Semester',
  4: '4th Semester',
  5: '5th Semester',
  6: '6th Semester',
  7: '7th Semester',
  8: '8th Semester',
};

export const BtebBooklistView: React.FC<BtebBooklistViewProps> = ({
  onBackToHome,
  initialDeptSlug,
  initialSemester = 1,
}) => {
  // Regulation 2022 departments only
  const allDepartments: BtebDepartment[] = useMemo(() => {
    return getAllDepartments().filter((dept) => dept.regulation === '2022');
  }, []);

  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [bookSearchQuery, setBookSearchQuery] = useState('');

  const [selectedDeptSlug, setSelectedDeptSlug] = useState<string>(() => {
    if (initialDeptSlug && allDepartments.some((d) => d.slug === initialDeptSlug)) {
      return initialDeptSlug;
    }
    const defaultDept =
      allDepartments.find((d) => d.slug.includes('computer-science')) ||
      allDepartments.find((d) => d.slug.includes('electrical')) ||
      allDepartments[0];
    return defaultDept?.slug || '';
  });

  // 'all' or number 1..8
  const [activeSemesterFilter, setActiveSemesterFilter] = useState<'all' | number>(initialSemester);

  // Filter departments by search
  const filteredDepartments = useMemo(() => {
    if (!deptSearchQuery.trim()) return allDepartments;
    const q = deptSearchQuery.toLowerCase();
    return allDepartments.filter(
      (dept) => dept.title.toLowerCase().includes(q) || dept.slug.toLowerCase().includes(q)
    );
  }, [allDepartments, deptSearchQuery]);

  // Current active department
  const currentDept = useMemo(() => {
    return allDepartments.find((d) => d.slug === selectedDeptSlug) || filteredDepartments[0] || allDepartments[0];
  }, [allDepartments, selectedDeptSlug, filteredDepartments]);

  // Total book count across all 8 semesters for current department
  const totalBooksCount = useMemo(() => {
    if (!currentDept || !currentDept.semesters) return 0;
    return SEMESTERS.reduce((total, sem) => {
      const list = currentDept.semesters[String(sem)] || [];
      return total + list.length;
    }, 0);
  }, [currentDept]);

  // Per-semester book count for current department
  const semesterCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    SEMESTERS.forEach((sem) => {
      counts[sem] = currentDept?.semesters?.[String(sem)]?.length || 0;
    });
    return counts;
  }, [currentDept]);

  // Filtered books grouped by semester
  const displayedSemesters = useMemo(() => {
    if (!currentDept || !currentDept.semesters) return [];

    const targetSemesters = activeSemesterFilter === 'all' ? SEMESTERS : [activeSemesterFilter];
    const q = bookSearchQuery.trim().toLowerCase();

    return targetSemesters
      .map((sem) => {
        const rawBooks = currentDept.semesters[String(sem)] || [];
        const filteredBooks = q
          ? rawBooks.filter(
              (b) =>
                b.name.toLowerCase().includes(q) ||
                b.code.toLowerCase().includes(q)
            )
          : rawBooks;

        return {
          semester: sem,
          books: filteredBooks,
          totalInSemester: rawBooks.length,
        };
      })
      .filter((group) => group.books.length > 0 || !q);
  }, [currentDept, activeSemesterFilter, bookSearchQuery]);

  return (
    <div className="w-full space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Navigation & Header */}
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
              <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                BTEB Curriculum Book List
              </h1>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                Diploma in Engineering 8-Semester Syllabus & Credits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold self-start sm:self-auto">
            <GraduationCap className="w-3 h-3" />
            <span>Regulation 2022</span>
          </div>
        </div>

        {/* Department Selection & Search Bar */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Department Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Select Department</span>
              <span className="text-[10px] text-zinc-400 font-mono">{filteredDepartments.length} Departments</span>
            </label>
            <div className="flex gap-2">
              <select
                value={currentDept?.slug || ''}
                onChange={(e) => setSelectedDeptSlug(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.06] dark:backdrop-blur-md text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition shadow-2xs"
              >
                {filteredDepartments.map((dept) => (
                  <option key={dept.slug} value={dept.slug} className="dark:bg-zinc-900 text-zinc-900 dark:text-white">
                    {cleanTitle(dept.title)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Book Search within department */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Search Book or Subject Code
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                placeholder="e.g. 28511, English, Math, Python..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.06] dark:backdrop-blur-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STATS BANNER: 8 Semesters Total & Per-Semester Breakdown */}
      {currentDept && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">
                  Curriculum Overview
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold tracking-tight mt-0.5">
                {cleanTitle(currentDept.title)}
              </h2>
            </div>

            {/* Total Books Highlight Badge */}
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shrink-0 flex items-center gap-2 self-start sm:self-auto">
              <Layers className="w-4 h-4 text-emerald-200" />
              <div>
                <div className="text-[9px] uppercase font-bold text-emerald-100">8 Semesters Total</div>
                <div className="text-xs sm:text-sm font-black leading-none">
                  {totalBooksCount} Books
                </div>
              </div>
            </div>
          </div>

          {/* Per-Semester Breakdown Pills (Clickable to Filter) */}
          <div className="pt-2 border-t border-white/20">
            <div className="text-[10px] font-bold text-emerald-100 mb-1.5 flex items-center justify-between">
              <span>Books per Semester (Click to filter):</span>
              <span className="text-[9px] text-emerald-200 font-normal">Semesters 1 to 8</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
              {/* All Semesters Button */}
              <button
                type="button"
                onClick={() => setActiveSemesterFilter('all')}
                className={`py-1.5 px-1 rounded-xl text-center text-[11px] font-bold transition cursor-pointer shadow-2xs flex flex-col items-center justify-center ${
                  activeSemesterFilter === 'all'
                    ? 'bg-white text-emerald-900 ring-2 ring-white font-black'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <span className="text-[9px]">All</span>
                <span className="text-[11px] font-bold leading-tight">({totalBooksCount})</span>
              </button>

              {/* Semester 1 to 8 Buttons */}
              {SEMESTERS.map((s) => {
                const count = semesterCounts[s] || 0;
                const isSelected = activeSemesterFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveSemesterFilter(s)}
                    className={`py-1.5 px-1 rounded-xl text-center text-[11px] font-bold transition cursor-pointer shadow-2xs flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-white text-emerald-900 ring-2 ring-white font-black'
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    <span className="text-[9px]">Sem {s}</span>
                    <span className="text-[11px] font-bold leading-tight">{count} bks</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Book List Content Area - Pure Book Viewing, No Add to Routine button */}
      <div className="space-y-3">
        {displayedSemesters.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 text-center space-y-1.5">
            <BookOpen className="w-6 h-6 text-zinc-400 mx-auto" />
            <p className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
              No books found
            </p>
            <p className="text-[11px] text-zinc-400">
              Try searching with different keywords or switch semester.
            </p>
          </div>
        ) : (
          displayedSemesters.map((group) => (
            <div
              key={group.semester}
              className="bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-2xl p-3 sm:p-4 border border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.36)] space-y-2.5"
            >
              {/* Semester Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px] flex items-center justify-center">
                    {group.semester}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                    {SEMESTER_NAMES[group.semester] || `Semester ${group.semester}`}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 border border-transparent dark:border-white/10">
                  {group.books.length} {group.books.length === 1 ? 'Book' : 'Books'}
                </span>
              </div>

              {/* Books in this Semester - Clean Compact Book Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {group.books.map((book: BtebSubjectItem, idx: number) => {
                  return (
                    <div
                      key={`${group.semester}-${book.code}-${idx}`}
                      className="p-2.5 sm:p-3 bg-zinc-50/80 dark:bg-white/[0.04] dark:backdrop-blur-xl rounded-xl border border-zinc-200/70 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col justify-between gap-1.5 transition hover:dark:bg-white/[0.08] hover:dark:border-white/20"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                            #{book.code}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Sem {group.semester}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {book.name}
                        </h4>
                      </div>

                      <div className="pt-1.5 border-t border-zinc-200/60 dark:border-white/[0.08] flex items-center justify-between gap-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{book.credit} Credits</span>
                        {book.marks && <span>· {book.marks} Marks</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Minimal Footer Info */}
      <div className="p-3 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Official BTEB Regulation 2022 Curriculum Syllabus</span>
        </div>
      </div>
    </div>
  );
};
