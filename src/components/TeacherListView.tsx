import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Phone,
  Mail,
  Users,
  RefreshCw,
  Copy,
  Check,
  X,
  ChevronRight,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import {
  TeacherRecord,
  getInitialTeachers,
  fetchLiveTeachers,
  deleteCustomTeacher,
  MALE_TEACHER_AVATAR,
  FEMALE_TEACHER_AVATAR,
} from '../services/jashoreTeacherService';
import { copyPhoneNumber } from '../utils/contactService';
import { AddTeacherModal } from './AddTeacherModal';

declare global {
  interface Window {
    AndroidSecurity?: {
      setFlagSecure?: (enabled: boolean) => void;
      isSecureEnabled?: () => boolean;
    };
  }
}

interface TeacherListViewProps {
  onBackToHome: () => void;
}

const CATEGORY_TABS = [
  { key: 'all', label: 'All Teachers' },
  { key: 'computer', label: 'Computer' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'mechanical', label: 'Mechanical' },
  { key: 'civil', label: 'Civil' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'power', label: 'Power' },
  { key: 'rac', label: 'RAC' },
  { key: 'telecom', label: 'Telecom' },
  { key: 'nontech', label: 'Non-Tech' },
  { key: 'admin', label: 'Admin' },
];

export const TeacherListView: React.FC<TeacherListViewProps> = () => {
  const [teachers, setTeachers] = useState<TeacherRecord[]>(() => getInitialTeachers());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRecord | null>(null);
  const [zoomPhotoTeacher, setZoomPhotoTeacher] = useState<TeacherRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Android FLAG_SECURE & Screen Capture Protection states
  const [isPrivacyShieldActive, setIsPrivacyShieldActive] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const securityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Long-press timer ref for photo preview (hold to preview, release to dismiss)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load fresh data from host
  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetchLiveTeachers();
      setTeachers(res.teachers);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // Android FLAG_SECURE & Content Protection Lifecycle
  useEffect(() => {
    // 1. Android Native Bridge: Enable FLAG_SECURE if running in Android app
    if (typeof window !== 'undefined' && window.AndroidSecurity?.setFlagSecure) {
      try {
        window.AndroidSecurity.setFlagSecure(true);
      } catch (err) {
        console.warn('AndroidSecurity bridge call error:', err);
      }
    }

    const triggerProtection = (message: string) => {
      setIsPrivacyShieldActive(true);
      setSecurityNotice(message);

      // Clear system clipboard to prevent copying intercepted screen data
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText('').catch(() => {});
      }

      if (securityTimerRef.current) clearTimeout(securityTimerRef.current);
      securityTimerRef.current = setTimeout(() => {
        setIsPrivacyShieldActive(false);
        setSecurityNotice(null);
      }, 2500);
    };

    // 2. Intercept keyboard screenshot and screen capture shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        triggerProtection('Screenshot blocked by FLAG_SECURE policy');
        return false;
      }

      // Windows/Linux Ctrl+P (Print) or Ctrl+S (Save page)
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 's')) {
        e.preventDefault();
        e.stopPropagation();
        triggerProtection('Printing / Saving blocked by security policy');
        return false;
      }

      // macOS screenshot shortcuts (Command + Shift + 3 / 4 / 5)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerProtection('Screen capture blocked by security policy');
        return false;
      }
    };

    // 3. Android app switching & screenshot capture blackout
    // Android triggers window blur or visibility hidden right when taking screenshot or opening assistant
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPrivacyShieldActive(true);
      } else {
        // Small delay to ensure OS screenshot buffer clears
        setTimeout(() => {
          setIsPrivacyShieldActive(false);
        }, 150);
      }
    };

    const handleWindowBlur = () => {
      setIsPrivacyShieldActive(true);
    };

    const handleWindowFocus = () => {
      setTimeout(() => {
        setIsPrivacyShieldActive(false);
      }, 150);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);

      // Disable FLAG_SECURE on exit
      if (typeof window !== 'undefined' && window.AndroidSecurity?.setFlagSecure) {
        try {
          window.AndroidSecurity.setFlagSecure(false);
        } catch {
          // ignore
        }
      }
      if (securityTimerRef.current) clearTimeout(securityTimerRef.current);
    };
  }, []);

  const handleCopyPhone = async (id: string, phone: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const ok = await copyPhoneNumber(phone);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Hold-to-preview handlers: show on press & hold, dismiss immediately when released
  const handlePhotoPressStart = (teacher: TeacherRecord, e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore
        }
      }
      setZoomPhotoTeacher(teacher);
    }, 240); // 240ms press-and-hold triggers preview
  };

  const handlePhotoPressEnd = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // Release immediately dismisses the photo popup back to normal state
    setZoomPhotoTeacher(null);
  };

  // Filter teachers by search and category
  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return teachers.filter((teacher) => {
      const fullCat = `${teacher.deptCategory} ${teacher.departmentEn} ${teacher.designationEn}`.toLowerCase();

      // Category matching
      if (activeCategory === 'nontech') {
        const isNonTech =
          teacher.deptCategory === 'nontech' ||
          teacher.deptCategory === 'rac' ||
          fullCat.includes('non-tech') ||
          fullCat.includes('nontech') ||
          fullCat.includes('rac') ||
          fullCat.includes('refrigeration') ||
          fullCat.includes('math') ||
          fullCat.includes('physics') ||
          fullCat.includes('chemistry') ||
          fullCat.includes('english') ||
          fullCat.includes('bangla') ||
          fullCat.includes('management') ||
          fullCat.includes('accounting');
        if (!isNonTech) return false;
      } else if (activeCategory === 'rac') {
        const isRac =
          teacher.deptCategory === 'rac' ||
          fullCat.includes('rac') ||
          fullCat.includes('refrigeration') ||
          fullCat.includes('air conditioning');
        if (!isRac) return false;
      } else if (activeCategory === 'admin') {
        const isAdmin =
          teacher.deptCategory === 'admin' ||
          fullCat.includes('admin') ||
          fullCat.includes('principal') ||
          fullCat.includes('office') ||
          fullCat.includes('general');
        if (!isAdmin) return false;
      } else if (activeCategory !== 'all') {
        if (!fullCat.includes(activeCategory)) return false;
      }

      if (!q) return true;

      // Real-time search matching name, department, designation, and 11-digit mobile
      const searchable = `${teacher.nameEn} ${teacher.designationEn} ${teacher.departmentEn} ${teacher.phone} ${teacher.email} ${teacher.deptCategory}`.toLowerCase();
      return searchable.includes(q);
    });
  }, [teachers, searchQuery, activeCategory]);

  return (
    <div
      className="w-full space-y-4 pb-12 animate-in fade-in duration-200 select-none teacher-list-view security-protected-view"
      onContextMenu={(e) => e.preventDefault()} // Disable default browser context menu on long-press
    >
      {/* 0. ANDROID FLAG_SECURE & PRIVACY BLACKOUT SHIELD */}
      {isPrivacyShieldActive && (
        <div className="fixed inset-0 z-999 bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto">
          <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-4 text-red-400">
            <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white mb-2 tracking-tight">
            Protected Screen Content
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mb-4 leading-relaxed">
            {securityNotice || 'Screen capture and recording are blocked by FLAG_SECURE policy on this screen.'}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-mono text-zinc-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android FLAG_SECURE Enforced</span>
          </div>
        </div>
      )}

      {/* Floating security alert notification */}
      {securityNotice && !isPrivacyShieldActive && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-999 bg-rose-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{securityNotice}</span>
        </div>
      )}

      {/* Top Banner, Search & Controls Card - ONLY place with Source citation */}
      <div className="bg-white/90 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.36)] space-y-3.5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
                  Teacher List
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {teachers.length} Active
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  FLAG_SECURE Active
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                Source: jashore.polytech.gov.bd
              </p>
            </div>
          </div>

          {/* Right Tools: Add Manual Teacher & Live Sync */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
              title="Add new teacher manually"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.12] text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-white/10 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
              title="Refresh teachers from host"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teacher name, department (e.g. Computer, Non-Tech, RAC), phone..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.06] dark:backdrop-blur-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shadow-2xs text-xs ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/[0.1] border border-transparent dark:border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        <span>
          Showing <strong className="text-zinc-900 dark:text-white font-bold">{filteredTeachers.length}</strong> teachers
        </span>
        <span className="text-[11px] text-zinc-400 hidden sm:inline">
          Tap card for details · Hold photo to preview
        </span>
      </div>

      {/* MAIN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTeachers.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl p-10 border border-zinc-200/80 dark:border-white/10 text-center space-y-2.5">
            <Users className="w-10 h-10 text-zinc-400 mx-auto opacity-50" />
            <h3 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200">
              No teachers found
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try searching with different keywords or add a teacher manually with the button above.
            </p>
          </div>
        ) : (
          filteredTeachers.map((teacher) => {
            return (
              <div
                key={teacher.id}
                onClick={() => setSelectedTeacher(teacher)}
                className="p-3.5 sm:p-4 bg-white/85 dark:bg-slate-900/55 dark:backdrop-blur-2xl rounded-3xl border border-zinc-200/80 dark:border-white/10 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.36)] flex items-center gap-3.5 transition hover:dark:bg-slate-900/80 hover:border-emerald-500/50 cursor-pointer group active:scale-[0.99] select-none"
                title="Tap card to view details"
              >
                {/* Teacher Photo: Click stays in place, Hold shows preview, Release dismisses */}
                <div
                  className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/80 dark:border-white/15 shadow-2xs group/photo cursor-pointer"
                  onClick={(e) => {
                    // Clicking on photo stays right in place (does not open detail popup)
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => handlePhotoPressStart(teacher, e)}
                  onMouseUp={handlePhotoPressEnd}
                  onMouseLeave={handlePhotoPressEnd}
                  onTouchStart={(e) => handlePhotoPressStart(teacher, e)}
                  onTouchEnd={handlePhotoPressEnd}
                  onTouchCancel={handlePhotoPressEnd}
                  title="Hold to preview photo"
                >
                  <img
                    src={teacher.photoUrl}
                    alt={teacher.nameEn}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover select-none pointer-events-none group-hover/photo:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        teacher.gender === "Ma'am"
                          ? FEMALE_TEACHER_AVATAR
                          : MALE_TEACHER_AVATAR;
                    }}
                  />
                  {teacher.isCustom && (
                    <div className="absolute top-1 right-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded-sm shadow-xs">
                      {teacher.gender === 'Sir' ? 'SIR' : "MA'AM"}
                    </div>
                  )}
                </div>

                {/* Main UI Details: Name, Department, and 11-digit Mobile Number */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {teacher.nameEn}
                    </h3>
                    {teacher.isCustom && (
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded shrink-0">
                        Manual
                      </span>
                    )}
                  </div>

                  {/* Department Badge */}
                  <div>
                    <span className="inline-block text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-white/[0.06] border border-emerald-200/50 dark:border-white/10 px-2 py-0.5 rounded-md truncate max-w-[210px] sm:max-w-xs">
                      {teacher.departmentEn}
                    </span>
                  </div>

                  {/* Standard 11-digit Mobile Number */}
                  <div className="pt-1 flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-bold">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{teacher.phone}</span>
                    </span>

                    <div className="text-[10px] text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center font-sans font-medium transition">
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. TEACHER DETAIL POPUP MODAL (When tapping a teacher card) */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 dark:backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            className="bg-white dark:bg-slate-950/85 dark:backdrop-blur-3xl rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-200/90 dark:border-white/15 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_24px_64px_rgba(0,0,0,0.6)] flex flex-col transition-all animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 bg-zinc-50/90 dark:bg-white/[0.04] dark:backdrop-blur-md border-b border-zinc-100 dark:border-white/[0.08] flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Teacher Details</span>
                {selectedTeacher.isCustom && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded font-bold">
                    Manual Added
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Profile Card Header with Photo */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border-2 border-emerald-500/40 shadow-sm">
                  <img
                    src={selectedTeacher.photoUrl}
                    alt={selectedTeacher.nameEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        selectedTeacher.gender === "Ma'am"
                          ? FEMALE_TEACHER_AVATAR
                          : MALE_TEACHER_AVATAR;
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-tight">
                    {selectedTeacher.nameEn}
                  </h2>
                  <span className="inline-block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                    {selectedTeacher.departmentEn}
                  </span>
                </div>
              </div>

              {/* Designation Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Designation / Role
                </div>
                <div className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  {selectedTeacher.designationEn}
                </div>
              </div>

              {/* Department Details / Rules / Assigned Subjects if present */}
              {selectedTeacher.departmentDetails && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Assigned Subjects & Rules
                  </div>
                  <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                    {selectedTeacher.departmentDetails}
                  </div>
                </div>
              )}

              {/* Contact Actions: Mobile & Email */}
              <div className="space-y-2.5">
                {/* 11-Digit Mobile Phone Card */}
                {selectedTeacher.phone && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Mobile Number
                      </div>
                      <div className="font-mono text-sm font-bold text-zinc-900 dark:text-white mt-0.5 truncate">
                        {selectedTeacher.phone}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${selectedTeacher.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(selectedTeacher.id, selectedTeacher.phone)}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.12] text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-white/10 transition cursor-pointer"
                        title="Copy number"
                      >
                        {copiedId === selectedTeacher.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Card */}
                {selectedTeacher.email && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Email Address
                      </div>
                      <div className="font-mono text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                        {selectedTeacher.email}
                      </div>
                    </div>

                    <a
                      href={`mailto:${selectedTeacher.email}`}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Delete Button for Manually Created Teachers */}
              {selectedTeacher.isCustom && (
                <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      deleteCustomTeacher(selectedTeacher.id);
                      setTeachers((prev) => prev.filter((t) => t.id !== selectedTeacher.id));
                      setSelectedTeacher(null);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Manual Teacher</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. HOLD-TO-PREVIEW PHOTO POPUP (Appears while holding photo, disappears immediately when released) */}
      {zoomPhotoTeacher && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-100"
          onMouseUp={handlePhotoPressEnd}
          onTouchEnd={handlePhotoPressEnd}
          onTouchCancel={handlePhotoPressEnd}
        >
          <div
            className="relative max-w-xs w-full bg-slate-900/95 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col items-center p-4 space-y-3 animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
            onMouseUp={handlePhotoPressEnd}
            onTouchEnd={handlePhotoPressEnd}
          >
            {/* Large Photo Preview */}
            <div className="w-60 h-60 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl bg-black">
              <img
                src={zoomPhotoTeacher.photoUrl}
                alt={zoomPhotoTeacher.nameEn}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    zoomPhotoTeacher.gender === "Ma'am"
                      ? FEMALE_TEACHER_AVATAR
                      : MALE_TEACHER_AVATAR;
                }}
              />
            </div>

            {/* Teacher Info */}
            <div className="text-center space-y-1 w-full px-2">
              <h3 className="text-sm font-bold text-white">
                {zoomPhotoTeacher.nameEn}
              </h3>
              <p className="text-xs text-emerald-400 font-semibold truncate">
                {zoomPhotoTeacher.designationEn}
              </p>
              <p className="text-[11px] text-zinc-300 font-medium truncate">
                {zoomPhotoTeacher.departmentEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD MANUAL TEACHER MODAL */}
      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCategory={activeCategory}
        onTeacherAdded={(newTeacher) => {
          setTeachers((prev) => [newTeacher, ...prev]);
        }}
      />
    </div>
  );
};
