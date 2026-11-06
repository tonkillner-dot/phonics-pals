// src/components/student/AvatarRoom.tsx
// ห้องแต่งตัว: ใช้ดาวที่สะสมแลกของตกแต่งตัวการ์ตูน
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, LogOut, Star } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { StudentTopBar, celebrate } from '../ui';

interface Item {
  id: string;
  emoji: string;
  name: string;
  cost: number;
  slot: 'hat' | 'face' | 'pet' | 'bg';
}

const ITEMS: Item[] = [
  { id: 'hat_cap', emoji: '🧢', name: 'หมวกแก๊ป', cost: 20, slot: 'hat' },
  { id: 'hat_party', emoji: '🥳', name: 'หมวกปาร์ตี้', cost: 40, slot: 'hat' },
  { id: 'hat_crown', emoji: '👑', name: 'มงกุฎ', cost: 150, slot: 'hat' },
  { id: 'hat_grad', emoji: '🎓', name: 'หมวกบัณฑิต', cost: 200, slot: 'hat' },
  { id: 'face_glasses', emoji: '👓', name: 'แว่นตา', cost: 30, slot: 'face' },
  { id: 'face_sun', emoji: '🕶️', name: 'แว่นกันแดด', cost: 60, slot: 'face' },
  { id: 'pet_chick', emoji: '🐥', name: 'ลูกเจี๊ยบ', cost: 50, slot: 'pet' },
  { id: 'pet_dragon', emoji: '🐉', name: 'มังกรน้อย', cost: 180, slot: 'pet' },
  { id: 'bg_rainbow', emoji: '🌈', name: 'สายรุ้ง', cost: 80, slot: 'bg' },
  { id: 'bg_space', emoji: '🪐', name: 'อวกาศ', cost: 120, slot: 'bg' },
];

const AVATARS = ['🦁', '🐼', '🦊', '🐰', '🐯', '🐨', '🐸', '🦄', '🐵', '🐧', '🐶', '🐱'];

export default function AvatarRoom() {
  const { student, update, logout } = useStudents();
  const nav = useNavigate();
  const [equipped, setEquipped] = useState<Record<string, string>>({});
  if (!student) return null;

  const owned = new Set(student.unlockedAvatarItems);
  const buy = (it: Item) => {
    if (owned.has(it.id)) {
      setEquipped((e) => ({ ...e, [it.slot]: e[it.slot] === it.id ? '' : it.id }));
      return;
    }
    if (student.totalStars < it.cost) return;
    update((s) => ({ totalStars: s.totalStars - it.cost, unlockedAvatarItems: [...s.unlockedAvatarItems, it.id] }));
    setEquipped((e) => ({ ...e, [it.slot]: it.id }));
    celebrate();
  };
  const on = (slot: Item['slot']) => ITEMS.find((i) => i.id === equipped[slot]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-violet-50 pb-16">
      <StudentTopBar back="/map" title="👕 ห้องแต่งตัว" />
      <main className="max-w-5xl mx-auto px-4 pt-6 grid md:grid-cols-[340px_1fr] gap-6">
        {/* ตัวการ์ตูน */}
        <section className="card p-6 flex flex-col items-center h-fit md:sticky md:top-24">
          <div className="relative w-56 h-56 rounded-full grid place-items-center bg-gradient-to-br from-sky-100 to-pink-100 overflow-hidden">
            {on('bg') && <span className="absolute text-[180px] opacity-30">{on('bg')!.emoji}</span>}
            <span className="relative text-[130px] leading-none">{student.avatarIcon}</span>
            {on('hat') && <span className="absolute top-2 text-7xl">{on('hat')!.emoji}</span>}
            {on('face') && <span className="absolute top-[88px] text-6xl">{on('face')!.emoji}</span>}
            {on('pet') && <span className="absolute bottom-3 right-6 text-5xl animate-float">{on('pet')!.emoji}</span>}
          </div>
          <h2 className="font-thai text-2xl mt-4">{student.displayName}</h2>
          <p className="font-thai text-slate-500">{student.gradeLevel} • เลขที่ {student.studentNumber}</p>
          <div className="mt-3 flex items-center gap-2 bg-yellow-100 text-yellow-700 rounded-full px-4 py-2 font-bold text-xl">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-500" /> {student.totalStars} ดาว
          </div>
          <div className="mt-5 w-full">
            <div className="font-thai text-slate-500 mb-2">เปลี่ยนตัวการ์ตูน</div>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a) => (
                <button key={a} onClick={() => update({ avatarIcon: a })} className={`text-3xl rounded-xl aspect-square ${student.avatarIcon === a ? 'bg-indigo-100 ring-4 ring-indigo-300' : 'bg-slate-50'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              nav('/');
            }}
            className="mt-6 flex items-center gap-2 font-thai text-slate-500 hover:text-rose-500"
          >
            <LogOut className="w-5 h-5" /> ออกจากระบบ
          </button>
        </section>

        {/* ร้านค้า */}
        <section>
          <h3 className="font-thai text-2xl mb-3">🛍️ ร้านค้าแลกดาว</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ITEMS.map((it) => {
              const has = owned.has(it.id);
              const canBuy = student.totalStars >= it.cost;
              const wearing = equipped[it.slot] === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => buy(it)}
                  className={`card p-4 flex flex-col items-center border-4 transition-transform hover:-translate-y-1 ${wearing ? 'border-green-400' : 'border-transparent'} ${!has && !canBuy ? 'opacity-60' : ''}`}
                >
                  <span className="text-6xl">{it.emoji}</span>
                  <span className="font-thai text-lg mt-2">{it.name}</span>
                  {has ? (
                    <span className={`mt-2 rounded-full px-3 py-1 font-thai ${wearing ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {wearing ? <><Check className="inline w-4 h-4" /> ใส่อยู่</> : 'แตะเพื่อใส่'}
                    </span>
                  ) : (
                    <span className={`mt-2 rounded-full px-3 py-1 font-bold flex items-center gap-1 ${canBuy ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-200 text-slate-500'}`}>
                      {canBuy ? <Star className="w-4 h-4 fill-yellow-900" /> : <Lock className="w-4 h-4" />} {it.cost}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
