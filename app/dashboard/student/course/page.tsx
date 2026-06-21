"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  getStudentCourses,
  courses as initialCourses,
  getSubject,
  getCourseModules as initialGetCourseModules,
  getStudentAssignments as initialGetStudentAssignments,
  getTeacher,
  Course,
  Module,
  Assignment,
} from "../../../lib/dummy-data";

// Type definitions for subcomponents
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function StudentCoursePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Core state for simulation
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Navigation / UI states
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"materi" | "tugas" | "quiz">("materi");

  // Interaction Modals
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeReading, setActiveReading] = useState<{ title: string; text: string } | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{ module: Module; questions: QuizQuestion[] } | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Homework upload simulation
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      router.push("/login");
      return;
    }
    const parsed: User = JSON.parse(stored);
    if (parsed.role !== "student") {
      router.push("/login");
      return;
    }
    setUser(parsed);

    // Initialize course data
    setCourses(initialCourses.filter((c) => c.enrolledStudents.includes(parsed.id)));

    // Load modules and backfill empty courses
    const allModules: Module[] = [];
    initialCourses.forEach((c) => {
      const mods = initialGetCourseModules(c.id);
      if (mods.length > 0) {
        allModules.push(...mods);
      } else {
        // Mock modules for courses that don't have them in dummy-data
        allModules.push(
          { id: `mock-${c.id}-1`, courseId: c.id, title: "Pengenalan Topik & Silabus", type: "video", duration: "15 min", isCompleted: false, order: 1 },
          { id: `mock-${c.id}-2`, courseId: c.id, title: "Modul Utama & Latihan Soal", type: "reading", duration: "30 min", isCompleted: false, order: 2 },
          { id: `mock-${c.id}-3`, courseId: c.id, title: "Review Quiz 1", type: "quiz", duration: "10 min", isCompleted: false, order: 3 }
        );
      }
    });
    setModules(allModules);

    // Load assignments
    setAssignments(initialGetStudentAssignments(parsed.id));
  }, [router]);

  // Listen to search query changes to select course dynamically
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search !== searchQuery) {
      setSearchQuery(window.location.search);
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(searchQuery);
    const courseId = params.get("id");
    setSelectedCourseId(courseId);
  }, [searchQuery]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Get active student courses
  const studentCourses = courses;

  // Find course and details
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedSubject = selectedCourse ? getSubject(selectedCourse.subjectId) : null;
  const courseModules = selectedCourseId
    ? modules.filter((m) => m.courseId === selectedCourseId && m.type !== "quiz").sort((a, b) => a.order - b.order)
    : [];

  const courseAssignments = selectedCourseId
    ? assignments.filter((a) => a.courseId === selectedCourseId)
    : [];

  // Helpers for calculations
  const getCourseStats = (courseId: string) => {
    const courseMods = modules.filter((m) => m.courseId === courseId);
    const total = courseMods.length;
    const completed = courseMods.filter((m) => m.isCompleted).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { progress, total, completed };
  };

  // Video viewer trigger
  const handlePlayVideo = (title: string) => {
    setActiveVideoUrl(`https://www.w3schools.com/html/mov_bbb.mp4`); // mock video link
    alert(`Memutar Video Pembelajaran: "${title}"`);
  };

  // Reading viewer trigger
  const handleReadModule = (title: string) => {
    setActiveReading({
      title,
      text: `Ini adalah isi modul materi "${title}". Bimbingan belajar Lumina LMS berkomitmen menyediakan materi ajar terlengkap dan terkurasi dengan baik. Bacalah materi ini secara perlahan, catat poin-poin penting, dan selesaikan kuis untuk menguji pemahaman Anda.`,
    });
  };

  // Quiz initiation
  const handleStartQuiz = (mod: Module) => {
    const questions: QuizQuestion[] = [
      {
        question: "Berapa hasil dari 5 + 3 * 2?",
        options: ["16", "11", "13", "10"],
        correctAnswer: 1, // 11
      },
      {
        question: "Manakah di bawah ini yang merupakan metode belajar yang efektif?",
        options: ["SKS (Sistem Kebut Semalam)", "Spaced Repetition & Active Recall", "Membaca cepat tanpa mencatat", "Menghafal rumus tanpa memahami"],
        correctAnswer: 1, // Spaced Repetition
      },
      {
        question: "Apakah fungsi utama dari Lumina LMS?",
        options: ["Membeli makanan", "Belajar materi bimbel & upload tugas", "Menonton film bioskop", "Mendengarkan musik secara offline"],
        correctAnswer: 1, // Belajar materi
      },
    ];

    setSelectedAnswers({});
    setQuizScore(null);
    setActiveQuiz({ module: mod, questions });
  };

  // Submit Quiz Action
  const handleSubmitQuiz = () => {
    let score = 0;
    activeQuiz?.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });

    const finalPercent = Math.round((score / activeQuiz!.questions.length) * 100);
    setQuizScore(finalPercent);

    // Update module status to completed in state
    const updatedModules = modules.map((m) => {
      if (m.id === activeQuiz?.module.id) {
        return { ...m, isCompleted: true };
      }
      return m;
    });
    setModules(updatedModules);

    // Update course progress in courses state
    const updatedCourses = courses.map((c) => {
      if (c.id === activeQuiz?.module.courseId) {
        const courseMods = updatedModules.filter((m) => m.courseId === c.id);
        const completed = courseMods.filter((m) => m.isCompleted).length;
        const progress = Math.round((completed / courseMods.length) * 100);
        return { ...c, progress };
      }
      return c;
    });
    setCourses(updatedCourses);
  };

  // Submit Homework Action
  const handleUploadHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Harap pilih berkas terlebih dahulu!");
      return;
    }

    const targetId = uploadingAssignmentId;

    // Update assignment status to submitted
    const updatedAssignments = assignments.map((a) => {
      if (a.id === targetId) {
        return {
          ...a,
          status: "submitted" as const,
        };
      }
      return a;
    });
    setAssignments(updatedAssignments);

    alert(`Tugas berhasil diunggah! Status tugas Anda kini "Menunggu Penilaian".`);
    setUploadingAssignmentId(null);
    setSelectedFile(null);

    // Simulate teacher grading after 5 seconds to show how score appears only after grading
    setTimeout(() => {
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id === targetId) {
            return {
              ...a,
              status: "graded" as const,
              score: Math.floor(Math.random() * 11) + 90, // Random score between 90 and 100
            };
          }
          return a;
        })
      );
      alert(`[Simulasi Pengajar] Pengajar telah selesai memeriksa tugas Anda. Skor telah keluar!`);
    }, 5000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* 1. LIST VIEW OF ALL COURSES */}
      {!selectedCourseId ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Courses</h1>
            <p className="text-slate-500 text-sm mt-1">
              Pilih kelas belajar Anda untuk mengakses materi pembelajaran, video tutor, tugas kelas, dan kuis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {studentCourses.map((course) => {
              const subjectDetail = getSubject(course.subjectId);
              const teacherDetail = getTeacher(course.teacherId);
              const { progress, total, completed } = getCourseStats(course.id);

              return (
                <div
                  key={course.id}
                  onClick={() => router.push(`/dashboard/student/course?id=${course.id}`)}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Header Image / Gradient representation */}
                    <div
                      className="w-full h-32 rounded-xl mb-4 flex flex-col justify-center items-center gap-2 relative overflow-hidden"
                      style={{
                        background: subjectDetail
                          ? `linear-gradient(135deg, ${subjectDetail.color}15, ${subjectDetail.color}35)`
                          : "#f8fafc",
                      }}
                    >
                      <span className="text-4xl">{subjectDetail?.icon ?? "📚"}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-slate-100 rounded shadow-sm text-slate-700">
                        {subjectDetail?.name ?? "Course"}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors mb-1">
                      {course.title}
                    </h3>

                    {/* Teacher & Modules completed */}
                    <div className="flex justify-between items-center text-xs text-slate-400 font-medium mb-4">
                      <span>Pengajar: {teacherDetail?.fullName.split(",")[0]}</span>
                      <span className="text-slate-600 font-bold">{completed} / {total} Modul</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-5 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                        <span>Progress Kelas</span>
                        <span className="text-blue-600">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status & Action Button */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-50 mt-auto">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                        course.status === "ongoing"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : course.status === "completed"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      {course.status === "ongoing" ? "Aktif" : course.status === "completed" ? "Selesai" : "Belum Mulai"}
                    </span>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-4 rounded-xl transition-all shadow-sm">
                      Masuk Kelas
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 2. COURSE DETAIL VIEW (TABS FOR MATERI, TUGAS, QUIZ) */
        <div className="space-y-6">
          {/* Breadcrumb / Back button */}
          <button
            onClick={() => router.push("/dashboard/student/course")}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Daftar Kursus
          </button>

          {/* Course Title Header Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {selectedSubject && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${selectedSubject.color}15`, color: selectedSubject.color }}>
                    {selectedSubject.icon} {selectedSubject.name}
                  </span>
                )}
                <span className="text-xs text-slate-400">Ruang Kelas Lumina</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 leading-snug">
                {selectedCourse?.title}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {selectedCourse?.description}
              </p>
            </div>

            {/* Overall course progress in detail header */}
            <div className="flex items-center gap-4 border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Progress</p>
                <p className="text-xl font-extrabold text-blue-600">{getCourseStats(selectedCourseId).progress}%</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center bg-slate-50 relative">
                <span className="text-xs font-bold text-slate-700">{getCourseStats(selectedCourseId).progress}%</span>
              </div>
            </div>
          </div>

          {/* Modul & Video Materi */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Modul & Video Materi</h3>
            <div className="divide-y divide-slate-100">
              {courseModules.map((mod, idx) => (
                <div key={mod.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    {/* Number Index */}
                    <span className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-100 flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>

                    {/* Icon based on module type */}
                    <div className="mt-1">
                      {mod.type === "video" ? (
                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                      )}
                    </div>

                    {/* Title and duration */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                        {mod.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-medium">{mod.duration}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                            mod.isCompleted
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          {mod.isCompleted ? "Selesai" : "Belum Dipelajari"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons depending on type */}
                  <div>
                    {mod.type === "video" ? (
                      <button
                        onClick={() => handlePlayVideo(mod.title)}
                        className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-1.5 px-4 rounded-xl transition-all"
                      >
                        Tonton Video
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReadModule(mod.title)}
                        className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs py-1.5 px-4 rounded-xl transition-all"
                      >
                        Baca Modul
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* READING MODAL / VIEWER */}
      {activeReading && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-base">{activeReading.title}</h3>
              <button onClick={() => setActiveReading(null)} className="text-slate-400 hover:text-slate-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto text-sm text-slate-600 leading-relaxed pr-2 space-y-4 flex-1">
              <p>{activeReading.text}</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs font-semibold text-blue-700">
                Penting: Setelah membaca materi ini, silakan kerjakan latihan kuis untuk mematangkan konsep dasar Anda.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveReading(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-6 rounded-xl transition-all"
              >
                Tutup Modul
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC QUIZ MODAL */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{activeQuiz.module.title}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Selesaikan semua pertanyaan kuis</p>
              </div>
              <button
                onClick={() => {
                  if (quizScore === null && !confirm("Kuis belum selesai. Yakin ingin keluar?")) return;
                  setActiveQuiz(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-6">
              {quizScore === null ? (
                activeQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="text-sm font-bold text-slate-800">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx })}
                          className={`text-left text-xs p-3 rounded-xl border transition-all flex items-center gap-3 ${
                            selectedAnswers[qIdx] === optIdx
                              ? "bg-blue-50 border-blue-500 font-bold text-blue-800"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full border bg-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-lg">Kuis Berhasil Diselesaikan!</h4>
                    <p className="text-slate-400 text-xs mt-1">Nilai Anda telah otomatis diunggah ke sistem</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 max-w-[200px] mx-auto border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Skor Anda</span>
                    <span className="text-3xl font-black text-emerald-600">{quizScore}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-end gap-2">
              {quizScore === null ? (
                <>
                  <button
                    onClick={() => {
                      if (confirm("Yakin ingin membatalkan kuis? Progress akan hilang.")) {
                        setActiveQuiz(null);
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < activeQuiz.questions.length}
                    className={`font-semibold text-xs py-2 px-6 rounded-xl transition-all shadow-sm ${
                      Object.keys(selectedAnswers).length < activeQuiz.questions.length
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Kirim Jawaban
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-6 rounded-xl transition-all"
                >
                  Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNMENT UPLOAD MODAL */}
      {uploadingAssignmentId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Kumpulkan Tugas</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Kirim bukti berkas tugas Anda</p>
              </div>
              <button
                onClick={() => {
                  setUploadingAssignmentId(null);
                  setSelectedFile(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUploadHomework} className="space-y-4">
              <div
                className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                onClick={() => document.getElementById("hw-file-input")?.click()}
              >
                <input
                  id="hw-file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />

                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>

                <p className="text-xs font-semibold text-slate-600">
                  {selectedFile ? selectedFile.name : "Klik untuk memilih file tugas"}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Mendukung PDF, DOCX, ZIP (Max. 5MB)</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadingAssignmentId(null);
                    setSelectedFile(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className={`font-semibold text-xs py-2 px-6 rounded-xl transition-all shadow-sm ${
                    !selectedFile
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Kirim Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
