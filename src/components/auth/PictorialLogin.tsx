// src/components/auth/PictorialLogin.tsx
// หน้าเข้าสู่ระบบแบบรูปภาพ: เลือกชั้น -> เลือกรูปตัวเอง -> กด PIN 4 หลัก
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Delete, GraduationCap } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { GRADES } from '../../data/mockStudents';
import { MascotSays } from '../ui';
import type { StudentDocument } from '../../types/schema';

const GRADE_COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
const KEY_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#e11d48', '#a855f7', '#0ea5e9', '#eab308', '#14b8a6', '#ec4899', '#6366f1'];

export default function PictorialLogin() {
  const { students, login } = useStudents();
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [grade, setGrade] = useState<string | null>(null);
  const [picked, setPicked] = useState<StudentDocument | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const classStudents = students.filter((s) => s.gradeLevel === grade).sort((a, b) => a.studentNumber - b.studentNumber);

  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4 && picked) {
      setTimeout(() => {
        if (next === picked.pinCode) {
          login(picked.studentId);
          nav(picked.assessments.preTest.completed ? '/map' : '/test/preTest');
        } else {
          setError(true);
          setPin('');
        }
      }, 250);
    }
  };

  return (
    <div className="min-h-screen bg-playful flex flex-col">
      {/* ส่วนหัว */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🦉</span>
          <div>
            <span className="font-kid font-bold text-2xl text-indigo-700">Phonics Pals</span>
            <span className="font-thai text-xs text-slate-500 ml-2">โดย ครูนภรัฐ</span>
          </div>
        </div>
        <button onClick={() => nav('/teacher')} className="flex items-center gap-2 bg-white/80 border-2 border-slate-200 rounded-full px-4 py-2 font-thai text-slate-600 hover:bg-white">
          <GraduationCap className="w-5 h-5" /> สำหรับคุณครู
        </button>
      </header>

      {/* ตัวบอกขั้นตอน */}
      <div className="flex justify-center gap-3 mt-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`h-3 rounded-full transition-all ${step >= n ? 'bg-indigo-500 w-14' : 'bg-slate-300 w-8'}`} />
        ))}
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-6">
        {step > 1 && (
          <button
            onClick={() => {
              setStep((s) => (s === 3 ? 2 : 1));
              setPin('');
              setError(false);
            }}
            className="flex items-center gap-1 font-thai text-lg text-slate-600 mb-4"
          >
            <ChevronLeft className="w-6 h-6" /> ย้อนกลับ
          </button>
        )}

        {/* ขั้นที่ 1: เลือกชั้น */}
        {step === 1 && (
          <section className="animate-pop">
            <MascotSays>สวัสดีจ้า! หนูเรียนอยู่ชั้นไหนเอ่ย? 👋</MascotSays>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-8">
              {GRADES.map((g, i) => {
                const count = students.filter((s) => s.gradeLevel === g).length;
                return (
                  <button
                    key={g}
                    onClick={() => {
                      setGrade(g);
                      setStep(2);
                    }}
                    className="rounded-3xl h-36 md:h-44 text-white font-thai flex flex-col items-center justify-center active:translate-y-1 transition-transform"
                    style={{ background: GRADE_COLORS[i], boxShadow: `0 8px 0 0 ${GRADE_COLORS[i]}aa` }}
                  >
                    <span className="text-5xl md:text-6xl">{g}</span>
                    <span className="text-lg opacity-90 mt-1">{count} คน</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ขั้นที่ 2: เลือกรูปตัวเอง */}
        {step === 2 && (
          <section className="animate-pop">
            <MascotSays>ชั้น {grade} — แตะที่รูปของหนูเลย!</MascotSays>
            {classStudents.length === 0 ? (
              <div className="card p-10 mt-8 text-center font-thai text-xl text-slate-500">ยังไม่มีรายชื่อนักเรียนในชั้นนี้ ให้คุณครูเพิ่มรายชื่อก่อนนะ</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
                {classStudents.map((s) => (
                  <button
                    key={s.studentId}
                    onClick={() => {
                      setPicked(s);
                      setStep(3);
                    }}
                    className="card p-4 flex flex-col items-center hover:-translate-y-1 transition-transform border-4 border-transparent hover:border-indigo-300"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-pink-100 grid place-items-center text-6xl">{s.avatarIcon}</div>
                    <div className="font-thai text-lg mt-3 text-center leading-tight">{s.displayName}</div>
                    <div className="mt-1 bg-slate-100 rounded-full px-3 py-0.5 text-sm font-thai text-slate-600">เลขที่ {s.studentNumber}</div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ขั้นที่ 3: กดรหัส PIN */}
        {step === 3 && picked && (
          <section className="animate-pop flex flex-col items-center">
            <div className="text-8xl animate-float">{picked.avatarIcon}</div>
            <h2 className="font-thai text-3xl mt-2">{picked.displayName}</h2>
            <p className="font-thai text-lg text-slate-500">กดรหัสลับ 4 ตัวของหนู</p>
            <div className={`flex gap-4 mt-5 ${error ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-2xl border-4 grid place-items-center text-3xl transition-all ${
                    pin.length > i ? 'bg-indigo-500 border-indigo-500 scale-110' : error ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'
                  }`}
                >
                  {pin.length > i && <span className="text-white">★</span>}
                </div>
              ))}
            </div>
            {error && <p className="font-thai text-rose-500 text-lg mt-3">รหัสยังไม่ถูก ลองใหม่อีกครั้งนะ 😊</p>}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d, i) => (
                <button
                  key={d}
                  onClick={() => press(d)}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-3xl text-white text-4xl font-kid font-bold active:translate-y-1 transition-transform"
                  style={{ background: KEY_COLORS[i], boxShadow: `0 6px 0 0 ${KEY_COLORS[i]}99` }}
                >
                  {d}
                </button>
              ))}
              <div />
              <button
                onClick={() => press('0')}
                className="w-20 h-20 md:w-24 md:h-24 rounded-3xl text-white text-4xl font-kid font-bold active:translate-y-1 transition-transform"
                style={{ background: KEY_COLORS[9], boxShadow: `0 6px 0 0 ${KEY_COLORS[9]}99` }}
              >
                0
              </button>
              <button onClick={() => setPin((p) => p.slice(0, -1))} className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-200 grid place-items-center active:translate-y-1" aria-label="ลบ">
                <Delete className="w-9 h-9 text-slate-600" />
              </button>
            </div>
            <p className="font-thai text-sm text-slate-400 mt-6">(โหมดตัวอย่าง: รหัสของทุกคนคือ 1234)</p>
          </section>
        )}
      </main>
    </div>
  );
}
