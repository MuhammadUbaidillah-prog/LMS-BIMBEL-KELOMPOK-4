"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Course,
  Schedule,
  Assignment,
  courses as initialCourses,
  schedules as initialSchedules,
  assignments as initialAssignments,
  students as initialStudents,
  getSubject,
} from "../../lib/dummy-data";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [teacherSchedules, setTeacherSchedules] = useState<Schedule[]>([]);
  const [ungradedAssignments, setUngradedAssignments] = useState<Assignment[]>([]);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);

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
    setTeacherCourses(myCourses);

    // Get schedules for this teacher
    const mySchedules = initialSchedules.filter((s) => s.teacherId === parsed.id);
    setTeacherSchedules(mySchedules);

    // Get all assignments for this teacher's courses
    const myCourseIds = myCourses.map((c) => c.id);
    const myAssignments = initialAssignments.filter(
      (a) => myCourseIds.includes(a.courseId) && a.status === "submitted"
    );
    setUngradedAssignments(myAssignments);

    // Calculate active student count
    const studentIds = new Set<string>();
    myCourses.forEach((c) => {
      c.enrolledStudents.forEach((id) => studentIds.add(id));
    });
    setActiveStudentsCount(studentIds.size);
  }, [router]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Ringkasan</h1>
        <p className="text-slate-500 text-sm mt-1">
          Selamat datang di Lumina LMS. Berikut ringkasan kelas hari ini, tugas siswa, dan statistik performa kelas Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Kelas Hari Ini */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kelas Hari Ini</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{teacherSchedules.length} Sesi</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Jadwal mengajar aktif minggu ini</p>
          </div>
        </div>

        {/* Stat 2: Tugas Belum Dikoreksi */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tugas Pending</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{ungradedAssignments.length} Tugas</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Menunggu koreksi & penilaian</p>
          </div>
        </div>

        {/* Stat 3: Siswa Aktif */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Siswa Terdaftar</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{activeStudentsCount} Siswa</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Siswa aktif di semua kelas Anda</p>
          </div>
        </div>

        {/* Stat 4: Total Kelas */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mata Pelajaran</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{teacherCourses.length} Kelas</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Kelas materi ajar yang Anda ampu</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Jadwal Sesi & Ungraded List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Jadwal Mengajar */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Jadwal Sesi & Mengajar</h2>
            <button
              onClick={() => router.push("/dashboard/teacher/class")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Lihat Semua
            </button>
          </div>

          {teacherSchedules.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Tidak ada jadwal mengajar terdaftar.
            </div>
          ) : (
            <div className="space-y-3">
              {teacherSchedules.map((sch) => {
                const course = teacherCourses.find((c) => c.id === sch.courseId);
                const subject = course ? getSubject(course.subjectId) : null;
                return (
                  <div key={sch.id} className="flex justify-between items-center border border-slate-50 p-4 rounded-xl hover:border-slate-150 hover:bg-slate-50/30 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1 bg-slate-50 border border-slate-100 rounded-lg">{subject?.icon ?? "📚"}</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{course?.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-0.5">
                            🏢 {sch.room}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          <span className={`px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[9px] ${
                            sch.type === "online" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}>
                            {sch.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">{sch.day}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sch.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Tugas Menunggu Penilaian */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Tugas Siswa</h2>
            <button
              onClick={() => router.push("/dashboard/teacher/assignment")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Koreksi
            </button>
          </div>

          {ungradedAssignments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium space-y-2">
              <span className="text-3xl block">🎉</span>
              <p>Semua tugas siswa telah dikoreksi!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ungradedAssignments.map((a) => {
                const course = teacherCourses.find((c) => c.id === a.courseId);
                return (
                  <div key={a.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-1.5 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{a.title}</h4>
                      <span className="text-[9px] bg-rose-50 border border-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full flex-shrink-0">
                        Pending
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{course?.title}</p>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-100/50">
                      <span className="text-[10px] text-slate-400">Batas: {a.dueDate}</span>
                      <button
                        onClick={() => router.push("/dashboard/teacher/assignment")}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Beri Nilai →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
