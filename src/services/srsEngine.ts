// src/services/srsEngine.ts
// ระบบตะกร้า 3 สี (Spaced Repetition: แดง / เหลือง / เขียว) และคำนวณดาวตามความพยายาม
import type { BucketColor, SRSWordState } from '../types/schema';

/** คำนวณดาวต่อคำ (1-3 ดาว) ตามความพยายาม */
export const calculateWordStars = (attempts: number, usedSlowTurtle: boolean, usedFallback: boolean): 1 | 2 | 3 => {
  if (usedFallback) return 1;
  if (attempts === 1 && !usedSlowTurtle) return 3;
  return 2;
};

/** อัปเดตสถานะตะกร้าคำศัพท์หลังฝึกเสร็จ 1 คำ */
export const updateSRSWordState = (
  prev: SRSWordState | undefined,
  wordId: string,
  earnedStars: 1 | 2 | 3,
): { nextState: SRSWordState; unlockedSticker: boolean } => {
  const now = new Date();
  const consecutive = earnedStars === 3 ? (prev?.consecutiveThreeStars ?? 0) + 1 : 0;

  let bucket: BucketColor = 'red';
  let addDays = 1;
  if (earnedStars < 3) {
    bucket = 'red';
    addDays = 1;
  } else if (consecutive >= 3) {
    bucket = 'green';
    addDays = 7;
  } else {
    bucket = 'yellow';
    addDays = 3;
  }

  const due = new Date(now.getTime() + addDays * 86400000);
  const bestStars = Math.max(prev?.bestStars ?? 0, earnedStars) as 0 | 1 | 2 | 3;

  return {
    nextState: {
      wordId,
      bucket,
      consecutiveThreeStars: consecutive,
      lastPracticedAt: now.toISOString(),
      nextReviewDueAt: due.toISOString(),
      bestStars,
      totalAttempts: (prev?.totalAttempts ?? 0) + 1,
    },
    unlockedSticker: bucket === 'green' || earnedStars >= 2,
  };
};

/** ดึงรายการคำที่ต้องทบทวนใน Daily Warm-up (สูงสุด 5 คำ) */
export const getDailyWarmupWordIds = (srsState: Record<string, SRSWordState>, limit = 5): string[] => {
  const nowIso = new Date().toISOString();
  return Object.values(srsState)
    .filter((s) => s.bucket === 'red' || s.nextReviewDueAt <= nowIso)
    .sort((a, b) => (a.bucket === 'red' ? -1 : 1) - (b.bucket === 'red' ? -1 : 1))
    .slice(0, limit)
    .map((s) => s.wordId);
};
