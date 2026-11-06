// src/components/learning/PrintableWorksheet.tsx
// ระบบสร้างใบงาน Phonics ขนาด A4 สำหรับพิมพ์แจกนักเรียน (Printable PDF / A4 Worksheet)
// ผู้จัดทำ: ครูนภรัฐ โรงเรียนบ้านส้อเด่นพัฒนา
// [กฎเหล็กสูงสุด] ห้ามใช้ตัวเลขไทยเด็ดขาด ใช้ตัวเลขอารบิก (1, 2, 3...) 100%

import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { STAGES, WORD_MAP, getLesson, getPhoneme } from '../../data/curriculumData';
import type { WordItem } from '../../types/schema';

export default function PrintableWorksheet() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const nav = useNavigate();

  const lesson = lessonId ? getLesson(lessonId) : null;
  const stage = lesson ? STAGES.find((s) => s.id === lesson.stageId) : null;

  if (!lesson || !stage) {
    return (
      <div className="min-h-screen grid place-items-center font-thai text-xl p-4">
        <div className="text-center">
          <p className="text-slate-600">ไม่พบบทเรียนสำหรับสร้างใบงาน</p>
          <button
            onClick={() => nav('/map')}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl"
          >
            กลับสู่แผนที่ด่าน
          </button>
        </div>
      </div>
    );
  }

  const words: WordItem[] = lesson.wordIds
    .map((id: string) => WORD_MAP[id])
    .filter((w): w is WordItem => Boolean(w));
  const phonemes: string[] = lesson.targetPhonemes;
  const targetWords = words.slice(0, 4); // คำศัพท์หลัก 4 คำประจำบท

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-2 sm:px-4 print:bg-white print:p-0">
      {/* แถบควบคุมด้านบน (ซ่อนเวลาสั่งพิมพ์) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 print:hidden">
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-thai text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>ย้อนกลับ</span>
        </button>

        <div className="text-center sm:text-left">
          <div className="font-thai font-bold text-slate-800 text-lg">
            ใบงานกิจกรรม: {lesson.title}
          </div>
          <div className="font-thai text-xs text-slate-500">
            {stage.title} • ผู้จัดทำ: ครูนภรัฐ โรงเรียนบ้านส้อเด่นพัฒนา
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-thai font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Printer className="w-5 h-5" />
          <span>พิมพ์ใบงาน / บันทึกเป็น PDF</span>
        </button>
      </div>

      {/* แผ่นกระดาษใบงาน A4 สำหรับพิมพ์ */}
      <div className="a4-sheet max-w-[210mm] mx-auto bg-white p-8 sm:p-12 shadow-lg border border-slate-300 rounded-lg print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
        
        {/* ส่วนหัวกระดาษ (Header) */}
        <header className="border-b-2 border-indigo-900 pb-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-thai text-xs font-bold tracking-wider text-indigo-700 uppercase">
                โรงเรียนบ้านส้อเด่นพัฒนา • กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ (ภาษาอังกฤษ)
              </div>
              <h1 className="font-thai text-2xl font-bold text-slate-900 mt-0.5">
                แบบฝึกทักษะการสะกดคำและอ่านออกเสียง Phonics (Synthetic Phonics)
              </h1>
              <div className="font-thai text-sm text-slate-600 mt-0.5">
                <span className="font-bold text-indigo-900">{stage.title}</span> • {lesson.title}
              </div>
            </div>
            <div className="text-right border-l-2 border-slate-300 pl-4 shrink-0">
              <div className="font-thai text-xs text-slate-500">ผู้จัดทำเอกสาร</div>
              <div className="font-thai font-bold text-base text-indigo-900">ครูนภรัฐ อุดเต็น</div>
              <div className="font-thai text-xs text-slate-500">(ครูต้น)</div>
            </div>
          </div>

          {/* ช่องกรอกข้อมูลนักเรียนและคะแนน */}
          <div className="mt-3 pt-2.5 border-t border-dashed border-slate-300 flex flex-wrap items-center justify-between gap-2 font-thai text-sm text-slate-800">
            <div>
              ชื่อ-นามสกุล: <span className="inline-block border-b border-dotted border-slate-500 w-56">&nbsp;</span>
            </div>
            <div>
              ชั้น: <span className="inline-block border-b border-dotted border-slate-500 w-16 text-center">ป.&nbsp;&nbsp;</span>
            </div>
            <div>
              เลขที่: <span className="inline-block border-b border-dotted border-slate-500 w-12 text-center">&nbsp;</span>
            </div>
            <div>
              วันที่: <span className="inline-block border-b border-dotted border-slate-500 w-24 text-center">&nbsp;</span>
            </div>
            <div className="border border-slate-400 rounded-lg px-3 py-1 bg-slate-50 text-xs font-bold">
              คะแนนที่ได้: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] / 10
            </div>
          </div>
        </header>

        {/* เนื้อหาใบงานแบ่งเป็น 4 ตอน ตามลำดับการเรียนรู้ 5 ขั้นตอน */}
        <div className="mt-5 space-y-5">
          
          {/* ตอนที่ 1: คัดตามรอยประและเทียบเสียงโฟนิกส์ (Sound & Letter Tracing) */}
          <section className="border border-slate-300 rounded-xl p-3.5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
              <h2 className="font-thai font-bold text-base text-indigo-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-900 text-white text-xs grid place-items-center">1</span>
                <span>ตอนที่ 1: ฝึกคัดตัวอักษรและเปล่งเสียงโฟนิกส์ให้ถูกต้อง (2 คะแนน)</span>
              </h2>
              <span className="font-thai text-xs text-slate-500">คัดตามรอยประและเทียบเสียง</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {phonemes.slice(0, 6).map((phStr: string) => {
                const ph = getPhoneme(phStr);
                return (
                  <div
                    key={phStr}
                    className="border border-slate-300 rounded-lg p-2 text-center bg-slate-50 flex flex-col items-center justify-between"
                  >
                    <span className="font-kid text-3xl font-bold text-indigo-950 leading-none">
                      {ph.grapheme}
                    </span>
                    <span className="font-kid text-2xl text-slate-400 font-normal border-b border-dashed border-slate-400 w-12 my-1">
                      {ph.grapheme}
                    </span>
                    <span className="font-thai text-xs text-slate-700 font-medium">
                      {ph.thaiHint.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ตอนที่ 2: วงกลมเสียงที่ได้ยิน (Sound Discrimination Check) */}
          <section className="border border-slate-300 rounded-xl p-3.5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
              <h2 className="font-thai font-bold text-base text-indigo-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-900 text-white text-xs grid place-items-center">2</span>
                <span>ตอนที่ 2: ฟังเสียงจากคุณครู/จอทีวี แล้วกากบาท (X) ทับตัวอักษรที่ตรงกับเสียง (2 คะแนน)</span>
              </h2>
              <span className="font-thai text-xs text-slate-500">ทดสอบความจำเสียง</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((itemNum: number) => {
                const sampleOpts = phonemes.slice(0, 4);
                return (
                  <div key={itemNum} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="font-thai text-sm font-bold text-indigo-900 w-14">ข้อ {itemNum}.</span>
                    <div className="flex-1 grid grid-cols-4 gap-1.5">
                      {sampleOpts.map((opt: string, optIdx: number) => (
                        <div
                          key={optIdx}
                          className="h-9 border border-slate-300 rounded-md bg-white font-kid font-bold text-lg grid place-items-center text-slate-700"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ตอนที่ 3: บันไดผสมเสียง Onset-Vowel Blending */}
          <section className="border border-slate-300 rounded-xl p-3.5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
              <h2 className="font-thai font-bold text-base text-indigo-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-900 text-white text-xs grid place-items-center">3</span>
                <span>ตอนที่ 3: ฝึกผสมเสียงตัวอักษรตามบันไดเสียง (Onset-Vowel Blending) (2 คะแนน)</span>
              </h2>
              <span className="font-thai text-xs text-slate-500">รวมเสียงทีละขั้น</span>
            </div>

            <div className="space-y-2">
              {targetWords.slice(0, 2).map((w: WordItem, idx: number) => {
                const onset = w.phonemes[0] ?? 's';
                const vowel = w.phonemes[1] ?? 'a';
                const finalCons = w.phonemes[2] ?? 't';
                return (
                  <div
                    key={w.id}
                    className="flex flex-wrap items-center justify-between p-2.5 border border-slate-200 rounded-lg bg-slate-50 gap-2 font-kid text-base text-slate-800"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-thai font-bold text-indigo-900 text-sm mr-1">ข้อ {idx + 1}.</span>
                      <span className="px-2 py-0.5 border border-slate-300 rounded bg-white font-bold">{onset}</span>
                      <span>+</span>
                      <span className="px-2 py-0.5 border border-slate-300 rounded bg-white font-bold">{vowel}</span>
                      <span>=</span>
                      <span className="px-3 py-0.5 border-2 border-dashed border-indigo-400 rounded bg-indigo-50/50 font-bold min-w-[50px] text-center">
                        &nbsp;&nbsp;&nbsp;&nbsp;
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">➔</span>
                      <span className="px-2.5 py-0.5 border-2 border-dashed border-indigo-400 rounded bg-indigo-50/50 font-bold min-w-[45px] text-center">
                        &nbsp;&nbsp;&nbsp;
                      </span>
                      <span>+</span>
                      <span className="px-2 py-0.5 border border-slate-300 rounded bg-white font-bold">{finalCons}</span>
                      <span>=</span>
                      <span className="px-3 py-0.5 border-2 border-indigo-600 rounded bg-indigo-100 text-indigo-950 font-bold min-w-[60px] text-center">
                        {w.word}
                      </span>
                      <span className="font-thai text-xs text-slate-600 ml-1">({w.meaningThai})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ตอนที่ 4: กล่องเสียงคำศัพท์ (Elkonin Sound Boxes) */}
          <section className="border border-slate-300 rounded-xl p-3.5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
              <h2 className="font-thai font-bold text-base text-indigo-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-900 text-white text-xs grid place-items-center">4</span>
                <span>ตอนที่ 4: เขียนตัวอักษรลงในกล่องเสียงตามลำดับเสียงที่ได้ยิน (Elkonin Sound Boxes) (2 คะแนน)</span>
              </h2>
              <span className="font-thai text-xs text-slate-500">1 ช่อง = 1 เสียง</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {targetWords.map((w: WordItem, wIdx: number) => (
                <div key={w.id} className="border border-slate-200 rounded-lg p-2.5 text-center bg-slate-50 flex flex-col items-center">
                  <div className="text-3xl mb-1">{w.emoji}</div>
                  <div className="font-thai text-xs font-bold text-slate-700 mb-2">
                    {wIdx + 1}. {w.meaningThai}
                  </div>
                  {/* กล่องเสียง Elkonin Boxes */}
                  <div className="flex justify-center gap-1 w-full">
                    {w.phonemes.map((_: string, pIdx: number) => (
                      <div
                        key={pIdx}
                        className="flex-1 h-9 border-2 border-slate-400 rounded bg-white font-kid font-bold text-lg grid place-items-center text-slate-800"
                      >
                        &nbsp;
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ตอนที่ 5: แบบประเมินท้ายบทเรียน (Exit Check & Teacher Sign) */}
          <section className="border border-slate-300 rounded-xl p-3 bg-white flex flex-wrap items-center justify-between gap-3 text-xs font-thai text-slate-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <input type="checkbox" id="eval_pass" className="w-4 h-4 rounded text-indigo-600" />
                <label htmlFor="eval_pass" className="font-bold text-emerald-800">
                  ผ่านเกณฑ์ (ได้คะแนนตั้งแต่ 8 คะแนนขึ้นไป)
                </label>
              </div>
              <div className="flex items-center gap-1.5">
                <input type="checkbox" id="eval_retry" className="w-4 h-4 rounded text-indigo-600" />
                <label htmlFor="eval_retry" className="text-slate-600">
                  ควรฝึกทบทวนเสียงเพิ่มเติม
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span>ลงชื่อผู้ตรวจ:</span>
              <span className="inline-block border-b border-dotted border-slate-500 w-36 text-center font-bold text-indigo-900">
                (ครูนภรัฐ อุดเต็น)
              </span>
            </div>
          </section>
        </div>

        {/* ส่วนท้ายกระดาษ (Footer) */}
        <footer className="mt-4 pt-2 border-t border-slate-300 flex items-center justify-between font-thai text-[11px] text-slate-400">
          <span>ใบงานวิชาภาษาอังกฤษพื้นฐาน • นายนภรัฐ อุดเต็น (ครูต้น) โรงเรียนบ้านส้อเด่นพัฒนา</span>
          <span>หน้า 1 จาก 1 • Phonics Pals</span>
        </footer>
      </div>

      {/* สไตล์สำหรับการพิมพ์ (Print Stylesheet) */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            color: #000 !important;
          }
          .a4-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
        }
      `}</style>
    </div>
  );
}
