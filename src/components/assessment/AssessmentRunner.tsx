// src/components/assessment/AssessmentRunner.tsx
// แบบทดสอบก่อนเรียน / หลังเรียน (ไม่มีตัวช่วย ไม่มีปุ่มเต่า ไม่มีคำใบ้ภาษาไทย)
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, Volume2 } from 'lucide-react';
import { ASSESSMENT_BANK } from '../../data/assessmentBank';
import { playPhoneme, playWordOrSentence } from '../../services/audioEngine';
import { isSpeechRecognitionSupported, listenOnce } from '../../services/speechEngine';
import { useStudents } from '../../context/StudentContext';
import { emptyAssessment } from '../../data/mockStudents';
import { BigButton, MascotSays, celebrate } from '../ui';
import type { AssessmentRecord, StageId } from '../../types/schema';

const SKILL_LABEL = {
  phoneme_recognition: { th: 'ฟังเสียง', icon: '👂' },
  cvc_blending: { th: 'สะกดคำ', icon: '🧩' },
  vocab_meaning: { th: 'ความหมาย', icon: '🖼️' },
  oral_pronunciation: { th: 'พูดออกเสียง', icon: '🎤' },
} as const;

export default function AssessmentRunner() {
  const { mode = 'preTest' } = useParams<{ mode: 'preTest' | 'postTest' }>();
  const nav = useNavigate();
  const { student, saveAssessment } = useStudents();
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<AssessmentRecord['itemResponses']>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [micTries, setMicTries] = useState(0);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<AssessmentRecord | null>(null);

  const q = ASSESSMENT_BANK[i];
  const isPre = mode === 'preTest';

  const playTarget = () => {
    if (!q) return;
    if (q.skillType === 'phoneme_recognition' && q.targetAudioOrText.length <= 2) playPhoneme(q.targetAudioOrText);
    else playWordOrSentence(q.targetAudioOrText, 'normal');
  };

  useEffect(() => {
    if (!started || !q) return;
    if (q.skillType === 'phoneme_recognition' || q.skillType === 'cvc_blending') {
      const t = setTimeout(playTarget, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, i]);

  const record = (isCorrect: boolean, earned: number, spoken?: string) => {
    const resp = [...responses, { questionId: q.id, isCorrect, earnedScore: earned, spokenTranscript: spoken }];
    setResponses(resp);
    setPicked(null);
    setMicTries(0);
    if (i + 1 < ASSESSMENT_BANK.length) {
      setI(i + 1);
    } else {
      finish(resp);
    }
  };

  const finish = (resp: AssessmentRecord['itemResponses']) => {
    const rec = emptyAssessment();
    rec.completed = true;
    rec.completedAt = new Date().toISOString();
    rec.itemResponses = resp;
    for (const r of resp) {
      const qq = ASSESSMENT_BANK.find((x) => x.id === r.questionId)!;
      rec.totalScore += r.earnedScore;
      rec.breakdownBySkill[qq.skillType] += r.earnedScore;
      rec.breakdownByStage[qq.stageId as StageId].earned += r.earnedScore;
    }
    saveAssessment(mode, rec);
    setResult(rec);
    celebrate(true);
  };

  const onOral = async () => {
    if (!isSpeechRecognitionSupported()) {
      record(false, 0, '(เบราว์เซอร์ไม่รองรับไมค์)');
      return;
    }
    setListening(true);
    const { result: r, transcript } = await listenOnce(q.expectedSpokenWord ?? q.targetAudioOrText);
    setListening(false);
    if (r === 'PASSED_PERFECT') return record(true, 5, transcript);
    if (r === 'PASSED_CLOSE') return record(true, 3, transcript);
    if (micTries + 1 >= 2) return record(false, 0, transcript);
    setMicTries(micTries + 1);
  };

  // ---------- หน้าเริ่มต้น ----------
  if (!started) {
    return (
      <div className="min-h-screen bg-playful grid place-items-center p-5">
        <div className="card max-w-lg w-full p-8 text-center animate-pop">
          <div className="text-8xl animate-float">{isPre ? '🧭' : '🏆'}</div>
          <h1 className="font-thai text-3xl mt-3 text-indigo-700">{isPre ? 'ภารกิจแรก: วัดพลังเริ่มต้น' : 'ภารกิจใหญ่: แบบทดสอบหลังเรียน'}</h1>
          <p className="font-thai text-xl text-slate-600 mt-3">
            {isPre ? 'ตอบให้ได้มากที่สุดนะ ข้อไหนไม่รู้ ตอบเดาได้เลย ไม่ต้องกังวล 😊' : 'มาดูกันว่าหนูเก่งขึ้นแค่ไหนแล้ว!'}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {Object.values(SKILL_LABEL).map((s) => (
              <div key={s.th} className="bg-indigo-50 rounded-2xl py-3 font-thai text-lg">{s.icon} {s.th}</div>
            ))}
          </div>
          <p className="font-thai text-slate-500 mt-4">ทั้งหมด {ASSESSMENT_BANK.length} ข้อ • ประมาณ 10 นาที</p>
          <BigButton onClick={() => setStarted(true)} className="w-full mt-6" color="#4f46e5" shadow="#3730a3">เริ่มเลย! 🚀</BigButton>
        </div>
      </div>
    );
  }

  // ---------- หน้าผลลัพธ์ ----------
  if (result) {
    const pre = student?.assessments.preTest;
    const gain = !isPre && pre?.completed ? result.totalScore - pre.totalScore : null;
    return (
      <div className="min-h-screen bg-playful grid place-items-center p-5">
        <div className="card max-w-lg w-full p-8 text-center animate-pop">
          <div className="text-7xl">🎉</div>
          <h1 className="font-thai text-3xl mt-2">ทำครบทุกข้อแล้ว เก่งมาก!</h1>
          <div className="mt-5 inline-flex items-baseline gap-2 bg-indigo-50 rounded-3xl px-8 py-4">
            <span className="font-kid font-bold text-6xl text-indigo-600">{result.totalScore}</span>
            <span className="font-thai text-2xl text-slate-500">/ 100</span>
          </div>
          {gain !== null && (
            <p className="font-thai text-2xl mt-4 text-green-600">เก่งขึ้นจากครั้งแรก +{gain} คะแนน 📈</p>
          )}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {(Object.keys(SKILL_LABEL) as (keyof typeof SKILL_LABEL)[]).map((k) => (
              <div key={k} className="bg-slate-50 rounded-2xl p-3">
                <div className="font-thai">{SKILL_LABEL[k].icon} {SKILL_LABEL[k].th}</div>
                <div className="font-kid font-bold text-2xl">{result.breakdownBySkill[k]}<span className="text-base text-slate-400">/25</span></div>
              </div>
            ))}
          </div>
          <BigButton onClick={() => nav('/map')} className="w-full mt-6" color="#16a34a" shadow="#166534">ไปที่แผนที่ด่าน 🗺️</BigButton>
        </div>
      </div>
    );
  }

  // ---------- หน้าคำถาม ----------
  const skill = SKILL_LABEL[q.skillType];
  const showText = q.skillType === 'vocab_meaning' || q.skillType === 'oral_pronunciation';
  return (
    <div className="min-h-screen bg-playful flex flex-col">
      <header className="max-w-3xl w-full mx-auto px-4 pt-5">
        <div className="flex items-center justify-between font-thai text-slate-600">
          <span className="bg-white rounded-full px-4 py-1 border-2 border-slate-200">{isPre ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน'} • ครูนภรัฐ</span>
          <span className="font-kid font-bold text-lg">ข้อ {i + 1} / {ASSESSMENT_BANK.length}</span>
        </div>
        <div className="flex gap-1 mt-3">
          {ASSESSMENT_BANK.map((_, n) => (
            <div key={n} className={`h-3 flex-1 rounded-full ${n < i ? 'bg-indigo-500' : n === i ? 'bg-indigo-300' : 'bg-slate-200'}`} />
          ))}
        </div>
      </header>

      <main key={q.id} className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col items-center gap-6 animate-pop">
        <MascotSays>
          <span className="mr-1">{skill.icon}</span>
          {q.promptText}
        </MascotSays>

        {showText ? (
          <div className="card px-10 py-8 font-kid font-bold text-5xl md:text-6xl text-indigo-800 text-center">{q.targetAudioOrText}</div>
        ) : (
          <button onClick={playTarget} className="w-36 h-36 rounded-full bg-sky-500 text-white grid place-items-center active:translate-y-1 transition-transform" style={{ boxShadow: '0 8px 0 0 #0369a1' }} aria-label="ฟังเสียงอีกครั้ง">
            <Volume2 className="w-20 h-20" />
          </button>
        )}

        {/* ตัวเลือก */}
        {q.options && (
          <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
            {q.options.map((o) => (
              <button
                key={o.id}
                onClick={() => setPicked(o.id)}
                className={`card py-6 flex flex-col items-center gap-1 border-4 transition-all ${picked === o.id ? 'border-indigo-500 -translate-y-1' : 'border-transparent'}`}
              >
                {o.emoji ? <span className="text-6xl">{o.emoji}</span> : <span className="font-kid font-bold text-4xl md:text-5xl">{o.label}</span>}
              </button>
            ))}
          </div>
        )}
        {q.options && (
          <BigButton
            disabled={!picked}
            onClick={() => record(picked === q.correctOptionId, picked === q.correctOptionId ? 5 : 0)}
            className="w-full max-w-xl"
          >
            ตอบข้อนี้ ✓
          </BigButton>
        )}

        {/* ข้อพูด */}
        {q.skillType === 'oral_pronunciation' && (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onOral}
              className={`w-28 h-28 rounded-full bg-rose-500 text-white grid place-items-center ${listening ? 'animate-mic' : ''}`}
              style={{ boxShadow: listening ? undefined : '0 8px 0 0 #9f1239' }}
            >
              <Mic className="w-14 h-14" />
            </button>
            <p className="font-thai text-lg text-slate-600">
              {listening ? 'กำลังฟัง... พูดเลย!' : micTries > 0 ? 'ลองพูดอีกครั้ง (ครั้งสุดท้าย)' : 'กดไมค์แล้วอ่านออกเสียง'}
            </p>
            <button onClick={() => record(false, 0)} className="font-thai text-slate-400 underline">ข้ามข้อนี้</button>
          </div>
        )}
      </main>
    </div>
  );
}
