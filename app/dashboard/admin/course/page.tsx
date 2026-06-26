"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Course,
  Module,
  courses as initialCourses,
  modules as initialModules,
  getSubject,
} from "../../../lib/dummy-data";

export default function TeacherCoursePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Forms states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"video" | "reading">("video");
  const [newDuration, setNewDuration] = useState("15 min");

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

    // Initialize modules
    setModules(initialModules);
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
  const subjectDetail = selectedCourse ? getSubject(selectedCourse.subjectId) : null;

  // Filter modules for selected course
  const courseModules = selectedCourseId
    ? modules.filter((m) => m.courseId === selectedCourseId).sort((a, b) => a.order - b.order)
    : [];

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Judul materi tidak boleh kosong!");
      return;
    }

    if (!selectedCourseId) return;

    const newMod: Module = {
      id: `m-custom-${Date.now()}`,
      courseId: selectedCourseId,
      title: newTitle,
      type: newType,
      duration: newDuration,
      isCompleted: false,
      order: courseModules.length + 1,
    };

    setModules((prev) => [...prev, newMod]);
    setShowAddModal(false);
    setNewTitle("");
    setNewDuration("15 min");
    alert(`Materi "${newTitle}" (${newType === "video" ? "Video" : "PDF Modul"}) berhasil ditambahkan!`);
  };

  const handleDeleteModule = (modId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
      setModules((prev) => prev.filter((m) => m.id !== modId));
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      {/* 1. LIST VIEW OF COURSES */}
      {!selectedCourseId ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kelola Materi Kelas (Course)</h1>
            <p className="text-slate-500 text-sm mt-1">
              Buat, edit, dan kelola bahan ajar seperti mengunggah rekaman video, PDF modul pelajaran, atau menambah topik bab baru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => {
              const subject = getSubject(course.subjectId);
              const count = modules.filter((m) => m.courseId === course.id).length;

              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Color / Icon Header representation */}
                    <div
                      className="w-full h-32 rounded-xl mb-4 flex flex-col justify-center items-center gap-2 relative overflow-hidden"
                      style={{
                        background: subject
                          ? `linear-gradient(135deg, ${subject.color}15, ${subject.color}35)`
                          : "#f8fafc",
                      }}
                    >
                      <span className="text-4xl">{subject?.icon ?? "📚"}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-slate-100 rounded shadow-sm text-slate-700">
                        {subject?.name ?? "Course"}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mb-4">
                      {count} Materi Pelajaran Terdaftar
                    </p>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm">
                    Kelola Materi
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 2. DETAILED MATERIALS LIST & MANAGER */
        <div className="space-y-6">
          {/* Back Button */}
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

          {/* Header */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {subjectDetail && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${subjectDetail.color}15`, color: subjectDetail.color }}>
                    {subjectDetail.icon} {subjectDetail.name}
                  </span>
                )}
                <span className="text-xs text-slate-400">Penyusunan Materi Pembelajaran</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 leading-snug">
                {selectedCourse?.title}
              </h2>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNewType("video");
                  setShowAddModal(true);
                }}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                📹 Upload Video
              </button>
              <button
                onClick={() => {
                  setNewType("reading");
                  setShowAddModal(true);
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                📄 Upload Modul PDF
              </button>
            </div>
          </div>

          {/* Modules List block */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h3 className="text-base font-bold text-slate-800">Modul, Topik & Video Saat Ini</h3>
              <span className="text-xs font-semibold text-slate-400">{courseModules.length} Topik</span>
            </div>

            {courseModules.length === 0 ? (
              <p className="text-slate-400 text-center py-8 text-sm">Belum ada materi pelajaran. Klik tombol di atas untuk menambah.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {courseModules.map((mod, idx) => (
                  <div key={mod.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-100 flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>

                      <div className="mt-1 flex-shrink-0">
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

                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                          {mod.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-medium">{mod.duration}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-400 px-1.5 py-0.2 rounded-full uppercase">
                            {mod.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Hapus Materi"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD TOPIC / FILE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddModule} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Tambah {newType === "video" ? "Materi Video" : "Modul PDF"}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Lengkapi data berkas/topik ajar</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
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
                <label className="text-[11px] font-bold text-slate-400 uppercase">Judul Topik / Materi</label>
                <input
                  type="text"
                  placeholder="Contoh: Integral Tentu Bagian 1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Pilih Berkas Pelajaran</label>
                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <span className="text-2xl block mb-1">📁</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Klik untuk memilih file ({newType === "video" ? "mp4, mkv" : "pdf, docx"})
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Perkiraan Waktu Belajar / Durasi</label>
                <input
                  type="text"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="Contoh: 30 min"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-6 rounded-xl transition-all shadow-sm"
              >
                Simpan Materi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
