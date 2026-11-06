// src/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import PictorialLogin from './components/auth/PictorialLogin';
import StageMap from './components/student/StageMap';
import LessonPlayer from './components/learning/LessonPlayer';
import DailyWarmup from './components/learning/DailyWarmup';
import PrintableWorksheet from './components/learning/PrintableWorksheet';
import AssessmentRunner from './components/assessment/AssessmentRunner';
import VocabStickerBook from './components/student/VocabStickerBook';
import AvatarRoom from './components/student/AvatarRoom';
import TeacherDashboard from './components/teacher/TeacherDashboard';

export default function App() {
  return (
    <StudentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PictorialLogin />} />
          <Route path="/map" element={<StageMap />} />
          <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
          <Route path="/worksheet/:lessonId" element={<PrintableWorksheet />} />
          <Route path="/warmup" element={<DailyWarmup />} />
          <Route path="/test/:mode" element={<AssessmentRunner />} />
          <Route path="/stickers" element={<VocabStickerBook />} />
          <Route path="/avatar" element={<AvatarRoom />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StudentProvider>
  );
}
