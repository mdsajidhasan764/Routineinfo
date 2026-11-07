import localOfficers from '../data/jashoreOfficers.json';

export interface TeacherRecord {
  id: string;
  sl: number;
  name: string;
  nameEn: string;
  nameBn: string;
  designation: string;
  designationEn: string;
  designationBn: string;
  department: string;
  departmentEn: string;
  departmentBn: string;
  deptCategory: string;
  phone: string;
  email: string;
  photoUrl: string;
  sourceUrl: string;
  isCustom?: boolean;
  gender?: 'Sir' | "Ma'am";
  departmentDetails?: string;
}

export interface TeachersApiResponse {
  success: boolean;
  source: string;
  sourceDomain: string;
  isLive: boolean;
  total: number;
  data: TeacherRecord[];
}

// Cartoon Male Teacher Avatar (SVG Vector Data URI)
export const MALE_CARTOON_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%2310b981"/><circle cx="60" cy="50" r="32" fill="%231e293b"/><path d="M25 116 C25 88 40 82 60 82 C80 82 95 88 95 116 Z" fill="%230f172a"/><path d="M48 82 L60 102 L72 82 Z" fill="%23ffffff"/><path d="M57 88 L63 88 L65 110 L60 114 L55 110 Z" fill="%23ef4444"/><rect x="52" y="70" width="16" height="14" rx="4" fill="%23fed7aa"/><circle cx="60" cy="52" r="24" fill="%23fed7aa"/><path d="M36 48 C36 30 52 24 72 26 C82 28 85 36 84 44 C76 34 54 36 40 48 Z" fill="%231e293b"/><rect x="42" y="46" width="14" height="10" rx="3" fill="none" stroke="%23334155" stroke-width="2.5"/><rect x="64" y="46" width="14" height="10" rx="3" fill="none" stroke="%23334155" stroke-width="2.5"/><line x1="56" y1="51" x2="64" y2="51" stroke="%23334155" stroke-width="2.5"/><circle cx="49" cy="51" r="2.2" fill="%230f172a"/><circle cx="71" cy="51" r="2.2" fill="%230f172a"/><circle cx="50" cy="50" r="0.7" fill="%23ffffff"/><circle cx="72" cy="50" r="0.7" fill="%23ffffff"/><path d="M54 62 Q60 67 66 62" fill="none" stroke="%239a3412" stroke-width="2.5" stroke-linecap="round"/><circle cx="43" cy="59" r="3.2" fill="%23f43f5e" opacity="0.4"/><circle cx="77" cy="59" r="3.2" fill="%23f43f5e" opacity="0.4"/></svg>`;

// Cartoon Female Teacher Avatar (SVG Vector Data URI)
export const FEMALE_CARTOON_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%23ec4899"/><path d="M30 46 C26 70 32 94 36 102 C40 85 40 65 40 50 Z" fill="%23312e81"/><path d="M90 46 C94 70 88 94 84 102 C80 85 80 65 80 50 Z" fill="%23312e81"/><circle cx="60" cy="48" r="32" fill="%23312e81"/><path d="M25 116 C25 88 40 82 60 82 C80 82 95 88 95 116 Z" fill="%234338ca"/><path d="M46 82 L60 98 L74 82 Z" fill="%23ffffff"/><rect x="53" y="70" width="14" height="14" rx="4" fill="%23fed7aa"/><circle cx="60" cy="52" r="23" fill="%23fed7aa"/><path d="M35 48 C35 30 50 22 68 24 C82 26 86 36 85 48 C78 36 68 35 56 38 C44 41 38 46 35 48 Z" fill="%23312e81"/><circle cx="48" cy="51" r="7.5" fill="none" stroke="%23be123c" stroke-width="2.3"/><circle cx="72" cy="51" r="7.5" fill="none" stroke="%23be123c" stroke-width="2.3"/><line x1="55.5" y1="51" x2="64.5" y2="51" stroke="%23be123c" stroke-width="2.3"/><circle cx="48" cy="51" r="2.2" fill="%230f172a"/><circle cx="72" cy="51" r="2.2" fill="%230f172a"/><circle cx="49" cy="50" r="0.8" fill="%23ffffff"/><circle cx="73" cy="50" r="0.8" fill="%23ffffff"/><path d="M42 45 L45 47 M75 47 L78 45" stroke="%23312e81" stroke-width="1.8" stroke-linecap="round"/><path d="M54 62 Q60 67 66 62" fill="none" stroke="%239f1239" stroke-width="2.4" stroke-linecap="round"/><circle cx="42" cy="59" r="3.5" fill="%23f43f5e" opacity="0.45"/><circle cx="78" cy="59" r="3.5" fill="%23f43f5e" opacity="0.45"/></svg>`;

export const MALE_TEACHER_AVATAR = MALE_CARTOON_AVATAR;
export const FEMALE_TEACHER_AVATAR = FEMALE_CARTOON_AVATAR;

const STORAGE_KEY = 'jpi_live_officers_directory_v5';
const CUSTOM_TEACHERS_KEY = 'bteb_custom_faculty_v1';

const fallbackBySl = new Map<number, TeacherRecord>(
  (localOfficers as TeacherRecord[]).map((o) => [o.sl, o])
);

/**
 * Intelligent gender detector based on Bengali / South-Asian name patterns
 */
export function detectGenderFromName(name: string): 'Sir' | "Ma'am" {
  const n = name.toLowerCase().trim();
  const femaleClues = [
    'mrs', 'miss', 'ms', 'mst', 'mst.', 'mrs.', 'ms.',
    'khatun', 'akter', 'begum', 'fatima', 'shanta', 'nahar', 'jahan', 'khanam',
    'yasmin', 'rumpa', 'dutta', 'tamanna', 'kaniz', 'mahmuda', 'shahida',
    'tabassum', 'roksana', 'rokshana', 'zebun', 'ismat', 'sharmin', 'shirin',
    'nasrin', 'farhana', 'tania', 'nusrat', 'sultana', 'rabeya', 'parvin',
    'rubi', 'mita', 'rita', 'moni', 'shikha', 'priya', 'poly', 'jannat', 'madhu', 'ara'
  ];

  for (const clue of femaleClues) {
    const regex = new RegExp(`\\b${clue}\\b`, 'i');
    if (regex.test(n) || n.startsWith(`${clue} `) || n.startsWith(`${clue}.`)) {
      return "Ma'am";
    }
  }

  return 'Sir';
}

/**
 * Normalizes phone numbers to standard 11-digit Bangladesh mobile numbers (e.g. 017XXXXXXXX)
 * and guarantees zero Bengali characters in English fields.
 */
export function normalizeTeacherRecord(t: TeacherRecord): TeacherRecord {
  if (t.isCustom) return t;

  const localFallback = fallbackBySl.get(t.sl) || (localOfficers as TeacherRecord[])[0];

  let p = (t.phone || '').replace(/[^\d]/g, '');
  if (p.startsWith('8801') && p.length === 13) {
    p = '0' + p.slice(3);
  } else if (p.startsWith('880') && p.length > 11) {
    p = '0' + p.slice(3);
  }

  // If not standard 11-digit mobile starting with 01, use the verified 11-digit mobile number
  if (!p.startsWith('01') || p.length !== 11) {
    p = localFallback?.phone || '01711061390';
  }

  // Ensure English fields have zero Bengali
  const cleanField = (val?: string, fallbackVal?: string) => {
    if (!val || /[\u0980-\u09FF]/.test(val)) {
      return fallbackVal || val || '';
    }
    return val;
  };

  const nameEn = cleanField(t.nameEn, localFallback?.nameEn || t.name);
  const designationEn = cleanField(t.designationEn, localFallback?.designationEn || t.designation);
  const departmentEn = cleanField(t.departmentEn, localFallback?.departmentEn || t.department);

  return {
    ...t,
    name: nameEn,
    nameEn,
    designation: designationEn,
    designationEn,
    department: departmentEn,
    departmentEn,
    deptCategory: localFallback?.deptCategory || t.deptCategory,
    phone: p,
    photoUrl: t.photoUrl || localFallback?.photoUrl || '',
  };
}

/**
 * Retrieve manually created teachers from local storage
 */
export function getCustomTeachers(): TeacherRecord[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEACHERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Save a newly added manual teacher with cartoon avatar
 */
export function addCustomTeacher(data: {
  name: string;
  phone: string;
  email?: string;
  gender: 'Sir' | "Ma'am";
  department: string;
  deptCategory: string;
  designation: string;
  departmentDetails?: string;
}): TeacherRecord {
  const existing = getCustomTeachers();
  const id = `custom_faculty_${Date.now()}`;
  const photoUrl = data.gender === 'Sir' ? MALE_CARTOON_AVATAR : FEMALE_CARTOON_AVATAR;

  // Clean and enforce 11-digit mobile number starting with 01
  let p = data.phone.replace(/[^\d]/g, '');
  if (p.startsWith('8801') && p.length === 13) p = '0' + p.slice(3);
  if (!p.startsWith('01')) p = '01' + p;
  p = p.slice(0, 11);

  const newRecord: TeacherRecord = {
    id,
    sl: 1000 + existing.length + 1,
    name: data.name.trim(),
    nameEn: data.name.trim(),
    nameBn: data.name.trim(),
    designation: data.designation.trim() || (data.gender === 'Sir' ? 'Sir / Instructor' : "Ma'am / Instructor"),
    designationEn: data.designation.trim() || (data.gender === 'Sir' ? 'Sir / Instructor' : "Ma'am / Instructor"),
    designationBn: data.designation.trim() || (data.gender === 'Sir' ? 'Sir / Instructor' : "Ma'am / Instructor"),
    department: data.department.trim(),
    departmentEn: data.department.trim(),
    departmentBn: data.department.trim(),
    deptCategory: data.deptCategory || 'computer',
    phone: p,
    email: (data.email || '').trim(),
    photoUrl,
    sourceUrl: 'Manual Added',
    isCustom: true,
    gender: data.gender,
    departmentDetails: (data.departmentDetails || '').trim(),
  };

  const updated = [newRecord, ...existing];
  try {
    localStorage.setItem(CUSTOM_TEACHERS_KEY, JSON.stringify(updated));
    // Also save in directory for autocomplete in routine builder
    const rawDir = localStorage.getItem('bteb_teacher_directory');
    const dir = rawDir ? JSON.parse(rawDir) : {};
    dir[newRecord.nameEn] = newRecord.phone;
    localStorage.setItem('bteb_teacher_directory', JSON.stringify(dir));
  } catch {
    // quota
  }

  return newRecord;
}

/**
 * Delete a manually created teacher
 */
export function deleteCustomTeacher(id: string): void {
  const existing = getCustomTeachers();
  const filtered = existing.filter((t) => t.id !== id);
  try {
    localStorage.setItem(CUSTOM_TEACHERS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * Get initial teachers combining custom added faculty with authentic dataset
 */
export function getInitialTeachers(): TeacherRecord[] {
  const custom = getCustomTeachers();
  let base: TeacherRecord[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        base = parsed.map(normalizeTeacherRecord);
      }
    }
  } catch {
    // fallback to local officers
  }
  if (base.length === 0) {
    base = (localOfficers as TeacherRecord[]).map(normalizeTeacherRecord);
  }
  return [...custom, ...base];
}

/**
 * Fetch fresh live teachers from backend connected to https://jashore.polytech.gov.bd/pages/officers
 */
export async function fetchLiveTeachers(): Promise<{
  teachers: TeacherRecord[];
  isLive: boolean;
  sourceDomain: string;
}> {
  const custom = getCustomTeachers();
  try {
    const response = await fetch('/api/teachers', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const json: TeachersApiResponse = await response.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      const normalized = json.data.map(normalizeTeacherRecord);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      } catch {
        // storage quota
      }
      return {
        teachers: [...custom, ...normalized],
        isLive: json.isLive,
        sourceDomain: json.sourceDomain || 'jashore.polytech.gov.bd',
      };
    }
  } catch (err) {
    console.warn('[Teacher Service] Live fetch error, using cached records:', err);
  }

  const fallback = getInitialTeachers();
  return {
    teachers: fallback,
    isLive: false,
    sourceDomain: 'jashore.polytech.gov.bd',
  };
}
