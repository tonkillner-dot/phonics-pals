// src/services/audioEngine.ts
// ระบบเสียง Phonics แท้:
// 1) เสียงหน่วยโฟนิกส์เดี่ยว (Phonemes) ใช้ไฟล์เสียงเจ้าของภาษา /audio/phonemes/{grapheme}.mp3 ทั้ง 48 เสียง
// 2) เสียงคำศัพท์ (Words) ใช้ไฟล์เสียงเจ้าของภาษาจาก Oxford Dictionary /audio/words/{word}.mp3
// 3) ประโยคยาว ใช้ไฟล์เสียงคำต่อกันหรือ Web Speech API สำรองอัตโนมัติ
import { getPhoneme } from '../data/curriculumData';

// คำพาหะสำรองกรณีฉุกเฉินหากโหลดไฟล์ไม่สำเร็จ
const CARRIERS: Record<string, string> = {
  s: 'sss', a: 'ah', t: 'tuh', p: 'puh', i: 'ih', n: 'nnn', c: 'kuh', k: 'kuh', e: 'eh', h: 'huh',
  r: 'rrr', m: 'mmm', d: 'duh', g: 'guh', o: 'aw', u: 'uh', l: 'lll', f: 'fff', b: 'buh', j: 'juh',
  z: 'zzz', w: 'wuh', v: 'vvv', y: 'yuh', x: 'ks', q: 'kwuh', sh: 'shh', ch: 'chuh', th: 'thh',
  ng: 'ng', ck: 'kuh', ee: 'ee', ea: 'ee', oa: 'oh', ai: 'ay', oo: 'oo', a_e: 'ay', i_e: 'eye',
  o_e: 'oh', st: 'st', cl: 'cl', sw: 'sw', fr: 'fr', cr: 'cr', dr: 'dr', tr: 'tr', mp: 'mp', nch: 'nch',
};

let activeAudio: HTMLAudioElement | null = null;

const stopAllAudio = () => {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch { /* ignore */ }
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

let cachedVoice: SpeechSynthesisVoice | null = null;
const pickVoice = (): SpeechSynthesisVoice | null => {
  if (cachedVoice) return cachedVoice;
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => v.lang === 'en-US' && /female|samantha|zira|aria|jenny|google us/i.test(v.name)) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null;
  return cachedVoice;
};
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}

export const isTTSSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

const speakTTS = (text: string, mode: 'normal' | 'slow' = 'normal'): Promise<void> =>
  new Promise((resolve) => {
    if (!isTTSSupported()) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = mode === 'normal' ? 0.9 : 0.5;
    u.pitch = 1.05;
    const v = pickVoice();
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });

const playAudioUrl = (url: string, playbackRate = 1.0): Promise<boolean> =>
  new Promise((resolve) => {
    stopAllAudio();
    const audio = new Audio(url);
    activeAudio = audio;
    audio.playbackRate = playbackRate;
    if ('preservesPitch' in audio) {
      audio.preservesPitch = true;
    }
    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
      resolve(true);
    };
    audio.onerror = () => {
      if (activeAudio === audio) activeAudio = null;
      resolve(false);
    };
    audio.play().catch(() => {
      if (activeAudio === audio) activeAudio = null;
      resolve(false);
    });
  });

/** เล่นเสียงโฟนิกส์เดี่ยวจากไฟล์เสียงเจ้าของภาษา (/audio/phonemes/{grapheme}.mp3) */
export const playPhoneme = async (grapheme: string): Promise<void> => {
  const key = grapheme.trim().toLowerCase();
  const unit = getPhoneme(key);
  const url = unit.audioFile || `/audio/phonemes/${key}.mp3`;
  const ok = await playAudioUrl(url, 1.0);
  if (!ok) {
    const carrier = CARRIERS[key] ?? key;
    await speakTTS(carrier, 'slow');
  }
};

/** อ่านคำศัพท์หรือประโยค: ใช้ไฟล์เสียงเจ้าของภาษา (/audio/words/{word}.mp3) ก่อน ถ้าเป็นประโยคใช้ TTS */
export const playWordOrSentence = async (text: string, mode: 'normal' | 'slow' = 'normal'): Promise<void> => {
  const cleaned = text.trim().replace(/[.!?]/g, '').toLowerCase();
  // กรณีเป็นคำเดี่ยว ใช้ไฟล์เสียงเจ้าของภาษาที่ดาวน์โหลดไว้ใน /audio/words/
  if (cleaned && !cleaned.includes(' ')) {
    const rate = mode === 'normal' ? 1.0 : 0.68;
    const ok = await playAudioUrl(`/audio/words/${cleaned}.mp3`, rate);
    if (ok) return;
  }
  await speakTTS(text, mode);
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** ประสมเสียงทีละตัวอักษรด้วยไฟล์เสียงโฟนิกส์แท้ แล้วตามด้วยเสียงอ่านเต็มคำ */
export const playBlend = async (phonemes: string[], word: string, onStep: (index: number) => void) => {
  for (let i = 0; i < phonemes.length; i++) {
    onStep(i);
    await playPhoneme(phonemes[i]);
    await wait(160);
  }
  onStep(-1);
  await wait(120);
  await playWordOrSentence(word, 'normal');
};
