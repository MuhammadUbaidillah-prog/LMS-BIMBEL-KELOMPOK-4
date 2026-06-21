"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  getStudentAssignments as initialGetStudentAssignments,
  courses,
  getSubject,
  Assignment,
} from "../../../lib/dummy-data";

const subjectTitles: { [key: string]: string } = {
  "Matematika": "ADVANCED MATHEMATICS",
  "Fisika": "PHYSICS FUNDAMENTALS",
  "Kimia": "CHEMISTRY LAB",
  "Biologi": "BIOLOGY CELL",
  "B. Inggris": "ENGLISH FOCUS",
  "B. Indonesia": "INDONESIAN LITERACY",
  "Ekonomi": "ECONOMICS & FINANCE"
};

export default function StudentAssignmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Homework upload simulation
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");

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

  // Helper to get course details
  const getCourseInfo = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    const subject = course ? getSubject(course.subjectId) : null;
    const name = subject?.name ?? "Umum";
    const mappedTitle = subjectTitles[name] || name.toUpperCase();
    return {
      title: course?.title ?? "Kursus Lainnya",
      subjectIcon: subject?.icon ?? "📚",
      subjectName: mappedTitle,
      color: subject?.color ?? "#475569",
    };
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

    // Simulate teacher grading after 5 seconds
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

  // Calculate statistics dynamically
  const pendingTasks = assignments.filter((a) => a.status === "pending" || a.status === "late");
  const completedTasks = assignments.filter((a) => a.status === "submitted" || a.status === "graded");
  const totalTasks = assignments.length;
  
  const gradedTasks = assignments.filter((a) => a.status === "graded");
  const avgGrade = gradedTasks.length > 0
    ? (gradedTasks.reduce((sum, a) => sum + (a.score ?? 0), 0) / gradedTasks.length).toFixed(1)
    : "0.0";

  // Filter tasks to display on the left side based on tab
  const displayTasks = assignments.filter((a) => {
    if (activeTab === "pending") return a.status === "pending" || a.status === "late";
    if (activeTab === "completed") return a.status === "submitted" || a.status === "graded";
    return true; // "all"
  });

  // Filter recently graded assignments (top 3 graded ones)
  const recentlyGraded = assignments
    .filter((a) => a.status === "graded")
    .sort((x, y) => {
      const order = ["a1", "a5", "a8"];
      const indexX = order.indexOf(x.id);
      const indexY = order.indexOf(y.id);
      if (indexX !== -1 && indexY !== -1) return indexX - indexY;
      if (indexX !== -1) return -1;
      if (indexY !== -1) return 1;
      return 0;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      
      {/* 1. STATISTICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Belum Selesai */}
        <div className="bg-[#FDF2F2] border border-[#FDE8E8] rounded-2xl p-5 flex flex-col justify-between h-28 shadow-sm transition-transform hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
            BELUM SELESAI
          </span>
          <span className="text-2xl font-black text-slate-800">
            {pendingTasks.length} Tugas
          </span>
        </div>

        {/* Card 2: Sudah Dikumpulkan */}
        <div className="bg-[#DEF7EC] border border-[#DEF7EC] rounded-2xl p-5 flex flex-col justify-between h-28 shadow-sm transition-transform hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-green-800 uppercase tracking-wider block">
            SUDAH DIKUMPULKAN
          </span>
          <span className="text-2xl font-black text-slate-800">
            {completedTasks.length} Tugas
          </span>
        </div>

        {/* Card 3: Total Tugas Semester Ini */}
        <div className="bg-[#E1EFFE] border border-[#E1EFFE] rounded-2xl p-5 flex flex-col justify-between h-28 shadow-sm transition-transform hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
            TOTAL TUGAS SEMESTER INI
          </span>
          <span className="text-2xl font-black text-slate-800">
            {totalTasks} Tugas
          </span>
        </div>

        {/* Card 4: Rata-Rata Nilai Tugas */}
        <div className="bg-[#FDF6B2] border border-[#FDF6B2] rounded-2xl p-5 flex flex-col justify-between h-28 shadow-sm transition-transform hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider block">
            RATA-RATA NILAI TUGAS
          </span>
          <span className="text-2xl font-black text-slate-800">
            {avgGrade}
          </span>
        </div>

      </div>

      {/* 2. FILTER PILLS */}
      <div className="flex gap-2.5">
        <button
          onClick={() => setActiveTab("all")}
          className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm ${
            activeTab === "all"
              ? "bg-[#0b1936] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Semua Tugas
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm ${
            activeTab === "pending"
              ? "bg-[#0b1936] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Belum Selesai
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm ${
            activeTab === "completed"
              ? "bg-[#0b1936] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Sudah Dikumpulkan
        </button>
      </div>

      {/* 3. SPLIT CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tugas Aktif */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80">
          <h3 className="text-lg font-extrabold text-slate-900 mb-5">
            {activeTab === "completed" ? "Tugas Selesai" : "Tugas Aktif"}
          </h3>

          {displayTasks.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <svg className="w-12 h-12 mx-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <p className="text-sm font-bold">Tidak ada tugas di kategori ini</p>
              <p className="text-xs">Pertahankan kerja keras dan prestasi belajar Anda!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayTasks.map((task) => {
                const courseInfo = getCourseInfo(task.courseId);
                const isUrgent = task.dueDate.toLowerCase().includes("besok") && (task.status === "pending" || task.status === "late");

                return (
                  <div
                    key={task.id}
                    className="bg-white hover:bg-slate-50/40 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 border-l-[6px]"
                    style={{ borderLeftColor: courseInfo.color }}
                  >
                    <div className="space-y-1">
                      <span
                        className="text-[10px] font-extrabold tracking-wider block"
                        style={{ color: courseInfo.color }}
                      >
                        {courseInfo.subjectName}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        {isUrgent ? (
                          <span className="text-red-600 font-semibold flex items-center gap-1">
                            ⚠️ Tenggat: {task.dueDate}
                          </span>
                        ) : (
                          <>
                            📅 Tenggat: {task.dueDate}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                      
                      {/* Status Badges */}
                      {task.status === "pending" && (
                        isUrgent ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-600">
                            Mendesak
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-600">
                            Belum Selesai
                          </span>
                        )
                      )}

                      {task.status === "late" && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-600">
                          Mendesak
                        </span>
                      )}

                      {task.status === "submitted" && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600">
                          Menunggu Penilaian
                        </span>
                      )}

                      {task.status === "graded" && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 border border-green-100 text-green-600">
                          Sudah Dinilai
                        </span>
                      )}

                      {/* Action buttons */}
                      {(task.status === "pending" || task.status === "late") ? (
                        <button
                          onClick={() => setUploadingAssignmentId(task.id)}
                          className="bg-[#0b1936] hover:bg-[#15274d] text-white font-bold text-xs py-2 px-5 rounded-xl shadow-sm transition-all duration-200"
                        >
                          Kumpulkan
                        </button>
                      ) : task.status === "submitted" ? (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                          Sudah Dikirim
                        </span>
                      ) : (
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Nilai Anda</span>
                          <span className="text-sm font-black text-green-600">{task.score} / {task.maxScore}</span>
                        </div>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Baru Saja Dinilai */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/80 h-fit">
          <h3 className="text-lg font-extrabold text-slate-900 mb-5">
            Baru Saja Dinilai
          </h3>

          <div className="space-y-4">
            {recentlyGraded.map((task) => {
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="space-y-1 pr-2">
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">
                      {task.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Dikumpul: {task.dueDate}
                    </span>
                  </div>

                  {/* Score badge */}
                  <div className="w-12 h-12 rounded-xl border border-green-200 bg-[#f3fbf7] flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[7px] text-green-600 font-bold uppercase tracking-wider leading-none mb-0.5">
                      NILAI
                    </span>
                    <span className="text-sm font-extrabold text-green-700 leading-none">
                      {task.score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. ASSIGNMENT UPLOAD MODAL */}
      {uploadingAssignmentId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col animate-scale-up">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Kumpulkan Tugas</h3>
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
                className="border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/5 rounded-2xl p-6 bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
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

                <p className="text-xs font-semibold text-slate-600 text-center">
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
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className={`font-semibold text-xs py-2.5 px-6 rounded-xl transition-all shadow-sm ${
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
