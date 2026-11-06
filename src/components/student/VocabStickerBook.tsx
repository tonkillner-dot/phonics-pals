// src/components/student/VocabStickerBook.tsx
// สมุดสะสมสติกเกอร์คำศัพท์ แยกตามหมวดหมู่
import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { WORDS } from '../../data/curriculumData';
import { playWordOrSentence } from '../../services/audioEngine';
import { useStudents } from '../../context/StudentContext';
import { StudentTopBar } from '../ui';
import type { WordCategoryTag, WordItem } from '../../types/schema';

const CATS: { tag: WordCategoryTag; label: string; emoji: string; color: string }[] = [
  { tag: 'animal', label: 'สัตว์', emoji: '🐾', color: '#f97316' },
  { tag: 'food', label: 'อาหาร', emoji: '🍎', color: '#e11d48' },
  { tag: 'body', label: 'ร่างกาย/คน', emoji: '🙋', color: '#a855f7' },
  { tag: 'action', label: 'ท่าทาง', emoji: '🏃', color: '#0ea5e9' },
  { tag: 'object', label: 'สิ่งของ', emoji: '🎒', color: '#2563eb' },
  { tag: 'nature', label: 'ธรรมชาติ', emoji: '🌳', color: '#16a34a' },
];

// คำเดียวกันอาจอยู่หลายด่าน ให้แสดงครั้งเดียว
const uniqueByWord = (list: WordItem[]) => {
  const seen = new Map<string, WordItem>();
  list.forEach((w) => !seen.has(w.word) && seen.set(w.word, w));
  return [...seen.values()];
};

export default function VocabStickerBook() {
  const { student } = useStudents();
  const [cat, setCat] = useState<WordCategoryTag>('animal');
  const [zoom, setZoom] = useState<WordItem | null>(null);
  if (!student) return null;

  const unlockedWords = new Set(WORDS.filter((w) => student.unlockedVocabCards.includes(w.id)).map((w) => w.word));
  const all = uniqueByWord(WORDS.filter((w) => w.categoryTag !== 'sight_word'));
  const list = all.filter((w) => w.categoryTag === cat);
  const current = CATS.find((c) => c.tag === cat)!;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-16">
      <StudentTopBar back="/map" title="📒 สมุดสะสมสติกเกอร์" />
      <main className="max-w-5xl mx-auto px-4 pt-5">
        <div className="card p-5 flex items-center gap-4">
          <div className="text-6xl">📒</div>
          <div className="flex-1">
            <div className="font-thai text-2xl">สะสมแล้ว {unlockedWords.size} / {all.length} ใบ</div>
            <div className="h-4 bg-amber-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${(unlockedWords.size / all.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* แท็บหมวดหมู่ */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mt-5 pb-2">
          {CATS.map((c) => {
            const have = all.filter((w) => w.categoryTag === c.tag && unlockedWords.has(w.word)).length;
            const total = all.filter((w) => w.categoryTag === c.tag).length;
            const on = c.tag === cat;
            return (
              <button
                key={c.tag}
                onClick={() => setCat(c.tag)}
                className="shrink-0 rounded-2xl px-4 py-3 font-thai text-lg transition-all"
                style={{ background: on ? c.color : 'white', color: on ? 'white' : '#334155', boxShadow: `0 5px 0 0 ${on ? c.color + '99' : '#e2e8f0'}` }}
              >
                {c.emoji} {c.label} <span className="opacity-75 text-base">({have}/{total})</span>
              </button>
            );
          })}
        </div>

        {/* ตารางสติกเกอร์ */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-5">
          {list.map((w, n) => {
            const got = unlockedWords.has(w.word);
            return (
              <button
                key={w.id}
                disabled={!got}
                onClick={() => {
                  setZoom(w);
                  playWordOrSentence(w.word);
                }}
                className={`aspect-[3/4] rounded-2xl flex flex-col items-center justify-center p-2 transition-transform ${got ? 'bg-white hover:-translate-y-1 hover:rotate-1' : 'bg-slate-200/70 border-4 border-dashed border-slate-300'}`}
                style={got ? { boxShadow: `0 6px 0 0 ${current.color}55`, border: `4px solid ${current.color}`, transform: `rotate(${(n % 3) - 1}deg)` } : undefined}
              >
                {got ? (
                  <>
                    <span className="text-5xl md:text-6xl">{w.emoji}</span>
                    <span className="font-kid font-semibold text-lg mt-1">{w.word}</span>
                    <span className="font-thai text-sm text-slate-500 leading-tight text-center">{w.meaningThai}</span>
                  </>
                ) : (
                  <>
                    <span className="text-5xl grayscale opacity-25 blur-[2px]">{w.emoji}</span>
                    <span className="font-kid text-slate-400 text-xl mt-1">?</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {zoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 grid place-items-center p-4" onClick={() => setZoom(null)}>
          <div className="card p-8 text-center animate-pop w-72" style={{ border: `6px solid ${current.color}` }}>
            <div className="text-9xl">{zoom.emoji}</div>
            <div className="font-kid font-bold text-4xl mt-2">{zoom.word}</div>
            <div className="font-thai text-2xl text-slate-600">{zoom.meaningThai}</div>
            <button onClick={(e) => { e.stopPropagation(); playWordOrSentence(zoom.word); }} className="mt-4 bg-sky-500 text-white rounded-full px-5 py-2 font-thai text-lg">
              <Volume2 className="inline w-6 h-6 -mt-1" /> ฟังอีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
