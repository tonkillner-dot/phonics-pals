// src/components/student/StageMap.tsx
// หน้าแผนที่ด่าน (หน้าหลักของนักเรียน)
import { useNavigate } from 'react-router-dom';
import { BookOpen, Check, Lock, Play, Shirt, Sparkles, Trophy } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { LESSONS, STAGES, WORD_MAP, lessonsOfStage } from '../../data/curriculumData';
import { StudentTopBar } from '../ui';

export default function StageMap() {
  const { student } = useStudents();
  const nav = useNavigate();
  if (!student) return null;

  const done = new Set(student.completedLessonIds);
  const firstOpen = LESSONS.find((l) => !done.has(l.id))?.id;
  const reviewWords = Object.values(student.srsState).filter((s) => s.bucket === 'red' && WORD_MAP[s.wordId]);
  const allDone = LESSONS.every((l) => done.has(l.id));
  const postOpen = (allDone || student.assessments.postTestUnlockedByTeacher) && !student.assessments.postTest.completed;
  const progress = Math.round((done.size / LESSONS.length) * 100);

  return (
    <div className="min-h-screen bg-playful pb-20">
      <StudentTopBar />

      <main className="max-w-5xl mx-auto px-4 pt-5">
        {/* การ์ดทักทาย */}
        <section className="card p-5 md:p-6 flex flex-col md:flex-row gap-5 items-center bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
          <div className="text-7xl animate-float">{student.avatarIcon}</div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-thai text-2xl md:text-3xl">สวัสดี {student.displayName.replace(/^ด\.(ช|ญ)\.\s*/, 'น้อง')}! 🌈</h2>
            <p className="font-thai text-lg opacity-90 mt-1">เรียนไปแล้ว {done.size} จาก {LESSONS.length} บท</p>
            <div className="h-4 bg-white/25 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {reviewWords.length > 0 ? (
            <button
              onClick={() => nav('/warmup')}
              className="bg-white text-rose-600 rounded-3xl px-6 py-4 font-thai text-xl active:translate-y-1 transition-transform flex items-center gap-3"
              style={{ boxShadow: '0 6px 0 0 #fda4af' }}
            >
              <span className="text-4xl">🔥</span>
              <span className="text-left leading-tight">
                อุ่นเครื่อง 2 นาที
                <br />
                <span className="text-base text-slate-500">ทบทวน {Math.min(reviewWords.length, 5)} คำ</span>
              </span>
            </button>
          ) : (
            <div className="bg-white/20 rounded-3xl px-5 py-3 font-thai text-lg text-center">✅ ทบทวนครบแล้ววันนี้</div>
          )}
        </section>

        {/* แถบอธิบาย 5 ขั้นตอนการฝึกสะกด Phonics ในแต่ละบทเรียน */}
        <section className="card p-4 mt-5 bg-white border-2 border-indigo-100">
          <div className="font-thai text-base font-bold text-indigo-800 mb-2">
            🎯 ขั้นตอนการฝึกสะกดและออกเสียง Phonics ในแต่ละบท (ต้องสอบผ่านท้ายบท 80% จึงจะไปบทใหม่ได้)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-thai text-sm">
            <div className="bg-indigo-50 text-indigo-800 rounded-xl p-2">1. รู้จักเสียงตัวอักษร/สระ</div>
            <div className="bg-sky-50 text-sky-800 rounded-xl p-2">2. ฟังเลือกเสียงซ้ำจนแม่น</div>
            <div className="bg-purple-50 text-purple-800 rounded-xl p-2">3. ฝึกผสมเสียงเป็นคำ</div>
            <div className="bg-amber-50 text-amber-800 rounded-xl p-2">4. ฟังแล้วต่อเสียงสะกดคำ</div>
            <div className="bg-rose-50 text-rose-800 rounded-xl p-2">5. ทดสอบท้ายบท (80%)</div>
          </div>
        </section>

        {/* ปุ่มลัด */}
        <section className="grid grid-cols-2 gap-4 mt-5">
          <button onClick={() => nav('/stickers')} className="card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 grid place-items-center"><BookOpen className="w-8 h-8 text-amber-600" /></div>
            <div className="text-left">
              <div className="font-thai text-lg md:text-xl">สมุดสติกเกอร์</div>
              <div className="font-thai text-slate-500">{student.unlockedVocabCards.length} ใบ</div>
            </div>
          </button>
          <button onClick={() => nav('/avatar')} className="card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-pink-100 grid place-items-center"><Shirt className="w-8 h-8 text-pink-600" /></div>
            <div className="text-left">
              <div className="font-thai text-lg md:text-xl">ห้องแต่งตัว</div>
              <div className="font-thai text-slate-500">ใช้ดาวแลกของ</div>
            </div>
          </button>
        </section>

        {/* แบบทดสอบหลังเรียน */}
        {postOpen && (
          <button onClick={() => nav('/test/postTest')} className="w-full card p-5 mt-5 flex items-center gap-4 border-4 border-yellow-300 bg-yellow-50 animate-pop">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <div className="text-left flex-1">
              <div className="font-thai text-2xl">แบบทดสอบหลังเรียนเปิดแล้ว!</div>
              <div className="font-thai text-slate-600">มาดูกันว่าหนูเก่งขึ้นแค่ไหน</div>
            </div>
            <Play className="w-10 h-10 text-yellow-600 fill-yellow-500" />
          </button>
        )}

        {/* แผนที่ด่าน */}
        <div className="mt-8 space-y-10">
          {STAGES.map((stage) => {
            const lessons = lessonsOfStage(stage.id);
            const stageDone = lessons.every((l) => done.has(l.id));
            const stageLocked = lessons.every((l) => !done.has(l.id) && l.id !== firstOpen);
            return (
              <section key={stage.id} className={stageLocked ? 'opacity-60' : ''}>
                <div className="flex items-center gap-3 rounded-3xl px-5 py-4 text-white" style={{ background: `linear-gradient(135deg, ${stage.color}, ${stage.color}cc)` }}>
                  <span className="text-4xl">{stage.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-thai text-2xl">{stage.title}</h3>
                    <p className="font-thai opacity-90">{stage.subtitle}</p>
                  </div>
                  {stageDone && <span className="bg-white/25 rounded-full px-3 py-1 font-thai">ผ่านแล้ว ✓</span>}
                  {stageLocked && <Lock className="w-7 h-7" />}
                </div>

                {/* เส้นทางคดเคี้ยว */}
                <div className="relative mt-4 px-2">
                  {lessons.map((l, i) => {
                    const isDone = done.has(l.id);
                    const isCurrent = l.id === firstOpen;
                    const locked = !isDone && !isCurrent;
                    const offset = [0, 60, 0, -60][i % 4];
                    return (
                      <div key={l.id} className="flex flex-col items-center py-3" style={{ transform: `translateX(${offset}px)` }}>
                        <button
                          disabled={locked}
                          onClick={() => nav(`/lesson/${l.id}`)}
                          className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full grid place-items-center transition-transform active:translate-y-1 ${isCurrent ? 'animate-float' : ''}`}
                          style={{
                            background: locked ? '#cbd5e1' : isDone ? stage.color : '#ffffff',
                            border: isCurrent ? `6px solid ${stage.color}` : 'none',
                            boxShadow: `0 8px 0 0 ${locked ? '#94a3b8' : isDone ? stage.color + '99' : stage.color + '66'}`,
                          }}
                        >
                          {isDone ? (
                            <Check className="w-12 h-12 text-white" strokeWidth={3.5} />
                          ) : locked ? (
                            <Lock className="w-10 h-10 text-slate-500" />
                          ) : (
                            <Play className="w-12 h-12" style={{ color: stage.color, fill: stage.color }} />
                          )}
                          {isCurrent && (
                            <span className="absolute -top-9 bg-white rounded-xl px-3 py-1 font-thai text-base shadow-md border-2 whitespace-nowrap" style={{ borderColor: stage.color, color: stage.color }}>
                              <Sparkles className="inline w-4 h-4 -mt-1" /> เริ่มตรงนี้!
                            </span>
                          )}
                        </button>
                        <div className="mt-3 text-center max-w-[220px]">
                          <div className="font-thai text-lg leading-tight">{l.title}</div>
                          <div className="font-kid text-slate-500 tracking-wide">{l.targetPhonemes.join(' · ')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
