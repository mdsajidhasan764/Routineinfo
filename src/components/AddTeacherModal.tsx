import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Check,
  Sparkles,
  BookOpen,
  PlusCircle,
} from 'lucide-react';
import {
  MALE_CARTOON_AVATAR,
  FEMALE_CARTOON_AVATAR,
  detectGenderFromName,
  addCustomTeacher,
  TeacherRecord,
} from '../services/jashoreTeacherService';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeacherAdded: (newTeacher: TeacherRecord) => void;
  defaultCategory?: string;
}

export const JPI_DEPARTMENTS = [
  { name: 'Computer Science & Technology (CST)', category: 'computer' },
  { name: 'Electrical Technology (ET)', category: 'electrical' },
  { name: 'Mechanical Technology (MT)', category: 'mechanical' },
  { name: 'Civil Technology (CT)', category: 'civil' },
  { name: 'Electronics Technology (ENT)', category: 'electronics' },
  { name: 'Power Technology (PT)', category: 'power' },
  { name: 'Telecommunication Technology (TCT)', category: 'telecom' },
  { name: 'Non-Tech Department (RAC, Math, Science, English)', category: 'nontech' },
  { name: 'Administration & Principal Office', category: 'admin' },
  { name: '+ Custom Department (Manual Input)', category: 'custom' },
];

export const DESIGNATION_PRESETS = [
  'Instructor',
  'Junior Instructor',
  'Chief Instructor & HOD',
  'Workshop Superintendent',
  'Lecturer',
  'Guest Faculty',
];

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  onTeacherAdded,
  defaultCategory = 'computer',
}) => {
  // Title / Gender (Sir vs Ma'am) with Cartoon Avatar
  const [gender, setGender] = useState<'Sir' | "Ma'am">('Sir');
  const [isManualGenderSet, setIsManualGenderSet] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDeptChoice, setSelectedDeptChoice] = useState('Computer Science & Technology (CST)');
  const [customDeptName, setCustomDeptName] = useState('');
  const [deptDetails, setDeptDetails] = useState('');
  const [designation, setDesignation] = useState('Instructor');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-select department based on active category
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setIsManualGenderSet(false);

      if (defaultCategory === 'rac' || defaultCategory === 'nontech') {
        setSelectedDeptChoice('Non-Tech Department (RAC, Math, Science, English)');
      } else {
        const matched = JPI_DEPARTMENTS.find((d) => d.category === defaultCategory);
        if (matched && matched.category !== 'custom') {
          setSelectedDeptChoice(matched.name);
        } else {
          setSelectedDeptChoice('Computer Science & Technology (CST)');
        }
      }
    }
  }, [isOpen, defaultCategory]);

  if (!isOpen) return null;

  // Real-time name change with automatic gender and cartoon avatar detection
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isManualGenderSet && val.trim().length >= 2) {
      const detected = detectGenderFromName(val);
      setGender(detected);
    }
  };

  const currentAvatar = gender === 'Sir' ? MALE_CARTOON_AVATAR : FEMALE_CARTOON_AVATAR;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Name Validation
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Please enter a valid teacher name (at least 2 letters).');
      return;
    }

    // Phone Validation (11 digits starting with 01)
    let cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.startsWith('8801') && cleanPhone.length === 13) {
      cleanPhone = '0' + cleanPhone.slice(3);
    }
    if (!cleanPhone.startsWith('01') || cleanPhone.length !== 11) {
      setErrorMsg('Mobile number must be a valid 11-digit number starting with 01 (e.g. 017XXXXXXXX).');
      return;
    }

    // Department Handling
    let finalDeptName = selectedDeptChoice;
    let deptCategory = 'computer';

    if (selectedDeptChoice === '+ Custom Department (Manual Input)') {
      if (!customDeptName.trim()) {
        setErrorMsg('Please enter your custom department name.');
        return;
      }
      finalDeptName = customDeptName.trim();
      const lower = finalDeptName.toLowerCase();
      if (lower.includes('comp')) deptCategory = 'computer';
      else if (lower.includes('elec') && !lower.includes('tron')) deptCategory = 'electrical';
      else if (lower.includes('mech')) deptCategory = 'mechanical';
      else if (lower.includes('civil')) deptCategory = 'civil';
      else if (lower.includes('tron')) deptCategory = 'electronics';
      else if (lower.includes('pow')) deptCategory = 'power';
      else if (lower.includes('rac') || lower.includes('refrig')) deptCategory = 'rac';
      else if (lower.includes('tel')) deptCategory = 'telecom';
      else if (lower.includes('non')) deptCategory = 'nontech';
      else deptCategory = 'other';
    } else {
      const deptObj = JPI_DEPARTMENTS.find((d) => d.name === selectedDeptChoice);
      deptCategory = deptObj ? deptObj.category : 'computer';
    }

    const newTeacher = addCustomTeacher({
      name: cleanName,
      phone: cleanPhone,
      email: email.trim(),
      gender,
      department: finalDeptName,
      deptCategory,
      designation: designation.trim() || (gender === 'Sir' ? 'Sir / Instructor' : "Ma'am / Instructor"),
      departmentDetails: deptDetails.trim(),
    });

    onTeacherAdded(newTeacher);
    onClose();

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setCustomDeptName('');
    setDeptDetails('');
  };

  const isCustomDept = selectedDeptChoice === '+ Custom Department (Manual Input)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 dark:backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-950/85 dark:backdrop-blur-3xl rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-200/90 dark:border-white/15 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_24px_64px_rgba(0,0,0,0.6)] flex flex-col transition-all max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-zinc-50/90 dark:bg-white/[0.04] dark:backdrop-blur-md border-b border-zinc-100 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-none">
                Add Faculty Member
              </h2>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Auto Avatar & JPI Departments
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold text-xs animate-in shake duration-150">
              {errorMsg}
            </div>
          )}

          {/* Teacher Full Name (Required) - Drives Auto Cartoon Avatar */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span>Teacher Full Name <span className="text-rose-500 font-bold">*</span></span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Auto-detects Boy/Girl Avatar
              </span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Md. Tanvir Ahmed or Mst. Sharmin Akter"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-emerald-500 shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Live Cartoon Avatar & Gender Indicator */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.04] dark:backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Cartoon Avatar ({gender === 'Sir' ? 'Boy / Sir' : 'Girl / Ma’am'})</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
                Cartoon Vector
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Cartoon Avatar */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-emerald-500/60 shrink-0 shadow-xs">
                <img
                  src={currentAvatar}
                  alt={gender}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Sir vs Ma'am Buttons */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGender('Sir');
                    setIsManualGenderSet(true);
                  }}
                  className={`p-2 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                    gender === 'Sir'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500'
                  }`}
                >
                  <span className="text-sm">👨‍🏫</span>
                  <span>Sir (Boy)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGender("Ma'am");
                    setIsManualGenderSet(true);
                  }}
                  className={`p-2 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                    gender === "Ma'am"
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500'
                  }`}
                >
                  <span className="text-sm">👩‍🏫</span>
                  <span>Ma'am (Girl)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Teacher Mobile Number (Required - 11 Digits) */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span>Mobile Number (11 Digits) <span className="text-rose-500 font-bold">*</span></span>
              <span className="text-[10px] font-mono text-zinc-400 font-normal">Must start with 01</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono focus:outline-emerald-500 shadow-2xs font-bold"
              />
            </div>
          </div>

          {/* Email Address (Optional) */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[10px] text-zinc-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@polytech.gov.bd"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-emerald-500 shadow-2xs font-mono"
              />
            </div>
          </div>

          {/* Department Selection (All Jashore Polytechnic Departments + Custom) */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Department (JPI Official & Custom)</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Auto-Selected
              </span>
            </label>
            <select
              value={selectedDeptChoice}
              onChange={(e) => setSelectedDeptChoice(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium focus:outline-emerald-500 shadow-2xs text-xs sm:text-sm cursor-pointer"
            >
              {JPI_DEPARTMENTS.map((d) => (
                <option key={d.category} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Department Name Field (When Custom is selected) */}
          {isCustomDept && (
            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800 space-y-2 animate-in slide-in-from-top-2 duration-150">
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Manual Custom Department Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={customDeptName}
                  onChange={(e) => setCustomDeptName(e.target.value)}
                  placeholder="e.g. Mechatronics / Food Technology"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-emerald-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Assigned Subjects / Department Rules (Optional)</span>
                </label>
                <input
                  type="text"
                  value={deptDetails}
                  onChange={(e) => setDeptDetails(e.target.value)}
                  placeholder="e.g. Subjects: Python, Networking, Microcontroller"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-emerald-500 shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* Designation Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Designation / Role</span>
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Instructor / Workshop Superintendent"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-emerald-500 shadow-2xs"
              />
              <div className="flex items-center gap-1 flex-wrap">
                {DESIGNATION_PRESETS.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDesignation(p)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                      designation === p
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-100 dark:border-white/[0.08] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Teacher</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
