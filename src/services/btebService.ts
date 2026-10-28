import btebData from '../data/btebCurriculum.json';
import { Subject, SubjectCategory, Chapter } from '../types';
import { uid } from '../utils/storage';

export interface BtebSubjectItem {
  code: string;
  name: string;
  credit: number;
  marks: number;
}

export interface BtebDepartment {
  slug: string;
  title: string;
  regulation: '2022' | '2016';
  semesters: Record<string, BtebSubjectItem[]>;
}

export const btebDepartments: BtebDepartment[] = btebData as BtebDepartment[];

export function getAllDepartments(): BtebDepartment[] {
  return btebDepartments;
}

export function getDepartmentBySlug(slug: string): BtebDepartment | undefined {
  return btebDepartments.find((d) => d.slug === slug);
}

export function determineSubjectCategory(code: string, name: string): SubjectCategory {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes('project') ||
    lowerName.includes('industrial attachment') ||
    lowerName.includes('presentation')
  ) {
    return 'ডিপার্টমেন্টাল • প্রজেক্ট';
  }

  if (
    lowerName.includes('drawing') ||
    lowerName.includes('workshop') ||
    lowerName.includes('laboratory') ||
    lowerName.includes('lab')
  ) {
    return 'প্রজেক্ট / প্র্যাকটিক্যাল';
  }

  if (
    lowerName.includes('bangla') ||
    lowerName.includes('english') ||
    lowerName.includes('social science') ||
    lowerName.includes('accounting') ||
    lowerName.includes('management') ||
    lowerName.includes('marketing') ||
    lowerName.includes('economics') ||
    lowerName.includes('entrepreneurship') ||
    lowerName.includes('physical education') ||
    lowerName.includes('business')
  ) {
    return 'নন-ডিপার্টমেন্টাল • নন-টেকনিক্যাল';
  }

  if (
    lowerName.includes('mathematics') ||
    lowerName.includes('math') ||
    lowerName.includes('physics') ||
    lowerName.includes('chemistry') ||
    lowerName.includes('mechanics') ||
    lowerName.includes('environmental')
  ) {
    return 'টেকনিক্যাল • ভিত্তিমূলক';
  }

  return 'ডিপার্টমেন্টাল • টেকনিক্যাল';
}

export function convertBtebToSubjects(items: BtebSubjectItem[]): Subject[] {
  return items.map((item, idx) => {
    const category = determineSubjectCategory(item.code, item.name);
    // Starter initial syllabus chapters for student guidance
    const starterChapters: Chapter[] = [
      { id: uid('ch'), name: '১. অধ্যায় ১ — ভূমিকা ও মৌলিক ধারণা', done: false, priority: 'high' },
      { id: uid('ch'), name: '২. অধ্যায় ২ — মূল থিওরি ও সমীকরণ', done: false, priority: 'high' },
      { id: uid('ch'), name: '৩. অধ্যায় ৩ — গাণিতিক সমস্যা ও উদাহরণ', done: false, priority: 'medium' },
      { id: uid('ch'), name: '৪. অধ্যায় ৪ — প্র্যাকটিক্যাল ও বোর্ড প্রশ্ন সমাধান', done: false, priority: 'medium' },
    ];

    return {
      id: uid('sub'),
      name: item.name,
      code: item.code,
      credit: item.credit,
      category,
      chapters: starterChapters,
    };
  });
}
