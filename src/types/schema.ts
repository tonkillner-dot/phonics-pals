// src/types/schema.ts
// โครงสร้างข้อมูลทั้งหมดของแอป (อ้างอิงตาม AGENT_PROJECT_SPEC.md หัวข้อที่ 3)

export type PhonemeCategory = 'consonant' | 'short_vowel' | 'long_vowel' | 'digraph' | 'blend';
export type BucketColor = 'red' | 'yellow' | 'green';
export type StageId = 1 | 2 | 3 | 4 | 5;

export interface PhonemeUnit {
  grapheme: string;           // e.g., "s", "a", "sh", "a_e"
  ipa: string;                // e.g., "/s/", "/æ/", "/ʃ/", "/eɪ/"
  thaiHint: string;           // e.g., "ซู่ (เสียงลมลอดฟัน)", "แอะ"
  category: PhonemeCategory;  // Determines tile color: consonant=blue, vowel=red, digraph/blend=emerald
  audioFile: string;          // e.g., "/audio/phonemes/s.mp3"
}

export type WordCategoryTag = 'animal' | 'food' | 'body' | 'action' | 'object' | 'nature' | 'sight_word';

export interface WordItem {
  id: string;                 // e.g., "w_cat"
  stageId: StageId;
  lessonId: string;
  word: string;               // e.g., "cat"
  phonemes: string[];         // e.g., ["c", "a", "t"]
  meaningThai: string;        // e.g., "แมว"
  categoryTag: WordCategoryTag;
  emoji: string;              // e.g., "🐱"
  isSightWord?: boolean;      // True if non-decodable sight word (e.g., "the", "is")
  contrastPairId?: string;    // Used in Stage 4 Minimal Pairs (e.g., "w_cap" <-> "w_cape")
  sentenceExample?: string;   // Used in Stage 5 (e.g., "The fat cat sat on a mat.")
  blendGuideThai?: string;    // วิธีสะกดเทียบภาษาไทย เช่น "ค + แอะ = แคะ ➔ แคะ + ท = แคท"
  magicE?: boolean;           // คำที่มี Magic E (e ตัวท้ายไม่ออกเสียง แต่ทำให้สระเปลี่ยนเป็นเสียงยาว)
}

export interface LessonUnit {
  id: string;                 // e.g., "stage1_lesson1"
  stageId: StageId;
  order: number;
  title: string;              // e.g., "กลุ่มเสียงตั้งต้นชุดที่ 1: s, a, t, p, i, n"
  targetPhonemes: string[];   // e.g., ["s", "a", "t", "p", "i", "n"]
  wordIds: string[];          // References to WordItem.id
}

export type SkillType = 'phoneme_recognition' | 'cvc_blending' | 'vocab_meaning' | 'oral_pronunciation';

export interface AssessmentQuestion {
  id: string;                 // e.g., "q_pre_01"
  stageId: StageId;
  skillType: SkillType;
  promptText: string;         // Instruction in Thai for the student
  targetAudioOrText: string;  // Target phoneme or word
  options?: {                 // Present for multiple-choice recognition questions
    id: string;
    label: string;
    emoji?: string;
  }[];
  correctOptionId?: string;
  expectedSpokenWord?: string;// Present if skillType === 'oral_pronunciation'
  maxScore: number;           // Default: 5 points per question (20 questions = 100 points)
}

export interface AssessmentRecord {
  completed: boolean;
  completedAt: string | null; // ISO timestamp
  totalScore: number;         // 0 - 100
  maxPossibleScore: number;   // 100
  breakdownByStage: Record<StageId, { earned: number; max: number }>;
  breakdownBySkill: {
    phoneme_recognition: number;
    cvc_blending: number;
    vocab_meaning: number;
    oral_pronunciation: number;
  };
  itemResponses: {
    questionId: string;
    isCorrect: boolean;
    earnedScore: number;
    spokenTranscript?: string;
  }[];
}

export interface SRSWordState {
  wordId: string;
  bucket: BucketColor;        // 'red' = review tomorrow, 'yellow' = +3 days, 'green' = +7 to 14 days
  consecutiveThreeStars: number;
  lastPracticedAt: string;    // ISO date string
  nextReviewDueAt: string;    // ISO date string
  bestStars: 0 | 1 | 2 | 3;
  totalAttempts: number;
}

// SINGLE FIRESTORE DOCUMENT SCHEMA: Collection `students`, Document `{studentId}`
export interface StudentDocument {
  studentId: string;          // e.g., "std_p1_001"
  studentNumber: number;      // เลขที่ในห้องเรียน
  displayName: string;        // ชื่อนักเรียน
  gradeLevel: string;         // e.g., "ป.1", "ป.2", "ป.3"
  avatarIcon: string;         // e.g., "🦁", "🐼", "🦊"
  pinCode: string;            // 4-digit PIN e.g., "1234"

  // Gamification & Motivation
  totalStars: number;
  currentStreakDays: number;
  lastActiveDate: string;     // YYYY-MM-DD
  unlockedAvatarItems: string[];
  unlockedVocabCards: string[]; // Array of WordItem.id unlocked in Sticker Book

  // Curriculum Progression
  currentStageId: StageId;
  currentLessonId: string;
  completedLessonIds: string[];

  // 3-Bucket Spaced Repetition State
  srsState: Record<string, SRSWordState>;

  // Pre-Test & Post-Test Records
  assessments: {
    preTest: AssessmentRecord;
    postTest: AssessmentRecord;
    postTestUnlockedByTeacher: boolean; // Teacher can manually unlock Post-test anytime
    stageChecks: Record<StageId, { preScore: number | null; postScore: number | null }>;
  };

  updatedAt: string;          // ISO timestamp of last batch sync
}
