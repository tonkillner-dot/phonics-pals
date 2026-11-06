// src/services/assessmentEngine.ts
// คำนวณคะแนนพัฒนาการ (Raw Gain Δ และ Normalized Learning Gain g) และส่งออกไฟล์ CSV
import type { StudentDocument } from '../types/schema';

export interface LearningGainMetrics {
  preScore: number | null;
  postScore: number | null;
  rawGain: number | null;          // Δ = Post - Pre
  normalizedGain: number | null;   // g = (Post - Pre) / (100 - Pre)
}

export const computeLearningGain = (student: StudentDocument): LearningGainMetrics => {
  const pre = student.assessments.preTest.completed ? student.assessments.preTest.totalScore : null;
  const post = student.assessments.postTest.completed ? student.assessments.postTest.totalScore : null;
  if (pre === null || post === null) {
    return { preScore: pre, postScore: post, rawGain: null, normalizedGain: null };
  }
  const rawGain = post - pre;
  const normalizedGain = pre >= 100 ? 1 : Number(((post - pre) / (100 - pre)).toFixed(2));
  return { preScore: pre, postScore: post, rawGain, normalizedGain };
};

/** สร้างไฟล์ CSV (ใส่ UTF-8 BOM เพื่อเปิดใน Microsoft Excel ได้โดยภาษาไทยไม่เพี้ยน) */
export const exportStudentsToCSV = (students: StudentDocument[]) => {
  const headers = [
    'รหัสนักเรียน',
    'ชั้น',
    'เลขที่',
    'ชื่อ-นามสกุล',
    'คะแนนก่อนเรียน (Pre-test 100)',
    'คะแนนหลังเรียน (Post-test 100)',
    'พัฒนาการ (Δ)',
    'Normalized Gain (g)',
    'ด่านปัจจุบัน',
    'จำนวนบทที่ผ่านแล้ว',
    'ดาวสะสม',
    'คำศัพท์ที่สะสมได้',
    'คำที่ติดในตะกร้าแดง',
  ];

  const rows = students.map((s) => {
    const g = computeLearningGain(s);
    const redCount = Object.values(s.srsState).filter((w) => w.bucket === 'red').length;
    return [
      s.studentId,
      s.gradeLevel,
      s.studentNumber,
      `"${s.displayName}"`,
      g.preScore ?? '-',
      g.postScore ?? '-',
      g.rawGain !== null ? (g.rawGain >= 0 ? `+${g.rawGain}` : `${g.rawGain}`) : '-',
      g.normalizedGain !== null ? `${Math.round(g.normalizedGain * 100)}%` : '-',
      `ด่านที่ ${s.currentStageId}`,
      s.completedLessonIds.length,
      s.totalStars,
      s.unlockedVocabCards.length,
      redCount,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `รายงานพัฒนาการโฟนิกส์_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
