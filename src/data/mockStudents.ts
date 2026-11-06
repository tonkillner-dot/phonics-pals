// src/data/mockStudents.ts
// ข้อมูลนักเรียนตัวอย่างสำหรับช่วงออกแบบหน้าเว็บ (ยังไม่เชื่อม Firebase)
import type { AssessmentRecord, BucketColor, SRSWordState, StageId, StudentDocument } from '../types/schema';
import { WORDS } from './curriculumData';

export const emptyAssessment = (): AssessmentRecord => ({
  completed: false,
  completedAt: null,
  totalScore: 0,
  maxPossibleScore: 100,
  breakdownByStage: { 1: { earned: 0, max: 20 }, 2: { earned: 0, max: 20 }, 3: { earned: 0, max: 20 }, 4: { earned: 0, max: 20 }, 5: { earned: 0, max: 20 } },
  breakdownBySkill: { phoneme_recognition: 0, cvc_blending: 0, vocab_meaning: 0, oral_pronunciation: 0 },
  itemResponses: [],
});

const doneAssessment = (score: number, daysAgo: number): AssessmentRecord => ({
  ...emptyAssessment(),
  completed: true,
  completedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  totalScore: score,
  breakdownBySkill: {
    phoneme_recognition: Math.round(score * 0.3),
    cvc_blending: Math.round(score * 0.25),
    vocab_meaning: Math.round(score * 0.28),
    oral_pronunciation: score - Math.round(score * 0.3) - Math.round(score * 0.25) - Math.round(score * 0.28),
  },
});

const srs = (wordIds: string[], bucket: BucketColor): Record<string, SRSWordState> =>
  Object.fromEntries(
    wordIds.map((id) => [
      id,
      {
        wordId: id,
        bucket,
        consecutiveThreeStars: bucket === 'green' ? 3 : bucket === 'yellow' ? 1 : 0,
        lastPracticedAt: new Date().toISOString(),
        nextReviewDueAt: new Date().toISOString(),
        bestStars: bucket === 'green' ? 3 : bucket === 'yellow' ? 3 : 1,
        totalAttempts: 3,
      } satisfies SRSWordState,
    ]),
  );

const ids = (lessonId: string) => WORDS.filter((w) => w.lessonId === lessonId).map((w) => w.id);

interface Seed {
  n: number;
  name: string;
  grade: string;
  avatar: string;
  stars: number;
  streak: number;
  stage: StageId;
  current: string;
  completed: string[];
  pre: number | null;
  post: number | null;
  red: string[];
}

const make = (s: Seed): StudentDocument => {
  const completedWords = s.completed.flatMap(ids);
  const greenWords = completedWords.filter((id) => !s.red.includes(id));
  return {
    studentId: `std_${s.grade === 'ป.1' ? 'p1' : s.grade === 'ป.2' ? 'p2' : 'p3'}_${String(s.n).padStart(3, '0')}`,
    studentNumber: s.n,
    displayName: s.name,
    gradeLevel: s.grade,
    avatarIcon: s.avatar,
    pinCode: '1234',
    totalStars: s.stars,
    currentStreakDays: s.streak,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    unlockedAvatarItems: s.stars > 40 ? ['hat_cap'] : [],
    unlockedVocabCards: greenWords,
    currentStageId: s.stage,
    currentLessonId: s.current,
    completedLessonIds: s.completed,
    srsState: { ...srs(greenWords, 'green'), ...srs(s.red, 'red') },
    assessments: {
      preTest: s.pre === null ? emptyAssessment() : doneAssessment(s.pre, 30),
      postTest: s.post === null ? emptyAssessment() : doneAssessment(s.post, 1),
      postTestUnlockedByTeacher: false,
      stageChecks: {
        1: { preScore: null, postScore: null },
        2: { preScore: null, postScore: null },
        3: { preScore: null, postScore: null },
        4: { preScore: null, postScore: null },
        5: { preScore: null, postScore: null },
      },
    },
    updatedAt: new Date().toISOString(),
  };
};

const S1 = ['stage1_lesson1', 'stage1_lesson2', 'stage1_lesson3', 'stage1_lesson4'];
const S2 = ['stage2_lesson1', 'stage2_lesson2', 'stage2_lesson3', 'stage2_lesson4'];
const S3 = ['stage3_lesson1', 'stage3_lesson2', 'stage3_lesson3'];

export const MOCK_STUDENTS: StudentDocument[] = [
  make({ n: 1, name: 'ด.ช. สมชาย', grade: 'ป.1', avatar: '🦁', stars: 86, streak: 5, stage: 2, current: 'stage2_lesson3', completed: [...S1, ...S2.slice(0, 2)], pre: 24, post: null, red: ['w_pin_s2', 'w_fin_s2', 'w_egg_s1'] }),
  make({ n: 2, name: 'ด.ญ. มะลิ', grade: 'ป.1', avatar: '🐼', stars: 120, streak: 9, stage: 3, current: 'stage3_lesson1', completed: [...S1, ...S2], pre: 32, post: null, red: ['w_hop_s2'] }),
  make({ n: 3, name: 'ด.ช. ก้องภพ', grade: 'ป.1', avatar: '🦊', stars: 34, streak: 2, stage: 1, current: 'stage1_lesson3', completed: S1.slice(0, 2), pre: 12, post: null, red: ['w_ink_s1', 'w_egg_s1', 'w_rat_s1'] }),
  make({ n: 4, name: 'ด.ญ. ปิ่นแก้ว', grade: 'ป.1', avatar: '🐰', stars: 0, streak: 0, stage: 1, current: 'stage1_lesson1', completed: [], pre: null, post: null, red: [] }),
  make({ n: 5, name: 'ด.ช. ธนากร', grade: 'ป.1', avatar: '🐯', stars: 158, streak: 12, stage: 4, current: 'stage4_lesson1', completed: [...S1, ...S2, ...S3], pre: 40, post: 78, red: ['w_teeth_s3', 'w_pin_s2'] }),
  make({ n: 1, name: 'ด.ญ. ใบเตย', grade: 'ป.2', avatar: '🐨', stars: 64, streak: 4, stage: 2, current: 'stage2_lesson2', completed: [...S1, S2[0]], pre: 28, post: null, red: ['w_fin_s2', 'w_van_s2'] }),
  make({ n: 2, name: 'ด.ช. ภูมิ', grade: 'ป.2', avatar: '🐸', stars: 47, streak: 1, stage: 2, current: 'stage2_lesson1', completed: S1, pre: 20, post: null, red: ['w_pin_s2', 'w_egg_s1'] }),
  make({ n: 1, name: 'ด.ญ. น้ำฝน', grade: 'ป.3', avatar: '🦄', stars: 201, streak: 15, stage: 5, current: 'stage5_lesson1', completed: [...S1, ...S2, ...S3, 'stage4_lesson1', 'stage4_lesson2', 'stage4_lesson3'], pre: 44, post: 88, red: [] }),
];

export const GRADES = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
