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
  grades as initialGrades,
  getSubject,
} from "../../../lib/dummy-data";

interface StudentGradeRow {
  studentId: string;
  studentName: string;
  assignmentScores: Record<string, number | string>; // assignmentId -> score
  averageScore: number;
}

export default function TeacherGradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

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
      setSelectedCourseId(myCourses[0].id);
    }
  }, [router]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const courseAssignments = selectedCourse
    ? initialAssignments.filter((a) => a.courseId === selectedCourseId)
    : [];

  // Calculate student rows
  const getGradeRows = (): StudentGradeRow[] => {
    if (!selectedCourse) return [];

    return selectedCourse.enrolledStudents.map((studId) => {
      const student = initialStudents.find((s) => s.id === studId);
      const scores: Record<string, number | string> = {};
      let total = 0;
      let count = 0;

      courseAssignments.forEach((a) => {
        // Find if this student has a grade in dummy-data or mock it
        const grade = initialGrades.find(
          (g) => g.studentId === studId && g.assignmentId === a.id
        );

        if (grade) {
          scores[a.id] = grade.score;
          total += grade.score;
          count += 1;
        } else if (a.status === "graded" && studId === "s1") {
          // Fallback simulation for Budi
          scores[a.id] = a.score || 80;
          total += a.score || 80;
          count += 1;
        } else {
          scores[a.id] = "—";
        }
      });

      const average = count > 0 ? Math.round(total / count) : 0;

      return {
        studentId: studId,
        studentName: student?.fullName || "Siswa Lumina",
        assignmentScores: scores,
        averageScore: average,
      };
    });
  };

  const rows = getGradeRows();

  // Class Stats
  const classAverage =
    rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.averageScore, 0) / rows.length)
      : 0;

  const highestScore =
    rows.length > 0 ? Math.max(...rows.map((r) => r.averageScore)) : 0;

  const lowestScore =
    rows.length > 0 ? Math.min(...rows.map((r) => r.averageScore)) : 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekap Nilai Siswa (Grades)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Lihat rekapitulasi kumulatif dari seluruh nilai tugas dan performa siswa berdasarkan kelas/mata pelajaran.
          </p>
        </div>

        {/* Dropdown Selector */}
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourseId ? (
        <>
          {/* Class Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rata-Rata Kelas</p>
                <h3 className="text-2xl font-bold text-blue-600">{classAverage}%</h3>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nilai Tertinggi Kelas</p>
                <h3 className="text-2xl font-bold text-emerald-600">{highestScore}%</h3>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nilai Terendah Kelas</p>
                <h3 className="text-2xl font-bold text-rose-500">{lowestScore}%</h3>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h3 className="text-base font-bold text-slate-800">Tabel Rekap Nilai Tugas</h3>
              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all"
              >
                🖨️ Cetak Rekap
              </button>
            </div>

            {rows.length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-sm">Tidak ada siswa terdaftar di kelas ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                      <th className="pb-3 pt-1">Nama Siswa</th>
                      {courseAssignments.map((a) => (
                        <th key={a.id} className="pb-3 pt-1 text-center" title={a.title}>
                          {a.title.length > 15 ? a.title.slice(0, 15) + "..." : a.title}
                        </th>
                      ))}
                      <th className="pb-3 pt-1 text-right">Rata-Rata Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.studentId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-bold text-slate-700">{row.studentName}</td>
                        {courseAssignments.map((a) => (
                          <td key={a.id} className="py-3 text-center text-slate-500 font-semibold">
                            {row.assignmentScores[a.id]}
                          </td>
                        ))}
                        <td className="py-3 text-right">
                          <span className={`font-black text-sm px-2 py-0.5 rounded ${
                            row.averageScore >= 80
                              ? "text-emerald-600 bg-emerald-50"
                              : row.averageScore >= 60
                              ? "text-amber-500 bg-amber-50"
                              : "text-rose-500 bg-rose-50"
                          }`}>
                            {row.averageScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-center py-12 text-slate-400 text-sm">Anda belum mengampu kelas apa pun.</p>
      )}
    </div>
  );
}
