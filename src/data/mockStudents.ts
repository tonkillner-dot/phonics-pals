// src/data/mockStudents.ts
// ข้อมูลนักเรียนโรงเรียนบ้านส้อเด่นพัฒนา ชั้น ป.1 - ป.6 รวมทั้งหมด 61 คน
// ผู้จัดทำ: นายนภรัฐ อุดเต็น (ครูต้น)
// [กฎเหล็กสูงสุด] ห้ามใช้ตัวเลขไทยเด็ดขาด ใช้ตัวเลขอารบิก (1, 2, 3...) 100%

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

const GRADE_PREFIX: Record<string, string> = {
  'ป.1': 'p1',
  'ป.2': 'p2',
  'ป.3': 'p3',
  'ป.4': 'p4',
  'ป.5': 'p5',
  'ป.6': 'p6',
};

const make = (s: Seed): StudentDocument => {
  const completedWords = s.completed.flatMap(ids);
  const greenWords = completedWords.filter((id) => !s.red.includes(id));
  const prefix = GRADE_PREFIX[s.grade] ?? 'p1';
  return {
    studentId: `std_${prefix}_${String(s.n).padStart(3, '0')}`,
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
const S4 = ['stage4_lesson1', 'stage4_lesson2', 'stage4_lesson3'];

export const MOCK_STUDENTS: StudentDocument[] = [
  // ==========================================
  // ชั้นประถมศึกษาปีที่ 1 (ป.1: รวม 11 คน)
  // ==========================================
  make({ n: 1, name: 'ด.ช. สมชาย ใจดี', grade: 'ป.1', avatar: '🦁', stars: 86, streak: 5, stage: 2, current: 'stage2_lesson3', completed: [...S1, ...S2.slice(0, 2)], pre: 24, post: null, red: ['w_pin_s1', 'w_sat_s1'] }),
  make({ n: 2, name: 'ด.ญ. มะลิ บุญเกิด', grade: 'ป.1', avatar: '🐼', stars: 120, streak: 9, stage: 3, current: 'stage3_lesson1', completed: [...S1, ...S2], pre: 32, post: null, red: ['w_pan_s1'] }),
  make({ n: 3, name: 'ด.ช. ก้องภพ สว่างวงศ์', grade: 'ป.1', avatar: '🦊', stars: 34, streak: 2, stage: 1, current: 'stage1_lesson3', completed: S1.slice(0, 2), pre: 12, post: null, red: ['w_sat_s1'] }),
  make({ n: 4, name: 'ด.ญ. ปิ่นแก้ว มณีโชติ', grade: 'ป.1', avatar: '🐰', stars: 0, streak: 0, stage: 1, current: 'stage1_lesson1', completed: [], pre: null, post: null, red: [] }),
  make({ n: 5, name: 'ด.ช. ธนากร ภักดี', grade: 'ป.1', avatar: '🐯', stars: 158, streak: 12, stage: 4, current: 'stage4_lesson1', completed: [...S1, ...S2, ...S3], pre: 40, post: 78, red: ['w_pin_s1'] }),
  make({ n: 6, name: 'ด.ญ. อริสา แก้วใส', grade: 'ป.1', avatar: '🐨', stars: 45, streak: 3, stage: 1, current: 'stage1_lesson4', completed: S1.slice(0, 3), pre: 18, post: null, red: ['w_mat_s1'] }),
  make({ n: 7, name: 'ด.ช. ชัยวัฒน์ คำมูล', grade: 'ป.1', avatar: '🐸', stars: 22, streak: 1, stage: 1, current: 'stage1_lesson2', completed: [S1[0]], pre: 10, post: null, red: ['w_tap_s1'] }),
  make({ n: 8, name: 'ด.ญ. กัญญารัตน์ ศรีสุข', grade: 'ป.1', avatar: '🦄', stars: 95, streak: 6, stage: 2, current: 'stage2_lesson4', completed: [...S1, ...S2.slice(0, 3)], pre: 28, post: null, red: ['w_dog_s1'] }),
  make({ n: 9, name: 'ด.ช. นพดล ยั่งยืน', grade: 'ป.1', avatar: '🐵', stars: 15, streak: 1, stage: 1, current: 'stage1_lesson2', completed: [S1[0]], pre: 14, post: null, red: ['w_man_s1'] }),
  make({ n: 10, name: 'ด.ญ. รัตนาพร ดวงจันทร์', grade: 'ป.1', avatar: '🐧', stars: 70, streak: 4, stage: 2, current: 'stage2_lesson2', completed: [...S1, S2[0]], pre: 22, post: null, red: ['w_pot_s1'] }),
  make({ n: 11, name: 'ด.ช. ปัณณธร ศุภกิจ', grade: 'ป.1', avatar: '🐶', stars: 55, streak: 3, stage: 2, current: 'stage2_lesson1', completed: S1, pre: 20, post: null, red: ['w_tin_s1'] }),

  // ==========================================
  // ชั้นประถมศึกษาปีที่ 2 (ป.2: รวม 11 คน)
  // ==========================================
  make({ n: 1, name: 'ด.ญ. ใบเตย วงศ์วรรณ', grade: 'ป.2', avatar: '🐨', stars: 64, streak: 4, stage: 2, current: 'stage2_lesson2', completed: [...S1, S2[0]], pre: 28, post: null, red: ['w_map_s1'] }),
  make({ n: 2, name: 'ด.ช. ภูมิพัฒน์ วงค์คำ', grade: 'ป.2', avatar: '🐸', stars: 47, streak: 1, stage: 2, current: 'stage2_lesson1', completed: S1, pre: 20, post: null, red: ['w_pin_s1'] }),
  make({ n: 3, name: 'ด.ญ. ชลธิชา สิทธิโชค', grade: 'ป.2', avatar: '🦄', stars: 110, streak: 7, stage: 3, current: 'stage3_lesson2', completed: [...S1, ...S2, S3[0]], pre: 34, post: null, red: ['w_sit_s1'] }),
  make({ n: 4, name: 'ด.ช. กฤษณะ ใจมั่น', grade: 'ป.2', avatar: '🦁', stars: 80, streak: 5, stage: 2, current: 'stage2_lesson3', completed: [...S1, ...S2.slice(0, 2)], pre: 26, post: null, red: ['w_dot_s1'] }),
  make({ n: 5, name: 'ด.ญ. ภัทรวดี ศรีวิชัย', grade: 'ป.2', avatar: '🐰', stars: 135, streak: 8, stage: 3, current: 'stage3_lesson3', completed: [...S1, ...S2, ...S3.slice(0, 2)], pre: 36, post: null, red: ['w_pit_s1'] }),
  make({ n: 6, name: 'ด.ช. ธีรภัทร สมบูรณ์', grade: 'ป.2', avatar: '🐯', stars: 92, streak: 6, stage: 3, current: 'stage3_lesson1', completed: [...S1, ...S2], pre: 30, post: null, red: ['w_tip_s1'] }),
  make({ n: 7, name: 'ด.ญ. นลินทิพย์ บุญนาค', grade: 'ป.2', avatar: '🐼', stars: 50, streak: 2, stage: 2, current: 'stage2_lesson1', completed: S1, pre: 22, post: null, red: ['w_pan_s1'] }),
  make({ n: 8, name: 'ด.ช. พิชญุตม์ พิทักษ์', grade: 'ป.2', avatar: '🦊', stars: 30, streak: 2, stage: 1, current: 'stage1_lesson3', completed: S1.slice(0, 2), pre: 16, post: null, red: ['w_mat_s1'] }),
  make({ n: 9, name: 'ด.ญ. วรรณภา สารคาม', grade: 'ป.2', avatar: '🐧', stars: 105, streak: 7, stage: 3, current: 'stage3_lesson2', completed: [...S1, ...S2, S3[0]], pre: 32, post: null, red: [] }),
  make({ n: 10, name: 'ด.ช. ศักดา อาจหาญ', grade: 'ป.2', avatar: '🐶', stars: 75, streak: 4, stage: 2, current: 'stage2_lesson3', completed: [...S1, ...S2.slice(0, 2)], pre: 24, post: null, red: ['w_dog_s1'] }),
  make({ n: 11, name: 'ด.ญ. สุภัสสรา คำดี', grade: 'ป.2', avatar: '🐱', stars: 140, streak: 9, stage: 4, current: 'stage4_lesson1', completed: [...S1, ...S2, ...S3], pre: 38, post: 74, red: [] }),

  // ==========================================
  // ชั้นประถมศึกษาปีที่ 3 (ป.3: รวม 14 คน)
  // ==========================================
  make({ n: 1, name: 'ด.ญ. น้ำฝน ปิ่นเพชร', grade: 'ป.3', avatar: '🦄', stars: 201, streak: 15, stage: 5, current: 'stage5_lesson1', completed: [...S1, ...S2, ...S3, ...S4], pre: 44, post: 88, red: [] }),
  make({ n: 2, name: 'ด.ช. เมธา ทรงกลด', grade: 'ป.3', avatar: '🦁', stars: 165, streak: 11, stage: 4, current: 'stage4_lesson2', completed: [...S1, ...S2, ...S3, S4[0]], pre: 38, post: null, red: ['w_pot_s1'] }),
  make({ n: 3, name: 'ด.ญ. พิมลภัส ศรีสมุทร', grade: 'ป.3', avatar: '🐼', stars: 180, streak: 13, stage: 4, current: 'stage4_lesson3', completed: [...S1, ...S2, ...S3, ...S4.slice(0, 2)], pre: 42, post: null, red: [] }),
  make({ n: 4, name: 'ด.ช. วรัญญู รัตนวงศ์', grade: 'ป.3', avatar: '🦊', stars: 125, streak: 8, stage: 3, current: 'stage3_lesson3', completed: [...S1, ...S2, ...S3.slice(0, 2)], pre: 32, post: null, red: ['w_dot_s1'] }),
  make({ n: 5, name: 'ด.ญ. วริศรา ชนะภัย', grade: 'ป.3', avatar: '🐰', stars: 195, streak: 14, stage: 5, current: 'stage5_lesson1', completed: [...S1, ...S2, ...S3, ...S4], pre: 46, post: 84, red: [] }),
  make({ n: 6, name: 'ด.ช. อธิป ยอดเมือง', grade: 'ป.3', avatar: '🐯', stars: 90, streak: 5, stage: 3, current: 'stage3_lesson1', completed: [...S1, ...S2], pre: 28, post: null, red: ['w_sat_s1'] }),
  make({ n: 7, name: 'ด.ญ. ณัชชา คำแก้ว', grade: 'ป.3', avatar: '🐨', stars: 140, streak: 9, stage: 4, current: 'stage4_lesson1', completed: [...S1, ...S2, ...S3], pre: 36, post: null, red: [] }),
  make({ n: 8, name: 'ด.ช. กิตติศักดิ์ พรหมมา', grade: 'ป.3', avatar: '🐸', stars: 110, streak: 7, stage: 3, current: 'stage3_lesson2', completed: [...S1, ...S2, S3[0]], pre: 30, post: null, red: ['w_man_s1'] }),
  make({ n: 9, name: 'ด.ญ. จุฑามาศ วิลาวัลย์', grade: 'ป.3', avatar: '🐧', stars: 155, streak: 10, stage: 4, current: 'stage4_lesson2', completed: [...S1, ...S2, ...S3, S4[0]], pre: 38, post: null, red: [] }),
  make({ n: 10, name: 'ด.ช. ณภัทร ธรรมรักษ์', grade: 'ป.3', avatar: '🐶', stars: 85, streak: 4, stage: 2, current: 'stage2_lesson4', completed: [...S1, ...S2.slice(0, 3)], pre: 26, post: null, red: ['w_map_s1'] }),
  make({ n: 11, name: 'ด.ญ. ปาริฉัตร มั่นคง', grade: 'ป.3', avatar: '🐱', stars: 170, streak: 12, stage: 4, current: 'stage4_lesson3', completed: [...S1, ...S2, ...S3, ...S4.slice(0, 2)], pre: 40, post: null, red: [] }),
  make({ n: 12, name: 'ด.ช. ภาณุพงศ์ บุญยืน', grade: 'ป.3', avatar: '🐵', stars: 100, streak: 6, stage: 3, current: 'stage3_lesson1', completed: [...S1, ...S2], pre: 30, post: null, red: ['w_pin_s1'] }),
  make({ n: 13, name: 'ด.ญ. ลลิตา เพียรสุข', grade: 'ป.3', avatar: '🦊', stars: 130, streak: 8, stage: 3, current: 'stage3_lesson3', completed: [...S1, ...S2, ...S3.slice(0, 2)], pre: 34, post: null, red: [] }),
  make({ n: 14, name: 'ด.ช. วสุพล อัศวเดช', grade: 'ป.3', avatar: '🦁', stars: 70, streak: 3, stage: 2, current: 'stage2_lesson3', completed: [...S1, ...S2.slice(0, 2)], pre: 22, post: null, red: ['w_tap_s1'] }),

  // ==========================================
  // ชั้นประถมศึกษาปีที่ 4 (ป.4: รวม 9 คน)
  // ==========================================
  make({ n: 1, name: 'ด.ช. ปิยวัฒน์ จันทร์หอม', grade: 'ป.4', avatar: '🦁', stars: 175, streak: 11, stage: 4, current: 'stage4_lesson3', completed: [...S1, ...S2, ...S3, ...S4.slice(0, 2)], pre: 42, post: null, red: [] }),
  make({ n: 2, name: 'ด.ญ. กมลวรรณ บุญเรือง', grade: 'ป.4', avatar: '🐼', stars: 210, streak: 16, stage: 5, current: 'stage5_lesson2', completed: [...S1, ...S2, ...S3, ...S4, 'stage5_lesson1'], pre: 48, post: 92, red: [] }),
  make({ n: 3, name: 'ด.ช. ชนาธิป สุขเกษม', grade: 'ป.4', avatar: '🦊', stars: 145, streak: 9, stage: 4, current: 'stage4_lesson1', completed: [...S1, ...S2, ...S3], pre: 36, post: null, red: ['w_tin_s1'] }),
  make({ n: 4, name: 'ด.ญ. ธิดารัตน์ ชูวงศ์', grade: 'ป.4', avatar: '🐰', stars: 190, streak: 13, stage: 5, current: 'stage5_lesson1', completed: [...S1, ...S2, ...S3, ...S4], pre: 44, post: 86, red: [] }),
  make({ n: 5, name: 'ด.ช. พงศธร รักษาสัตย์', grade: 'ป.4', avatar: '🐯', stars: 120, streak: 7, stage: 3, current: 'stage3_lesson3', completed: [...S1, ...S2, ...S3.slice(0, 2)], pre: 32, post: null, red: ['w_pit_s1'] }),
  make({ n: 6, name: 'ด.ญ. ศิริพร พานิช', grade: 'ป.4', avatar: '🐨', stars: 160, streak: 10, stage: 4, current: 'stage4_lesson2', completed: [...S1, ...S2, ...S3, S4[0]], pre: 38, post: null, red: [] }),
  make({ n: 7, name: 'ด.ช. อนุสรณ์ มิ่งขวัญ', grade: 'ป.4', avatar: '🐸', stars: 95, streak: 5, stage: 3, current: 'stage3_lesson1', completed: [...S1, ...S2], pre: 28, post: null, red: ['w_sat_s1'] }),
  make({ n: 8, name: 'ด.ญ. อัจฉรา ฤกษ์ดี', grade: 'ป.4', avatar: '🦄', stars: 225, streak: 18, stage: 5, current: 'stage5_lesson3', completed: [...S1, ...S2, ...S3, ...S4, 'stage5_lesson1', 'stage5_lesson2'], pre: 52, post: 96, red: [] }),
  make({ n: 9, name: 'ด.ช. อัครเดช แสนสุข', grade: 'ป.4', avatar: '🐶', stars: 135, streak: 8, stage: 4, current: 'stage4_lesson1', completed: [...S1, ...S2, ...S3], pre: 34, post: null, red: ['w_pan_s1'] }),

  // ==========================================
  // ชั้นประถมศึกษาปีที่ 5 (ป.5: รวม 5 คน)
  // ==========================================
  make({ n: 1, name: 'ด.ช. ณัฐวุฒิ สดใส', grade: 'ป.5', avatar: '🦁', stars: 185, streak: 12, stage: 4, current: 'stage4_lesson3', completed: [...S1, ...S2, ...S3, ...S4.slice(0, 2)], pre: 44, post: null, red: [] }),
  make({ n: 2, name: 'ด.ญ. ธนาพร รุ่งเรือง', grade: 'ป.5', avatar: '🐼', stars: 230, streak: 17, stage: 5, current: 'stage5_lesson2', completed: [...S1, ...S2, ...S3, ...S4, 'stage5_lesson1'], pre: 50, post: 94, red: [] }),
  make({ n: 3, name: 'ด.ช. ภานุวัฒน์ คำปัน', grade: 'ป.5', avatar: '🦊', stars: 150, streak: 9, stage: 4, current: 'stage4_lesson1', completed: [...S1, ...S2, ...S3], pre: 38, post: null, red: ['w_dot_s1'] }),
  make({ n: 4, name: 'ด.ญ. วาสนา สายชล', grade: 'ป.5', avatar: '🐰', stars: 200, streak: 15, stage: 5, current: 'stage5_lesson1', completed: [...S1, ...S2, ...S3, ...S4], pre: 46, post: 90, red: [] }),
  make({ n: 5, name: 'ด.ช. เอกภาพ ก้าวหน้า', grade: 'ป.5', avatar: '🐯', stars: 165, streak: 10, stage: 4, current: 'stage4_lesson2', completed: [...S1, ...S2, ...S3, S4[0]], pre: 40, post: null, red: [] }),

  // ==========================================
  // ชั้นประถมศึกษาปีที่ 6 (ป.6: รวม 11 คน - ห้องครูนภรัฐ)
  // ==========================================
  make({ n: 1, name: 'ด.ช. ชลภัทร รัตนวิเชียร', grade: 'ป.6', avatar: '🦁', stars: 215, streak: 15, stage: 5, current: 'stage5_lesson2', completed: [...S1, ...S2, ...S3, ...S4, 'stage5_lesson1'], pre: 50, post: 92, red: [] }),
  make({ n: 2, name: 'ด.ญ. นภัสสร แสงเพชร', grade: 'ป.6', avatar: '🐼', stars: 240, streak: 19, stage: 5, current: 'stage5_lesson3', completed: [...S1, ...S2, ...S3, ...S4, 'stage5_lesson1', 'stage5_lesson2'], pre: 54, post: 98, red: [] }),
  make({ n: 3, name: 'ด.ช. ธนดล ทองดี', grade: 'ป.6', avatar: '🦊', stars: 170, streak: 11, stage: 4, current: 'stage4_lesson2', completed: [...S1, ...S2, ...S3, S4[0]], pre: 42, post: null, red: ['w_tip_s1'] }),
  make({ n: 4, name: 'ด.ญ. ปริญญา มงคล', grade: 'ป.6', avatar: '🐰', stars: 220, streak: 16, stage: 5, current: 'stage5_lesson2', completed: [...S1, ...S2, ...S3, ...S4, 'stage5_lesson1'], pre: 52, post: 95, red: [] }),
  make({ n: 5, name: 'ด.ช. วรพงษ์ แก้วทอง', grade: 'ป.6', avatar: '🐯', stars: 190, streak: 13, stage: 5, current: 'stage5_lesson1', completed: [...S1, ...S2, ...S3, ...S4], pre: 46, post: 88, red: [] }),
  make({ n: 6, name: 'ด.ญ. ศศิธร เด่นดวง', grade: 'ป.6', avatar: '🐨', stars: 180, streak: 12, stage: 4, current: 'stage4_lesson3', completed: [...S1, ...S2, ...S3, ...S4.slice(0, 2)], pre: 44, post: null, red: [] }),
  make({ n: 7, name: 'ด.ช. สหรัฐ มังคละ', grade: 'ป.6', avatar: '🐸', stars: 160, streak: 10, stage: 4, current: 'stage4_lesson2', completed: [...S1, ...S2, ...S3, S4[0]], pre: 40, post: null, red: ['w_dog_s1'] }),
  make({ n: 8, name: 'ด.ญ. อรทัย รักษ์ดวง', grade: 'ป.6', avatar: '🦄', stars: 235, streak: 18, stage: 5, current: 'stage5_lesson3', completed: [...S1, ...S2, ...S3, ...S4, 'stage5_lesson1', 'stage5_lesson2'], pre: 52, post: 96, red: [] }),
  make({ n: 9, name: 'ด.ช. ภูริพัฒน์ อุ่นเมือง', grade: 'ป.6', avatar: '🐶', stars: 145, streak: 8, stage: 4, current: 'stage4_lesson1', completed: [...S1, ...S2, ...S3], pre: 36, post: null, red: ['w_mat_s1'] }),
  make({ n: 10, name: 'ด.ญ. สุพรรณษา ยอดใจ', grade: 'ป.6', avatar: '🐱', stars: 205, streak: 14, stage: 5, current: 'stage5_lesson1', completed: [...S1, ...S2, ...S3, ...S4], pre: 48, post: 90, red: [] }),
  make({ n: 11, name: 'ด.ช. รชต ศรีสวัสดิ์', grade: 'ป.6', avatar: '🐵', stars: 175, streak: 11, stage: 4, current: 'stage4_lesson3', completed: [...S1, ...S2, ...S3, ...S4.slice(0, 2)], pre: 42, post: null, red: [] }),
];

export const GRADES = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
