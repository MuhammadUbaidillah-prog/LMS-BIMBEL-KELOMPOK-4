"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  getStudentGrades,
  getStudentStats,
  courses,
  getSubject,
  getTeacher,
  assignments,
  Grade,
} from "../../../lib/dummy-data";

export default function StudentGradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [stats, setStats] = useState<any>(null);

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
    setGrades(getStudentGrades(parsed.id));
    setStats(getStudentStats(parsed.id));
  }, [router]);

  if (!user || !stats) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Get letter grade equivalent
  const getLetterGrade = (score: number) => {
    if (score >= 90) return { letter: "A", color: "text-green-600 bg-green-50 border-green-200" };
    if (score >= 80) return { letter: "B+", color: "text-blue-600 bg-blue-50 border-blue-200" };
    if (score >= 75) return { letter: "B", color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
    if (score >= 65) return { letter: "C", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { letter: "D", color: "text-rose-600 bg-rose-50 border-rose-200" };
  };

  // Get course information helper
  const getCourseDetails = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    const subject = course ? getSubject(course.subjectId) : null;
    const teacher = course ? getTeacher(course.teacherId) : null;
    return {
      title: course?.title ?? "Kursus",
      subjectIcon: subject?.icon ?? "📚",
      subjectName: subject?.name ?? "Mata Pelajaran",
      color: subject?.color ?? "#475569",
      teacherName: teacher?.fullName.split(",")[0] ?? "Pengajar",
    };
  };

  // Get assignment detail
  const getAssignmentTitle = (assignId: string) => {
    const task = assignments.find((a) => a.id === assignId);
    return task?.title ?? "Latihan Soal";
  };

  // Group grades by Course
  const courseIds = Array.from(new Set(grades.map((g) => g.courseId)));

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hasil Belajar & Nilai</h1>
        <p className="text-slate-500 text-sm mt-1">
          Laporan pencapaian nilai akademis, kuis, tugas bimbel, dan tanggapan langsung dari pengajar.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Average Score */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Rata-rata Nilai</span>
            <span className="text-3xl font-black text-slate-800">{stats.avgGrade}</span>
            <span className="text-xs text-slate-500 block">Skala kelulusan KKM: 75</span>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${getLetterGrade(stats.avgGrade).color}`}>
            {getLetterGrade(stats.avgGrade).letter}
          </div>
        </div>

        {/* Card 2: Assignments completed */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Tugas Dikirim</span>
            <span className="text-3xl font-black text-slate-800">
              {stats.totalAssignments - stats.pendingAssignments} <span className="text-xs text-slate-400 font-normal">dari {stats.totalAssignments}</span>
            </span>
            <span className="text-xs text-emerald-600 block font-semibold">
              {Math.round(((stats.totalAssignments - stats.pendingAssignments) / stats.totalAssignments) * 100)}% Tugas Selesai
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Card 3: Completed Courses */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Kelas Selesai</span>
            <span className="text-3xl font-black text-slate-800">
              {stats.completedCourses} <span className="text-xs text-slate-400 font-normal">dari {stats.totalCourses}</span>
            </span>
            <span className="text-xs text-slate-500 block">Mata pelajaran terselesaikan</span>
          </div>
          <div className="w-12 h-12 bg-purple-50 border border-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        </div>
      </div>

      {/* Detailed Grades Grouped by Subject */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-slate-800">Detail Nilai per Mata Pelajaran</h2>
        
        {courseIds.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400">
            Belum ada nilai yang dikeluarkan oleh pengajar.
          </div>
        ) : (
          courseIds.map((cId) => {
            const courseInfo = getCourseDetails(cId);
            const courseGrades = grades.filter((g) => g.courseId === cId);
            const courseAvg = Math.round(
              courseGrades.reduce((sum, g) => sum + g.score, 0) / courseGrades.length
            );

            return (
              <div key={cId} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Accordion/Card Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                      style={{ backgroundColor: `${courseInfo.color}15` }}
                    >
                      {courseInfo.subjectIcon}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{courseInfo.title}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Tutor: {courseInfo.teacherName}</p>
                    </div>
                  </div>

                  {/* Avg indicator */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Rata-rata Kelas</span>
                      <span className="text-base font-black text-slate-800">{courseAvg} / 100</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${getLetterGrade(courseAvg).color}`}>
                      Grade {getLetterGrade(courseAvg).letter}
                    </span>
                  </div>
                </div>

                {/* Grades Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                        <th className="p-4 pl-6">Nama Tugas / Kuis</th>
                        <th className="p-4">Tanggal Diperiksa</th>
                        <th className="p-4 text-center">Nilai Akhir</th>
                        <th className="p-4 max-w-[350px]">Keterangan & Feedback Guru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {courseGrades.map((g) => (
                        <tr key={g.id} className="hover:bg-slate-50/20 transition-colors">
                          <td className="p-4 pl-6 font-semibold text-slate-700">
                            {getAssignmentTitle(g.assignmentId)}
                          </td>
                          <td className="p-4 text-slate-400 font-medium">
                            {new Date(g.gradedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-4 text-center font-bold text-slate-800 text-sm">
                            <span className="text-blue-600">{g.score}</span>{" "}
                            <span className="text-slate-300">/</span>{" "}
                            <span className="text-slate-400 text-xs font-normal">{g.maxScore}</span>
                          </td>
                          <td className="p-4 text-slate-500 leading-relaxed max-w-[350px] whitespace-normal italic">
                            "{g.feedback || "-"}"
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
