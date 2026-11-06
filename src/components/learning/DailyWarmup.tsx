// src/components/learning/DailyWarmup.tsx
// อุ่นเครื่อง 2 นาที: ทบทวนคำในตะกร้าแดง (ฟังแล้วเลือกภาพ)
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Volume2 } from 'lucide-react';
import { WORDS, WORD_MAP } from '../../data/curriculumData';
import { playWordOrSentence } from '../../services/audioEngine';
import { useStudents } from '../../context/StudentContext';
import { BigButton, StarRewardModal, StudentTopBar } from '../ui';
import type { WordItem } from '../../types/schema';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

export default function DailyWarmup() {
  const { student, update, addStars } = useStudents();
  const nav = useNavigate();

  const queue = useMemo<WordItem[]>(() => {
    if (!student) return [];
    return Object.values(student.srsState)
      .filter((s) => s.bucket === 'red')
      .map((s) => WORD_MAP[s.wordId])
      .filter(Boolean)
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [seconds, setSeconds] = useState(120);
  const [done, setDone] = useState(false);

  const word = queue[i];
  const options = useMemo(() => {
    if (!word) return [];
    const others = shuffle(WORDS.filter((w) => w.word !== word.word && w.stageId <= 4 && w.emoji !== word.emoji)).slice(0, 2);
    return shuffle([word, ...others]);
  }, [word]);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (word) {
      const t = setTimeout(() => playWordOrSentence(word.word), 400);
      return () => clearTimeout(t);
    }
  }, [word]);

  if (!student) return null;

  if (queue.length === 0) {
    return (
      <div className="min-h-screen bg-playful">
        <StudentTopBar back="/map" title="อุ่นเครื่องประจำวัน" />
        <div className="card max-w-md mx-auto mt-16 p-8 text-center font-thai text-2xl">✅ วันนี้ไม่มีคำต้องทบทวน เก่งมาก!</div>
      </div>
    );
  }

  const choose = (w: WordItem) => {
    if (picked) return;
    setPicked(w.id);
    const ok = w.word === word.word;
    if (ok) {
      setCorrectCount((c) => c + 1);
      update((s) => ({
        srsState: {
          ...s.srsState,
          [word.id]: { ...s.srsState[word.id], bucket: 'yellow', consecutiveThreeStars: 1, lastPracticedAt: new Date().toISOString() },
        },
      }));
    }
    setTimeout(() => {
      setPicked(null);
      if (i + 1 < queue.length) setI(i + 1);
      else {
        addStars(correctCount + (ok ? 1 : 0));
        setDone(true);
      }
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50">
      <StudentTopBar back="/map" title="🔥 อุ่นเครื่อง 2 นาที" />
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 w-full">
          <div className="flex gap-2 flex-1">
            {queue.map((_, n) => (
              <div key={n} className={`h-4 flex-1 rounded-full ${n < i ? 'bg-rose-500' : n === i ? 'bg-rose-300' : 'bg-white border-2 border-rose-100'}`} />
            ))}
          </div>
          <div className={`flex items-center gap-1 font-kid font-bold text-xl ${seconds < 30 ? 'text-rose-600' : 'text-slate-600'}`}>
            <Timer className="w-6 h-6" /> {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </div>
        </div>

        <div className="bg-rose-100 text-rose-700 rounded-full px-4 py-1 font-thai">🧺 คำจากตะกร้าแดง — ฟังแล้วแตะภาพที่ถูกต้อง</div>

        <button
          onClick={() => playWordOrSentence(word.word)}
          className="w-36 h-36 rounded-full bg-rose-500 text-white grid place-items-center active:translate-y-1 transition-transform"
          style={{ boxShadow: '0 8px 0 0 #9f1239' }}
          aria-label="ฟังอีกครั้ง"
        >
          <Volume2 className="w-20 h-20" />
        </button>

        <div className="grid grid-cols-3 gap-4 w-full">
          {options.map((o) => {
            const isPicked = picked === o.id;
            const isAnswer = picked && o.word === word.word;
            return (
              <button
                key={o.id}
                onClick={() => choose(o)}
                className={`card aspect-square grid place-items-center text-6xl md:text-7xl border-4 transition-all ${
                  isAnswer ? 'border-green-500 bg-green-50 scale-105' : isPicked ? 'border-rose-400 bg-rose-50 animate-shake' : 'border-transparent'
                }`}
              >
                <div className="text-center">
                  {o.emoji}
                  {picked && <div className="font-kid text-xl font-semibold mt-1">{o.word}</div>}
                </div>
              </button>
            );
          })}
        </div>

        <BigButton onClick={() => nav('/map')} color="#94a3b8" shadow="#64748b" className="!text-base">ข้ามไปเรียนบทใหม่</BigButton>
      </main>

      <StarRewardModal
        open={done}
        stars={correctCount >= queue.length ? 3 : correctCount >= queue.length / 2 ? 2 : 1}
        earnedStars={correctCount}
        title="อุ่นเครื่องเสร็จแล้ว!"
        newCards={[]}
        onClose={() => nav('/map')}
      />
    </div>
  );
}
