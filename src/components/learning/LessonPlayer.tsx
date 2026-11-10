// src/components/learning/LessonPlayer.tsx
// โครงสร้างบทเรียน Phonics 5 ขั้นตอนแท้ (ตามแนวทางของครูต้น):
// ขั้นที่ 1: เรียนรู้เสียงโฟนิกส์ (ตัวอักษรและสระในบทนั้น + คำเทียบเสียงไทย + วิธีวางปาก/ลิ้น)
// ขั้นที่ 2: ฟังเสียงแล้วเลือกตัวอักษร (ฝึกซ้ำจนจำแม่นครบทุกตัว ถ้าตอบผิดวนกลับมาถามใหม่)
// ขั้นที่ 3: เรียนรู้การประสมเสียงเป็นคำ (ทีละขั้น: เสียงต้น + สระ + ตัวสะกด -> รวมเป็นคำ + ฝึกพูดใส่ไมค์)
// ขั้นที่ 4: ฝึกสะกดคำจากเสียงที่ได้ยิน (เรียงแผ่นเสียงประกอบเป็นคำไปพร้อมกับการทดสอบย่อย)
// ขั้นที่ 5: ทดสอบท้ายบท (เกณฑ์ผ่าน 80% จึงจะปลดล็อกบทถัดไป ถ้าไม่ผ่านให้ฝึกซ้ำได้ทันที)
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Ear,
  FileText,
  Layers,
  Mic,
  Monitor,
  Puzzle,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import {
  PHONEMES,
  SIGHT_WORDS,
  STAGES,
  WORD_MAP,
  getLesson,
  getPhoneme,
} from '../../data/curriculumData';
import { playBlend, playPhoneme, playWordOrSentence } from '../../services/audioEngine';
import { isSpeechRecognitionSupported, listenOnce, recordVoice } from '../../services/speechEngine';
import { useStudents } from '../../context/StudentContext';
import { BigButton, PhonemeTile, TILE_STYLE, celebrate } from '../ui';
import type { WordItem } from '../../types/schema';

type Phase = 1 | 2 | 3 | 4 | 5;

const PHASE_INFO: { id: Phase; short: string; title: string; icon: typeof Volume2 }[] = [
  { id: 1, short: '1. รู้จักเสียง', title: 'ขั้นที่ 1: เรียนรู้เสียงโฟนิกส์ของตัวอักษรและสระ', icon: Volume2 },
  { id: 2, short: '2. ฟังเลือกเสียง', title: 'ขั้นที่ 2: ฟังเสียงแล้วเลือกตัวอักษร (ฝึกซ้ำจนจำแม่น)', icon: Ear },
  { id: 3, short: '3. ผสมเสียงเป็นคำ', title: 'ขั้นที่ 3: เรียนรู้การผสมเสียงตัวอักษรเป็นคำ', icon: Layers },
  { id: 4, short: '4. ฝึกสะกดคำ', title: 'ขั้นที่ 4: ฟังคำแล้วต่อเสียงสะกดด้วยตัวเอง', icon: Puzzle },
  { id: 5, short: '5. ทดสอบท้ายบท', title: 'ขั้นที่ 5: ทดสอบท้ายบทเรียน (ผ่าน 80% ไปบทต่อไป)', icon: Trophy },
];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

interface QuizQuestion {
  id: string;
  kind: 'sound_to_letter' | 'blend_to_word' | 'sound_to_spell' | 'speak_word';
  prompt: string;
  audioTarget: string;
  isPhonemeAudio?: boolean;
  phonemeHint?: string[];
  options?: string[];
  answer: string;
}

export default function LessonPlayer() {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);
  const nav = useNavigate();
  const { addStars, completeLesson } = useStudents();

  const words = useMemo<WordItem[]>(
    () => (lesson ? lesson.wordIds.map((id) => WORD_MAP[id]).filter(Boolean) : []),
    [lesson],
  );
  const stage = STAGES.find((s) => s.id === lesson?.stageId) ?? STAGES[0];
  const isSentenceLesson = lesson?.stageId === 5;

  // รายการหน่วยเสียงประจำบทเรียน (สำหรับขั้นที่ 1 และ 2)
  const targetPhonemes = useMemo<string[]>(() => {
    if (!lesson) return [];
    const set = new Set<string>(lesson.targetPhonemes);
    if (!isSentenceLesson) {
      words.forEach((w) => w.phonemes.forEach((p) => set.add(p)));
    }
    return [...set];
  }, [lesson, words, isSentenceLesson]);

  // ตัวอย่างคำของแต่ละเสียงในบทเรียน
  const exampleWordForPhoneme = (g: string): WordItem | undefined =>
    words.find((w) => w.phonemes[0]?.toLowerCase() === g.toLowerCase()) ??
    words.find((w) => w.phonemes.some((p) => p.toLowerCase() === g.toLowerCase()));

  const [phase, setPhase] = useState<Phase>(1);
  const [isTvMode, setIsTvMode] = useState<boolean>(false);

  // ==================== State ขั้นที่ 1: เรียนรู้เสียงโฟนิกส์ ====================
  const [p1Idx, setP1Idx] = useState(0);
  const [p1Learned, setP1Learned] = useState<Set<string>>(new Set());
  const currentPhoneme = getPhoneme(targetPhonemes[p1Idx] ?? 's');
  const p1Example = exampleWordForPhoneme(currentPhoneme.grapheme);

  // ==================== State ขั้นที่ 2: ฟังแล้วเลือกตัวอักษร (Mastery Loop) ====================
  const REQUIRED_MASTERY = 2; // ต้องตอบถูกตัวละ 2 รอบจึงถือว่าจำได้แม่น
  const [p2Mastery, setP2Mastery] = useState<Record<string, number>>({});
  const [p2Target, setP2Target] = useState<string>('');
  const [p2Options, setP2Options] = useState<string[]>([]);
  const [p2Feedback, setP2Feedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [p2Picked, setP2Picked] = useState<string | null>(null);

  const pickNextP2Question = (masteryMap: Record<string, number>, prevTarget?: string) => {
    const remaining = targetPhonemes.filter((g) => (masteryMap[g] ?? 0) < REQUIRED_MASTERY);
    if (remaining.length === 0) return;
    const pool = remaining.length > 1 ? remaining.filter((g) => g !== prevTarget) : remaining;
    const target = pool[Math.floor(Math.random() * pool.length)];
    const allChoices = Array.from(
      new Set([...targetPhonemes, ...PHONEMES.slice(0, 12).map((p) => p.grapheme)]),
    ).filter((g) => g !== target);
    const distractors = shuffle(allChoices).slice(0, 3);
    setP2Target(target);
    setP2Options(shuffle([target, ...distractors]));
    setP2Feedback('none');
    setP2Picked(null);
    setTimeout(() => {
      if (isSentenceLesson) playWordOrSentence(target, 'normal');
      else playPhoneme(target);
    }, 300);
  };

  // ==================== State ขั้นที่ 3: เรียนรู้การประสมเสียงเป็นคำ ====================
  // แบ่งเป็น 2 ช่วงชัดเจน:
  // 1) 'demo' = ครูและจอทีวีสาธิตตัวอย่างให้ดูจนครบทุกคำก่อน (I Do)
  // 2) 'practice' = นักเรียนลงมือฝึกผสมเสียงด้วยตัวเอง (You Do)
  const [p3Stage, setP3Stage] = useState<'demo' | 'practice'>('demo');
  const [p3DemoIdx, setP3DemoIdx] = useState(0);
  const [p3DemoBlended, setP3DemoBlended] = useState(false);
  const [p3DemoSeen, setP3DemoSeen] = useState<Set<number>>(new Set([0]));

  const [p3Idx, setP3Idx] = useState(0);
  const [p3Tapped, setP3Tapped] = useState<Set<number>>(new Set());
  const [p3ActiveTile, setP3ActiveTile] = useState<number>(-1);
  const [p3Blended, setP3Blended] = useState(false);
  const [p3SpokenOk, setP3SpokenOk] = useState(false);
  const [p3MicState, setP3MicState] = useState<'idle' | 'listening' | 'ok' | 'retry'>('idle');
  const [p3Tries, setP3Tries] = useState(0);
  const [p3Heard, setP3Heard] = useState('');
  const [p3SelfRecordUrl, setP3SelfRecordUrl] = useState<string | null>(null);
  const [p3Recording, setP3Recording] = useState(false);

  const p3Word = words[p3Idx];
  const p3DemoWord = words[p3DemoIdx] ?? words[0];

  // ==================== State ขั้นที่ 4: ฝึกต่อเสียงสะกดคำ (Spell / Build Word) ====================
  const p4Words = useMemo(() => words.slice(0, Math.min(words.length, 6)), [words]);
  const [p4Idx, setP4Idx] = useState(0);
  const [p4Slots, setP4Slots] = useState<(string | null)[]>([]);
  const [p4Pool, setP4Pool] = useState<{ id: number; g: string; used: boolean }[]>([]);
  const [p4Status, setP4Status] = useState<'building' | 'correct' | 'wrong'>('building');

  const initP4Word = (w: WordItem) => {
    const units = isSentenceLesson ? w.word.replace(/\./g, '').split(' ') : w.phonemes;
    const extraPool = isSentenceLesson
      ? SIGHT_WORDS.filter((sw) => !units.map((u) => u.toLowerCase()).includes(sw))
      : targetPhonemes.filter((tp) => !units.includes(tp));
    const distractors = shuffle(extraPool).slice(0, Math.min(3, extraPool.length));
    const combined = shuffle([...units, ...distractors]).map((g, idx) => ({
      id: idx,
      g,
      used: false,
    }));
    setP4Slots(Array(units.length).fill(null));
    setP4Pool(combined);
    setP4Status('building');
    setTimeout(() => playWordOrSentence(w.word, 'normal'), 350);
  };

  // ==================== State ขั้นที่ 5: ทดสอบท้ายบทเรียน (Mastery Quiz 80%) ====================
  const [p5Questions, setP5Questions] = useState<QuizQuestion[]>([]);
  const [p5Idx, setP5Idx] = useState(0);
  const [p5Score, setP5Score] = useState(0);
  const [p5Picked, setP5Picked] = useState<string | null>(null);
  const [p5Feedback, setP5Feedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [p5Finished, setP5Finished] = useState(false);
  const [p5Listening, setP5Listening] = useState(false);

  // ==================== State โหมดสอบอ่านรายบุคคลกับคุณครู (1-on-1 Oral Reading Check) ====================
  const [showOralCheck, setShowOralCheck] = useState(false);
  const [oralCheckedWords, setOralCheckedWords] = useState<Record<string, boolean>>({});
  const [oralSaved, setOralSaved] = useState(false);

  const passedOralCount = useMemo(
    () => Object.values(oralCheckedWords).filter(Boolean).length,
    [oralCheckedWords],
  );

  const toggleOralWord = (wordId: string) => {
    setOralCheckedWords((prev) => ({
      ...prev,
      [wordId]: !prev[wordId],
    }));
  };

  const handleSaveOralAssessment = () => {
    const passedWordIds = Object.entries(oralCheckedWords)
      .filter(([_, passed]) => passed)
      .map(([id]) => id);
    completeLesson(lessonId, passedWordIds);
    addStars(50);
    celebrate();
    setOralSaved(true);
  };

  const buildPhase5Quiz = (): QuizQuestion[] => {
    const qs: QuizQuestion[] = [];
    // 1) ฟังเสียงโฟนิกส์แล้วเลือกตัวอักษร 2 ข้อ
    const phSample = shuffle(targetPhonemes).slice(0, 2);
    phSample.forEach((g, idx) => {
      const distractors = shuffle(
        Array.from(new Set([...targetPhonemes, 's', 'a', 't', 'p', 'i', 'n'])).filter((x) => x !== g),
      ).slice(0, 3);
      qs.push({
        id: `q_ph_${idx}`,
        kind: 'sound_to_letter',
        prompt: 'ฟังเสียงโฟนิกส์ แล้วเลือกตัวอักษรที่ตรงกับเสียง',
        audioTarget: g,
        isPhonemeAudio: !isSentenceLesson,
        options: shuffle([g, ...distractors]),
        answer: g,
      });
    });

    // 2) ดูการแยกเสียง แล้วเลือกว่าผสมเป็นคำใด 1 ข้อ
    const wBlend = words[0];
    if (wBlend) {
      const otherWords = shuffle(words.filter((w) => w.id !== wBlend.id)).slice(0, 2);
      const fallbackWords = ['cat', 'sun', 'dog', 'hat'].filter((x) => x !== wBlend.word);
      const opts = Array.from(
        new Set([wBlend.word, ...otherWords.map((w) => w.word), ...fallbackWords]),
      ).slice(0, 3);
      qs.push({
        id: 'q_blend_1',
        kind: 'blend_to_word',
        prompt: 'เมื่อนำเสียงด้านล่างนี้มาผสมกัน จะอ่านเป็นคำว่าอะไร?',
        audioTarget: wBlend.word,
        phonemeHint: wBlend.phonemes,
        options: shuffle(opts),
        answer: wBlend.word,
      });
    }

    // 3) ฟังคำอ่าน แล้วเลือกตัวสะกดที่ถูกต้อง 1 ข้อ
    const wSpell = words[Math.min(1, words.length - 1)];
    if (wSpell) {
      const otherWords = shuffle(words.filter((w) => w.id !== wSpell.id)).slice(0, 2);
      const fallbackWords = ['pan', 'pin', 'pot', 'pen'].filter((x) => x !== wSpell.word);
      const opts = Array.from(
        new Set([wSpell.word, ...otherWords.map((w) => w.word), ...fallbackWords]),
      ).slice(0, 3);
      qs.push({
        id: 'q_spell_1',
        kind: 'sound_to_spell',
        prompt: 'ฟังเสียงคำอ่าน แล้วเลือกคำที่สะกดถูกต้อง',
        audioTarget: wSpell.word,
        options: shuffle(opts),
        answer: wSpell.word,
      });
    }

    // 4) อ่านออกเสียงคำศัพท์ด้วยตัวเองใส่ไมโครโฟน 1 ข้อ
    const wSpeak = words[Math.min(2, words.length - 1)] ?? words[0];
    if (wSpeak) {
      qs.push({
        id: 'q_speak_1',
        kind: 'speak_word',
        prompt: 'สะกดและอ่านออกเสียงคำนี้ใส่ไมโครโฟน',
        audioTarget: wSpeak.word,
        phonemeHint: wSpeak.phonemes,
        answer: wSpeak.word,
      });
    }

    return qs;
  };

  // เล่นเสียงอัตโนมัติเมื่อเปิดขั้นที่ 1
  useEffect(() => {
    if (phase === 1 && currentPhoneme) {
      const t = setTimeout(() => {
        if (isSentenceLesson) playWordOrSentence(currentPhoneme.grapheme, 'normal');
        else playPhoneme(currentPhoneme.grapheme);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [phase, p1Idx, currentPhoneme, isSentenceLesson]);

  if (!lesson || words.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center font-thai text-2xl">
        ไม่พบบทเรียนนี้{' '}
        <button className="underline ml-2" onClick={() => nav('/map')}>
          กลับแผนที่ด่าน
        </button>
      </div>
    );
  }

  // เปลี่ยนไปยังแต่ละขั้น
  const goToPhase = (nextPhase: Phase) => {
    setPhase(nextPhase);
    if (nextPhase === 2) {
      const initMap: Record<string, number> = Object.fromEntries(targetPhonemes.map((g) => [g, 0]));
      setP2Mastery(initMap);
      pickNextP2Question(initMap);
    } else if (nextPhase === 3) {
      setP3Stage('demo');
      setP3DemoIdx(0);
      setP3DemoBlended(false);
      setP3DemoSeen(new Set([0]));
      setP3Idx(0);
      setP3Tapped(new Set());
      setP3Blended(false);
      setP3SpokenOk(false);
      setP3MicState('idle');
      setP3Tries(0);
      setP3Heard('');
      setP3SelfRecordUrl(null);
      if (words[0]) {
        setTimeout(() => {
          playBlend(words[0].phonemes, words[0].word, () => setP3DemoBlended(true));
        }, 400);
      }
    } else if (nextPhase === 4) {
      setP4Idx(0);
      if (p4Words[0]) initP4Word(p4Words[0]);
    } else if (nextPhase === 5) {
      const qs = buildPhase5Quiz();
      setP5Questions(qs);
      setP5Idx(0);
      setP5Score(0);
      setP5Picked(null);
      setP5Feedback('none');
      setP5Finished(false);
      if (qs[0] && qs[0].kind !== 'blend_to_word' && qs[0].kind !== 'speak_word') {
        setTimeout(() => {
          if (qs[0].isPhonemeAudio) playPhoneme(qs[0].audioTarget);
          else playWordOrSentence(qs[0].audioTarget, 'normal');
        }, 400);
      }
    }
  };

  // ==================== Logic ขั้นที่ 2 ====================
  const totalP2Goal = targetPhonemes.length * REQUIRED_MASTERY;
  const currentP2Done = Object.values(p2Mastery).reduce((a, b) => a + Math.min(b, REQUIRED_MASTERY), 0);
  const isP2Complete = currentP2Done >= totalP2Goal;

  const handleP2Answer = (choice: string) => {
    if (p2Feedback !== 'none') return;
    setP2Picked(choice);
    if (isSentenceLesson) playWordOrSentence(choice, 'normal');
    else playPhoneme(choice);

    if (choice === p2Target) {
      setP2Feedback('correct');
      const updated = { ...p2Mastery, [p2Target]: (p2Mastery[p2Target] ?? 0) + 1 };
      setP2Mastery(updated);
      const doneCount = Object.values(updated).reduce((a, b) => a + Math.min(b, REQUIRED_MASTERY), 0);
      if (doneCount >= totalP2Goal) {
        celebrate();
      } else {
        setTimeout(() => pickNextP2Question(updated, p2Target), 950);
      }
    } else {
      setP2Feedback('wrong');
      // ถ้าตอบผิด ลดแต้มความจำของตัวนั้นลง เพื่อบังคับให้ระบบถามซ้ำจนจำได้จริง
      const updated = { ...p2Mastery, [p2Target]: Math.max(0, (p2Mastery[p2Target] ?? 0) - 1) };
      setP2Mastery(updated);
      setTimeout(() => {
        if (isSentenceLesson) playWordOrSentence(p2Target, 'slow');
        else playPhoneme(p2Target);
      }, 650);
      setTimeout(() => pickNextP2Question(updated, p2Target), 1700);
    }
  };

  // ==================== Logic ขั้นที่ 3 ====================
  const p3Units = isSentenceLesson ? p3Word.word.replace(/\./g, '').split(' ') : p3Word.phonemes;
  const allP3TilesTapped = p3Tapped.size >= p3Units.length;

  const handleP3TapTile = (idx: number, g: string) => {
    setP3ActiveTile(idx);
    const play = isSentenceLesson ? playWordOrSentence(g, 'slow') : playPhoneme(g);
    play.then(() => setP3ActiveTile(-1));
    setP3Tapped((prev) => new Set(prev).add(idx));
  };

  const handleP3Blend = async () => {
    setP3Tapped(new Set(p3Units.map((_, i) => i)));
    if (isSentenceLesson) {
      await playWordOrSentence(p3Word.word, 'slow');
      await playWordOrSentence(p3Word.word, 'normal');
    } else {
      await playBlend(p3Word.phonemes, p3Word.word, setP3ActiveTile);
    }
    setP3Blended(true);
  };

  const handleP3Mic = async () => {
    if (p3MicState === 'listening') return;
    if (!isSpeechRecognitionSupported()) {
      setP3Tries(2);
      return;
    }
    setP3MicState('listening');
    setP3Heard('');
    const { result, transcript } = await listenOnce(p3Word.word);
    setP3Heard(transcript);
    if (result === 'PASSED_PERFECT' || result === 'PASSED_CLOSE') {
      setP3MicState('ok');
      setP3SpokenOk(true);
      celebrate();
    } else {
      setP3MicState('retry');
      setP3Tries((t) => t + 1);
    }
  };

  const handleP3RecordSelf = async () => {
    setP3Recording(true);
    await playWordOrSentence(p3Word.word, 'normal');
    const url = await recordVoice(3000);
    setP3Recording(false);
    setP3SelfRecordUrl(url);
    if (url) new Audio(url).play().catch(() => undefined);
  };

  const nextP3Word = () => {
    if (p3Idx + 1 < words.length) {
      setP3Idx(p3Idx + 1);
      setP3Tapped(new Set());
      setP3Blended(false);
      setP3SpokenOk(false);
      setP3MicState('idle');
      setP3Tries(0);
      setP3Heard('');
      setP3SelfRecordUrl(null);
    } else {
      goToPhase(4);
    }
  };

  const handleP3DemoPlay = (w: WordItem) => {
    setP3DemoBlended(false);
    playBlend(w.phonemes, w.word, () => setP3DemoBlended(true));
  };

  const handleP3DemoNext = () => {
    if (p3DemoIdx + 1 < words.length) {
      const nextIdx = p3DemoIdx + 1;
      setP3DemoIdx(nextIdx);
      setP3DemoBlended(false);
      setP3DemoSeen((prev) => new Set(prev).add(nextIdx));
      const nextWord = words[nextIdx];
      if (nextWord) {
        setTimeout(() => {
          playBlend(nextWord.phonemes, nextWord.word, () => setP3DemoBlended(true));
        }, 300);
      }
    } else {
      setP3Stage('practice');
      setP3Idx(0);
      celebrate(false);
    }
  };

  // ==================== Logic ขั้นที่ 4 ====================
  const p4CurrentWord = p4Words[p4Idx];
  const p4TargetUnits = p4CurrentWord
    ? isSentenceLesson
      ? p4CurrentWord.word.replace(/\./g, '').split(' ')
      : p4CurrentWord.phonemes
    : [];

  const handleP4PickTile = (poolItem: { id: number; g: string; used: boolean }) => {
    if (poolItem.used || p4Status === 'correct') return;
    const emptyIdx = p4Slots.findIndex((s) => s === null);
    if (emptyIdx === -1) return;

    if (isSentenceLesson) playWordOrSentence(poolItem.g, 'slow');
    else playPhoneme(poolItem.g);

    const nextSlots = [...p4Slots];
    nextSlots[emptyIdx] = poolItem.g;
    const nextPool = p4Pool.map((p) => (p.id === poolItem.id ? { ...p, used: true } : p));
    setP4Slots(nextSlots);
    setP4Pool(nextPool);

    // ถ้าวางครบทุกช่องแล้ว ตรวจคำตอบทันที
    if (nextSlots.every((s) => s !== null)) {
      const isOk = nextSlots.every((s, idx) => s?.toLowerCase() === p4TargetUnits[idx]?.toLowerCase());
      if (isOk) {
        setP4Status('correct');
        celebrate();
        setTimeout(() => {
          if (!isSentenceLesson) playBlend(p4CurrentWord.phonemes, p4CurrentWord.word, () => undefined);
          else playWordOrSentence(p4CurrentWord.word, 'normal');
        }, 350);
      } else {
        setP4Status('wrong');
        setTimeout(() => {
          setP4Slots(Array(p4TargetUnits.length).fill(null));
          setP4Pool((prev) => prev.map((p) => ({ ...p, used: false })));
          setP4Status('building');
          playWordOrSentence(p4CurrentWord.word, 'slow');
        }, 1100);
      }
    }
  };

  const handleP4Reset = () => {
    setP4Slots(Array(p4TargetUnits.length).fill(null));
    setP4Pool((prev) => prev.map((p) => ({ ...p, used: false })));
    setP4Status('building');
  };

  // ==================== Logic ขั้นที่ 5 ====================
  const currentQ = p5Questions[p5Idx];
  const passThreshold = Math.ceil(p5Questions.length * 0.8);
  const passedLesson = p5Score >= passThreshold;

  const advanceP5 = (earnedPoint: number) => {
    const newScore = p5Score + earnedPoint;
    setP5Score(newScore);
    setTimeout(() => {
      if (p5Idx + 1 < p5Questions.length) {
        const nextQ = p5Questions[p5Idx + 1];
        setP5Idx(p5Idx + 1);
        setP5Picked(null);
        setP5Feedback('none');
        if (nextQ.kind !== 'blend_to_word' && nextQ.kind !== 'speak_word') {
          setTimeout(() => {
            if (nextQ.isPhonemeAudio) playPhoneme(nextQ.audioTarget);
            else playWordOrSentence(nextQ.audioTarget, 'normal');
          }, 350);
        }
      } else {
        setP5Finished(true);
        if (newScore >= Math.ceil(p5Questions.length * 0.8)) {
          addStars(newScore * 3);
          completeLesson(
            lesson.id,
            words.map((w) => w.id),
          );
          celebrate(true);
        }
      }
    }, 1100);
  };

  const handleP5SelectOption = (opt: string) => {
    if (p5Feedback !== 'none' || !currentQ) return;
    setP5Picked(opt);
    const ok = opt.toLowerCase() === currentQ.answer.toLowerCase();
    setP5Feedback(ok ? 'correct' : 'wrong');
    advanceP5(ok ? 1 : 0);
  };

  const handleP5Speak = async () => {
    if (!currentQ || p5Listening) return;
    if (!isSpeechRecognitionSupported()) {
      setP5Feedback('correct');
      advanceP5(1);
      return;
    }
    setP5Listening(true);
    const { result } = await listenOnce(currentQ.answer);
    setP5Listening(false);
    const ok = result === 'PASSED_PERFECT' || result === 'PASSED_CLOSE';
    setP5Feedback(ok ? 'correct' : 'wrong');
    advanceP5(ok ? 1 : 0);
  };

  // รองรับคีย์บอร์ดและพอยเตอร์ไร้สายสำหรับโหมดจอทีวีหน้าชั้นเรียน (TV Presentation Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 1 && currentPhoneme) {
          if (isSentenceLesson) playWordOrSentence(currentPhoneme.grapheme, 'normal');
          else playPhoneme(currentPhoneme.grapheme);
        } else if (phase === 2 && p2Target) {
          if (isSentenceLesson) playWordOrSentence(p2Target, 'normal');
          else playPhoneme(p2Target);
        } else if (phase === 3) {
          if (p3Stage === 'demo') {
            const w = words[p3DemoIdx];
            if (w) handleP3DemoPlay(w);
          } else if (p3Word) {
            handleP3Blend();
          }
        } else if (phase === 4 && p4CurrentWord) {
          playWordOrSentence(p4CurrentWord.word, 'normal');
        } else if (phase === 5 && currentQ) {
          if (currentQ.isPhonemeAudio) playPhoneme(currentQ.audioTarget);
          else playWordOrSentence(currentQ.audioTarget, 'normal');
        }
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'].includes(e.code)) {
        const choiceIdx = parseInt(e.key, 10) - 1;
        if (phase === 2 && p2Options[choiceIdx]) {
          handleP2Answer(p2Options[choiceIdx]);
        } else if (phase === 5 && currentQ?.options?.[choiceIdx]) {
          handleP5SelectOption(currentQ.options[choiceIdx]);
        }
      } else if (e.code === 'ArrowRight') {
        if (phase === 1 && p1Idx + 1 < targetPhonemes.length) {
          setP1Idx(p1Idx + 1);
        } else if (phase === 3 && p3Stage === 'demo') {
          handleP3DemoNext();
        }
      } else if (e.code === 'ArrowLeft') {
        if (phase === 1 && p1Idx > 0) {
          setP1Idx(p1Idx - 1);
        } else if (phase === 3 && p3Stage === 'demo' && p3DemoIdx > 0) {
          setP3DemoIdx(p3DemoIdx - 1);
          setP3DemoBlended(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentPhoneme, p2Target, p2Options, p3Stage, p3DemoIdx, p3Word, p4CurrentWord, currentQ, p1Idx, targetPhonemes.length, words]);

  return (
    <div
      className="min-h-screen flex flex-col pb-12"
      style={{ background: `linear-gradient(180deg, ${stage.soft}, #fffbf0 65%)` }}
    >
      {/* ส่วนหัวและแถบ 5 ขั้นตอนการเรียนรู้ */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className={`${isTvMode ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav('/map')}
              className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 grid place-items-center"
              aria-label="กลับแผนที่ด่าน"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <div className="font-thai text-lg md:text-xl font-bold text-slate-800">
                {stage.emoji} {lesson.title}
              </div>
              <div className="font-thai text-xs text-slate-500">
                {PHASE_INFO[phase - 1].title} • ผู้จัดทำ: ครูนภรัฐ
              </div>
            </div>
          </div>

          {/* ปุ่มเครื่องมือสำหรับคุณครู: โหมดจอทีวี + ใบงาน PDF + สอบอ่านกับครู */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTvMode((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-thai text-sm border transition-all ${
                isTvMode
                  ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-sm animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="สลับโหมดจอทีวีหน้าชั้นเรียน (ตัวหนังสือใหญ่พิเศษ + คีย์บอร์ด)"
            >
              <Monitor className="w-4 h-4" />
              <span>{isTvMode ? '🖥️ จอทีวี (เปิดอยู่)' : '🖥️ โหมดจอทีวี'}</span>
            </button>

            <button
              onClick={() => setShowOralCheck(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-thai text-sm font-bold transition-all shadow-2xs"
              title="เปิดโหมดสอบอ่านออกเสียงรายบุคคลกับคุณครู"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">🗣️ สอบอ่านกับครู</span>
              <span className="sm:hidden">🗣️ อ่านกับครู</span>
            </button>

            <button
              onClick={() => nav(`/worksheet/${lessonId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-thai text-sm font-bold transition-all"
              title="เปิดใบงาน PDF สำหรับพิมพ์แจกนักเรียน"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">ใบงาน PDF</span>
            </button>
          </div>

          {/* แถบ 5 ขั้นตอนการเรียนรู้ */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto mt-1 sm:mt-0">
            {PHASE_INFO.map((p) => {
              const Icon = p.icon;
              const isCurrent = phase === p.id;
              const isPast = phase > p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => goToPhase(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-thai text-sm whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm scale-105'
                      : isPast
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{p.short}</span>
                  <span className="sm:hidden">{p.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* แถบแจ้งเตือนปุ่มลัดสำหรับโหมดจอทีวี */}
        {isTvMode && (
          <div className="bg-amber-100/90 border-t border-amber-200 px-4 py-1.5 text-center font-thai text-xs text-amber-900 flex items-center justify-center gap-4 flex-wrap">
            <span>✨ <b>โหมดจอทีวีหน้าชั้นเรียนเปิดใช้งานอยู่:</b></span>
            <span>กด [<b>Spacebar</b>] ฟังเสียง</span>
            <span>กด [<b>1, 2, 3, 4</b>] ชูนิ้วตอบคำถาม</span>
            <span>กด [<b>ลูกศร ซ้าย/ขวา</b>] สลับเสียง/คำ</span>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-6">
        {/* =====================================================================
            ขั้นที่ 1: เรียนรู้เสียงโฟนิกส์ของตัวอักษรและสระในบทเรียน
           ===================================================================== */}
        {phase === 1 && (
          <section className="card p-6 md:p-8 flex flex-col items-center text-center animate-pop">
            <span className="bg-indigo-100 text-indigo-800 font-thai px-4 py-1 rounded-full text-sm">
              ขั้นที่ 1 จาก 5 • เรียนรู้เสียงโฟนิกส์ ({p1Idx + 1}/{targetPhonemes.length})
            </span>

            {/* แถบตัวอักษรทั้งหมดในบทนี้ */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {targetPhonemes.map((g, idx) => {
                const seen = p1Learned.has(g) || idx === p1Idx;
                return (
                  <button
                    key={g}
                    onClick={() => setP1Idx(idx)}
                    className={`px-3.5 py-1.5 rounded-xl font-kid font-bold text-lg border-2 transition-all ${
                      idx === p1Idx
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 scale-110'
                        : seen
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            {/* แผ่นตัวอักษรขนาดใหญ่ตรงกลาง */}
            <div className="mt-6 flex flex-col items-center">
              <PhonemeTile
                grapheme={currentPhoneme.grapheme}
                size="lg"
                onClick={() => {
                  setP1Learned((prev) => new Set(prev).add(currentPhoneme.grapheme));
                  if (isSentenceLesson) playWordOrSentence(currentPhoneme.grapheme, 'normal');
                  else playPhoneme(currentPhoneme.grapheme);
                }}
              />
              <span
                className="mt-3 px-3 py-0.5 rounded-full text-xs font-thai text-white"
                style={{ background: TILE_STYLE[currentPhoneme.category].bg }}
              >
                {TILE_STYLE[currentPhoneme.category].label}
              </span>
            </div>

            {/* คำอธิบายเสียงโฟนิกส์ภาษาไทย */}
            <div className="mt-5 bg-amber-50 border-2 border-amber-200 rounded-3xl px-6 py-4 max-w-md w-full">
              <div className="font-thai text-slate-500 text-sm">ออกเสียงโฟนิกส์ว่า</div>
              <div className="font-thai text-3xl font-bold text-amber-900 mt-1">
                “{currentPhoneme.thaiHint}”
              </div>
              <div className="font-kid text-slate-500 text-base mt-0.5">
                สัญลักษณ์เสียง {currentPhoneme.ipa}
              </div>
            </div>

            {/* ปุ่มกดฟังเสียงซ้ำ */}
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <BigButton
                onClick={() => {
                  setP1Learned((prev) => new Set(prev).add(currentPhoneme.grapheme));
                  if (isSentenceLesson) playWordOrSentence(currentPhoneme.grapheme, 'normal');
                  else playPhoneme(currentPhoneme.grapheme);
                }}
                color="#0ea5e9"
                shadow="#0369a1"
              >
                <Volume2 className="inline w-7 h-7 mr-2 -mt-1" /> ฟังเสียง “{currentPhoneme.grapheme}”
              </BigButton>
            </div>

            {/* ตัวอย่างคำที่มีเสียงนี้ */}
            {p1Example && !isSentenceLesson && (
              <div className="mt-6 bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-4">
                <span className="text-4xl">{p1Example.emoji}</span>
                <div className="text-left">
                  <div className="font-thai text-xs text-slate-500">ตัวอย่างคำที่ใช้เสียงนี้</div>
                  <div className="font-kid text-2xl font-bold text-slate-800">
                    {p1Example.phonemes.map((ph, i) => (
                      <span
                        key={i}
                        className={
                          ph.toLowerCase() === currentPhoneme.grapheme.toLowerCase()
                            ? 'text-rose-600 underline decoration-4'
                            : ''
                        }
                      >
                        {ph}
                      </span>
                    ))}{' '}
                    <span className="font-thai text-base font-normal text-slate-600">
                      ({p1Example.meaningThai})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => playBlend(p1Example.phonemes, p1Example.word, () => undefined)}
                  className="ml-2 w-11 h-11 rounded-xl bg-sky-100 text-sky-700 grid place-items-center"
                  title="ฟังการสะกดคำตัวอย่าง"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            )}

            {/* ปุ่มเดินหน้า */}
            <div className="flex gap-3 w-full max-w-md mt-7">
              {p1Idx > 0 && (
                <button
                  onClick={() => setP1Idx(p1Idx - 1)}
                  className="px-5 py-3.5 rounded-2xl bg-slate-200 text-slate-700 font-thai text-lg"
                >
                  ⬅ เสียงก่อนหน้า
                </button>
              )}
              {p1Idx + 1 < targetPhonemes.length ? (
                <BigButton
                  onClick={() => {
                    setP1Learned((prev) => new Set(prev).add(currentPhoneme.grapheme));
                    setP1Idx(p1Idx + 1);
                  }}
                  className="flex-1"
                  color="#4f46e5"
                  shadow="#3730a3"
                >
                  เสียงต่อไป ({targetPhonemes[p1Idx + 1]}) ➜
                </BigButton>
              ) : (
                <BigButton
                  onClick={() => goToPhase(2)}
                  className="flex-1"
                  color="#16a34a"
                  shadow="#166534"
                >
                  จำเสียงได้แล้ว! ไปขั้นที่ 2 (ฟังเลือกตัวอักษร) ➜
                </BigButton>
              )}
            </div>
          </section>
        )}

        {/* =====================================================================
            ขั้นที่ 2: ฟังเสียงแล้วเลือกตัวอักษร (ฝึกซ้ำจนจำได้ครบทุกตัวในบทนั้น)
           ===================================================================== */}
        {phase === 2 && (
          <section className="card p-6 md:p-8 flex flex-col items-center text-center animate-pop">
            <span className="bg-sky-100 text-sky-800 font-thai px-4 py-1 rounded-full text-sm">
              ขั้นที่ 2 จาก 5 • ฟังเสียงแล้วเลือกตัวอักษร (ตอบถูกตัวละ {REQUIRED_MASTERY} ครั้งเพื่อผ่าน)
            </span>

            {/* แถบแสดงความแม่นยำรายตัวอักษร */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {targetPhonemes.map((g) => {
                const count = Math.min(p2Mastery[g] ?? 0, REQUIRED_MASTERY);
                const done = count >= REQUIRED_MASTERY;
                return (
                  <div
                    key={g}
                    className={`px-3.5 py-1.5 rounded-xl border-2 flex items-center gap-2 font-kid font-bold ${
                      done
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">{g}</span>
                    <span className="text-xs font-thai font-normal">
                      {done ? '⭐⭐ ผ่าน' : count === 1 ? '⭐ (อีก 1 ครั้ง)' : '⚪ ยังไม่ผ่าน'}
                    </span>
                  </div>
                );
              })}
            </div>

            {!isP2Complete ? (
              <>
                <p className="font-thai text-xl text-slate-700 mt-6">
                  กดปุ่มลำโพงเพื่อฟังเสียง แล้วแตะตัวอักษรที่ได้ยิน
                </p>

                {isTvMode && (
                  <div className="mt-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-xl font-thai text-sm text-amber-900">
                    📢 <b>กิจกรรมหน้าชั้น:</b> ครูเปิดเสียง ➔ เด็กทั้งห้องชูนิ้ว (1, 2, 3 หรือ 4) ➔ ครูกดเฉลย!
                  </div>
                )}

                <button
                  onClick={() => {
                    if (isSentenceLesson) playWordOrSentence(p2Target, 'normal');
                    else playPhoneme(p2Target);
                  }}
                  className="mt-4 w-32 h-32 rounded-full bg-sky-500 text-white grid place-items-center active:translate-y-1 transition-transform"
                  style={{ boxShadow: '0 8px 0 0 #0369a1' }}
                  aria-label="ฟังเสียง"
                >
                  <Volume2 className="w-16 h-16" />
                </button>
                <span className="font-thai text-sm text-slate-400 mt-2">แตะลำโพงเพื่อฟังซ้ำ (หรือกด Spacebar)</span>

                {/* ตัวเลือก 4 ตัวอักษร พร้อมหมายเลขกำกับสำหรับการชูนิ้วตอบ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 w-full max-w-xl">
                  {p2Options.map((opt, optIdx) => {
                    const isPicked = p2Picked === opt;
                    const isAnswer = p2Feedback !== 'none' && opt === p2Target;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleP2Answer(opt)}
                        className={`relative h-28 sm:h-36 rounded-3xl font-kid font-bold text-5xl sm:text-6xl border-4 transition-all ${
                          isAnswer
                            ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                            : isPicked && p2Feedback === 'wrong'
                              ? 'bg-rose-500 text-white border-rose-600 animate-shake'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-400 hover:-translate-y-1'
                        }`}
                        style={{ boxShadow: '0 6px 0 0 rgb(0 0 0 / 0.12)' }}
                      >
                        {/* ป้ายหมายเลขชูนิ้วตอบ */}
                        <span className="absolute top-2 left-2.5 w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-thai text-xs font-bold grid place-items-center">
                          {optIdx + 1}
                        </span>
                        {opt.replace('_', '‿')}
                      </button>
                    );
                  })}
                </div>

                {p2Feedback === 'correct' && (
                  <div className="mt-5 font-thai text-xl text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" /> ถูกต้อง! เสียง “{getPhoneme(p2Target).thaiHint}” คือตัว {p2Target}
                  </div>
                )}
                {p2Feedback === 'wrong' && (
                  <div className="mt-5 font-thai text-xl text-rose-600 flex items-center gap-2">
                    <XCircle className="w-6 h-6" /> ยังไม่ใช่นะ เสียงเมื่อกี้คือตัว “{p2Target}” ({getPhoneme(p2Target).thaiHint}) เดี๋ยวระบบจะวนเสียงนี้กลับมาทวนซ้ำ!
                  </div>
                )}
              </>
            ) : (
              <div className="my-8 space-y-4">
                <div className="text-7xl">🎉</div>
                <h2 className="font-thai text-3xl text-emerald-700 font-bold">
                  ยอดเยี่ยม! นักเรียนจำเสียงตัวอักษรในบทนี้ได้แม่นยำครบทุกตัวแล้ว
                </h2>
                <p className="font-thai text-lg text-slate-600">
                  ฐานเสียงพร้อมแล้ว ➔ ก้าวเข้าสู่ขั้นที่ 3: ดูตัวอย่างการผสมคำให้ครบก่อนฝึกเอง
                </p>
                <BigButton onClick={() => goToPhase(3)} color="#16a34a" shadow="#166534">
                  ไปขั้นที่ 3: เรียนรู้การผสมตัวอักษรเป็นคำ ➜
                </BigButton>
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            ขั้นที่ 3: เรียนรู้การผสมตัวอักษรเป็นคำ (Step-by-Step Phonics Blending)
            แบ่งเป็น 2 ช่วง: 
            ช่วงที่ 1 (demo): ครูและจอทีวีสาธิตตัวอย่างให้ดูจนครบทุกคำก่อน (I Do)
            ช่วงที่ 2 (practice): นักเรียนลงมือฝึกผสมเสียงด้วยตัวเอง (You Do)
           ===================================================================== */}
        {phase === 3 && (
          <section className="card p-6 md:p-8 flex flex-col items-center text-center animate-pop">
            {/* สลับการแสดงผลระหว่าง ช่วงที่ 1 (สาธิตตัวอย่าง) กับ ช่วงที่ 2 (ฝึกผสมเอง) */}
            {p3Stage === 'demo' ? (
              <>
                <span className="bg-purple-100 text-purple-800 font-thai px-4 py-1 rounded-full text-sm font-bold">
                  ขั้นที่ 3 จาก 5 • ช่วงที่ 1: ครูและจอทีวีสาธิตการผสมเสียงให้ดูจนครบ (I Do) ({p3DemoIdx + 1}/{words.length})
                </span>

                {/* แถบคำศัพท์ตัวอย่างทั้งหมดในบทนี้ */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {words.map((w, idx) => {
                    const isCurrent = idx === p3DemoIdx;
                    const isSeen = p3DemoSeen.has(idx);
                    return (
                      <button
                        key={w.id}
                        onClick={() => {
                          setP3DemoIdx(idx);
                          setP3DemoBlended(false);
                          setP3DemoSeen((prev) => new Set(prev).add(idx));
                          setTimeout(() => {
                            playBlend(w.phonemes, w.word, () => setP3DemoBlended(true));
                          }, 250);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl font-kid font-bold text-base border-2 transition-all ${
                          isCurrent
                            ? 'border-purple-600 bg-purple-100 text-purple-900 scale-105 shadow-xs'
                            : isSeen
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                      >
                        {w.word} {isSeen ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 px-5 py-2 bg-purple-50 border border-purple-200 rounded-2xl font-thai text-sm text-purple-900 max-w-xl">
                  📢 <b>หลักการสอน:</b> ให้นักเรียนดูและฟังตัวอย่างการเลื่อนเสียงผสมกันทีละคำจนครบก่อน เพื่อเข้าใจจังหวะการผสมเสียง
                </div>

                {/* กล่องสาธิตการผสมเสียงขนาดใหญ่พิเศษ (Big Demonstration Screen) */}
                <div className="mt-6 w-full max-w-2xl bg-gradient-to-b from-slate-50 to-purple-50/40 border-2 border-purple-200 rounded-3xl p-6 md:p-8 shadow-xs">
                  
                  {/* การเลื่อนเสียงทีละขั้น Onset-Vowel Blending */}
                  <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 my-2">
                    {p3DemoWord.phonemes.map((g, i) => {
                      const ph = getPhoneme(g);
                      return (
                        <div key={i} className="flex items-center gap-2 md:gap-3">
                          <div className="flex flex-col items-center">
                            <PhonemeTile grapheme={g} size="lg" />
                            <span className="font-thai text-base text-slate-700 mt-2 font-bold">
                              {ph.thaiHint.split(' ')[0]}
                            </span>
                          </div>
                          {i + 1 < p3DemoWord.phonemes.length && (
                            <span className="font-kid text-4xl text-purple-400 font-bold -mt-6">+</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* แถบคำอธิบายบันไดผสมเสียงภาษาไทย */}
                  {p3DemoWord.blendGuideThai && (
                    <div className="mt-6 bg-white border-2 border-purple-200 rounded-2xl p-4 font-thai text-lg text-purple-950 font-bold shadow-xs">
                      💡 {p3DemoWord.blendGuideThai}
                    </div>
                  )}

                  {/* คำศัพท์ผลลัพธ์พร้อมภาพประกอบ */}
                  <div
                    className={`mt-6 bg-white border-2 ${
                      p3DemoBlended
                        ? 'border-purple-500 ring-4 ring-purple-100 shadow-md'
                        : 'border-slate-200'
                    } rounded-2xl p-4 flex flex-wrap items-center justify-center gap-6 transition-all duration-300`}
                  >
                    <span className="text-6xl">{p3DemoWord.emoji}</span>
                    <div className="text-left">
                      <div className="font-kid font-bold text-5xl text-purple-900 tracking-wide">
                        {p3DemoWord.word}
                      </div>
                      <div className="font-thai text-xl text-slate-600 mt-1">
                        แปลว่า “{p3DemoWord.meaningThai}”
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 ml-auto">
                      <button
                        onClick={() => handleP3DemoPlay(p3DemoWord)}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-thai text-base font-bold flex items-center gap-2 shadow-xs"
                      >
                        <Sparkles className="w-5 h-5" /> เล่นผสมเสียง
                      </button>
                      <button
                        onClick={() => playWordOrSentence(p3DemoWord.word, 'slow')}
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-thai text-base flex items-center gap-1.5"
                      >
                        🐢 ช้าๆ
                      </button>
                      <button
                        onClick={() => playWordOrSentence(p3DemoWord.word, 'normal')}
                        className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-thai text-base flex items-center gap-1.5"
                      >
                        🔊 ปกติ
                      </button>
                    </div>
                  </div>

                  {/* ปุ่มนำทางตัวอย่าง */}
                  <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-purple-100">
                    <button
                      disabled={p3DemoIdx === 0}
                      onClick={() => {
                        if (p3DemoIdx > 0) {
                          setP3DemoIdx(p3DemoIdx - 1);
                          setP3DemoBlended(false);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 disabled:opacity-30 text-slate-700 font-thai text-base"
                    >
                      ⬅ คำก่อนหน้า
                    </button>

                    {p3DemoIdx + 1 < words.length ? (
                      <BigButton
                        onClick={handleP3DemoNext}
                        color="#7c3aed"
                        shadow="#5b21b6"
                      >
                        ดูตัวอย่างคำถัดไป ({words[p3DemoIdx + 1]?.word}) ➜
                      </BigButton>
                    ) : (
                      <BigButton
                        onClick={() => {
                          setP3Stage('practice');
                          setP3Idx(0);
                          celebrate(false);
                        }}
                        color="#16a34a"
                        shadow="#166534"
                      >
                        ดูตัวอย่างครบแล้ว! ถึงตานักเรียนฝึกผสมเอง 🚀
                      </BigButton>
                    )}
                  </div>
                </div>

                {/* ทางลัดข้ามไปโหมดฝึกเองทันที (กรณีทบทวน) */}
                <button
                  onClick={() => setP3Stage('practice')}
                  className="mt-4 font-thai text-slate-500 hover:text-slate-700 underline text-sm"
                >
                  ข้ามไปยังช่วงที่ 2 (นักเรียนฝึกผสมเสียงด้วยตัวเอง)
                </button>
              </>
            ) : (
              /* ช่วงที่ 2: นักเรียนลงมือฝึกผสมเสียงเอง (Interactive Practice / You Do) */
              <>
                <div className="w-full flex items-center justify-between gap-2 mb-2">
                  <button
                    onClick={() => setP3Stage('demo')}
                    className="font-thai text-sm text-purple-700 hover:text-purple-900 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200"
                  >
                    ⬅ ย้อนกลับไปดูตัวอย่างการผสมคำ
                  </button>
                  <span className="bg-emerald-100 text-emerald-800 font-thai px-4 py-1 rounded-full text-sm font-bold">
                    ช่วงที่ 2 จาก 2: นักเรียนลงมือฝึกผสมเสียงเอง ({p3Idx + 1}/{words.length})
                  </span>
                </div>

                <p className="font-thai text-lg text-slate-600 mt-2">
                  1) แตะฟังเสียงทีละตัว ➔ 2) กดปุ่มผสมเสียงรวมเป็นคำ ➔ 3) ฝึกออกเสียงใส่ไมค์
                </p>

                {/* แผ่นเสียงแยกทีละตัว พร้อมคำใบ้เสียงภาษาไทยด้านล่าง */}
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-6">
                  {p3Units.map((g, i) => {
                    const ph = getPhoneme(g);
                    const tapped = p3Tapped.has(i);
                    const isSilentE = p3Word.magicE && i === p3Units.length - 1 && g.toLowerCase() === 'e';
                    return (
                      <div key={i} className="flex items-center gap-2 md:gap-3">
                        <div className="flex flex-col items-center relative">
                          {isSilentE && (
                            <span className="absolute -top-7 text-xl animate-bounce" title="Magic E ส่งพลังวิเศษ">
                              🪄
                            </span>
                          )}
                          <PhonemeTile
                            grapheme={g}
                            active={p3ActiveTile === i}
                            onClick={() => handleP3TapTile(i, g)}
                          />
                          <span className="font-thai text-sm text-slate-600 mt-2">
                            {isSilentE ? 'e เงียบ (เสกเสียงยาว)' : isSentenceLesson ? '' : ph.thaiHint.split(' ')[0]}
                          </span>
                          <span
                            className={`text-xs font-thai mt-0.5 ${
                              tapped ? 'text-emerald-600 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {tapped ? '✓ ฟังแล้ว' : 'แตะฟัง'}
                          </span>
                        </div>
                        {i + 1 < p3Units.length && (
                          <span className="font-kid text-3xl text-slate-400 font-bold -mt-6">
                            {p3Word.magicE && i === 1 ? '…' : '+'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* แสดงแนวทางการผสมเสียงภาษาไทย (Additive Blending Guide) */}
                {p3Word.blendGuideThai && (
                  <div className="mt-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl px-5 py-2 font-thai text-base text-indigo-900">
                    💡 <span className="font-bold">หลักการผสมเสียง:</span> {p3Word.blendGuideThai}
                  </div>
                )}

                {/* ปุ่มลากผสมเสียง (Sound Blending Bar) */}
                <button
                  onClick={handleP3Blend}
                  className="mt-5 w-full max-w-md py-4 px-6 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-thai text-xl flex items-center justify-center gap-3 active:translate-y-1 transition-all"
                  style={{ boxShadow: '0 6px 0 0 #3730a3' }}
                >
                  <Sparkles className="w-6 h-6" />
                  <span>กดเพื่อไล่เสียงผสมเป็นคำ</span>
                  <ArrowRight className="w-6 h-6" />
                  <span className="font-kid font-bold text-2xl underline">{p3Word.word}</span>
                </button>

                {/* เมื่อกดผสมเสียงแล้ว จะแสดงคำเต็ม + ความหมาย + ปุ่มไมค์ให้ฝึกออกเสียง */}
                {(p3Blended || allP3TilesTapped) && (
                  <div className="mt-6 w-full max-w-md bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 animate-pop">
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-6xl">{p3Word.emoji}</span>
                      <div className="text-left">
                        <div className="font-kid font-bold text-4xl text-indigo-900">{p3Word.word}</div>
                        <div className="font-thai text-lg text-slate-600">แปลว่า “{p3Word.meaningThai}”</div>
                      </div>
                      <div className="flex flex-col gap-1.5 ml-auto">
                        <button
                          onClick={() => playWordOrSentence(p3Word.word, 'normal')}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 text-white font-thai text-sm"
                        >
                          🔊 ปกติ
                        </button>
                        <button
                          onClick={() => playWordOrSentence(p3Word.word, 'slow')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-thai text-sm"
                        >
                          🐢 ช้าๆ
                        </button>
                      </div>
                    </div>

                    {/* ฝึกออกเสียงใส่ไมค์ */}
                    {!p3SpokenOk && (
                      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col items-center">
                        <button
                          onClick={handleP3Mic}
                          className={`w-20 h-20 rounded-full text-white grid place-items-center ${
                            p3MicState === 'listening' ? 'animate-mic bg-rose-500' : 'bg-rose-500'
                          }`}
                          style={{ boxShadow: p3MicState === 'listening' ? undefined : '0 6px 0 0 #9f1239' }}
                        >
                          <Mic className="w-10 h-10" />
                        </button>
                        <p className="font-thai text-base text-slate-600 mt-2">
                          {p3MicState === 'idle' && 'กดไมค์แล้วฝึกอ่านออกเสียงคำนี้'}
                          {p3MicState === 'listening' && 'กำลังฟังเสียงของหนู... พูดเลย!'}
                          {p3MicState === 'retry' &&
                            (p3Heard
                              ? `ระบบได้ยินว่า "${p3Heard}" — ลองออกเสียงอีกครั้งนะ`
                              : 'ยังไม่ได้ยินเสียง ลองกดไมค์พูดอีกครั้ง หรือกดปุ่มด้านล่าง')}
                        </p>

                        {p3Tries >= 1 && (
                          <div className="mt-3 flex flex-wrap justify-center gap-2">
                            <button
                              onClick={handleP3RecordSelf}
                              disabled={p3Recording}
                              className="px-4 py-2 rounded-xl bg-sky-100 text-sky-800 font-thai text-sm"
                            >
                              {p3Recording ? '🔴 กำลังอัดเสียง 3 วินาที...' : '🎙️ อัดเสียงตัวเองเทียบกับครู'}
                            </button>
                            {p3SelfRecordUrl && (
                              <button
                                onClick={() => new Audio(p3SelfRecordUrl).play()}
                                className="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-thai text-sm"
                              >
                                ▶ ฟังเสียงตัวเอง
                              </button>
                            )}
                            <button
                              onClick={() => setP3SpokenOk(true)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-thai text-sm"
                            >
                              ✓ ฉันฝึกออกเสียงตามแล้ว ไปคำต่อไป
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {p3SpokenOk && (
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <div className="font-thai text-xl text-emerald-600 font-bold mb-3">
                          🎉 ออกเสียงเยี่ยมมาก!
                        </div>
                        <BigButton onClick={nextP3Word} className="w-full" color="#16a34a" shadow="#166534">
                          {p3Idx + 1 < words.length ? 'ฝึกผสมคำต่อไป ➜' : 'ไปขั้นที่ 4: ฝึกต่อเสียงสะกดคำ ➜'}
                        </BigButton>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* =====================================================================
            ขั้นที่ 4: เรียนรู้ไปพร้อมกับการทดสอบ (ฟังคำแล้วเรียงตัวอักษรสะกดคำ)
           ===================================================================== */}
        {phase === 4 && p4CurrentWord && (
          <section className="card p-6 md:p-8 flex flex-col items-center text-center animate-pop">
            <span className="bg-amber-100 text-amber-800 font-thai px-4 py-1 rounded-full text-sm">
              ขั้นที่ 4 จาก 5 • ฝึกสะกดคำจากเสียง ({p4Idx + 1}/{p4Words.length})
            </span>

            <p className="font-thai text-xl text-slate-700 mt-4">
              ฟังเสียงคำศัพท์ แล้วแตะตัวอักษรด้านล่างมาเรียงสะกดตามลำดับเสียง
            </p>

            {/* ปุ่มฟังคำ + รูปใบ้ */}
            <div className="mt-4 flex items-center gap-4 bg-amber-50 border-2 border-amber-200 rounded-3xl px-6 py-4">
              <span className="text-6xl">{p4CurrentWord.emoji}</span>
              <div className="text-left">
                <div className="font-thai text-lg text-slate-700">ความหมาย: “{p4CurrentWord.meaningThai}”</div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => playWordOrSentence(p4CurrentWord.word, 'normal')}
                    className="px-4 py-2 rounded-xl bg-sky-500 text-white font-thai text-sm flex items-center gap-1"
                  >
                    <Volume2 className="w-4 h-4" /> ฟังปกติ
                  </button>
                  <button
                    onClick={() => playWordOrSentence(p4CurrentWord.word, 'slow')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-thai text-sm"
                  >
                    🐢 ฟังแยกเสียงช้าๆ
                  </button>
                </div>
              </div>
            </div>

            {/* ช่องว่างสำหรับวางแผ่นเสียง */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {p4Slots.map((val, idx) => (
                <div
                  key={idx}
                  className={`min-w-[82px] h-24 rounded-2xl border-4 grid place-items-center font-kid font-bold text-4xl px-3 transition-all ${
                    p4Status === 'correct'
                      ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                      : p4Status === 'wrong'
                        ? 'bg-rose-100 text-rose-700 border-rose-400 animate-shake'
                        : val
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-slate-50 text-slate-300 border-dashed border-slate-300'
                  }`}
                >
                  {val ? val.replace('_', '‿') : idx + 1}
                </div>
              ))}
            </div>

            {/* ตัวเลือกแผ่นเสียงให้แตะเลือก */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {p4Pool.map((item) => (
                <button
                  key={item.id}
                  disabled={item.used || p4Status === 'correct'}
                  onClick={() => handleP4PickTile(item)}
                  className={`min-w-[74px] h-20 px-4 rounded-2xl font-kid font-bold text-3xl border-2 transition-all ${
                    item.used
                      ? 'opacity-25 bg-slate-200 border-slate-300'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-500 hover:-translate-y-1'
                  }`}
                  style={{ boxShadow: item.used ? undefined : '0 5px 0 0 #cbd5e1' }}
                >
                  {item.g.replace('_', '‿')}
                </button>
              ))}
            </div>

            <button
              onClick={handleP4Reset}
              className="mt-4 flex items-center gap-1 font-thai text-sm text-slate-500 hover:text-slate-700"
            >
              <RotateCcw className="w-4 h-4" /> เรียงใหม่ตั้งแต่ต้น
            </button>

            {p4Status === 'correct' && (
              <div className="mt-5 w-full max-w-md animate-pop">
                <div className="font-thai text-xl text-emerald-600 font-bold mb-3">
                  ✓ สะกดถูกต้อง! {p4CurrentWord.phonemes.join(' + ')} = {p4CurrentWord.word}
                </div>
                <BigButton
                  onClick={() => {
                    if (p4Idx + 1 < p4Words.length) {
                      const nextW = p4Words[p4Idx + 1];
                      setP4Idx(p4Idx + 1);
                      initP4Word(nextW);
                    } else {
                      goToPhase(5);
                    }
                  }}
                  className="w-full"
                  color="#16a34a"
                  shadow="#166534"
                >
                  {p4Idx + 1 < p4Words.length ? 'สะกดคำต่อไป ➜' : 'พร้อมแล้ว! ไปขั้นที่ 5 (ทดสอบท้ายบท) ➜'}
                </BigButton>
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            ขั้นที่ 5: ทดสอบท้ายบทเรียน (ต้องได้ 80% จึงจะผ่านไปบทใหม่ได้)
           ===================================================================== */}
        {phase === 5 && (
          <section className="card p-6 md:p-8 flex flex-col items-center text-center animate-pop">
            <span className="bg-rose-100 text-rose-800 font-thai px-4 py-1 rounded-full text-sm">
              ขั้นที่ 5 จาก 5 • ทดสอบท้ายบทเรียน (เกณฑ์ผ่าน 80%)
            </span>

            {!p5Finished && currentQ && (
              <div className="w-full max-w-xl mt-4 flex flex-col items-center">
                <div className="flex justify-between w-full font-thai text-sm text-slate-500 mb-2">
                  <span>ข้อที่ {p5Idx + 1} จาก {p5Questions.length}</span>
                  <span>คะแนนปัจจุบัน: {p5Score} คะแนน</span>
                </div>

                <h3 className="font-thai text-2xl text-slate-800 mt-2">{currentQ.prompt}</h3>

                {/* แสดงโจทย์ตามประเภทข้อสอบ */}
                {(currentQ.kind === 'sound_to_letter' || currentQ.kind === 'sound_to_spell') && (
                  <button
                    onClick={() => {
                      if (currentQ.isPhonemeAudio) playPhoneme(currentQ.audioTarget);
                      else playWordOrSentence(currentQ.audioTarget, 'normal');
                    }}
                    className="mt-5 w-28 h-28 rounded-full bg-sky-500 text-white grid place-items-center active:translate-y-1"
                    style={{ boxShadow: '0 7px 0 0 #0369a1' }}
                  >
                    <Volume2 className="w-14 h-14" />
                  </button>
                )}

                {currentQ.kind === 'blend_to_word' && currentQ.phonemeHint && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                    {currentQ.phonemeHint.map((g, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <PhonemeTile grapheme={g} size="md" onClick={() => playPhoneme(g)} />
                        {i + 1 < currentQ.phonemeHint!.length && (
                          <span className="font-kid text-2xl font-bold text-slate-400">+</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentQ.kind === 'speak_word' && (
                  <div className="mt-5 flex flex-col items-center">
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl px-8 py-5 font-kid font-bold text-5xl text-indigo-900">
                      {currentQ.answer}
                    </div>
                    <button
                      onClick={handleP5Speak}
                      className={`mt-5 w-24 h-24 rounded-full bg-rose-500 text-white grid place-items-center ${
                        p5Listening ? 'animate-mic' : ''
                      }`}
                      style={{ boxShadow: p5Listening ? undefined : '0 7px 0 0 #9f1239' }}
                    >
                      <Mic className="w-12 h-12" />
                    </button>
                    <p className="font-thai text-slate-600 mt-2">
                      {p5Listening ? 'กำลังฟังเสียง... พูดเลย!' : 'แตะไมโครโฟนแล้วอ่านออกเสียง'}
                    </p>
                  </div>
                )}

                {/* ตัวเลือกสำหรับข้อปรนัย */}
                {currentQ.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-6">
                    {currentQ.options.map((opt) => {
                      const picked = p5Picked === opt;
                      const isCorrectOpt =
                        p5Feedback !== 'none' && opt.toLowerCase() === currentQ.answer.toLowerCase();
                      return (
                        <button
                          key={opt}
                          onClick={() => handleP5SelectOption(opt)}
                          className={`py-5 px-4 rounded-2xl font-kid font-bold text-3xl border-4 transition-all ${
                            isCorrectOpt
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : picked && p5Feedback === 'wrong'
                                ? 'bg-rose-500 text-white border-rose-600 animate-shake'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-400'
                          }`}
                        >
                          {opt.replace('_', '‿')}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* สรุปผลทดสอบท้ายบท: ตัดสินว่าผ่านไปบทใหม่หรือไม่ */}
            {p5Finished && (
              <div className="my-6 max-w-md w-full space-y-4 animate-pop">
                <div className="text-7xl">{passedLesson ? '🏆' : '💪'}</div>
                <h2 className="font-thai text-3xl font-bold text-slate-800">
                  {passedLesson ? 'ผ่านบทเรียนนี้แล้ว!' : 'เกือบผ่านแล้ว มาฝึกซ้ำอีกนิดนะ!'}
                </h2>
                <div className="bg-slate-100 rounded-3xl py-4 px-6">
                  <div className="font-thai text-slate-500">คะแนนทดสอบท้ายบท</div>
                  <div className="font-kid font-bold text-5xl text-indigo-700 mt-1">
                    {p5Score} / {p5Questions.length}{' '}
                    <span className="text-2xl text-slate-500">
                      ({Math.round((p5Score / p5Questions.length) * 100)}%)
                    </span>
                  </div>
                  <div className="font-thai text-sm text-slate-500 mt-1">
                    เกณฑ์ผ่านเพื่อปลดล็อกบทต่อไป: อย่างน้อย {passThreshold} คะแนน (80%)
                  </div>
                </div>

                {passedLesson ? (
                  <div className="space-y-3">
                    <BigButton onClick={() => nav('/map')} className="w-full" color="#16a34a" shadow="#166534">
                      เก่งมาก! ปลดล็อกบทต่อไปบนแผนที่ 🗺️
                    </BigButton>
                    <button
                      type="button"
                      onClick={() => setShowOralCheck(true)}
                      className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-thai font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                      <span>ถือไปสอบอ่านออกเสียงกับคุณครู ({words.length} คำ) 🗣️</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <BigButton onClick={() => goToPhase(5)} className="w-full" color="#f97316" shadow="#c2410c">
                      🔄 สอบท้ายบทใหม่อีกครั้ง
                    </BigButton>
                    <BigButton onClick={() => goToPhase(1)} className="w-full" color="#4f46e5" shadow="#3730a3">
                      📖 กลับไปทบทวนตั้งแต่ขั้นที่ 1
                    </BigButton>
                    <button
                      type="button"
                      onClick={() => setShowOralCheck(true)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-thai font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>สอบอ่านกับคุณครูตัวต่อตัว 🗣️</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* =========================================================================
          หน้าต่างสอบอ่านออกเสียงรายบุคคลกับคุณครูนภรัฐ (Oral Reading Check Modal)
         ========================================================================= */}
      {showOralCheck && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-pop">
            
            {/* ส่วนหัว Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white grid place-items-center font-bold text-xl shadow-xs">
                  🗣️
                </div>
                <div>
                  <h3 className="font-thai font-bold text-lg sm:text-xl text-slate-800">
                    แบบทดสอบการอ่านออกเสียงกับครูนภรัฐ
                  </h3>
                  <p className="font-thai text-xs text-slate-500">
                    อ่านออกเสียงทีละคำให้คุณครูฟัง • คุณครูกดติ๊ก [✓ ผ่าน] เมื่ออ่านถูกต้อง
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOralCheck(false)}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 grid place-items-center text-slate-500 transition-colors shadow-2xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* แถบสรุปคะแนน */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="font-thai text-sm text-slate-700">
                คำศัพท์ที่อ่านผ่าน: <b className="text-emerald-700 text-lg">{passedOralCount}</b> / {words.length} คำ
                {passedOralCount >= 10 && (
                  <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    ✓ ผ่านเกณฑ์แล้ว
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => nav(`/worksheet/${lessonId}`)}
                  className="flex items-center gap-1 text-xs font-thai font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  <FileText className="w-3.5 h-3.5" /> พิมพ์ใบงาน A4
                </button>
              </div>
            </div>

            {/* รายการคำศัพท์ 15 คำสำหรับคุณครูติ๊ก */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
              {words.map((w, idx) => {
                const isPassed = oralCheckedWords[w.id];
                return (
                  <div
                    key={w.id}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                      isPassed
                        ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-thai text-xs font-bold grid place-items-center">
                        {idx + 1}
                      </span>
                      <span className="text-2xl">{w.emoji}</span>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-kid font-bold text-2xl text-indigo-950">
                            {w.word}
                          </span>
                          <span className="font-kid text-slate-500 text-sm">
                            ({w.phonemes.join(' - ')})
                          </span>
                        </div>
                        <div className="font-thai text-xs text-slate-500">
                          {w.meaningThai} • <span className="text-indigo-600 font-medium">{w.blendGuideThai}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => playWordOrSentence(w.word, 'normal')}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 grid place-items-center"
                        title="ฟังเสียงตัวอย่าง"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleOralWord(w.id)}
                        className={`px-3.5 py-2 rounded-xl font-thai text-sm font-bold flex items-center gap-1.5 transition-all ${
                          isPassed
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isPassed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ผ่านแล้ว ✓</span>
                          </>
                        ) : (
                          <span>ติ๊กผ่าน [ ✓ ]</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* แถบท้าย Modal */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
              <div className="font-thai text-xs text-slate-500">
                เกณฑ์ผ่าน: อ่านออกเสียงถูกต้องตั้งแต่ 10 คำขึ้นไป (จาก {words.length} คำ)
              </div>
              <div className="flex items-center gap-2">
                {oralSaved ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-thai font-bold text-sm bg-emerald-100 px-4 py-2 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>บันทึกผลเรียบร้อยแล้ว! 🎉</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveOralAssessment}
                    disabled={passedOralCount === 0}
                    className={`px-5 py-2.5 rounded-xl font-thai font-bold text-sm flex items-center gap-2 shadow-sm transition-all ${
                      passedOralCount >= 10
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>บันทึกผลการอ่าน ({passedOralCount}/{words.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
