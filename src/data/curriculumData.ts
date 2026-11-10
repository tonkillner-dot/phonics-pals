// src/data/curriculumData.ts
// หลักสูตร Synthetic Phonics ตามหลักสากลที่ถูกต้องแม่นยำ (Strict Cumulative Progression):
// ทุกบทเรียนจะฝึกผสมคำเฉพาะจาก "ตัวอักษรและสระที่นักเรียนได้เรียนรู้แล้วเท่านั้น"
// โดยคำนึงถึงนักเรียนประถมที่ไม่มีพื้นฐานภาษาอังกฤษ
import type { LessonUnit, PhonemeCategory, PhonemeUnit, StageId, WordCategoryTag, WordItem } from '../types/schema';

// ---------- 1) หน่วยเสียงโฟนิกส์ (Phonemes) ----------
const p = (grapheme: string, ipa: string, thaiHint: string, category: PhonemeCategory): PhonemeUnit => ({
  grapheme,
  ipa,
  thaiHint,
  category,
  audioFile: `/audio/phonemes/${grapheme}.mp3`,
});

export const PHONEMES: PhonemeUnit[] = [
  // พยัญชนะเดี่ยว
  p('s', '/s/', 'ซ์ (ลมลอดไรฟัน ไม่เอะ)', 'consonant'),
  p('a', '/æ/', 'แอะ (อ้าปากกว้าง)', 'short_vowel'),
  p('t', '/t/', 'ท์ (ลมปลายลิ้น ไม่เทอะ)', 'consonant'),
  p('p', '/p/', 'พ์ (ระเบิดลมริมฝีปาก ไม่เพอะ)', 'consonant'),
  p('i', '/ɪ/', 'อิ (สระเสียงสั้น)', 'short_vowel'),
  p('n', '/n/', 'น์ (ลิ้นแตะเพดานเหงือก)', 'consonant'),
  p('c', '/k/', 'ค์ (ลมโคนลิ้น)', 'consonant'),
  p('k', '/k/', 'ค์ (ลมโคนลิ้น)', 'consonant'),
  p('ck', '/k/', 'ค์ (สะกดตัวท้าย)', 'digraph'),
  p('e', '/e/', 'เอะ (อ้าปากครึ่งเดียว)', 'short_vowel'),
  p('h', '/h/', 'ฮ์ (เป่าลมอุ่นๆ)', 'consonant'),
  p('r', '/r/', 'ร์ (ห่อปาก ลิ้นไม่แตะเพดาน)', 'consonant'),
  p('m', '/m/', 'ม์ (ปิดริมฝีปาก เสียงขึ้นจมูก)', 'consonant'),
  p('d', '/d/', 'ด์ (เสียงก้องปลายลิ้น)', 'consonant'),
  p('g', '/g/', 'ก์ (เสียงก้องโคนลิ้น)', 'consonant'),
  p('o', '/ɒ/', 'เอาะ (ปากกลม)', 'short_vowel'),
  p('u', '/ʌ/', 'อะ (เปิดปากผ่อนคลาย)', 'short_vowel'),
  p('l', '/l/', 'ล์ (ปลายลิ้นแตะหลังฟันบน)', 'consonant'),
  p('f', '/f/', 'ฟ์ (ฟันบนแตะริมฝีปากล่าง พ่นลม)', 'consonant'),
  p('b', '/b/', 'บ์ (ริมฝีปากประกบ เสียงก้อง)', 'consonant'),
  p('j', '/dʒ/', 'จ์ (เสียงก้องมีลม)', 'consonant'),
  p('z', '/z/', 'ซ์ (เสียงผึ้งบิน ลิ้นสั่น)', 'consonant'),
  p('w', '/w/', 'ว์ (ห่อปากกลม)', 'consonant'),
  p('v', '/v/', 'ฟ์ (ฟันบนแตะปากล่าง ลิ้นสั่น)', 'consonant'),
  p('y', '/j/', 'ย์ (เสียงเปิดปาก)', 'consonant'),
  p('x', '/ks/', 'คซ์ (เสียง k + s รวบกัน)', 'consonant'),
  p('q', '/kw/', 'คว์ (มักมาคู่กับ u)', 'consonant'),

  // พยัญชนะคู่ (Digraphs: 2 ตัวอักษรรวมกันเป็น 1 เสียงใหม่)
  p('sh', '/ʃ/', 'ช์ (เสียงจุ๊ๆ ห่อปากพ่นลมยาว)', 'digraph'),
  p('ch', '/tʃ/', 'ชึ (เสียงรถไฟ ระเบิดลมสั้น)', 'digraph'),
  p('th', '/θ/', 'ธ์ (แลบปลายลิ้นแตะฟันบน เป่าลม)', 'digraph'),
  p('ng', '/ŋ/', 'ง์ (เสียงขึ้นจมูก)', 'digraph'),

  // สระคู่และสระเสียงยาว (Long Vowels / Vowel Teams)
  p('ee', '/iː/', 'อี (ยิ้มกว้างเสียงยาว)', 'long_vowel'),
  p('ea', '/iː/', 'อี (ยิ้มกว้างเสียงยาว)', 'long_vowel'),
  p('oa', '/əʊ/', 'โอ (ปากห่อจากกว้างไปแคบ)', 'long_vowel'),
  p('ai', '/eɪ/', 'เอ (เสียงยาว)', 'long_vowel'),
  p('oo', '/uː/', 'อู (ห่อปากกลมเสียงยาว)', 'long_vowel'),

  // สระ Magic E (Split Digraphs)
  p('a_e', '/eɪ/', 'เอ (Magic e เปลี่ยน a เป็น เอ)', 'long_vowel'),
  p('i_e', '/aɪ/', 'ไอ (Magic e เปลี่ยน i เป็น ไอ)', 'long_vowel'),
  p('o_e', '/əʊ/', 'โอ (Magic e เปลี่ยน o เป็น โอ)', 'long_vowel'),
  p('u_e', '/juː/', 'ยู (Magic e เปลี่ยน u เป็น ยู/อู)', 'long_vowel'),
];

export const PHONEME_MAP: Record<string, PhonemeUnit> = Object.fromEntries(PHONEMES.map((x) => [x.grapheme, x]));

export const getPhoneme = (g: string): PhonemeUnit =>
  PHONEME_MAP[g] ?? p(g, `/${g}/`, g, /[aeiou]/.test(g) ? 'short_vowel' : 'consonant');

// ---------- 2) ฐานข้อมูลคำศัพท์ (Words) ----------
export const WORDS: WordItem[] = [];

const add = (
  stageId: StageId,
  lessonId: string,
  word: string,
  meaningThai: string,
  emoji: string,
  categoryTag: WordCategoryTag,
  phonemes: string[],
  blendGuideThai: string,
  extra: Partial<WordItem> = {},
): string => {
  const id = `w_${word.replace(/\s+/g, '_').toLowerCase()}_s${stageId}`;
  WORDS.push({
    id,
    stageId,
    lessonId,
    word,
    meaningThai,
    emoji,
    categoryTag,
    phonemes,
    blendGuideThai,
    ...extra,
  });
  return id;
};

// ---------- 3) รายชื่อบทเรียน (Lessons) ----------
export const LESSONS: LessonUnit[] = [];
const lesson = (stageId: StageId, order: number, title: string, targetPhonemes: string[], wordIds: string[]) =>
  LESSONS.push({ id: `stage${stageId}_lesson${order}`, stageId, order, title, targetPhonemes, wordIds });

// =========================================================================================
// STAGE 1: เสียงตัวอักษรเดี่ยวและการประสมคำตามหลัก Synthetic Phonics (สะสมเสียงทีละกลุ่ม)
// กฎเหล็ก: คำที่นำมาผสมต้องสร้างจากตัวอักษรที่เด็กเรียนในบทนั้น + บทก่อนหน้าเท่านั้น!
// =========================================================================================

// บทที่ 1.1: ชุดเริ่มต้นก้าวแรก: 10 เสียงตั้งต้น และการประสม 15 คำง่ายๆ
// ตัวอักษรและสระ 10 ตัว: s, a, t, p, i, n, m, d, g, o
// คำที่ผสม 15 คำ: sat, pat, tap, pan, mat, map, man, pin, tin, tip, sit, pit, pot, dot, dog
lesson(1, 1, 'ชุดเริ่มต้นก้าวแรก (10 เสียงตั้งต้น & 15 คำผสม CVC)', ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd', 'g', 'o'], [
  add(1, 'stage1_lesson1', 'sat', 'นั่งแล้ว', '🪑', 'action', ['s', 'a', 't'], 'ส + แอะ = แสะ ➔ แสะ + ท = แซ็ท'),
  add(1, 'stage1_lesson1', 'pat', 'ตบเบาๆ', '🤚', 'action', ['p', 'a', 't'], 'พ + แอะ = แพะ ➔ แพะ + ท = แพ็ท'),
  add(1, 'stage1_lesson1', 'tap', 'ก๊อกน้ำ', '🚰', 'object', ['t', 'a', 'p'], 'ท + แอะ = แทะ ➔ แทะ + พ = แท็พ'),
  add(1, 'stage1_lesson1', 'pan', 'กระทะ', '🍳', 'object', ['p', 'a', 'n'], 'พ + แอะ = แพะ ➔ แพะ + น = แพน'),
  add(1, 'stage1_lesson1', 'mat', 'เสื่อ', '🧶', 'object', ['m', 'a', 't'], 'ม + แอะ = แมะ ➔ แมะ + ท = แม็ท'),
  add(1, 'stage1_lesson1', 'map', 'แผนที่', '🗺️', 'object', ['m', 'a', 'p'], 'ม + แอะ = แมะ ➔ แมะ + พ = แม็พ'),
  add(1, 'stage1_lesson1', 'man', 'ผู้ชาย', '👨', 'body', ['m', 'a', 'n'], 'ม + แอะ = แมะ ➔ แมะ + น = แมน'),
  add(1, 'stage1_lesson1', 'pin', 'เข็มหมุด', '📌', 'object', ['p', 'i', 'n'], 'พ + อิ = พิ ➔ พิ + น = พิน'),
  add(1, 'stage1_lesson1', 'tin', 'กระป๋องสังกะสี', '🥫', 'object', ['t', 'i', 'n'], 'ท + อิ = ทิ ➔ ทิ + น = ทิน'),
  add(1, 'stage1_lesson1', 'tip', 'ปลายยอด', '🏔️', 'nature', ['t', 'i', 'p'], 'ท + อิ = ทิ ➔ ทิ + พ = ทิพ'),
  add(1, 'stage1_lesson1', 'sit', 'นั่งลง', '🧘', 'action', ['s', 'i', 't'], 'ซ + อิ = ซิ ➔ ซิ + ท = ซิท'),
  add(1, 'stage1_lesson1', 'pit', 'หลุม', '🕳️', 'nature', ['p', 'i', 't'], 'พ + อิ = พิ ➔ พิ + ท = พิท'),
  add(1, 'stage1_lesson1', 'pot', 'หม้อ', '🍲', 'object', ['p', 'o', 't'], 'พ + เอาะ = เพาะ ➔ เพาะ + ท = พ็อท'),
  add(1, 'stage1_lesson1', 'dot', 'จุด', '⚪', 'object', ['d', 'o', 't'], 'ด + เอาะ = เดาะ ➔ เดาะ + ท = ด็อท'),
  add(1, 'stage1_lesson1', 'dog', 'สุนัข', '🐶', 'animal', ['d', 'o', 'g'], 'ด + เอาะ = เดาะ ➔ เดาะ + ก = ด็อก'),
]);

// บทที่ 1.2: กลุ่มเสียงชุดที่ 2: c, k, e, h, r (+ เสียงเดิมจากบทที่ 1)
// สระใหม่: e (/e/ เอะ) และพยัญชนะ: c, k, h, r
lesson(1, 2, 'กลุ่มเสียงชุดที่ 2 (c, k, e, h, r)', ['c', 'k', 'e', 'h', 'r'], [
  add(1, 'stage1_lesson2', 'cat', 'แมว', '🐱', 'animal', ['c', 'a', 't'], 'ค + แอะ = แคะ ➔ แคะ + ท = แคท'),
  add(1, 'stage1_lesson2', 'hat', 'หมวก', '👒', 'object', ['h', 'a', 't'], 'ฮ + แอะ = แฮะ ➔ แฮะ + ท = แฮ็ท'),
  add(1, 'stage1_lesson2', 'rat', 'หนู', '🐀', 'animal', ['r', 'a', 't'], 'ร + แอะ = แระ ➔ แระ + ท = แร็ท'),
  add(1, 'stage1_lesson2', 'cap', 'หมวกแก๊ป', '🧢', 'object', ['c', 'a', 'p'], 'ค + แอะ = แคะ ➔ แคะ + พ = แค็พ'),
  add(1, 'stage1_lesson2', 'can', 'กระป๋อง', '🥫', 'object', ['c', 'a', 'n'], 'ค + แอะ = แคะ ➔ แคะ + น = แคน'),
  add(1, 'stage1_lesson2', 'pen', 'ปากกา', '🖊️', 'object', ['p', 'e', 'n'], 'พ + เอะ = เพะ ➔ เพะ + น = เพ็น'),
  add(1, 'stage1_lesson2', 'hen', 'แม่ไก่', '🐔', 'animal', ['h', 'e', 'n'], 'ฮ + เอะ = เฮะ ➔ เฮะ + น = เฮ็น'),
  add(1, 'stage1_lesson2', 'net', 'ตาข่าย', '🥅', 'object', ['n', 'e', 't'], 'น + เอะ = เนะ ➔ เนะ + ท = เน็ท'),
  add(1, 'stage1_lesson2', 'pet', 'สัตว์เลี้ยง', '🐶', 'animal', ['p', 'e', 't'], 'พ + เอะ = เพะ ➔ เพะ + ท = เพ็ท'),
  add(1, 'stage1_lesson2', 'red', 'สีแดง', '🔴', 'object', ['r', 'e', 'd'], 'ร + เอะ = เระ ➔ เระ + ด = เร็ด'),
  add(1, 'stage1_lesson2', 'kid', 'เด็ก', '🧒', 'body', ['k', 'i', 'd'], 'ค + อิ = คิ ➔ คิ + ด = คิด'),
  add(1, 'stage1_lesson2', 'hit', 'ตี', '🏏', 'action', ['h', 'i', 't'], 'ฮ + อิ = ฮิ ➔ ฮิ + ท = ฮิท'),
  add(1, 'stage1_lesson2', 'sad', 'เศร้า', '😢', 'action', ['s', 'a', 'd'], 'ส + แอะ = แสะ ➔ แสะ + ด = แซ็ด'),
]);

// บทที่ 1.3: กลุ่มเสียงชุดที่ 3: u, l, f, b (+ เสียงเดิม)
// สระใหม่: u (/ʌ/ อะ) และพยัญชนะ: l, f, b (สระครบ 5 ตัวแล้ว: a, e, i, o, u)
lesson(1, 3, 'กลุ่มเสียงชุดที่ 3 (u, l, f, b)', ['u', 'l', 'f', 'b'], [
  add(1, 'stage1_lesson3', 'log', 'ท่อนไม้', '🪵', 'nature', ['l', 'o', 'g'], 'ล + เอาะ = เลาะ ➔ เลาะ + ก = ล็อก'),
  add(1, 'stage1_lesson3', 'hot', 'ร้อน', '🔥', 'nature', ['h', 'o', 't'], 'ฮ + เอาะ = เหาะ ➔ เหาะ + ท = ฮ็อท'),
  add(1, 'stage1_lesson3', 'top', 'ลูกข่าง', '🪀', 'object', ['t', 'o', 'p'], 'ท + เอาะ = เทาะ ➔ เทาะ + พ = ท็อพ'),
  add(1, 'stage1_lesson3', 'hop', 'กระโดด', '🐇', 'action', ['h', 'o', 'p'], 'ฮ + เอาะ = เหาะ ➔ เหาะ + พ = ฮ็อพ'),
  add(1, 'stage1_lesson3', 'sun', 'ดวงอาทิตย์', '☀️', 'nature', ['s', 'u', 'n'], 'ส + อะ = สะ ➔ สะ + น = ซัน'),
  add(1, 'stage1_lesson3', 'run', 'วิ่ง', '🏃', 'action', ['r', 'u', 'n'], 'ร + อะ = ระ ➔ ระ + น = รัน'),
  add(1, 'stage1_lesson3', 'fun', 'สนุก', '🎈', 'action', ['f', 'u', 'n'], 'ฟ + อะ = ฟะ ➔ ฟะ + น = ฟัน'),
  add(1, 'stage1_lesson3', 'cup', 'ถ้วย', '☕', 'object', ['c', 'u', 'p'], 'ค + อะ = คะ ➔ คะ + พ = คัพ'),
  add(1, 'stage1_lesson3', 'bug', 'แมลง', '🐞', 'animal', ['b', 'u', 'g'], 'บ + อะ = บะ ➔ บะ + ก = บั๊ก'),
  add(1, 'stage1_lesson3', 'mug', 'แก้วมัค', '🍺', 'object', ['m', 'u', 'g'], 'ม + อะ = มะ ➔ มะ + ก = มั๊ก'),
  add(1, 'stage1_lesson3', 'hug', 'กอด', '🤗', 'action', ['h', 'u', 'g'], 'ฮ + อะ = ฮะ ➔ ฮะ + ก = ฮัก'),
  add(1, 'stage1_lesson3', 'big', 'ใหญ่', '🐘', 'nature', ['b', 'i', 'g'], 'บ + อิ = บิ ➔ บิ + ก = บิ๊ก'),
  add(1, 'stage1_lesson3', 'pig', 'หมู', '🐷', 'animal', ['p', 'i', 'g'], 'พ + อิ = พิ ➔ พิ + ก = พิก'),
  add(1, 'stage1_lesson3', 'bat', 'ค้างคาว', '🦇', 'animal', ['b', 'a', 't'], 'บ + แอะ = แบะ ➔ แบะ + ท = แบ็ท'),
  add(1, 'stage1_lesson3', 'bed', 'เตียง', '🛏️', 'object', ['b', 'e', 'd'], 'บ + เอะ = เบะ ➔ เบะ + ด = เบ็ด'),
  add(1, 'stage1_lesson3', 'leg', 'ขา', '🦵', 'body', ['l', 'e', 'g'], 'ล + เอะ = เละ ➔ เละ + ก = เล็ก'),
  add(1, 'stage1_lesson3', 'fan', 'พัดลม', '🪭', 'object', ['f', 'a', 'n'], 'ฟ + แอะ = แฟะ ➔ แฟะ + น = แฟน'),
  add(1, 'stage1_lesson3', 'fin', 'ครีบปลา', '🦈', 'animal', ['f', 'i', 'n'], 'ฟ + อิ = ฟิ ➔ ฟิ + น = ฟิน'),
]);

// บทที่ 1.4: กลุ่มเสียงชุดที่ 4: j, z, w, v, y, x, q (+ ทุกเสียงก่อนหน้า)
// พยัญชนะชุดสุดท้ายของพยัญชนะเดี่ยว ครบทั้ง 26 ตัวอักษร
lesson(1, 4, 'กลุ่มเสียงชุดที่ 4 (j, z, w, v, y, x, q)', ['j', 'z', 'w', 'v', 'y', 'x', 'q'], [
  add(1, 'stage1_lesson4', 'jam', 'แยม', '🍓', 'food', ['j', 'a', 'm'], 'จ + แอะ = แจ๊ะ ➔ แจ๊ะ + ม = แจม'),
  add(1, 'stage1_lesson4', 'jet', 'เครื่องบินเจ็ต', '✈️', 'object', ['j', 'e', 't'], 'จ + เอะ = เจะ ➔ เจะ + ท = เจ็ท'),
  add(1, 'stage1_lesson4', 'jug', 'เหยือกน้ำ', '🫖', 'object', ['j', 'u', 'g'], 'จ + อะ = จะ ➔ จะ + ก = จั๊ก'),
  add(1, 'stage1_lesson4', 'zip', 'ซิป', '🤐', 'object', ['z', 'i', 'p'], 'ซ(สั่น) + อิ = ซิ ➔ ซิ + พ = ซิพ'),
  add(1, 'stage1_lesson4', 'web', 'ใยแมงมุม', '🕸️', 'nature', ['w', 'e', 'b'], 'ว + เอะ = เวะ ➔ เวะ + บ = เว็บ'),
  add(1, 'stage1_lesson4', 'wet', 'เปียก', '💦', 'nature', ['w', 'e', 't'], 'ว + เอะ = เวะ ➔ เวะ + ท = เว็ท'),
  add(1, 'stage1_lesson4', 'wig', 'วิกผม', '💇', 'object', ['w', 'i', 'g'], 'ว + อิ = วิ ➔ วิ + ก = วิก'),
  add(1, 'stage1_lesson4', 'win', 'ชนะ', '🏆', 'action', ['w', 'i', 'n'], 'ว + อิ = วิ ➔ วิ + น = วิน'),
  add(1, 'stage1_lesson4', 'van', 'รถตู้', '🚐', 'object', ['v', 'a', 'n'], 'ฟ(สั่น) + แอะ = แฟะ ➔ แฟะ + น = แวน'),
  add(1, 'stage1_lesson4', 'vet', 'สัตวแพทย์', '🩺', 'body', ['v', 'e', 't'], 'ฟ(สั่น) + เอะ = เฟะ ➔ เฟะ + ท = เว็ท'),
  add(1, 'stage1_lesson4', 'yak', 'จามรี', '🦬', 'animal', ['y', 'a', 'k'], 'ย + แอะ = แยะ ➔ แยะ + ค = แย็ก'),
  add(1, 'stage1_lesson4', 'yes', 'ใช่/ตกลง', '👍', 'action', ['y', 'e', 's'], 'ย + เอะ = เยะ ➔ เยะ + ส = เยส'),
  add(1, 'stage1_lesson4', 'fox', 'สุนัขจิ้งจอก', '🦊', 'animal', ['f', 'o', 'x'], 'ฟ + เอาะ = เฝาะ ➔ เฝาะ + คซ์ = ฟ็อกซ์'),
  add(1, 'stage1_lesson4', 'box', 'กล่อง', '📦', 'object', ['b', 'o', 'x'], 'บ + เอาะ = เบาะ ➔ เบาะ + คซ์ = บ็อกซ์'),
  add(1, 'stage1_lesson4', 'six', 'เลขหก', '6️⃣', 'object', ['s', 'i', 'x'], 'ส + อิ = สิ ➔ สิ + คซ์ = ซิกส์'),
]);

// =========================================================================================
// STAGE 2: ตระกูลคำ (Word Families) เพื่อฝึกความคล่องในการอ่านและสะกดคำ CVC
// =========================================================================================

// บทที่ 2.1: ครอบครัวคำสระ -a- (-at, -an, -ap)
lesson(2, 1, 'ตระกูลคำสระ -a- (-at, -an, -ap)', ['a', 't', 'n', 'p'], [
  add(2, 'stage2_lesson1', 'cat', 'แมว', '🐱', 'animal', ['c', 'a', 't'], 'ค + -at(แอ็ท) = แคท'),
  add(2, 'stage2_lesson1', 'bat', 'ค้างคาว', '🦇', 'animal', ['b', 'a', 't'], 'บ + -at(แอ็ท) = แบ็ท'),
  add(2, 'stage2_lesson1', 'hat', 'หมวก', '👒', 'object', ['h', 'a', 't'], 'ฮ + -at(แอ็ท) = แฮ็ท'),
  add(2, 'stage2_lesson1', 'mat', 'เสื่อ', '🧶', 'object', ['m', 'a', 't'], 'ม + -at(แอ็ท) = แม็ท'),
  add(2, 'stage2_lesson1', 'rat', 'หนู', '🐀', 'animal', ['r', 'a', 't'], 'ร + -at(แอ็ท) = แร็ท'),
  add(2, 'stage2_lesson1', 'pan', 'กระทะ', '🍳', 'object', ['p', 'a', 'n'], 'พ + -an(แอน) = แพน'),
  add(2, 'stage2_lesson1', 'man', 'ผู้ชาย', '👨', 'body', ['m', 'a', 'n'], 'ม + -an(แอน) = แมน'),
  add(2, 'stage2_lesson1', 'fan', 'พัดลม', '🪭', 'object', ['f', 'a', 'n'], 'ฟ + -an(แอน) = แฟน'),
  add(2, 'stage2_lesson1', 'van', 'รถตู้', '🚐', 'object', ['v', 'a', 'n'], 'ว + -an(แอน) = แวน'),
  add(2, 'stage2_lesson1', 'cap', 'หมวกแก๊ป', '🧢', 'object', ['c', 'a', 'p'], 'ค + -ap(แอ็พ) = แค็พ'),
  add(2, 'stage2_lesson1', 'map', 'แผนที่', '🗺️', 'object', ['m', 'a', 'p'], 'ม + -ap(แอ็พ) = แม็พ'),
  add(2, 'stage2_lesson1', 'tap', 'ก๊อกน้ำ', '🚰', 'object', ['t', 'a', 'p'], 'ท + -ap(แอ็พ) = แท็พ'),
]);

// บทที่ 2.2: ครอบครัวคำสระ -i- (-in, -it, -ip, -ig)
lesson(2, 2, 'ตระกูลคำสระ -i- (-in, -it, -ip, -ig)', ['i', 'n', 't', 'p', 'g'], [
  add(2, 'stage2_lesson2', 'pin', 'เข็มหมุด', '📌', 'object', ['p', 'i', 'n'], 'พ + -in(อิน) = พิน'),
  add(2, 'stage2_lesson2', 'tin', 'กระป๋อง', '🥫', 'object', ['t', 'i', 'n'], 'ท + -in(อิน) = ทิน'),
  add(2, 'stage2_lesson2', 'fin', 'ครีบปลา', '🦈', 'animal', ['f', 'i', 'n'], 'ฟ + -in(อิน) = ฟิน'),
  add(2, 'stage2_lesson2', 'win', 'ชนะ', '🏆', 'action', ['w', 'i', 'n'], 'ว + -in(อิน) = วิน'),
  add(2, 'stage2_lesson2', 'sit', 'นั่ง', '🧘', 'action', ['s', 'i', 't'], 'ส + -it(อิท) = ซิท'),
  add(2, 'stage2_lesson2', 'hit', 'ตี', '🏏', 'action', ['h', 'i', 't'], 'ฮ + -it(อิท) = ฮิท'),
  add(2, 'stage2_lesson2', 'fit', 'พอดีตัว', '👕', 'object', ['f', 'i', 't'], 'ฟ + -it(อิท) = ฟิท'),
  add(2, 'stage2_lesson2', 'lip', 'ริมฝีปาก', '👄', 'body', ['l', 'i', 'p'], 'ล + -ip(อิพ) = ลิพ'),
  add(2, 'stage2_lesson2', 'zip', 'ซิป', '🤐', 'object', ['z', 'i', 'p'], 'ซ + -ip(อิพ) = ซิพ'),
  add(2, 'stage2_lesson2', 'tip', 'ปลายยอด', '🏔️', 'nature', ['t', 'i', 'p'], 'ท + -ip(อิพ) = ทิพ'),
  add(2, 'stage2_lesson2', 'pig', 'หมู', '🐷', 'animal', ['p', 'i', 'g'], 'พ + -ig(อิก) = พิก'),
  add(2, 'stage2_lesson2', 'big', 'ใหญ่', '🐘', 'nature', ['b', 'i', 'g'], 'บ + -ig(อิก) = บิ๊ก'),
  add(2, 'stage2_lesson2', 'wig', 'วิกผม', '💇', 'object', ['w', 'i', 'g'], 'ว + -ig(อิก) = วิก'),
]);

// บทที่ 2.3: ครอบครัวคำสระ -o- (-op, -ot, -og, -ox)
lesson(2, 3, 'ตระกูลคำสระ -o- (-op, -ot, -og, -ox)', ['o', 'p', 't', 'g', 'x'], [
  add(2, 'stage2_lesson3', 'hop', 'กระโดด', '🐇', 'action', ['h', 'o', 'p'], 'ฮ + -op(อ็อพ) = ฮ็อพ'),
  add(2, 'stage2_lesson3', 'mop', 'ไม้ถูพื้น', '🧹', 'object', ['m', 'o', 'p'], 'ม + -op(อ็อพ) = ม็อพ'),
  add(2, 'stage2_lesson3', 'top', 'ลูกข่าง', '🪀', 'object', ['t', 'o', 'p'], 'ท + -op(อ็อพ) = ท็อพ'),
  add(2, 'stage2_lesson3', 'pot', 'หม้อ', '🍲', 'object', ['p', 'o', 't'], 'พ + -ot(อ็อท) = พ็อท'),
  add(2, 'stage2_lesson3', 'hot', 'ร้อน', '🔥', 'nature', ['h', 'o', 't'], 'ฮ + -ot(อ็อท) = ฮ็อท'),
  add(2, 'stage2_lesson3', 'cot', 'เตียงเด็ก', '🛏️', 'object', ['c', 'o', 't'], 'ค + -ot(อ็อท) = ค็อท'),
  add(2, 'stage2_lesson3', 'dot', 'จุดกลม', '🟢', 'object', ['d', 'o', 't'], 'ด + -ot(อ็อท) = ด็อท'),
  add(2, 'stage2_lesson3', 'dog', 'สุนัข', '🐶', 'animal', ['d', 'o', 'g'], 'ด + -og(ออก) = ด็อก'),
  add(2, 'stage2_lesson3', 'log', 'ท่อนไม้', '🪵', 'nature', ['l', 'o', 'g'], 'ล + -og(ออก) = ล็อก'),
  add(2, 'stage2_lesson3', 'box', 'กล่อง', '📦', 'object', ['b', 'o', 'x'], 'บ + -ox(อ็อกซ์) = บ็อกซ์'),
  add(2, 'stage2_lesson3', 'fox', 'สุนัขจิ้งจอก', '🦊', 'animal', ['f', 'o', 'x'], 'ฟ + -ox(อ็อกซ์) = ฟ็อกซ์'),
]);

// บทที่ 2.4: ครอบครัวคำสระ -e- และ -u- (-en, -et, -ed, -ug, -un, -up)
lesson(2, 4, 'ตระกูลคำสระ -e- และ -u-', ['e', 'u', 'n', 't', 'd', 'g', 'p'], [
  add(2, 'stage2_lesson4', 'pen', 'ปากกา', '🖊️', 'object', ['p', 'e', 'n'], 'พ + -en(เอ็น) = เพ็น'),
  add(2, 'stage2_lesson4', 'ten', 'สิบ', '🔟', 'object', ['t', 'e', 'n'], 'ท + -en(เอ็น) = เท็น'),
  add(2, 'stage2_lesson4', 'hen', 'แม่ไก่', '🐔', 'animal', ['h', 'e', 'n'], 'ฮ + -en(เอ็น) = เฮ็น'),
  add(2, 'stage2_lesson4', 'net', 'ตาข่าย', '🥅', 'object', ['n', 'e', 't'], 'น + -et(เอ็ท) = เน็ท'),
  add(2, 'stage2_lesson4', 'pet', 'สัตว์เลี้ยง', '🐶', 'animal', ['p', 'e', 't'], 'พ + -et(เอ็ท) = เพ็ท'),
  add(2, 'stage2_lesson4', 'wet', 'เปียก', '💦', 'nature', ['w', 'e', 't'], 'ว + -et(เอ็ท) = เว็ท'),
  add(2, 'stage2_lesson4', 'bed', 'เตียง', '🛏️', 'object', ['b', 'e', 'd'], 'บ + -ed(เอ็ด) = เบ็ด'),
  add(2, 'stage2_lesson4', 'red', 'สีแดง', '🔴', 'object', ['r', 'e', 'd'], 'ร + -ed(เอ็ด) = เร็ด'),
  add(2, 'stage2_lesson4', 'bug', 'แมลง', '🐞', 'animal', ['b', 'u', 'g'], 'บ + -ug(อั๊ก) = บั๊ก'),
  add(2, 'stage2_lesson4', 'mug', 'แก้วมัค', '☕', 'object', ['m', 'u', 'g'], 'ม + -ug(อั๊ก) = มั๊ก'),
  add(2, 'stage2_lesson4', 'hug', 'กอด', '🤗', 'action', ['h', 'u', 'g'], 'ฮ + -ug(อั๊ก) = ฮัก'),
  add(2, 'stage2_lesson4', 'rug', 'พรมเช็ดเท้า', '🧶', 'object', ['r', 'u', 'g'], 'ร + -ug(อั๊ก) = รัก'),
  add(2, 'stage2_lesson4', 'sun', 'ดวงอาทิตย์', '☀️', 'nature', ['s', 'u', 'n'], 'ส + -un(อัน) = ซัน'),
  add(2, 'stage2_lesson4', 'run', 'วิ่ง', '🏃', 'action', ['r', 'u', 'n'], 'ร + -un(อัน) = รัน'),
  add(2, 'stage2_lesson4', 'fun', 'สนุก', '🎈', 'action', ['f', 'u', 'n'], 'ฟ + -un(อัน) = ฟัน'),
  add(2, 'stage2_lesson4', 'bun', 'ขนมปังก้อน', '🍞', 'food', ['b', 'u', 'n'], 'บ + -un(อัน) = บัน'),
  add(2, 'stage2_lesson4', 'cup', 'ถ้วย', '☕', 'object', ['c', 'u', 'p'], 'ค + -up(อัพ) = คัพ'),
]);

// =========================================================================================
// STAGE 3: พยัญชนะคู่ (Digraphs) และพยัญชนะควบกล้ำ (Consonant Blends)
// =========================================================================================

// บทที่ 3.1: พยัญชนะคู่ sh (/ʃ/) และ ch (/tʃ/)
lesson(3, 1, 'พยัญชนะคู่ sh และ ch', ['sh', 'ch'], [
  add(3, 'stage3_lesson1', 'fish', 'ปลา', '🐟', 'food', ['f', 'i', 'sh'], 'ฟ + อิ = ฟิ ➔ ฟิ + ช์(sh) = ฟิช'),
  add(3, 'stage3_lesson1', 'shop', 'ร้านค้า', '🏪', 'object', ['sh', 'o', 'p'], 'ช์(sh) + เอาะ = ช็อ ➔ ช็อ + พ = ช็อพ'),
  add(3, 'stage3_lesson1', 'dish', 'จาน', '🍽️', 'object', ['d', 'i', 'sh'], 'ด + อิ = ดิ ➔ ดิ + ช์(sh) = ดิช'),
  add(3, 'stage3_lesson1', 'ship', 'เรือเดินสมุทร', '🚢', 'object', ['sh', 'i', 'p'], 'ช์(sh) + อิ = ชิ ➔ ชิ + พ = ชิพ'),
  add(3, 'stage3_lesson1', 'shut', 'ปิดประตู', '🚪', 'action', ['sh', 'u', 't'], 'ช์(sh) + อะ = ชะ ➔ ชะ + ท = ชัท'),
  add(3, 'stage3_lesson1', 'chin', 'คาง', '🧔', 'body', ['ch', 'i', 'n'], 'ชึ(ch) + อิ = ชิ ➔ ชิ + น = ชิน'),
  add(3, 'stage3_lesson1', 'chop', 'สับ/หั่น', '🔪', 'action', ['ch', 'o', 'p'], 'ชึ(ch) + เอาะ = ช็อ ➔ ช็อ + พ = ช็อพ'),
  add(3, 'stage3_lesson1', 'chip', 'มันฝรั่งทอด', '🍟', 'food', ['ch', 'i', 'p'], 'ชึ(ch) + อิ = ชิ ➔ ชิ + พ = ชิพ'),
  add(3, 'stage3_lesson1', 'rich', 'ร่ำรวย', '💰', 'action', ['r', 'i', 'ch'], 'ร + อิ = ริ ➔ ริ + ชึ(ch) = ริช'),
]);

// บทที่ 3.2: พยัญชนะคู่ th (/θ/), ng (/ŋ/), ck (/k/)
lesson(3, 2, 'พยัญชนะคู่ th, ng และ ck', ['th', 'ng', 'ck'], [
  add(3, 'stage3_lesson2', 'thin', 'ผอมบาง', '📏', 'object', ['th', 'i', 'n'], 'ธ์(แลบลิ้น) + อิ = ธิ ➔ ธิ + น = ธิน'),
  add(3, 'stage3_lesson2', 'bath', 'อาบน้ำ', '🛁', 'action', ['b', 'a', 'th'], 'บ + แอะ = แบะ ➔ แบะ + ธ์(th) = บาธ'),
  add(3, 'stage3_lesson2', 'moth', 'ผีเสื้อกลางคืน', '🦋', 'animal', ['m', 'o', 'th'], 'ม + เอาะ = เมาะ ➔ เมาะ + ธ์(th) = มอธ'),
  add(3, 'stage3_lesson2', 'ring', 'แหวน', '💍', 'object', ['r', 'i', 'ng'], 'ร + อิ = ริ ➔ ริ + ง์(ng) = ริง'),
  add(3, 'stage3_lesson2', 'king', 'พระราชา', '👑', 'object', ['k', 'i', 'ng'], 'ค + อิ = คิ ➔ คิ + ง์(ng) = คิง'),
  add(3, 'stage3_lesson2', 'sing', 'ร้องเพลง', '🎤', 'action', ['s', 'i', 'ng'], 'ส + อิ = สิ ➔ สิ + ง์(ng) = ซิง'),
  add(3, 'stage3_lesson2', 'wing', 'ปีกนก', '🪶', 'animal', ['w', 'i', 'ng'], 'ว + อิ = วิ ➔ วิ + ง์(ng) = วิง'),
  add(3, 'stage3_lesson2', 'song', 'บทเพลง', '🎵', 'nature', ['s', 'o', 'ng'], 'ส + เอาะ = เสาะ ➔ เสาะ + ง์(ng) = ซ็อง'),
  add(3, 'stage3_lesson2', 'duck', 'เป็ด', '🦆', 'animal', ['d', 'u', 'ck'], 'ด + อะ = ดะ ➔ ดะ + ค์(ck) = ดั๊ก'),
  add(3, 'stage3_lesson2', 'rock', 'ก้อนหิน', '🪨', 'nature', ['r', 'o', 'ck'], 'ร + เอาะ = เราะ ➔ เราะ + ค์(ck) = ร็อค'),
  add(3, 'stage3_lesson2', 'sock', 'ถุงเท้า', '🧦', 'object', ['s', 'o', 'ck'], 'ส + เอาะ = เสาะ ➔ เสาะ + ค์(ck) = ซ็อค'),
  add(3, 'stage3_lesson2', 'neck', 'ลำคอ', '🦒', 'body', ['n', 'e', 'ck'], 'น + เอะ = เนะ ➔ เนะ + ค์(ck) = เน็ค'),
]);

// บทที่ 3.3: พยัญชนะควบกล้ำ (Consonant Blends: ออกทั้ง 2 เสียงเชื่อมกัน)
lesson(3, 3, 'พยัญชนะควบกล้ำ (cl, st, sw, fr, cr, dr, tr)', ['c', 'l', 's', 't', 'w', 'f', 'r', 'd'], [
  add(3, 'stage3_lesson3', 'clap', 'ปรบมือ', '👏', 'action', ['c', 'l', 'a', 'p'], 'ค + ล ➔ คล + แอะ = แคล ➔ แคล + พ = แคล็พ'),
  add(3, 'stage3_lesson3', 'stop', 'หยุด', '🛑', 'action', ['s', 't', 'o', 'p'], 'ส + ท ➔ สท + เอาะ = สเตาะ ➔ สเตาะ + พ = สต็อพ'),
  add(3, 'stage3_lesson3', 'swim', 'ว่ายน้ำ', '🏊', 'action', ['s', 'w', 'i', 'm'], 'ส + ว ➔ สว + อิ = สวิ ➔ สวิ + ม = สวิม'),
  add(3, 'stage3_lesson3', 'jump', 'กระโดด', '🦘', 'action', ['j', 'u', 'm', 'p'], 'จ + อะ = จะ ➔ จะ + ม = จัม ➔ จัม + พ = จัมพ์'),
  add(3, 'stage3_lesson3', 'frog', 'กบ', '🐸', 'animal', ['f', 'r', 'o', 'g'], 'ฟ + ร ➔ ฟร + เอาะ = ฟเราะ ➔ ฟเราะ + ก = ฟร็อก'),
  add(3, 'stage3_lesson3', 'crab', 'ปู', '🦀', 'animal', ['c', 'r', 'a', 'b'], 'ค + ร ➔ คร + แอะ = แคร ➔ แคร + บ = แครบ'),
  add(3, 'stage3_lesson3', 'drum', 'กลอง', '🥁', 'object', ['d', 'r', 'u', 'm'], 'ด + ร ➔ ดร + อะ = ดระ ➔ ดระ + ม = ดรัม'),
  add(3, 'stage3_lesson3', 'trap', 'กับดัก', '🪤', 'object', ['t', 'r', 'a', 'p'], 'ท + ร ➔ ทร + แอะ = แทร ➔ แทร + พ = แทร็พ'),
  add(3, 'stage3_lesson3', 'nest', 'รังนก', '🪺', 'nature', ['n', 'e', 's', 't'], 'น + เอะ = เนะ ➔ เนะ + ส = เนส ➔ เนส + ท = เนสท์'),
  add(3, 'stage3_lesson3', 'fast', 'เร็ว', '⚡', 'action', ['f', 'a', 's', 't'], 'ฟ + แอะ = แฟะ ➔ แฟะ + ส = ฟาส ➔ ฟาส + ท = ฟาสท์'),
]);

// =========================================================================================
// STAGE 4: สระเสียงยาว (Long Vowels) และกฎ Magic E (Silent E)
// =========================================================================================

// บทที่ 4.1: Magic E สระ a_e (เทียบสระสั้น แอะ ➔ สระยาว เอ)
lesson(4, 1, 'Magic e สระ a_e (เทียบ cap ➔ cape)', ['a', 'a_e'], [
  add(4, 'stage4_lesson1', 'cap', 'หมวกแก๊ป', '🧢', 'object', ['c', 'a', 'p'], 'ค + แอะ + พ = แค็พ (เสียงสั้น)', { contrastPairId: 'w_cape_s4' }),
  add(4, 'stage4_lesson1', 'cape', 'ผ้าคลุม', '🦸', 'object', ['c', 'a', 'p', 'e'], 'ค + เอ(magic e) + พ = เคพ (เสียงยาว)', { contrastPairId: 'w_cap_s4', magicE: true }),
  add(4, 'stage4_lesson1', 'tap', 'ก๊อกน้ำ', '🚰', 'object', ['t', 'a', 'p'], 'ท + แอะ + พ = แท็พ (เสียงสั้น)', { contrastPairId: 'w_tape_s4' }),
  add(4, 'stage4_lesson1', 'tape', 'เทปกาว', '📼', 'object', ['t', 'a', 'p', 'e'], 'ท + เอ(magic e) + พ = เทพ (เสียงยาว)', { contrastPairId: 'w_tap_s4', magicE: true }),
  add(4, 'stage4_lesson1', 'mat', 'เสื่อ', '🧶', 'object', ['m', 'a', 't'], 'ม + แอะ + ท = แม็ท (เสียงสั้น)', { contrastPairId: 'w_mate_s4' }),
  add(4, 'stage4_lesson1', 'mate', 'เพื่อนคู่หู', '👦', 'body', ['m', 'a', 't', 'e'], 'ม + เอ(magic e) + ท = เมท (เสียงยาว)', { contrastPairId: 'w_mat_s4', magicE: true }),
  add(4, 'stage4_lesson1', 'cake', 'เค้ก', '🎂', 'food', ['c', 'a', 'k', 'e'], 'ค + เอ(magic e) + ค = เค้ก', { magicE: true }),
  add(4, 'stage4_lesson1', 'lake', 'ทะเลสาบ', '🏞️', 'nature', ['l', 'a', 'k', 'e'], 'ล + เอ(magic e) + ค = เลค', { magicE: true }),
]);

// บทที่ 4.2: Magic E สระ i_e (ไอ) และ o_e (โอ)
lesson(4, 2, 'Magic e สระ i_e (ไอ) และ o_e (โอ)', ['i_e', 'o_e'], [
  add(4, 'stage4_lesson2', 'kit', 'ชุดอุปกรณ์', '🧰', 'object', ['k', 'i', 't'], 'ค + อิ + ท = คิด (เสียงสั้น)', { contrastPairId: 'w_kite_s4' }),
  add(4, 'stage4_lesson2', 'kite', 'ว่าว', '🪁', 'object', ['k', 'i', 't', 'e'], 'ค + ไอ(magic e) + ท = ไคท์ (เสียงยาว)', { contrastPairId: 'w_kit_s4', magicE: true }),
  add(4, 'stage4_lesson2', 'pin', 'เข็มหมุด', '📍', 'object', ['p', 'i', 'n'], 'พ + อิ + น = พิน (เสียงสั้น)', { contrastPairId: 'w_pine_s4' }),
  add(4, 'stage4_lesson2', 'pine', 'ต้นสน', '🌲', 'nature', ['p', 'i', 'n', 'e'], 'พ + ไอ(magic e) + น = ไพน์ (เสียงยาว)', { contrastPairId: 'w_pin_s4', magicE: true }),
  add(4, 'stage4_lesson2', 'hop', 'กระโดด', '🐇', 'action', ['h', 'o', 'p'], 'ฮ + เอาะ + พ = ฮ็อพ (เสียงสั้น)', { contrastPairId: 'w_hope_s4' }),
  add(4, 'stage4_lesson2', 'hope', 'ความหวัง', '🙏', 'action', ['h', 'o', 'p', 'e'], 'ฮ + โอ(magic e) + พ = โฮพ (เสียงยาว)', { contrastPairId: 'w_hop_s4', magicE: true }),
  add(4, 'stage4_lesson2', 'cub', 'ลูกสิงโต/หมี', '🐻', 'animal', ['c', 'u', 'b'], 'ค + อะ + บ = คับ (เสียงสั้น)', { contrastPairId: 'w_cube_s4' }),
  add(4, 'stage4_lesson2', 'cube', 'ลูกบาศก์', '🧊', 'object', ['c', 'u', 'b', 'e'], 'ค + ยู(magic e) + บ = คิวบ์ (เสียงยาว)', { contrastPairId: 'w_cub_s4', magicE: true }),
  add(4, 'stage4_lesson2', 'bone', 'กระดูก', '🦴', 'body', ['b', 'o', 'n', 'e'], 'บ + โอ(magic e) + น = โบน', { magicE: true }),
  add(4, 'stage4_lesson2', 'home', 'บ้าน', '🏠', 'object', ['h', 'o', 'm', 'e'], 'ฮ + โอ(magic e) + ม = โฮม', { magicE: true }),
]);

// บทที่ 4.3: คู่สระเสียงยาว (Vowel Teams: ee, ea, oa, ai, oo)
lesson(4, 3, 'คู่สระเสียงยาว (ee, ea, oa, ai, oo)', ['ee', 'ea', 'oa', 'ai', 'oo'], [
  add(4, 'stage4_lesson3', 'bee', 'ผึ้ง', '🐝', 'animal', ['b', 'ee'], 'บ + อี(ee) = บี'),
  add(4, 'stage4_lesson3', 'tree', 'ต้นไม้', '🌳', 'nature', ['t', 'r', 'ee'], 'ทร(tr) + อี(ee) = ทรี'),
  add(4, 'stage4_lesson3', 'feet', 'เท้า', '🦶', 'body', ['f', 'ee', 't'], 'ฟ + อี(ee) = ฟี ➔ ฟี + ท = ฟีท'),
  add(4, 'stage4_lesson3', 'seed', 'เมล็ดพืช', '🌱', 'nature', ['s', 'ee', 'd'], 'ซ + อี(ee) = ซี ➔ ซี + ด = ซีด'),
  add(4, 'stage4_lesson3', 'meat', 'เนื้อสัตว์', '🥩', 'food', ['m', 'ea', 't'], 'ม + อี(ea) = มี ➔ มี + ท = มีท'),
  add(4, 'stage4_lesson3', 'tea', 'น้ำชา', '🍵', 'food', ['t', 'ea'], 'ท + อี(ea) = ที'),
  add(4, 'stage4_lesson3', 'seat', 'ที่นั่ง', '🪑', 'object', ['s', 'ea', 't'], 'ซ + อี(ea) = ซี ➔ ซี + ท = ซีท'),
  add(4, 'stage4_lesson3', 'leaf', 'ใบไม้', '🍃', 'nature', ['l', 'ea', 'f'], 'ล + อี(ea) = ลี ➔ ลี + ฟ = ลีฟ'),
  add(4, 'stage4_lesson3', 'boat', 'เรือพาย', '⛵', 'object', ['b', 'oa', 't'], 'บ + โอ(oa) = โบ ➔ โบ + ท = โบท'),
  add(4, 'stage4_lesson3', 'goat', 'แพะ', '🐐', 'animal', ['g', 'oa', 't'], 'ก + โอ(oa) = โก ➔ โก + ท = โกท'),
  add(4, 'stage4_lesson3', 'coat', 'เสื้อโค้ต', '🧥', 'object', ['c', 'oa', 't'], 'ค + โอ(oa) = โค ➔ โค + ท = โคท'),
  add(4, 'stage4_lesson3', 'soap', 'สบู่', '🧼', 'object', ['s', 'oa', 'p'], 'ซ + โอ(oa) = โซ ➔ โซ + พ = โซพ'),
  add(4, 'stage4_lesson3', 'rain', 'สายฝน', '🌧️', 'nature', ['r', 'ai', 'n'], 'ร + เอ(ai) = เร ➔ เร + น = เรน'),
  add(4, 'stage4_lesson3', 'train', 'รถไฟ', '🚂', 'object', ['t', 'r', 'ai', 'n'], 'ทร(tr) + เอ(ai) = เทร ➔ เทร + น = เทรน'),
  add(4, 'stage4_lesson3', 'tail', 'หางสัตว์', '🐒', 'animal', ['t', 'ai', 'l'], 'ท + เอ(ai) = เท ➔ เท + ล = เทล'),
  add(4, 'stage4_lesson3', 'mail', 'จดหมาย', '✉️', 'object', ['m', 'ai', 'l'], 'ม + เอ(ai) = เม ➔ เม + ล = เมล'),
  add(4, 'stage4_lesson3', 'zoo', 'สวนสัตว์', '🦒', 'nature', ['z', 'oo'], 'ซ(สั่น) + อู(oo) = ซู'),
  add(4, 'stage4_lesson3', 'moon', 'พระจันทร์', '🌙', 'nature', ['m', 'oo', 'n'], 'ม + อู(oo) = มู ➔ มู + น = มูน'),
]);

// =========================================================================================
// STAGE 5: คำพบบ่อย (Sight Words) และประโยคสั้นประกอบภาพ (Decodable Micro-Stories)
// =========================================================================================
const sentence = (lessonId: string, text: string, thai: string, emoji: string) =>
  add(5, lessonId, text, thai, emoji, 'sight_word', text.replace(/[.]/g, '').split(' '), 'อ่านทั้งประโยคเชื่อมต่อกัน', { sentenceExample: text });

lesson(5, 1, 'คำพบบ่อย (the, is, a, on, in)', ['the', 'is', 'a', 'on', 'in'], [
  sentence('stage5_lesson1', 'The cat is on a mat.', 'แมวอยู่บนเสื่อ', '🐱'),
  sentence('stage5_lesson1', 'A fat pig is in the mud.', 'หมูอ้วนอยู่ในโคลน', '🐷'),
]);
lesson(5, 2, 'คำพบบ่อย (I, see, has, big)', ['I', 'see', 'has', 'big'], [
  sentence('stage5_lesson2', 'I see a big green frog.', 'ฉันเห็นกบสีเขียวตัวใหญ่', '🐸'),
  sentence('stage5_lesson2', 'The king has a red ring.', 'พระราชามีแหวนสีแดง', '👑'),
]);
lesson(5, 3, 'คำพบบ่อย (go, to, under, can)', ['go', 'to', 'under', 'can'], [
  sentence('stage5_lesson3', 'The dog can swim in the lake.', 'สุนัขว่ายน้ำในทะเลสาบได้', '🐶'),
  sentence('stage5_lesson3', 'A bug is under the hot pot.', 'แมลงอยู่ใต้หม้อร้อน', '🐞'),
]);

export const SIGHT_WORDS = ['the', 'is', 'a', 'on', 'in', 'i', 'see', 'has', 'big', 'go', 'to', 'under', 'can', 'fat', 'mud', 'green', 'red'];

export const WORD_MAP: Record<string, WordItem> = Object.fromEntries(WORDS.map((w) => [w.id, w]));

// ---------- 4) ข้อมูลหัวข้อด่านทั้ง 5 ด่าน ----------
export interface StageInfo {
  id: StageId;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  soft: string;
}

export const STAGES: StageInfo[] = [
  { id: 1, title: 'ด่านที่ 1 เสียงตัวอักษรเดี่ยว', subtitle: 'เรียนรู้ทีละกลุ่มเสียง และผสมคำ CVC ทันที', emoji: '🌱', color: '#16a34a', soft: '#dcfce7' },
  { id: 2, title: 'ด่านที่ 2 ตระกูลคำ CVC', subtitle: 'ตระกูลสระ -a-, -i-, -o-, -e-, -u- ฝึกความคล่อง', emoji: '🧩', color: '#2563eb', soft: '#dbeafe' },
  { id: 3, title: 'ด่านที่ 3 เสียงคู่และควบกล้ำ', subtitle: 'พยัญชนะคู่ sh, ch, th, ng, ck และเสียงควบ cl, st, tr', emoji: '🚀', color: '#9333ea', soft: '#f3e8ff' },
  { id: 4, title: 'ด่านที่ 4 สระเสียงยาว & Magic E', subtitle: 'สระเปลี่ยนเสียง cap ➔ cape และคู่สระ ee, ea, oa, ai, oo', emoji: '🪄', color: '#ea580c', soft: '#ffedd5' },
  { id: 5, title: 'ด่านที่ 5 อ่านประโยคสั้น', subtitle: 'คำพบบ่อย (Sight Words) ผสมกับคำโฟนิกส์เป็นเรื่องราว', emoji: '📖', color: '#ca8a04', soft: '#fef9c3' },
];

export const lessonsOfStage = (stageId: StageId) => LESSONS.filter((l) => l.stageId === stageId);
export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);
