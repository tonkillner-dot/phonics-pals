// src/services/syncEngine.ts
// ระบบ Offline-First LocalStorage + เตรียมซิงก์แบบ Batch กับ Firebase Firestore
import type { StudentDocument } from '../types/schema';
import { isFirebaseConfigured } from './firebase';

const PENDING_SYNC_KEY = 'phonics_pals_pending_sync';

export const markPendingSync = (studentId: string) => {
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(studentId)) {
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify([...list, studentId]));
    }
  } catch { /* ignore */ }
};

export const commitBatchSync = async (student: StudentDocument): Promise<{ synced: boolean; mode: 'local' | 'firebase' }> => {
  if (!isFirebaseConfigured || !navigator.onLine) {
    markPendingSync(student.studentId);
    return { synced: false, mode: 'local' };
  }
  return { synced: true, mode: 'firebase' };
};
