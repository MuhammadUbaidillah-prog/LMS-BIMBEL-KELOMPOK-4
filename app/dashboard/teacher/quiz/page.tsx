"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Course,
  Module,
  courses as initialCourses,
  modules as initialModules,
  students as initialStudents,
  getSubject,
} from "../../../lib/dummy-data";

interface QuizDetail {
  id: string;
  title: string;
  courseId: string;
  duration: string;
  deadline: string;
  questionsCount: number;
}

export default function TeacherQuizPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<QuizDetail[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Form: Buat Quiz Baru
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("20 min");
  const [newDeadline, setNewDeadline] = useState("2026-06-25");
  const [targetCourseId, setTargetCourseId] = useState("");
  const [questionsCount, setQuestionsCount] = useState(5);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      router.push("/login");
      return;
    }
    const parsed: User = JSON.parse(stored);
    if (parsed.role !== "teacher") {
      router.push("/login");
      return;
    }
    setUser(parsed);

    // Get courses taught by this teacher
    const myCourses = initialCourses.filter((c) => c.teacherId === parsed.id);
    setCourses(myCourses);
    if (myCourses.length > 0) {
      setTargetCourseId(myCourses[0].id);
    }

    // Mock initial quiz definitions matching modules in dummy-data
    const quizMods = initialModules.filter((m) => m.type === "quiz");
    const initialQuizzes: QuizDetail[] = quizMods.map((q) => {
      const course = initialCourses.find((c) => c.id === q.courseId);
      return {
        id: q.id,
        title: q.title,
        courseId: q.courseId,
        duration: q.duration,
        deadline: "2026-06-20",
        questionsCount: 3,
      };
    });
    setQuizzes(initialQuizzes);
  }, [router]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Filter quizzes for courses taught by this teacher
  const myCourseIds = courses.map((c) => c.id);
  const teacherQuizzes = quizzes.filter((q) => myCourseIds.includes(q.courseId));

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);
  const selectedCourse = selectedQuiz ? courses.find((c) => c.id === selectedQuiz.courseId) : null;

  // Mock student scores for quiz
  const getQuizResults = () => {
    if (!selectedQuiz || !selectedCourse) return [];

    return selectedCourse.enrolledStudents.map((studId, idx) => {
      const student = initialStudents.find((s) => s.id === studId);
      // Mock some dynamic completions
      const isDone = studId === "s1" || studId === "s2";
      const score = studId === "s1" ? 100 : studId === "s2" ? 67 : 0;
      const attemptTime = studId === "s1" ? "2026-06-12 09:12" : studId === "s2" ? "2026-06-13 14:02" : "—";

      return {
        studentId: studId,
        studentName: student?.fullName || "Siswa Lumina",
        status: isDone ? "Selesai" : "Belum Mengerjakan",
        score,
        attemptTime,
      };
    });
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newQuiz: QuizDetail = {
      id: `q-custom-${Date.now()}`,
      title: newTitle,
      courseId: targetCourseId,
      duration: newDuration,
      deadline: newDeadline,
      questionsCount,
    };

    setQuizzes((prev) => [newQuiz, ...prev]);
    setShowCreateModal(false);
    setNewTitle("");
    alert(`Quiz "${newTitle}" dengan ${questionsCount} soal berhasil dibuat!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* 1. LIST VIEW OF QUIZZES */}
      {!selectedQuizId ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Kelola Ujian Kuis (Quiz)</h1>
              <p className="text-slate-500 text-sm mt-1">
                Buat kuis latihan, atur batas durasi & deadline tanggal pengerjaan, serta pantau hasil skor kuis siswa.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              ❓ Buat Kuis Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {teacherQuizzes.map((quiz) => {
              const course = courses.find((c) => c.id === quiz.courseId);
              const subject = course ? getSubject(course.subjectId) : null;

              return (
                <div
                  key={quiz.id}
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Header Icon */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-slate-600">
                        {subject?.icon} {subject?.name || "Subject"}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        ⏱️ {quiz.duration}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors mb-2">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mb-4">
                      {quiz.questionsCount} Butir Soal Terdaftar
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-50 pt-4 mt-4">
                      <span>Batas: {quiz.deadline}</span>
                      <span className="text-blue-600 font-bold">Hasil Nilai Siswa →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 2. QUIZ RESULTS DETAILS */
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedQuizId(null)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Daftar Kuis
          </button>

          {/* Details header */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">DETAIL KUIS</span>
              <h2 className="text-lg font-bold text-slate-800 leading-snug">
                {selectedQuiz?.title}
              </h2>
              <div className="flex gap-4 mt-2 text-[10px] text-slate-500 font-bold">
                <span>⏱️ Batas Waktu: {selectedQuiz?.duration}</span>
                <span>📅 Batas Tanggal: {selectedQuiz?.deadline}</span>
                <span>❓ Jumlah Soal: {selectedQuiz?.questionsCount} Soal</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Kelas</span>
              <span className="text-sm font-bold text-slate-700">{selectedCourse?.title}</span>
            </div>
          </div>

          {/* Results table */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Hasil Ujian Kuis Siswa</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Nama Siswa</th>
                    <th className="pb-3">Waktu Mengerjakan</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getQuizResults().map((res) => (
                    <tr key={res.studentId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">{res.studentName}</td>
                      <td className="py-3 text-slate-400">{res.attemptTime}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          res.status === "Selesai"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-black text-sm">
                        {res.status === "Selesai" ? (
                          <span className={res.score >= 75 ? "text-emerald-600" : "text-amber-500"}>
                            {res.score} %
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE QUIZ MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateQuiz} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Buat Ujian Kuis Baru</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Lengkapi form konfigurasi kuis</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Pilih Kelas</label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Judul Kuis</label>
                <input
                  type="text"
                  placeholder="Contoh: Kuis 2 Trigonometri"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Durasi Kuis</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="Contoh: 30 min"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Batas Tanggal</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Jumlah Soal</label>
                  <input
                    type="number"
                    value={questionsCount}
                    onChange={(e) => setQuestionsCount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Mock questions editor */}
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">SIMULASI BANK SOAL</span>
                <p className="text-[10px] text-slate-400 font-medium">Bank soal kuis akan diacak secara otomatis berdasarkan topik ajar di kelas terpilih.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-6 rounded-xl transition-all shadow-sm"
              >
                Buat Soal Kuis
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
