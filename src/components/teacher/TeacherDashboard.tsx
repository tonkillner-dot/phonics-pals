// src/components/teacher/TeacherDashboard.tsx
// แดชบอร์ดสำหรับคุณครูนภรัฐ (รหัส PIN ครู: 9999)
// ดูคะแนน Pre-test / Post-test, ค่าพัฒนาการ (Δ, g), ปลดล็อก Post-test, จุดที่เด็กติดขัด (ตะกร้าแดง), จัดการรายชื่อ และส่งออก CSV
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  ChevronLeft,
  Download,
  FileText,
  Lock,
  Monitor,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Unlock,
  Users,
} from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { GRADES, emptyAssessment } from '../../data/mockStudents';
import { LESSONS, WORD_MAP } from '../../data/curriculumData';
import { computeLearningGain, exportStudentsToCSV } from '../../services/assessmentEngine';
import type { StudentDocument } from '../../types/schema';

const TEACHER_PIN = '9999';
const AVATARS = ['🦁', '🐼', '🦊', '🐰', '🐯', '🐨', '🐸', '🦄', '🐵', '🐧', '🐶', '🐱'];

export default function TeacherDashboard() {
  const { students, updateById, addStudent, removeStudent, resetDemo } = useStudents();
  const nav = useNavigate();

  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<string>('ทั้งหมด');

  // ฟอร์มเพิ่มนักเรียน
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('ป.1');
  const [newNumber, setNewNumber] = useState(1);
  const [newAvatar, setNewAvatar] = useState('🦁');
  const [newPin, setNewPin] = useState('1234');

  const filtered = useMemo(
    () =>
      students
        .filter((s) => gradeFilter === 'ทั้งหมด' || s.gradeLevel === gradeFilter)
        .sort((a, b) => a.gradeLevel.localeCompare(b.gradeLevel) || a.studentNumber - b.studentNumber),
    [students, gradeFilter],
  );

  // คำนวณคำศัพท์ที่นักเรียนติดในตะกร้าแดงมากที่สุด (SRS Bottleneck Heatmap)
  const redHotspots = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const s of filtered) {
      for (const st of Object.values(s.srsState)) {
        if (st.bucket === 'red') {
          countMap.set(st.wordId, (countMap.get(st.wordId) ?? 0) + 1);
        }
      }
    }
    return [...countMap.entries()]
      .map(([wordId, count]) => ({ word: WORD_MAP[wordId], count }))
      .filter((x) => x.word)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filtered]);

  // สรุปภาพรวม
  const stats = useMemo(() => {
    const preList = filtered.filter((s) => s.assessments.preTest.completed).map((s) => s.assessments.preTest.totalScore);
    const postList = filtered.filter((s) => s.assessments.postTest.completed).map((s) => s.assessments.postTest.totalScore);
    const avgPre = preList.length ? Math.round(preList.reduce((a, b) => a + b, 0) / preList.length) : null;
    const avgPost = postList.length ? Math.round(postList.reduce((a, b) => a + b, 0) / postList.length) : null;
    return { total: filtered.length, avgPre, avgPost };
  }, [filtered]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === TEACHER_PIN) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const togglePostTestForAll = (enable: boolean) => {
    for (const s of filtered) {
      updateById(s.studentId, {
        assessments: { ...s.assessments, postTestUnlockedByTeacher: enable },
      });
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const doc: StudentDocument = {
      studentId: `std_${Date.now()}`,
      studentNumber: Number(newNumber) || 1,
      displayName: newName.trim(),
      gradeLevel: newGrade,
      avatarIcon: newAvatar,
      pinCode: newPin.padStart(4, '0').slice(0, 4),
      totalStars: 0,
      currentStreakDays: 0,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      unlockedAvatarItems: [],
      unlockedVocabCards: [],
      currentStageId: 1,
      currentLessonId: 'stage1_lesson1',
      completedLessonIds: [],
      srsState: {},
      assessments: {
        preTest: emptyAssessment(),
        postTest: emptyAssessment(),
        postTestUnlockedByTeacher: false,
        stageChecks: {
          1: { preScore: null, postScore: null },
          2: { preScore: null, postScore: null },
          3: { preScore: null, postScore: null },
          4: { preScore: null, postScore: null },
          5: { preScore: null, postScore: null },
        },
      },
      updatedAt: new Date().toISOString(),
    };
    addStudent(doc);
    setNewName('');
    setShowAdd(false);
  };

  // ---------- หน้าใส่รหัส PIN ครู ----------
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-playful grid place-items-center p-4">
        <div className="card max-w-md w-full p-8 text-center animate-pop">
          <div className="text-6xl">👨‍🏫</div>
          <h1 className="font-thai text-3xl mt-3 text-indigo-800">ระบบจัดการสำหรับคุณครู</h1>
          <p className="font-thai text-slate-500 mt-1">ผู้จัดทำ: ครูนภรัฐ • โรงเรียนบ้านส้อเด่นพัฒนา</p>
          <form onSubmit={handlePinSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="รหัส PIN ครู (9999)"
              className="w-full text-center text-3xl tracking-widest font-kid font-bold border-4 border-slate-200 rounded-2xl py-3 focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
            {pinError && <p className="font-thai text-rose-600">รหัสไม่ถูกต้อง (รหัสเริ่มต้นคือ 9999)</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-thai text-xl py-3.5 rounded-2xl transition-colors"
            >
              เข้าสู่หน้าแดชบอร์ดครู
            </button>
            <button
              type="button"
              onClick={() => nav('/')}
              className="w-full font-thai text-slate-500 hover:text-slate-700 py-2"
            >
              กลับหน้าแรกนักเรียน
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------- หน้าแดชบอร์ดครู ----------
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-body">
      {/* แถบหัวกระดาษพร้อมเครดิตครูนภรัฐ */}
      <header
        className="text-white shadow-md"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav('/')}
              className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 grid place-items-center"
              title="กลับหน้านักเรียน"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-thai text-2xl md:text-3xl font-bold">แดชบอร์ดติดตามพัฒนาการโฟนิกส์</h1>
              <p className="text-sm text-blue-100">ครูนภรัฐ อุดเต็น (ครูต้น) • โรงเรียนบ้านส้อเด่นพัฒนา</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-white text-blue-900 font-thai px-4 py-2 rounded-xl hover:bg-blue-50"
            >
              <Plus className="w-5 h-5" /> เพิ่มนักเรียน
            </button>
            <button
              onClick={() => exportStudentsToCSV(filtered)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-thai px-4 py-2 rounded-xl"
            >
              <Download className="w-5 h-5" /> ส่งออก Excel (.csv)
            </button>
            <button
              onClick={() => {
                if (confirm('รีเซ็ตข้อมูลกลับเป็นข้อมูลตัวอย่างเริ่มต้นทั้งหมดหรือไม่?')) resetDemo();
              }}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-thai px-3 py-2 rounded-xl text-sm"
              title="รีเซ็ตข้อมูลตัวอย่าง"
            >
              <RefreshCw className="w-4 h-4" /> รีเซ็ตตัวอย่าง
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* การ์ดสรุป 3 ช่อง */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 grid place-items-center">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <div className="text-slate-500 text-sm">นักเรียนทั้งหมด (ตามตัวกรอง)</div>
              <div className="font-thai text-3xl font-bold text-slate-800">{stats.total} คน</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 grid place-items-center">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="text-slate-500 text-sm">คะแนนเฉลี่ย ก่อนเรียน (Pre-test)</div>
              <div className="font-thai text-3xl font-bold text-slate-800">
                {stats.avgPre !== null ? `${stats.avgPre} / 100` : 'ยังไม่สอบ'}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <div className="text-slate-500 text-sm">คะแนนเฉลี่ย หลังเรียน (Post-test)</div>
              <div className="font-thai text-3xl font-bold text-emerald-700">
                {stats.avgPost !== null ? `${stats.avgPost} / 100` : 'รอสอบหลังเรียน'}
              </div>
            </div>
          </div>
        </section>

        {/* จุดที่นักเรียนติดขัดมากที่สุด (Red Bucket Bottleneck Heatmap) */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-rose-700 font-thai text-xl font-bold">
            <AlertTriangle className="w-6 h-6" /> คำศัพท์ที่นักเรียนยังออกเสียงไม่คล่อง (ติดในตะกร้าแดงสูงสุด)
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            ใช้ดูว่าควรทบทวนเสียงหรือคำไหนเพิ่มหน้าชั้นเรียน
          </p>
          {redHotspots.length === 0 ? (
            <div className="mt-3 text-slate-500">ไม่มีคำในตะกร้าแดง</div>
          ) : (
            <div className="flex flex-wrap gap-3 mt-4">
              {redHotspots.map(({ word, count }) => (
                <div
                  key={word.id}
                  className="flex items-center gap-2 bg-rose-50 border-2 border-rose-200 rounded-2xl px-4 py-2"
                >
                  <span className="text-3xl">{word.emoji}</span>
                  <div>
                    <div className="font-kid font-bold text-lg text-rose-900">
                      {word.word} <span className="font-thai text-sm text-slate-600">({word.meaningThai})</span>
                    </div>
                    <div className="text-xs text-rose-600 font-semibold">ติดขัด {count} คน</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* แถบกรองชั้นเรียน + ปุ่มปลดล็อก Post-test ทั้งชั้น */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {['ทั้งหมด', ...GRADES].map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-4 py-2 rounded-xl font-thai text-base transition-colors ${
                  gradeFilter === g ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => togglePostTestForAll(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-thai px-4 py-2 rounded-xl text-sm"
            >
              <Unlock className="w-4 h-4" /> เปิดสอบ Post-test ทั้งห้อง
            </button>
            <button
              onClick={() => togglePostTestForAll(false)}
              className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-thai px-3 py-2 rounded-xl text-sm"
            >
              <Lock className="w-4 h-4" /> ปิดสอบ Post-test
            </button>
          </div>
        </section>

        {/* ตารางคะแนนพัฒนาการรายบุคคล */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-thai text-base border-b border-slate-200">
                <th className="py-3.5 px-4 text-center">ชั้น / เลขที่</th>
                <th className="py-3.5 px-4">ชื่อนักเรียน</th>
                <th className="py-3.5 px-4 text-center">รหัส PIN</th>
                <th className="py-3.5 px-4 text-center">ด่านปัจจุบัน</th>
                <th className="py-3.5 px-4 text-center">ก่อนเรียน (100)</th>
                <th className="py-3.5 px-4 text-center">หลังเรียน (100)</th>
                <th className="py-3.5 px-4 text-center">พัฒนาการ (Δ)</th>
                <th className="py-3.5 px-4 text-center">ดาว / คำศัพท์</th>
                <th className="py-3.5 px-4 text-center">ปลดล็อก Post-test</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filtered.map((s) => {
                const g = computeLearningGain(s);
                return (
                  <tr key={s.studentId} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 text-center font-semibold">
                      {s.gradeLevel} #{s.studentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{s.avatarIcon}</span>
                        <span className="font-thai text-base font-semibold">{s.displayName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">{s.pinCode}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 font-thai">
                        ด่านที่ {s.currentStageId} ({s.completedLessonIds.length} บท)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-base">
                      {g.preScore !== null ? g.preScore : <span className="text-slate-400 font-normal">ยังไม่สอบ</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-base">
                      {g.postScore !== null ? g.postScore : <span className="text-slate-400 font-normal">ยังไม่สอบ</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {g.rawGain !== null ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold rounded-full px-3 py-1">
                          {g.rawGain >= 0 ? `+${g.rawGain}` : g.rawGain} ({Math.round((g.normalizedGain ?? 0) * 100)}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      ⭐ {s.totalStars} • 📒 {s.unlockedVocabCards.length}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() =>
                          updateById(s.studentId, {
                            assessments: {
                              ...s.assessments,
                              postTestUnlockedByTeacher: !s.assessments.postTestUnlockedByTeacher,
                            },
                          })
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          s.assessments.postTestUnlockedByTeacher
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.assessments.postTestUnlockedByTeacher ? '🔓 เปิดให้สอบแล้ว' : '🔒 ปิดอยู่'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`ลบรายชื่อ ${s.displayName} หรือไม่?`)) removeStudent(s.studentId);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="ลบนักเรียน"
                      >
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* คลังใบงาน Phonics A4 และโหมดจอทีวีสำหรับคุณครู */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-thai text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                คลังใบงาน A4 และโหมดจอทีวีประจำบทเรียน (พิมพ์แจก / สอนหน้าห้อง)
              </h2>
              <p className="font-thai text-sm text-slate-500">
                คุณครูสามารถคลิกเปิดใบงานเพื่อสั่งพิมพ์แจก หรือเปิดโหมดจอทีวีหน้าชั้นเรียนเพื่อสอนนักเรียนพร้อมกัน
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {LESSONS.map((l) => (
              <div
                key={l.id}
                className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-thai font-semibold text-indigo-600">
                    ด่านที่ {l.stageId} • บทที่ {l.order}
                  </div>
                  <div className="font-thai font-bold text-slate-800 text-base mt-0.5">
                    {l.title}
                  </div>
                  <div className="font-kid text-slate-500 text-sm mt-0.5">
                    เสียง: {l.targetPhonemes.join(' · ')}
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-2.5 border-t border-slate-200">
                  <button
                    onClick={() => nav(`/worksheet/${l.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-thai text-xs font-bold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> พิมพ์ใบงาน A4
                  </button>
                  <button
                    onClick={() => nav(`/lesson/${l.id}`)}
                    className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-thai text-xs font-bold transition-colors"
                    title="เปิดสอนในโหมดจอทีวี"
                  >
                    <Monitor className="w-3.5 h-3.5" /> จอทีวี
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* หน้าต่างเพิ่มนักเรียนใหม่ */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 grid place-items-center p-4">
          <form onSubmit={handleAddStudent} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 animate-pop">
            <h2 className="font-thai text-2xl font-bold text-slate-800">เพิ่มรายชื่อนักเรียนใหม่</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">ชั้นเรียน</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 mt-1"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">เลขที่</label>
                <input
                  type="number"
                  min={1}
                  value={newNumber}
                  onChange={(e) => setNewNumber(Number(e.target.value))}
                  className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">ชื่อ-นามสกุล</label>
              <input
                type="text"
                required
                placeholder="เช่น ด.ช. สมปอง ใจดี"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">รหัส PIN 4 หลัก</label>
              <input
                type="text"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 mt-1 font-mono"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">เลือกรูปการ์ตูนประจำตัว</label>
              <div className="grid grid-cols-6 gap-2 mt-1">
                {AVATARS.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setNewAvatar(a)}
                    className={`text-2xl py-1.5 rounded-xl ${newAvatar === a ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-slate-50'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-thai"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-thai"
              >
                บันทึกนักเรียน
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
