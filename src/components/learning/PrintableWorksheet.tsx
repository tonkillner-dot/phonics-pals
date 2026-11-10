// src/components/learning/PrintableWorksheet.tsx
// ระบบสร้างใบงาน Phonics ขนาด A4 สำหรับพิมพ์แจกนักเรียน (Printable A4 Worksheet)
// ผู้จัดทำ: นายนภรัฐ อุดเต็น (ครูต้น) โรงเรียนบ้านส้อเด่นพัฒนา
// [กฎเหล็กสูงสุด] ห้ามใช้ตัวเลขไทยเด็ดขาด ใช้ตัวเลขอารบิก (1, 2, 3...) 100%

import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold"
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

  // แบ่ง 15 คำออกเป็น 2 คอลัมน์ (ซ้าย 8 คำ, ขวา 7 คำ) เพื่อให้จัดวางพอดีใน 1 หน้า A4
  const half = Math.ceil(words.length / 2);
  const col1 = words.slice(0, half);
  const col2 = words.slice(half);

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
            แบบฝึกทักษะ: {lesson.title}
          </div>
          <div className="font-thai text-xs text-slate-500">
            {stage.title} • นายนภรัฐ อุดเต็น โรงเรียนบ้านส้อเด่นพัฒนา
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-thai font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Printer className="w-5 h-5" />
          <span>พิมพ์ใบงาน / บันทึกเป็น PDF (A4)</span>
        </button>
      </div>

      {/* แผ่นกระดาษใบงาน A4 สำหรับพิมพ์ */}
      <div className="a4-sheet max-w-[210mm] mx-auto bg-white p-6 sm:p-8 shadow-lg border border-slate-300 rounded-lg print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-slate-900">
        
        {/* ส่วนหัวกระดาษ (Header) */}
        <header className="border-b-2 border-indigo-900 pb-2.5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-thai text-xs font-bold tracking-wider text-indigo-700 uppercase">
                โรงเรียนบ้านส้อเด่นพัฒนา • กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ (ภาษาอังกฤษ)
              </div>
              <h1 className="font-thai text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                แบบฝึกทักษะและบันทึกการอ่านออกเสียง Phonics (Synthetic Phonics)
              </h1>
              <div className="font-thai text-xs sm:text-sm text-slate-600 mt-0.5">
                <span className="font-bold text-indigo-900">{stage.title}</span> • {lesson.title}
              </div>
            </div>
            <div className="text-right border-l-2 border-slate-300 pl-3 shrink-0">
              <div className="font-thai text-[11px] text-slate-500">ครูผู้สอน</div>
              <div className="font-thai font-bold text-sm text-indigo-900">ครูนภรัฐ อุดเต็น</div>
              <div className="font-thai text-[11px] text-slate-500">(ครูต้น)</div>
            </div>
          </div>

          {/* ช่องกรอกข้อมูลนักเรียนและคะแนนรวม */}
          <div className="mt-2.5 pt-2 border-t border-dashed border-slate-300 flex flex-wrap items-center justify-between gap-2 font-thai text-xs sm:text-sm text-slate-800">
            <div>
              ชื่อ-นามสกุล: <span className="inline-block border-b border-dotted border-slate-500 w-44 sm:w-56">&nbsp;</span>
            </div>
            <div>
              ชั้น: <span className="inline-block border-b border-dotted border-slate-500 w-14 text-center">ป.&nbsp;&nbsp;</span>
            </div>
            <div>
              เลขที่: <span className="inline-block border-b border-dotted border-slate-500 w-10 text-center">&nbsp;</span>
            </div>
            <div>
              วันที่: <span className="inline-block border-b border-dotted border-slate-500 w-24 text-center">&nbsp;</span>
            </div>
            <div className="border border-indigo-300 rounded-lg px-2.5 py-0.5 bg-indigo-50 text-indigo-950 text-xs font-bold">
              อ่านผ่าน: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] / {words.length} คำ
            </div>
          </div>
        </header>

        {/* เนื้อหาหลักใบงาน */}
        <div className="mt-3 space-y-3">
          
          {/* ส่วนที่ 1: การจำและออกเสียงตัวอักษรตั้งต้น (Letter & Sound Foundation) */}
          <section className="border border-slate-300 rounded-xl p-2.5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
              <h2 className="font-thai font-bold text-sm sm:text-base text-indigo-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-900 text-white text-xs grid place-items-center font-bold">1</span>
                <span>ส่วนที่ 1: การจำและออกเสียงตัวอักษรตั้งต้น {phonemes.length} ตัว (ฝึกจำและคัดตามรอยประ)</span>
              </h2>
              <span className="font-thai text-[11px] text-slate-500">อ่านออกเสียงให้ครูฟัง</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {phonemes.map((phStr: string) => {
                const ph = getPhoneme(phStr);
                return (
                  <div
                    key={phStr}
                    className="border border-slate-300 rounded-lg p-1 text-center bg-slate-50 flex flex-col items-center justify-between"
                  >
                    <span className="font-kid text-2xl font-bold text-indigo-950 leading-none">
                      {ph.grapheme}
                    </span>
                    <span className="font-kid text-xl text-slate-400 font-normal border-b border-dashed border-slate-400 w-8 my-0.5">
                      {ph.grapheme}
                    </span>
                    <span className="font-thai text-[10px] text-slate-700 font-semibold truncate max-w-full">
                      {ph.thaiHint.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ส่วนที่ 2: ตารางทดสอบการอ่านออกเสียงรายบุคคลกับคุณครู (1-on-1 Oral Reading Assessment with Teacher) */}
          {/* เป็นคำศัพท์ที่นักเรียนได้ฝึกผสมเสียงมาแล้ว นำมาอ่านออกเสียงกับครูทีละคำ ครูติ๊ก [✓] เมื่ออ่านถูก */}
          <section className="border border-slate-300 rounded-xl p-2.5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
              <h2 className="font-thai font-bold text-sm sm:text-base text-indigo-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs grid place-items-center font-bold">2</span>
                <span>ส่วนที่ 2: แบบทดสอบการอ่านออกเสียงกับคุณครู {words.length} คำ (ครูติ๊กถูก ✓ ให้เมื่ออ่านถูกต้อง)</span>
              </h2>
              <span className="font-thai text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 inline" /> สอบอ่านทีละคน
              </span>
            </div>

            {/* ตารางแสดง 2 คอลัมน์ (ซ้าย 8 คำ, ขวา 7 คำ) เพื่อความสบายตาและความสูงช่องประมาณ 1.2 ซม. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-thai">
              
              {/* คอลัมน์ที่ 1 (ข้อ 1 ถึง half) */}
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 py-1 px-1.5 text-center w-8">ข้อ</th>
                    <th className="border border-slate-300 py-1 px-2 text-left">คำศัพท์</th>
                    <th className="border border-slate-300 py-1 px-1.5 text-center">แยกเสียง</th>
                    <th className="border border-slate-300 py-1 px-2 text-left">ความหมาย</th>
                    <th className="border border-slate-300 py-1 px-1 text-center w-20 text-emerald-800 font-bold">
                      ผลการอ่าน
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {col1.map((w: WordItem, idx: number) => {
                    const itemNo = idx + 1;
                    return (
                      <tr key={w.id} className="hover:bg-slate-50 h-[36px]">
                        <td className="border border-slate-300 text-center font-bold text-slate-600">
                          {itemNo}
                        </td>
                        <td className="border border-slate-300 px-2 font-kid text-lg font-bold text-indigo-950">
                          {w.word}
                        </td>
                        <td className="border border-slate-300 text-center font-kid text-slate-500 text-xs">
                          {w.phonemes.join(' - ')}
                        </td>
                        <td className="border border-slate-300 px-2 text-slate-700">
                          <span className="mr-1">{w.emoji}</span>
                          <span>{w.meaningThai}</span>
                        </td>
                        <td className="border border-slate-300 text-center px-1">
                          <div className="flex items-center justify-center gap-1 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded text-emerald-600" />
                              <span className="font-bold text-emerald-700">✓ ผ่าน</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* คอลัมน์ที่ 2 (ข้อ half + 1 ถึง words.length) */}
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 py-1 px-1.5 text-center w-8">ข้อ</th>
                    <th className="border border-slate-300 py-1 px-2 text-left">คำศัพท์</th>
                    <th className="border border-slate-300 py-1 px-1.5 text-center">แยกเสียง</th>
                    <th className="border border-slate-300 py-1 px-2 text-left">ความหมาย</th>
                    <th className="border border-slate-300 py-1 px-1 text-center w-20 text-emerald-800 font-bold">
                      ผลการอ่าน
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {col2.map((w: WordItem, idx: number) => {
                    const itemNo = half + idx + 1;
                    return (
                      <tr key={w.id} className="hover:bg-slate-50 h-[36px]">
                        <td className="border border-slate-300 text-center font-bold text-slate-600">
                          {itemNo}
                        </td>
                        <td className="border border-slate-300 px-2 font-kid text-lg font-bold text-indigo-950">
                          {w.word}
                        </td>
                        <td className="border border-slate-300 text-center font-kid text-slate-500 text-xs">
                          {w.phonemes.join(' - ')}
                        </td>
                        <td className="border border-slate-300 px-2 text-slate-700">
                          <span className="mr-1">{w.emoji}</span>
                          <span>{w.meaningThai}</span>
                        </td>
                        <td className="border border-slate-300 text-center px-1">
                          <div className="flex items-center justify-center gap-1 text-[11px]">
                            <label className="flex items-center gap-0.5 cursor-pointer">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded text-emerald-600" />
                              <span className="font-bold text-emerald-700">✓ ผ่าน</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            </div>
          </section>

          {/* ส่วนที่ 3: สรุปผลการประเมินและการลงชื่อรับรองของคุณครูนภรัฐ (Teacher Assessment Rubric) */}
          <section className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs font-thai text-slate-800">
            <div className="space-y-1">
              <div className="font-bold text-slate-900">
                เกณฑ์การตัดสินการอ่านออกเสียง (เต็ม {words.length} คำ):
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded text-indigo-600" />
                  <span className="font-bold text-emerald-800">ดีเยี่ยม (ผ่าน 13 - 15 คำ)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded text-indigo-600" />
                  <span className="font-bold text-blue-800">ผ่านเกณฑ์ (ผ่าน 10 - 12 คำ)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded text-indigo-600" />
                  <span className="text-slate-600">ควรฝึกทบทวนเพิ่ม (ต่ำกว่า 10 คำ)</span>
                </label>
              </div>
            </div>

            <div className="text-right border-l-2 border-slate-300 pl-4 py-0.5">
              <div className="text-[11px] text-slate-500">ลงชื่อครูผู้ประเมิน</div>
              <div className="font-bold text-indigo-900 text-sm mt-0.5">
                (นายนภรัฐ อุดเต็น)
              </div>
              <div className="text-[11px] text-slate-500">
                ตำแหน่ง ครูประจำชั้น / ครูผู้สอน
              </div>
            </div>
          </section>
        </div>

        {/* ส่วนท้ายกระดาษ (Footer) */}
        <footer className="mt-2.5 pt-1.5 border-t border-slate-300 flex items-center justify-between font-thai text-[10px] text-slate-400">
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
            margin: 8mm 8mm;
          }
        }
      `}</style>
    </div>
  );
}
