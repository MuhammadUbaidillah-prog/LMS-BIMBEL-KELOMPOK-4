"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Course,
  Schedule,
  courses as initialCourses,
  schedules as initialSchedules,
  students as initialStudents,
  getSubject,
} from "../../../lib/dummy-data";

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: "Hadir" | "Izin" | "Sakit" | "Alfa";
}

export default function TeacherClassPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"siswa" | "jadwal" | "absensi">("siswa");

  // Mock attendance records state
  const [attendanceDate, setAttendanceDate] = useState("2026-06-15");
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

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

    // Get schedules for this teacher
    const mySchedules = initialSchedules.filter((s) => s.teacherId === parsed.id);
    setSchedules(mySchedules);
  }, [router]);

  // Handle selected course change
  useEffect(() => {
    if (selectedCourseId) {
      const selectedCourse = courses.find((c) => c.id === selectedCourseId);
      if (selectedCourse) {
        // Build initial attendance list for the enrolled students
        const initialList: AttendanceRecord[] = selectedCourse.enrolledStudents.map((id) => {
          const student = initialStudents.find((s) => s.id === id);
          return {
            studentId: id,
            studentName: student?.fullName || "Siswa Lumina",
            status: "Hadir",
          };
        });
        setAttendanceList(initialList);
      }
    }
  }, [selectedCourseId, courses]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const courseSchedules = selectedCourseId ? schedules.filter((s) => s.courseId === selectedCourseId) : [];
  const subjectDetail = selectedCourse ? getSubject(selectedCourse.subjectId) : null;

  // Find enrolled students info
  const courseStudents = selectedCourse
    ? initialStudents.filter((s) => selectedCourse.enrolledStudents.includes(s.id))
    : [];

  const handleUpdateAttendance = (studentId: string, status: "Hadir" | "Izin" | "Sakit" | "Alfa") => {
    setAttendanceList((prev) =>
      prev.map((rec) => (rec.studentId === studentId ? { ...rec, status } : rec))
    );
  };

  const handleSaveAttendance = () => {
    alert(`Absensi untuk tanggal ${attendanceDate} berhasil disimpan!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* 1. LIST VIEW OF ALL CLASSES */}
      {!selectedCourseId ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kelola Kelas yang Diajar</h1>
            <p className="text-slate-500 text-sm mt-1">
              Pilih kelas yang Anda ajar untuk melihat daftar siswa, jadwal sesi kelas, dan input absensi harian.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => {
              const subject = getSubject(course.subjectId);
              const classSchedules = schedules.filter((s) => s.courseId === course.id);

              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Header Subject Icon */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-slate-600">
                        {subject?.icon} {subject?.name || "Subject"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {course.enrolledStudents.length} Siswa Terdaftar
                      </span>
                    </div>

                    {/* Class Name */}
                    <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {course.description}
                    </p>

                    {/* Schedules info in card */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50 space-y-1.5 mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Jadwal Sesi</span>
                      {classSchedules.map((sch) => (
                        <div key={sch.id} className="flex justify-between items-center text-xs font-semibold text-slate-600">
                          <span>📅 {sch.day}</span>
                          <span>🕒 {sch.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm">
                    Kelola Kelas
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 2. CLASS DETAIL VIEW (TABS FOR DAFTAR SISWA, JADWAL, ABSENSI) */
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedCourseId(null)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Daftar Kelas
          </button>

          {/* Class Title Header */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {subjectDetail && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded animate-pulse" style={{ backgroundColor: `${subjectDetail.color}15`, color: subjectDetail.color }}>
                    {subjectDetail.icon} {subjectDetail.name}
                  </span>
                )}
                <span className="text-xs text-slate-400">ID Kelas: {selectedCourseId}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 leading-snug">
                {selectedCourse?.title}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Total Siswa</span>
              <span className="text-2xl font-extrabold text-blue-600">{courseStudents.length} Siswa</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("siswa")}
              className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
                activeTab === "siswa"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Daftar Siswa
            </button>
            <button
              onClick={() => setActiveTab("jadwal")}
              className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
                activeTab === "jadwal"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Jadwal Sesi
            </button>
            <button
              onClick={() => setActiveTab("absensi")}
              className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
                activeTab === "absensi"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Absensi Kelas
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="space-y-4">
            {/* 2.1 DAFTAR SISWA */}
            {activeTab === "siswa" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800">Siswa yang Terdaftar</h3>
                {courseStudents.length === 0 ? (
                  <p className="text-slate-400 text-center py-6 text-sm">Belum ada siswa yang mendaftar.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                          <th className="pb-3 pt-1">Nama Siswa</th>
                          <th className="pb-3 pt-1">Email</th>
                          <th className="pb-3 pt-1">No. Handphone</th>
                          <th className="pb-3 pt-1">Tanggal Bergabung</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {courseStudents.map((stud) => (
                          <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-500">
                                {stud.fullName.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-700">{stud.fullName}</span>
                            </td>
                            <td className="py-3 text-slate-500 font-medium">{stud.email}</td>
                            <td className="py-3 text-slate-500 font-medium">{stud.phone}</td>
                            <td className="py-3 text-slate-400 font-medium">{stud.joinedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 2.2 JADWAL SESI */}
            {activeTab === "jadwal" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800">Sesi Kelas Terjadwal</h3>
                <div className="space-y-3">
                  {courseSchedules.map((sch) => (
                    <div key={sch.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-lg p-2 bg-blue-50 text-blue-600 rounded-lg">📅</span>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{sch.day}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{sch.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                          sch.type === "online" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-blue-50 border-blue-200 text-blue-700"
                        }`}>
                          {sch.type}
                        </span>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">Ruang: {sch.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2.3 ABSENSI KELAS */}
            {activeTab === "absensi" && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Pencatatan Kehadiran Siswa</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Silakan pilih tanggal absensi dan tandai kehadiran siswa</p>
                  </div>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="overflow-x-auto pt-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                        <th className="pb-3">Nama Siswa</th>
                        <th className="pb-3 text-center">Status Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceList.map((rec) => (
                        <tr key={rec.studentId}>
                          <td className="py-3 font-bold text-slate-700">{rec.studentName}</td>
                          <td className="py-3">
                            <div className="flex justify-center items-center gap-2">
                              {(["Hadir", "Izin", "Sakit", "Alfa"] as const).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleUpdateAttendance(rec.studentId, status)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                    rec.status === status
                                      ? status === "Hadir"
                                        ? "bg-emerald-500 text-white border-emerald-500"
                                        : status === "Izin"
                                        ? "bg-blue-500 text-white border-blue-500"
                                        : status === "Sakit"
                                        ? "bg-amber-500 text-white border-amber-500"
                                        : "bg-rose-500 text-white border-rose-500"
                                      : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <button
                    onClick={handleSaveAttendance}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-6 rounded-xl transition-all shadow-sm"
                  >
                    Simpan Absensi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
