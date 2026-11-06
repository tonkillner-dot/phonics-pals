// src/data/assessmentBank.ts
// แบบทดสอบก่อนเรียน-หลังเรียน 20 ข้อ (ข้อละ 5 คะแนน รวม 100 คะแนน)
// 4 ทักษะ x 5 ข้อ และกระจายด่านละ 4 ข้อ
import type { AssessmentQuestion } from '../types/schema';

const mc = (
  id: string,
  stageId: AssessmentQuestion['stageId'],
  skillType: AssessmentQuestion['skillType'],
  promptText: string,
  target: string,
  options: { id: string; label: string; emoji?: string }[],
  correctOptionId: string,
): AssessmentQuestion => ({ id, stageId, skillType, promptText, targetAudioOrText: target, options, correctOptionId, maxScore: 5 });

const oral = (id: string, stageId: AssessmentQuestion['stageId'], word: string): AssessmentQuestion => ({
  id,
  stageId,
  skillType: 'oral_pronunciation',
  promptText: 'อ่านคำนี้ออกเสียงดังๆ ใส่ไมโครโฟน',
  targetAudioOrText: word,
  expectedSpokenWord: word,
  maxScore: 5,
});

const L = (...labels: string[]) => labels.map((label, i) => ({ id: String.fromCharCode(97 + i), label }));

export const ASSESSMENT_BANK: AssessmentQuestion[] = [
  // ----- ด่านที่ 1 -----
  mc('q01', 1, 'phoneme_recognition', 'ฟังเสียง แล้วเลือกตัวอักษรที่ได้ยิน', 's', L('s', 'z', 'c'), 'a'),
  mc('q02', 1, 'phoneme_recognition', 'ฟังเสียง แล้วเลือกตัวอักษรที่ได้ยิน', 'a', L('e', 'a', 'u'), 'b'),
  mc('q03', 1, 'vocab_meaning', 'อ่านคำ แล้วเลือกรูปที่ตรงกับความหมาย', 'sun',
    [{ id: 'a', label: 'ดวงอาทิตย์', emoji: '☀️' }, { id: 'b', label: 'มด', emoji: '🐜' }, { id: 'c', label: 'กระทะ', emoji: '🍳' }], 'a'),
  oral('q04', 1, 'pan'),
  // ----- ด่านที่ 2 -----
  mc('q05', 2, 'cvc_blending', 'ฟังคำ แล้วเลือกคำที่สะกดถูกต้อง', 'cat', L('cut', 'cat', 'cap'), 'b'),
  mc('q06', 2, 'cvc_blending', 'ฟังคำ แล้วเลือกคำที่สะกดถูกต้อง', 'pig', L('pig', 'peg', 'big'), 'a'),
  mc('q07', 2, 'vocab_meaning', 'อ่านคำ แล้วเลือกรูปที่ตรงกับความหมาย', 'hen',
    [{ id: 'a', label: 'ปากกา', emoji: '🖊️' }, { id: 'b', label: 'สิบ', emoji: '🔟' }, { id: 'c', label: 'แม่ไก่', emoji: '🐔' }], 'c'),
  oral('q08', 2, 'sat'),
  // ----- ด่านที่ 3 -----
  mc('q09', 3, 'phoneme_recognition', 'ฟังเสียง แล้วเลือกตัวอักษรที่ได้ยิน', 'sh', L('ch', 'th', 'sh'), 'c'),
  mc('q10', 3, 'cvc_blending', 'ฟังคำ แล้วเลือกคำที่สะกดถูกต้อง', 'chip', L('ship', 'chip', 'chop'), 'b'),
  mc('q11', 3, 'vocab_meaning', 'อ่านคำ แล้วเลือกรูปที่ตรงกับความหมาย', 'frog',
    [{ id: 'a', label: 'กบ', emoji: '🐸' }, { id: 'b', label: 'ปู', emoji: '🦀' }, { id: 'c', label: 'กลอง', emoji: '🥁' }], 'a'),
  oral('q12', 3, 'fish'),
  // ----- ด่านที่ 4 -----
  mc('q13', 4, 'phoneme_recognition', 'ฟังเสียง แล้วเลือกตัวอักษรที่ได้ยิน', 'ee', L('ee', 'ai', 'oa'), 'a'),
  mc('q14', 4, 'cvc_blending', 'ฟังคำ แล้วเลือกคำที่สะกดถูกต้อง', 'cape', L('cap', 'cape', 'cup'), 'b'),
  mc('q15', 4, 'vocab_meaning', 'อ่านคำ แล้วเลือกรูปที่ตรงกับความหมาย', 'kite',
    [{ id: 'a', label: 'ชุดอุปกรณ์', emoji: '🧰' }, { id: 'b', label: 'ว่าว', emoji: '🪁' }, { id: 'c', label: 'บ้าน', emoji: '🏠' }], 'b'),
  oral('q16', 4, 'kite'),
  // ----- ด่านที่ 5 -----
  mc('q17', 5, 'phoneme_recognition', 'ฟังเสียง แล้วเลือกคำที่ได้ยิน', 'the', L('the', 'he', 'she'), 'a'),
  mc('q18', 5, 'cvc_blending', 'ฟังคำ แล้วเลือกคำที่สะกดถูกต้อง', 'under', L('under', 'udder', 'unde'), 'a'),
  mc('q19', 5, 'vocab_meaning', 'อ่านประโยค แล้วเลือกรูปที่ตรงกับความหมาย', 'The cat is on a mat.',
    [{ id: 'a', label: 'หมูในโคลน', emoji: '🐷' }, { id: 'b', label: 'แมวบนเสื่อ', emoji: '🐱' }, { id: 'c', label: 'กบตัวใหญ่', emoji: '🐸' }], 'b'),
  oral('q20', 5, 'The red dog'),
];
