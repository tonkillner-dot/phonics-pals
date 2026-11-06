// src/services/speechEngine.ts
// ระบบฟังเสียงพูดของนักเรียน + ตรวจแบบยืดหยุ่นสำเนียง (Fuzzy Matcher)
import { PHONETIC_TOLERANCE } from '../data/phoneticTolerance';

export type PronunciationResult = 'PASSED_PERFECT' | 'PASSED_CLOSE' | 'FAILED' | 'UNSUPPORTED' | 'NO_SPEECH';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

export const isSpeechRecognitionSupported = () =>
  typeof window !== 'undefined' &&
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();

export const levenshtein = (a: string, b: string): number => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
};

export const similarity = (a: string, b: string) => {
  const max = Math.max(a.length, b.length);
  return max === 0 ? 1 : 1 - levenshtein(a, b) / max;
};

/** ตรวจการออกเสียงจากคำตอบทางเลือก (สูงสุด 5 แบบ) ที่เบราว์เซอร์ส่งกลับมา */
export const evaluatePronunciation = (targetWord: string, alternatives: string[]): PronunciationResult => {
  const target = normalize(targetWord);
  const tolerant = (PHONETIC_TOLERANCE[target] ?? []).map(normalize);
  let best = 0;
  for (const raw of alternatives) {
    const spoken = normalize(raw);
    if (!spoken) continue;
    if (spoken === target || tolerant.includes(spoken) || spoken.split(' ').includes(target)) return 'PASSED_PERFECT';
    best = Math.max(best, similarity(target, spoken));
  }
  if (alternatives.length === 0) return 'NO_SPEECH';
  return best >= 0.65 ? 'PASSED_CLOSE' : 'FAILED';
};

/** ฟังเสียงนักเรียน 1 ครั้ง */
export const listenOnce = (targetWord: string, timeoutMs = 6000): Promise<{ result: PronunciationResult; transcript: string }> =>
  new Promise((resolve) => {
    if (!isSpeechRecognitionSupported()) return resolve({ result: 'UNSUPPORTED', transcript: '' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec: AnyRecognition = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    let done = false;
    const finish = (result: PronunciationResult, transcript: string) => {
      if (done) return;
      done = true;
      try { rec.stop(); } catch { /* ignore */ }
      resolve({ result, transcript });
    };
    rec.onresult = (e: AnyRecognition) => {
      const alts: string[] = [];
      const res = e.results[0];
      for (let i = 0; i < res.length; i++) alts.push(res[i].transcript);
      finish(evaluatePronunciation(targetWord, alts), alts[0] ?? '');
    };
    rec.onerror = () => finish('NO_SPEECH', '');
    rec.onend = () => finish('NO_SPEECH', '');
    setTimeout(() => finish('NO_SPEECH', ''), timeoutMs);
    try { rec.start(); } catch { finish('UNSUPPORTED', ''); }
  });

/** โหมดฟังเสียงตัวเองเทียบกับครู: อัดเสียง 3 วินาที */
export const recordVoice = async (ms = 3000): Promise<string | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    const stopped = new Promise<void>((r) => (recorder.onstop = () => r()));
    recorder.start();
    await new Promise((r) => setTimeout(r, ms));
    recorder.stop();
    await stopped;
    stream.getTracks().forEach((t) => t.stop());
    return URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
  } catch {
    return null;
  }
};
