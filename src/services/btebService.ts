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
    return 'Departmental · Project';
  }

  if (
    lowerName.includes('drawing') ||
    lowerName.includes('workshop') ||
    lowerName.includes('laboratory') ||
    lowerName.includes('lab')
  ) {
    return 'Project / Practical';
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
    return 'Non-Departmental';
  }

  if (
    lowerName.includes('mathematics') ||
    lowerName.includes('math') ||
    lowerName.includes('physics') ||
    lowerName.includes('chemistry') ||
    lowerName.includes('mechanics') ||
    lowerName.includes('environmental')
  ) {
    return 'Technical · Foundation';
  }

  return 'Departmental · Technical';
}

export function convertBtebToSubjects(items: BtebSubjectItem[]): Subject[] {
  return items.map((item) => {
    const category = determineSubjectCategory(item.code, item.name);
    const starterChapters: Chapter[] = [
      { id: uid('ch'), name: '1. Chapter 1 — Fundamentals & Introduction', done: false, priority: 'high' },
      { id: uid('ch'), name: '2. Chapter 2 — Core Concepts & Theories', done: false, priority: 'high' },
      { id: uid('ch'), name: '3. Chapter 3 — Problem Solving & Examples', done: false, priority: 'medium' },
      { id: uid('ch'), name: '4. Chapter 4 — Practical & Board Questions', done: false, priority: 'medium' },
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
