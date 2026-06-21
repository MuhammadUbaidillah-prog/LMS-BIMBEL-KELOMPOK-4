"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  getStudentSchedules,
  courses as initialCourses,
  getSubject,
  getCourseModules as initialGetCourseModules,
  getStudentAssignments as initialGetStudentAssignments,
  getTeacher,
  getStudentCourses,
  Course,
  Module,
  Assignment,
  announcements as initialAnnouncements,
} from "../../../lib/dummy-data";

// Type definitions for subcomponents
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function StudentClassPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Core state for simulation
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Navigation / UI states
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"beranda" | "materi" | "tugas" | "quiz" | "diskusi" | "pengumuman">("beranda");

  // Local state for interactive discussion forum
  const [discussions, setDiscussions] = useState<Array<{ id: string; user: string; avatar: string; role: string; content: string; time: string; replies: number; isTeacher?: boolean }>>([
    { id: "d1", user: "Ahmad Fauzi, S.Pd", avatar: "/avatars/teacher1.png", role: "Pengajar", content: "Halo semuanya, silakan diskusikan di sini jika ada kendala dalam memahami materi Persamaan Kuadrat.", time: "1 jam yang lalu", replies: 2, isTeacher: true },
    { id: "d2", user: "Budi Santoso", avatar: "/avatars/student1.png", role: "Siswa", content: "Pak, untuk nomor 5 di modul latihan apakah ada rumus cepatnya?", time: "30 menit yang lalu", replies: 1 },
  ]);
  const [newPostText, setNewPostText] = useState("");

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

    // Initialize state from dummy data
    setCourses(initialCourses);
    
    // Get all modules and backfill empty courses
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

    // Get assignments
    setAssignments(initialGetStudentAssignments(parsed.id));
  }, [router]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Get active student schedules
  const schedulesList = getStudentSchedules(user.id);

  // Group schedules by courseId to avoid duplicate cards for same course
  const groupedSchedulesList = schedulesList.reduce((acc, current) => {
    const existing = acc.find(item => item.courseId === current.courseId);
    if (!existing) {
      acc.push({
        ...current,
        slots: [{ day: current.day, time: current.time, room: current.room, type: current.type }]
      });
    } else {
      existing.slots.push({ day: current.day, time: current.time, room: current.room, type: current.type });
    }
    return acc;
  }, [] as Array<typeof schedulesList[0] & { slots: Array<{ day: string; time: string; room: string; type: string }> }>);


  // Find course and details
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedSubject = selectedCourse ? getSubject(selectedCourse.subjectId) : null;
  const courseModules = selectedCourseId
    ? modules.filter((m) => m.courseId === selectedCourseId).sort((a, b) => a.order - b.order)
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

    const courseAssigns = assignments.filter((a) => a.courseId === courseId);
    const pendingAssigns = courseAssigns.filter((a) => a.status === "pending").length;

    const activeQuizCount = courseMods.filter((m) => m.type === "quiz" && !m.isCompleted).length;

    return { progress, pendingAssigns, activeQuizCount };
  };

  // Handler for joining video call
  const handleJoinMeeting = (e: React.MouseEvent, room: string) => {
    e.stopPropagation(); // prevent card click event
    alert(`Membuka tautan kelas online: ${room}`);
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
    // Generate questions based on course type
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
      {/* 1. LIST VIEW OF SCHEDULES / CLASSES */}
      {!selectedCourseId ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Class & Course</h1>
            <p className="text-slate-500 text-sm mt-1">
              Lihat progress kelas Anda, kumpulkan tugas, selesaikan kuis, dan masuk ke ruang kelas online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedSchedulesList.map((sch) => {
              const courseDetail = courses.find((c) => c.id === sch.courseId);
              if (!courseDetail) return null;

              const subjectDetail = getSubject(courseDetail.subjectId);
              const { progress, pendingAssigns, activeQuizCount } = getCourseStats(sch.courseId);
              const isOnline = sch.slots.some((s) => s.type === "online");

              return (
                <div
                  key={sch.courseId}
                  onClick={() => setSelectedCourseId(sch.courseId)}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Header: Class Type & Subject */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isOnline
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : "bg-blue-50 border border-blue-200 text-blue-700"
                        }`}
                      >
                        {isOnline ? "🌐 Online" : "🏢 Offline"}
                      </span>

                      {subjectDetail && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-600">
                          {subjectDetail.icon} {subjectDetail.name}
                        </span>
                      )}
                    </div>

                    {/* Course Title */}
                    <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors mb-1">
                      {sch.courseName}
                    </h3>

                    {/* Teacher */}
                    <p className="text-[11px] text-slate-400 font-medium mb-4">
                      Pengajar: <span className="text-slate-600 font-semibold">{sch.teacherName}</span>
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                        <span>Progress Belajar</span>
                        <span className="text-blue-600">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Schedule Slots list */}
                    <div className="text-[10px] text-slate-500 mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 space-y-1.5">
                      <p className="font-bold text-slate-400 text-[9px] uppercase tracking-wider mb-1">Jadwal Kelas</p>
                      {sch.slots.map((slot, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{slot.day}, {slot.time}</span>
                          <span className="text-[10px] bg-white border border-slate-150 px-1.5 py-0.5 rounded text-slate-500 font-medium">{slot.room}</span>
                        </div>
                      ))}
                    </div>

                    {/* Dynamic Badges Row */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50 mb-5">
                      {/* Assignment Badge */}
                      {pendingAssigns > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          {pendingAssigns} Tugas Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-green-50 border border-green-200 text-green-700 px-2.5 py-0.5 rounded-full">
                          Tugas Selesai
                        </span>
                      )}

                      {/* Quiz Badge */}
                      {activeQuizCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {activeQuizCount} Quiz Aktif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contextual Action Buttons Footer */}
                  <div className="flex gap-2 mt-auto">
                    {isOnline ? (
                      <>
                        <button
                          onClick={(e) => handleJoinMeeting(e, sch.slots.find((s) => s.type === "online")?.room || sch.room)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 7a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7Z" />
                            <path d="M23 7v10l-4-4" />
                          </svg>
                          Join Meeting
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCourseId(sch.courseId);
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                        >
                          Detail
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourseId(sch.courseId);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                        Lihat Detail Kelas
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </>
      ) : (
        /* 2. COURSE DETAIL VIEW (TABS FOR BERANDA, MATERI, TUGAS, QUIZ, DISKUSI, PENGUMUMAN) */
        <div className="space-y-6">
          {/* Breadcrumb / Back button */}
          <button
            onClick={() => {
              setSelectedCourseId(null);
              setActiveTab("beranda");
            }}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Jadwal Kelas
          </button>

          {/* Restyled Header Card matching screenshot */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 leading-snug">
                {selectedCourse?.title.split(" - ")[0]}
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                {selectedCourse?.description || "Persiapan Ujian Semester"}
              </p>
            </div>
            
            {/* Progress Kelas on the right with thin green progress bar */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 min-w-[260px] shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                <span>Progress Kelas</span>
                <span className="text-slate-800 font-extrabold">{getCourseStats(selectedCourseId).progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${getCourseStats(selectedCourseId).progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tabs Navigation matching the screenshot */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
            <button
              onClick={() => setActiveTab("beranda")}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "beranda"
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Beranda
            </button>
            <button
              onClick={() => setActiveTab("materi")}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "materi"
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              Materi
            </button>
            <button
              onClick={() => setActiveTab("tugas")}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "tugas"
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
              Tugas
              {courseAssignments.filter(a => a.status === "pending").length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "quiz"
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" /><path d="M10 22h4" />
              </svg>
              Quiz
            </button>
            <button
              onClick={() => setActiveTab("diskusi")}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "diskusi"
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Diskusi
            </button>
            <button
              onClick={() => setActiveTab("pengumuman")}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "pengumuman"
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              Pengumuman
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="space-y-4">
            {/* 2.0 TAB BERANDA */}
            {activeTab === "beranda" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Welcome Banner & Materi Terbaru */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 relative flex flex-col sm:flex-row justify-between items-center overflow-hidden">
                    <div className="space-y-2 z-10 text-center sm:text-left">
                      <h3 className="text-xl font-extrabold text-blue-900">
                        Selamat datang di kelas! 🎉
                      </h3>
                      <p className="text-xs text-blue-700/80 font-medium">
                        Yuk mulai belajar dan raih prestasi terbaikmu bersama Lumina.
                      </p>
                    </div>
                    {/* CSS Cartoon representation */}
                    <div className="w-32 h-24 relative flex-shrink-0 mt-4 sm:mt-0 z-10">
                      <svg viewBox="0 0 120 90" className="w-full h-full">
                        {/* Laptop */}
                        <rect x="25" y="45" width="70" height="4" rx="2" fill="#94A3B8" />
                        <rect x="30" y="15" width="60" height="30" rx="3" fill="#334155" />
                        <rect x="34" y="19" width="52" height="22" fill="#38BDF8" />
                        {/* Student character */}
                        <circle cx="60" cy="18" r="8" fill="#FBCFE8" />
                        <path d="M48 38c0-5 3-9 12-9s12 4 12 9v7H48v-7Z" fill="#3B82F6" />
                        {/* Desk elements */}
                        <circle cx="20" cy="25" r="4" fill="#FBBF24" />
                        <circle cx="105" cy="35" r="3" fill="#34D399" />
                      </svg>
                    </div>
                  </div>

                  {/* Materi Terbaru Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <h3 className="text-base font-extrabold text-slate-800">Materi Terbaru</h3>
                      <button
                        onClick={() => setActiveTab("materi")}
                        className="text-blue-600 hover:text-blue-700 text-xs font-bold"
                      >
                        Lihat Semua
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {courseModules.slice(0, 4).map((mod, idx) => {
                        // Determine button based on progress and type
                        let btnContent = "Mulai";
                        let btnClass = "bg-blue-600 hover:bg-blue-700 text-white";
                        if (mod.isCompleted) {
                          btnContent = "Selesai";
                          btnClass = "bg-slate-50 border border-slate-200 text-slate-400 cursor-default";
                        } else if (idx === 0) {
                          btnContent = "Lanjutkan";
                          btnClass = "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm";
                        } else if (mod.type === "reading") {
                          btnContent = "Unduh";
                          btnClass = "bg-white hover:bg-slate-50 text-blue-600 border border-blue-200";
                        } else if (mod.type === "quiz") {
                          btnContent = "Mulai Kuis";
                          btnClass = "bg-amber-500 hover:bg-amber-600 text-white shadow-sm";
                        }

                        const triggerAction = () => {
                          if (mod.type === "video") {
                            handlePlayVideo(mod.title);
                          } else if (mod.type === "reading") {
                            handleReadModule(mod.title);
                          } else if (mod.type === "quiz") {
                            handleStartQuiz(mod);
                          }
                        };

                        return (
                          <div key={mod.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              {/* Icon container */}
                              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                {mod.type === "video" ? (
                                  <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                ) : mod.type === "reading" ? (
                                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="m9 12 2 2 4-4" />
                                  </svg>
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-slate-800 leading-tight">
                                  {mod.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                  {mod.type === "video" ? "Video" : mod.type === "reading" ? "PDF" : "Kuis"} • {mod.duration}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={triggerAction}
                              disabled={mod.isCompleted && mod.type === "quiz"}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${btnClass}`}
                            >
                              {btnContent}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right side: Pengajar Card (NO announcements card!) */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Pengajar Card */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider self-start mb-4">
                      Pengajar
                    </p>
                    
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mb-3 flex items-center justify-center">
                      <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                      {selectedCourse ? getTeacher(selectedCourse.teacherId)?.fullName : "Budi Santoso, M.Pd."}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 mb-5">
                      Guru {selectedSubject?.name || "Matematika"}
                    </p>

                    <button
                      onClick={() => alert(`Kirim pesan ke pengajar: Fitur chat room sedang disiapkan!`)}
                      className="w-full border border-blue-200 hover:bg-blue-50/50 text-blue-600 font-bold text-xs py-2 px-4 rounded-xl transition-all"
                    >
                      Kirim Pesan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2.5 TAB DISKUSI */}
            {activeTab === "diskusi" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-800">Forum Diskusi Kelas</h3>
                
                {/* Submit post form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPostText.trim()) return;
                    const newPost = {
                      id: `d-${Date.now()}`,
                      user: user?.fullName || "Budi Santoso",
                      avatar: "/avatars/student1.png",
                      role: "Siswa",
                      content: newPostText,
                      time: "Baru saja",
                      replies: 0,
                    };
                    setDiscussions([newPost, ...discussions]);
                    setNewPostText("");
                  }}
                  className="space-y-3"
                >
                  <textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Tulis pertanyaan atau tanggapan Anda di forum kelas..."
                    className="w-full min-h-[80px] p-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-slate-50/30"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-6 rounded-xl transition-all shadow-sm"
                    >
                      Kirim Diskusi
                    </button>
                  </div>
                </form>

                <div className="divide-y divide-slate-100 pt-2">
                  {discussions.map((disc) => (
                    <div key={disc.id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                          <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {disc.isTeacher && selectedCourse 
                                ? (getTeacher(selectedCourse.teacherId)?.fullName || disc.user)
                                : disc.user}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              disc.role === "Pengajar"
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-blue-50 border-blue-200 text-blue-700"
                            }`}>
                              {disc.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold">{disc.time}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-11">
                        {disc.content}
                      </p>
                      <div className="pl-11 pt-1 flex items-center gap-4">
                        <button
                          onClick={() => {
                            setDiscussions(discussions.map(d => d.id === disc.id ? { ...d, replies: d.replies + 1 } : d));
                          }}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 font-bold transition-all"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          {disc.replies} Balasan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2.6 TAB PENGUMUMAN */}
            {activeTab === "pengumuman" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800">Pengumuman Kelas</h3>
                
                <div className="space-y-4">
                  {initialAnnouncements.map((ann) => (
                    <div key={ann.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 hover:bg-slate-50 transition-all">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">
                          {ann.title}
                        </h4>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          ann.priority === "high"
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}>
                          {ann.priority === "high" ? "Penting" : "Informasi"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        {ann.content}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold">
                        Diposting pada: <span className="text-slate-600">{ann.createdAt}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2.1 TAB MATERI */}
            {activeTab === "materi" && (
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
                          ) : mod.type === "reading" ? (
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="m9 12 2 2 4-4" />
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
                        ) : mod.type === "reading" ? (
                          <button
                            onClick={() => handleReadModule(mod.title)}
                            className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs py-1.5 px-4 rounded-xl transition-all"
                          >
                            Baca Modul
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartQuiz(mod)}
                            className={`w-full sm:w-auto font-bold text-xs py-1.5 px-4 rounded-xl transition-all border ${
                              mod.isCompleted
                                ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                            }`}
                            disabled={mod.isCompleted}
                          >
                            {mod.isCompleted ? "Quiz Selesai" : "Mulai Quiz"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2.2 TAB TUGAS */}
            {activeTab === "tugas" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800">Tugas & Pengumpulan</h3>
                
                {courseAssignments.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Tidak ada tugas untuk kelas ini.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {courseAssignments.map((task) => (
                      <div key={task.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-800 leading-tight">
                              {task.title}
                            </h4>
                            {/* Status badges */}
                            <span
                              className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                                task.status === "pending"
                                  ? "bg-rose-50 border-rose-200 text-rose-700"
                                  : task.status === "submitted"
                                  ? "bg-amber-50 border-amber-200 text-amber-700"
                                  : task.status === "graded"
                                  ? "bg-green-50 border-green-200 text-green-700"
                                  : "bg-slate-50 border-slate-200 text-slate-500"
                              }`}
                            >
                              {task.status === "pending"
                                ? "Belum Dikerjakan"
                                : task.status === "submitted"
                                ? "Menunggu Penilaian"
                                : task.status === "graded"
                                ? `Dinilai: ${task.score}/${task.maxScore}`
                                : "Terlambat"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-[500px]">
                            {task.description}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            Batas Pengumpulan: <span className="text-rose-600">{task.dueDate}</span>
                          </p>
                        </div>

                        {/* File upload action */}
                        <div>
                          {task.status === "pending" && (
                            <button
                              onClick={() => setUploadingAssignmentId(task.id)}
                              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" x2="12" y1="3" y2="15" />
                              </svg>
                              Kumpulkan Tugas
                            </button>
                          )}

                          {task.status === "submitted" && (
                            <button
                              disabled
                              className="w-full md:w-auto bg-slate-50 text-slate-400 border border-slate-100 font-bold text-xs py-2 px-4 rounded-xl cursor-not-allowed"
                            >
                              Sudah Dikirim
                            </button>
                          )}

                          {task.status === "graded" && (
                            <div className="text-right">
                              <span className="text-xs text-slate-400 font-semibold uppercase block">Skor Akhir</span>
                              <span className="text-lg font-black text-green-600">{task.score} / {task.maxScore}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2.3 TAB QUIZ */}
            {activeTab === "quiz" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800">Riwayat & Kuis Aktif</h3>
                
                {courseModules.filter((m) => m.type === "quiz").length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Tidak ada kuis untuk kelas ini.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {courseModules
                      .filter((m) => m.type === "quiz")
                      .map((mod) => (
                        <div key={mod.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              {mod.title}
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  mod.isCompleted
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-amber-50 border-amber-200 text-amber-700"
                                }`}
                              >
                                {mod.isCompleted ? "Selesai" : "Ada Quiz Aktif"}
                              </span>
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">Durasi Ujian: {mod.duration}</p>
                          </div>

                          <div>
                            {mod.isCompleted ? (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded-xl">
                                Skor: 100/100
                              </span>
                            ) : (
                              <button
                                onClick={() => handleStartQuiz(mod)}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all"
                              >
                                Kerjakan Kuis
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* READING MODAL / VIEWER */}
      {activeReading && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-base">{activeReading.title}</h3>
              <button
                onClick={() => setActiveReading(null)}
                className="text-slate-400 hover:text-slate-600"
              >
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
            {/* Header */}
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

            {/* Questions container */}
            <div className="overflow-y-auto flex-1 pr-2 space-y-6">
              {quizScore === null ? (
                /* QUIZ ACTIVE VIEW */
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
                /* QUIZ SCORE VIEW */
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

            {/* Footer Buttons */}
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
            {/* Header */}
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

            {/* Upload form */}
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
                <p className="text-[10px] text-slate-400 font-medium">
                  Mendukung PDF, DOCX, ZIP (Max. 5MB)
                </p>
              </div>

              {/* Action buttons */}
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
