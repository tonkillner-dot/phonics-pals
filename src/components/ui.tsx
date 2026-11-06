// src/components/ui.tsx
// ชิ้นส่วนหน้าจอที่ใช้ซ้ำทั่วทั้งแอป
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PhonemeCategory } from '../types/schema';
import { getPhoneme } from '../data/curriculumData';
import { useStudents } from '../context/StudentContext';

// ---------- สีของแผ่นเสียงตามประเภท ----------
export const TILE_STYLE: Record<PhonemeCategory | 'sight', { bg: string; shadow: string; label: string }> = {
  consonant: { bg: '#2563eb', shadow: '#1e40af', label: 'พยัญชนะ' },
  short_vowel: { bg: '#e11d48', shadow: '#9f1239', label: 'สระเสียงสั้น' },
  long_vowel: { bg: '#ea580c', shadow: '#9a3412', label: 'สระเสียงยาว' },
  digraph: { bg: '#059669', shadow: '#065f46', label: 'เสียงคู่' },
  blend: { bg: '#0d9488', shadow: '#115e59', label: 'เสียงผสม' },
  sight: { bg: '#eab308', shadow: '#a16207', label: 'คำพบบ่อย' },
};

/** แผ่นเสียงโฟนิกส์ (กดเพื่อฟังเสียง) */
export function PhonemeTile({
  grapheme,
  active = false,
  size = 'lg',
  onClick,
  hideColor = false,
}: {
  grapheme: string;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hideColor?: boolean;
}) {
  const unit = getPhoneme(grapheme);
  const st = hideColor ? { bg: '#475569', shadow: '#1e293b' } : TILE_STYLE[unit.category];
  const display = grapheme.replace('_', '‿');
  const dims =
    size === 'lg'
      ? 'min-w-[88px] h-[104px] text-6xl px-4'
      : size === 'md'
        ? 'min-w-[64px] h-[76px] text-4xl px-3'
        : 'min-w-[44px] h-[52px] text-2xl px-2';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${dims} rounded-2xl font-kid font-semibold text-white select-none transition-all duration-150 ${active ? '-translate-y-3 scale-110' : ''}`}
      style={{
        background: st.bg,
        boxShadow: active ? `0 0 0 5px #fde047, 0 10px 0 0 ${st.shadow}` : `0 7px 0 0 ${st.shadow}`,
      }}
      aria-label={`เสียง ${grapheme}`}
    >
      {display}
    </button>
  );
}

/** แถบด้านบนของนักเรียน: รูปประจำตัว ชื่อ ดาว และจำนวนวันต่อเนื่อง */
export function StudentTopBar({ back, title }: { back?: string; title?: string }) {
  const { student } = useStudents();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/75 border-b border-slate-200/70">
      <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-2.5">
        {back ? (
          <button onClick={() => nav(back)} className="btn-3d w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 grid place-items-center" aria-label="ย้อนกลับ">
            <ChevronLeft className="w-7 h-7" />
          </button>
        ) : (
          <div className="text-3xl">🦉</div>
        )}
        <div className="flex-1 min-w-0">
          {title ? (
            <h1 className="font-thai text-xl md:text-2xl truncate">
              {title} <span className="text-xs font-normal text-slate-400">• ครูนภรัฐ</span>
            </h1>
          ) : (
            <h1 className="font-kid font-bold text-xl md:text-2xl text-indigo-700 leading-tight">
              Phonics Pals <span className="font-thai text-xs font-normal text-slate-400">• โดย ครูนภรัฐ</span>
            </h1>
          )}
        </div>
        {student && (
          <>
            <div className="flex items-center gap-1.5 bg-orange-100 text-orange-600 rounded-full px-3 py-1.5 font-bold" title="เข้าเรียนต่อเนื่อง">
              <Flame className="w-5 h-5 fill-orange-500" /> {student.currentStreakDays}
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 rounded-full px-3 py-1.5 font-bold" title="ดาวสะสม">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" /> {student.totalStars}
            </div>
            <button onClick={() => nav('/avatar')} className="w-12 h-12 rounded-full bg-indigo-100 grid place-items-center text-3xl border-2 border-indigo-200" title={student.displayName}>
              {student.avatarIcon}
            </button>
          </>
        )}
      </div>
    </header>
  );
}

/** ดาว 1–3 ดวง */
export function Stars({ count, size = 28 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size, animationDelay: `${i * 0.15}s` }}
          className={`animate-pop ${i <= count ? 'fill-yellow-400 text-yellow-500' : 'fill-slate-200 text-slate-300'}`}
        />
      ))}
    </div>
  );
}

/** ปุ่มใหญ่แบบเกม */
export function BigButton({
  children,
  onClick,
  color = '#4f46e5',
  shadow = '#3730a3',
  className = '',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  shadow?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl px-6 py-4 min-h-[56px] font-thai text-xl text-white transition-transform active:translate-y-1 disabled:opacity-40 disabled:pointer-events-none ${className}`}
      style={{ background: color, boxShadow: `0 6px 0 0 ${shadow}` }}
    >
      {children}
    </button>
  );
}

/** พลุฉลอง */
export const celebrate = (big = false) => {
  confetti({ particleCount: big ? 160 : 70, spread: big ? 100 : 70, origin: { y: 0.6 }, colors: ['#2563eb', '#e11d48', '#eab308', '#059669', '#9333ea'] });
};

/** หน้าต่างฉลองรางวัลเมื่อจบบทเรียน */
export function StarRewardModal({
  open,
  stars,
  earnedStars,
  newCards,
  title,
  onClose,
}: {
  open: boolean;
  stars: number;
  earnedStars: number;
  newCards: { emoji: string; word: string; meaning: string }[];
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (open) celebrate(true);
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm grid place-items-center p-4">
      <div className="card w-full max-w-md p-7 text-center animate-pop">
        <div className="text-7xl animate-float">🏆</div>
        <h2 className="font-thai text-3xl mt-2 text-indigo-700">{title}</h2>
        <div className="flex justify-center mt-4">
          <Stars count={stars} size={52} />
        </div>
        <p className="font-thai text-xl mt-3">
          ได้รับ <span className="text-yellow-600 font-bold">+{earnedStars} ดาว</span>
        </p>
        {newCards.length > 0 && (
          <div className="mt-5">
            <p className="font-thai text-lg text-slate-500">สติกเกอร์ใหม่เข้าสมุดสะสม!</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {newCards.map((c) => (
                <div key={c.word} className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-2 animate-pop">
                  <div className="text-3xl">{c.emoji}</div>
                  <div className="font-kid font-semibold">{c.word}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <BigButton onClick={onClose} className="w-full mt-6" color="#16a34a" shadow="#166534">
          เก่งมาก! ไปต่อกันเลย 🚀
        </BigButton>
      </div>
    </div>
  );
}

/** หัวข้อหน้าจอพร้อมตัวการ์ตูนนกฮูกพูด */
export function MascotSays({ children, emoji = '🦉' }: { children: ReactNode; emoji?: string }) {
  return (
    <div className="flex items-end gap-3">
      <div className="text-5xl md:text-6xl animate-float shrink-0">{emoji}</div>
      <div className="relative bg-white rounded-3xl rounded-bl-md px-5 py-3 shadow-md border-2 border-indigo-100 font-thai text-lg md:text-xl">
        {children}
      </div>
    </div>
  );
}
