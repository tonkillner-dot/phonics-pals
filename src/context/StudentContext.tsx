// src/context/StudentContext.tsx
// สถานะกลางของแอป (ช่วงออกแบบ: เก็บในเครื่องด้วย localStorage ก่อน — จะเชื่อม Firebase ภายหลัง)
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AssessmentRecord, StudentDocument } from '../types/schema';
import { MOCK_STUDENTS } from '../data/mockStudents';
import { LESSONS } from '../data/curriculumData';

const STORAGE_KEY = 'phonics_pals_students_v1';
const ACTIVE_KEY = 'phonics_pals_active_student';

interface Ctx {
  students: StudentDocument[];
  student: StudentDocument | null;
  login: (studentId: string) => void;
  logout: () => void;
  update: (patch: Partial<StudentDocument> | ((s: StudentDocument) => Partial<StudentDocument>)) => void;
  updateById: (studentId: string, patch: Partial<StudentDocument>) => void;
  addStudent: (doc: StudentDocument) => void;
  removeStudent: (studentId: string) => void;
  addStars: (n: number) => void;
  completeLesson: (lessonId: string, earnedWordIds: string[]) => void;
  saveAssessment: (mode: 'preTest' | 'postTest', record: AssessmentRecord) => void;
  resetDemo: () => void;
}

const StudentContext = createContext<Ctx | null>(null);

const load = (): StudentDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StudentDocument[];
  } catch { /* ignore */ }
  return MOCK_STUDENTS;
};

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<StudentDocument[]>(load);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_KEY));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    else localStorage.removeItem(ACTIVE_KEY);
  }, [activeId]);

  const student = useMemo(() => students.find((s) => s.studentId === activeId) ?? null, [students, activeId]);

  const updateById = useCallback((studentId: string, patch: Partial<StudentDocument>) => {
    setStudents((list) => list.map((s) => (s.studentId === studentId ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s)));
  }, []);

  const addStudent = useCallback((doc: StudentDocument) => {
    setStudents((list) => [...list, doc]);
  }, []);

  const removeStudent = useCallback((studentId: string) => {
    setStudents((list) => list.filter((s) => s.studentId !== studentId));
  }, []);

  const update = useCallback<Ctx['update']>(
    (patch) => {
      if (!activeId) return;
      setStudents((list) =>
        list.map((s) => {
          if (s.studentId !== activeId) return s;
          const p = typeof patch === 'function' ? patch(s) : patch;
          return { ...s, ...p, updatedAt: new Date().toISOString() };
        }),
      );
    },
    [activeId],
  );

  const addStars = useCallback((n: number) => update((s) => ({ totalStars: s.totalStars + n })), [update]);

  const completeLesson = useCallback(
    (lessonId: string, earnedWordIds: string[]) =>
      update((s) => {
        const completed = s.completedLessonIds.includes(lessonId) ? s.completedLessonIds : [...s.completedLessonIds, lessonId];
        const next = LESSONS.find((l) => !completed.includes(l.id));
        return {
          completedLessonIds: completed,
          currentLessonId: next?.id ?? lessonId,
          currentStageId: next?.stageId ?? s.currentStageId,
          unlockedVocabCards: Array.from(new Set([...s.unlockedVocabCards, ...earnedWordIds])),
        };
      }),
    [update],
  );

  const saveAssessment = useCallback(
    (mode: 'preTest' | 'postTest', record: AssessmentRecord) =>
      update((s) => ({ assessments: { ...s.assessments, [mode]: record } })),
    [update],
  );

  const value: Ctx = {
    students,
    student,
    login: setActiveId,
    logout: () => setActiveId(null),
    update,
    updateById,
    addStudent,
    removeStudent,
    addStars,
    completeLesson,
    saveAssessment,
    resetDemo: () => {
      setStudents(MOCK_STUDENTS);
      setActiveId(null);
    },
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStudents = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudents must be used inside StudentProvider');
  return ctx;
};
