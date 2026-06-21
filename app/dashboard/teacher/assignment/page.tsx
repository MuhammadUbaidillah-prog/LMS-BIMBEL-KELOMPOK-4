"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Course,
  Assignment,
  courses as initialCourses,
  assignments as initialAssignments,
  students as initialStudents,
  getSubject,
} from "../../../lib/dummy-data";

export default function TeacherAssignmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Navigation states
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Form: Buat Tugas Baru
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("2026-06-25");
  const [newMaxScore, setNewMaxScore] = useState(100);
  const [targetCourseId, setTargetCourseId] = useState("");

  // Grading State
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);
  const [inputScore, setInputScore] = useState(85);
  const [inputFeedback, setInputFeedback] = useState("Kerjaan yang bagus!");

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

    // Load assignments
    setAssignments(initialAssignments);
  }, [router]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Filter assignments for courses taught by this teacher
  const myCourseIds = courses.map((c) => c.id);
  const teacherAssignments = assignments.filter((a) => myCourseIds.includes(a.courseId));

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId);
  const selectedCourse = selectedAssignment ? courses.find((c) => c.id === selectedAssignment.courseId) : null;

  // Simulate student submissions for details
  const getSubmissions = () => {
    if (!selectedAssignment || !selectedCourse) return [];

    return selectedCourse.enrolledStudents.map((studId) => {
      const student = initialStudents.find((s) => s.id === studId);
      // Generate some mock submission state based on assignment id and student id
      let mockStatus: "pending" | "submitted" | "graded" = "pending";
      let mockScore = selectedAssignment.score;

      // Make it dynamic: Student 1 has submitted, Student 2 is graded, etc.
      if (studId === "s1") {
        mockStatus = selectedAssignment.status === "graded" ? "graded" : "submitted";
      } else if (studId === "s2") {
        mockStatus = "graded";
        mockScore = 90;
      }

      return {
        studentId: studId,
        studentName: student?.fullName || "Siswa Lumina",
        status: mockStatus,
        score: mockScore,
        maxScore: selectedAssignment.maxScore,
        submittedAt: "2026-06-14 10:24",
        feedback: studId === "s2" ? "Sangat rapi!" : "",
      };
    });
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAssign: Assignment = {
      id: `a-custom-${Date.now()}`,
      courseId: targetCourseId,
      title: newTitle,
      description: newDesc,
      dueDate: newDueDate,
      status: "pending",
      maxScore: newMaxScore,
    };

    setAssignments((prev) => [newAssign, ...prev]);
    setShowCreateModal(false);
    setNewTitle("");
    setNewDesc("");
    alert(`Tugas "${newTitle}" berhasil dibuat!`);
  };

  const handleGradeSubmission = (studentId: string) => {
    setGradingStudentId(studentId);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId || !gradingStudentId) return;

    // Save grade simulation
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === selectedAssignmentId) {
          return {
            ...a,
            status: "graded",
            score: inputScore,
          };
        }
        return a;
      })
    );

    alert(`Nilai ${inputScore} berhasil disimpan untuk siswa.`);
    setGradingStudentId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* 1. LIST VIEW OF ASSIGNMENTS */}
      {!selectedAssignmentId ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Kelola Tugas Kelas (Assignment)</h1>
              <p className="text-slate-500 text-sm mt-1">
                Buat tugas pekerjaan rumah baru untuk kelas, tinjau hasil pengerjaan siswa, dan berikan penilaian langsung.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              📝 Buat Tugas Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {teacherAssignments.map((assign) => {
              const course = courses.find((c) => c.id === assign.courseId);
              const subject = course ? getSubject(course.subjectId) : null;

              return (
                <div
                  key={assign.id}
                  onClick={() => setSelectedAssignmentId(assign.id)}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Header Subject Icon */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-slate-600">
                        {subject?.icon} {subject?.name || "Subject"}
                      </span>
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        Batas: {assign.dueDate}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors mb-2">
                      {assign.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {assign.description}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-50 pt-4 mt-4">
                      <span>Max Skor: {assign.maxScore}</span>
                      <span className="text-blue-600 font-bold">Koreksi & Nilai →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 2. ASSIGNMENT SUBMISSIONS DETAILS */
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedAssignmentId(null)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Daftar Tugas
          </button>

          {/* Details header */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">DETAIL TUGAS</span>
              <h2 className="text-lg font-bold text-slate-800 leading-snug">
                {selectedAssignment?.title}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {selectedAssignment?.description}
              </p>
              <p className="text-[10px] text-rose-500 font-bold mt-2">
                Batas Pengumpulan: {selectedAssignment?.dueDate}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Kelas</span>
              <span className="text-sm font-bold text-slate-700">{selectedCourse?.title}</span>
            </div>
          </div>

          {/* Submissions List Table */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Daftar Pengumpulan Siswa</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Nama Siswa</th>
                    <th className="pb-3">Tanggal Unggah</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-center">Skor / Feedback</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getSubmissions().map((sub) => (
                    <tr key={sub.studentId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">{sub.studentName}</td>
                      <td className="py-3 text-slate-400">{sub.status === "pending" ? "—" : sub.submittedAt}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          sub.status === "graded"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : sub.status === "submitted"
                            ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}>
                          {sub.status === "graded" ? "Dinilai" : sub.status === "submitted" ? "Perlu Dinilai" : "Belum Kumpul"}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {sub.status === "graded" ? (
                          <div className="flex flex-col items-center">
                            <span className="font-extrabold text-green-600 text-sm">{sub.score}/{sub.maxScore}</span>
                            {sub.feedback && <span className="text-[9px] text-slate-400 italic font-semibold">"{sub.feedback}"</span>}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="py-3 text-right">
                        {sub.status === "submitted" && (
                          <button
                            onClick={() => handleGradeSubmission(sub.studentId)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-1 px-3 rounded-lg transition-all"
                          >
                            Beri Nilai
                          </button>
                        )}
                        {sub.status === "graded" && (
                          <button
                            onClick={() => handleGradeSubmission(sub.studentId)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-1 px-3 rounded-lg transition-all"
                          >
                            Ubah Nilai
                          </button>
                        )}
                        {sub.status === "pending" && <span className="text-slate-300 font-semibold">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateAssignment} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col animate-scale-up">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Buat Tugas Pekerjaan Rumah</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Lengkapi form pembuatan tugas</p>
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
                <label className="text-[11px] font-bold text-slate-400 uppercase">Pilih Kelas Sasaran</label>
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
                <label className="text-[11px] font-bold text-slate-400 uppercase">Judul Tugas</label>
                <input
                  type="text"
                  placeholder="Contoh: Latihan Diferensial Lanjutan"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Deskripsi / Intruksi Tugas</label>
                <textarea
                  placeholder="Instruksi pengerjaan tugas..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700 h-20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Batas Tanggal</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Max Nilai</label>
                  <input
                    type="number"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                    required
                  />
                </div>
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
                Buat Tugas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GRADING FORM MODAL */}
      {gradingStudentId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveGrade} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Berikan Nilai Tugas</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Input nilai serta umpan balik koreksi Anda</p>
              </div>
              <button
                type="button"
                onClick={() => setGradingStudentId(null)}
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
                <label className="text-[11px] font-bold text-slate-400 uppercase">Skor Nilai Siswa (Maks: {selectedAssignment?.maxScore})</label>
                <input
                  type="number"
                  max={selectedAssignment?.maxScore}
                  value={inputScore}
                  onChange={(e) => setInputScore(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Umpan Balik (Feedback)</label>
                <textarea
                  value={inputFeedback}
                  onChange={(e) => setInputFeedback(e.target.value)}
                  placeholder="Tulis ulasan hasil kerja siswa..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700 h-16"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGradingStudentId(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-6 rounded-xl transition-all shadow-sm"
              >
                Simpan Nilai
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
