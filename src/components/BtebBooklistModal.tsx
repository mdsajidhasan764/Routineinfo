import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, Plus } from 'lucide-react';
import { getAllDepartments, BtebSubjectItem } from '../services/btebService';
import { cleanTitle } from '../utils/storage';

interface BtebBooklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubjectForRoutine: (subject: { code: string; name: string }) => void;
}

export const BtebBooklistModal: React.FC<BtebBooklistModalProps> = ({
  isOpen,
  onClose,
  onSelectSubjectForRoutine,
}) => {
  // Block Regulation 2016 from frontend - strictly show Regulation 2022
  const allDepartments = useMemo(() => {
    return getAllDepartments().filter((dept) => dept.regulation === '2022');
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptSlug, setSelectedDeptSlug] = useState<string>(() => {
    const defaultDept =
      allDepartments.find((d) => d.slug.includes('computer-science')) ||
      allDepartments.find((d) => d.slug.includes('electrical')) ||
      allDepartments[0];
    return defaultDept?.slug || '';
  });

  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  // Filter departments by search
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return allDepartments;
    const q = searchQuery.toLowerCase();
    return allDepartments.filter((dept) =>
      dept.title.toLowerCase().includes(q) || dept.slug.toLowerCase().includes(q)
    );
  }, [allDepartments, searchQuery]);

  // Current active department
  const currentDept = useMemo(() => {
    return allDepartments.find((d) => d.slug === selectedDeptSlug) || filteredDepartments[0];
  }, [allDepartments, selectedDeptSlug, filteredDepartments]);

  // Current semester books (Regulation 2022 only)
  const semesterBooks: BtebSubjectItem[] = useMemo(() => {
    if (!currentDept || !currentDept.semesters) return [];
    return currentDept.semesters[String(selectedSemester)] || [];
  }, [currentDept, selectedSemester]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">BTEB Book List</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          {/* Department Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search department..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-emerald-500"
            />
          </div>

          {/* Department Select */}
          <select
            value={currentDept?.slug || ''}
            onChange={(e) => setSelectedDeptSlug(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
          >
            {filteredDepartments.map((dept) => (
              <option key={dept.slug} value={dept.slug}>
                {cleanTitle(dept.title)}
              </option>
            ))}
          </select>

          {/* 1st to 8th Semester Pills */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSemester(s)}
                className={`py-1.5 px-1 text-center rounded-lg text-xs font-bold transition ${
                  selectedSemester === s
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Sem {s}
              </button>
            ))}
          </div>
        </div>

        {/* Books List */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-50 space-y-2">
          {semesterBooks.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              No books found for this semester.
            </div>
          ) : (
            semesterBooks.map((book) => (
              <div
                key={book.code}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {book.code}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                      {book.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{book.credit} Credits</span>
                    {book.marks && <span>· {book.marks} Marks</span>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectSubjectForRoutine({ code: book.code, name: book.name });
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shrink-0 flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Routine</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Minimal Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Source: {' '}
            <a
              href="https://btebresultszone.com/booklists"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline font-semibold"
            >
              btebresultszone.com/booklists
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
