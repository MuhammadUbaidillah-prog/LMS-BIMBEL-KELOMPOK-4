"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Course,
  Schedule,
  allUsers as initialUsers,
  courses as initialCourses,
  schedules as initialSchedules,
} from "../../lib/dummy-data";

interface PaymentProof {
  id: string;
  studentName: string;
  courseTitle: string;
  amount: string;
  proofUrl: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

interface ClassCategory {
  id: string;
  name: string;
  code: string;
}

interface LearningContent {
  id: string;
  courseId: string;
  title: string;
  contentType: "video" | "pdf" | "quiz";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"payments" | "users" | "academic">(
    "payments",
  );
  const [user, setUser] = useState<User | null>(null);

  // States mirroring core collections from your sprint list
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [categories, setCategories] = useState<ClassCategory[]>([]);
  const [contents, setContents] = useState<LearningContent[]>([]);

  // State: Menyimpan list ID user yang dinonaktifkan (US-024 & US-025)
  const [disabledUserIds, setDisabledUserIds] = useState<string[]>([]);
  // State: Menyimpan data user yang sedang diklik untuk modal pop-up detail
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Modals / Inputs form states
  const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(
    null,
  );
  const [reviewNotes, setReviewNotes] = useState("");

  // Quick dynamic add inputs
  const [newCategory, setNewCategory] = useState({ name: "", code: "" });
  const [newSchedule, setNewSchedule] = useState({
    courseId: "",
    day: "",
    time: "",
    room: "",
    type: "offline" as "online" | "offline",
  });
  const [newContent, setNewContent] = useState({
    courseId: "",
    title: "",
    contentType: "pdf" as "video" | "pdf" | "quiz",
  });

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      router.push("/login/admin");
      return;
    }
    const parsed: User = JSON.parse(stored);
    if (parsed.role !== "admin") {
      router.push("/login/admin");
      return;
    }
    setUser(parsed);

    // Seed local states from dummy data files
    setUsers(initialUsers);
    setCourses(initialCourses);
    setSchedules(initialSchedules);

    // Seed Default categories from subjects metadata
    setCategories([
      { id: "cat-1", name: "Sains & Matematika", code: "SCI-MAT" },
      { id: "cat-2", name: "Bahasa & Sastra", code: "LANG" },
    ]);

    // Seed Mock learning contents (US-030)
    setContents([
      {
        id: "lc-1",
        courseId: initialCourses[0]?.id || "1",
        title: "Modul Pertemuan 1 - Pendahuluan",
        contentType: "pdf",
      },
      {
        id: "lc-2",
        courseId: initialCourses[0]?.id || "1",
        title: "Video Pembelajaran Dasar Aljabar",
        contentType: "video",
      },
    ]);

    // Seed Mock registration/course payments (US-027)
    setPayments([
      {
        id: "PAY-101",
        studentName: "Rian Hidayat",
        courseTitle: "Matematika Dasar UTBK",
        amount: "Rp 450.000",
        proofUrl: "/library-students.png",
        status: "pending",
      },
      {
        id: "PAY-102",
        studentName: "Amalia Putri",
        courseTitle: "Fisika Mekanika Lanjutan",
        amount: "Rp 600.000",
        proofUrl: "/library-students.png",
        status: "pending",
      },
    ]);
  }, [router]);

  // Action: US-028 Approve / Reject Payments
  const processPayment = (id: string, action: "approved" | "rejected") => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: action, notes: reviewNotes } : p,
      ),
    );
    setSelectedPayment(null);
    setReviewNotes("");
  };

  // Action: US-024 & US-025 Toggle Aktif/Nonaktifkan akun
  const toggleUserStatus = (id: string) => {
    setDisabledUserIds((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id],
    );
  };

  // Action: US-024 & US-025 Delete accounts
  const deleteAccount = (id: string) => {
    if (
      confirm(
        "Hapus pengguna ini secara permanen dari sistem? Tindakan ini tidak dapat dibatalkan.",
      )
    ) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
    }
  };

  // Action: US-026 Add categories
  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.code) return;
    setCategories([...categories, { id: `cat-${Date.now()}`, ...newCategory }]);
    setNewCategory({ name: "", code: "" });
  };

  // Action: US-029 Add schedules
  const addSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.courseId || !newSchedule.day || !newSchedule.time) return;
    const assignedCourse = courses.find((c) => c.id === newSchedule.courseId);
    setSchedules([
      ...schedules,
      {
        id: `sch-${Date.now()}`,
        courseId: newSchedule.courseId,
        teacherId: assignedCourse?.teacherId || "system",
        day: newSchedule.day,
        time: newSchedule.time,
        room: newSchedule.room || "Aula Virtual",
        type: newSchedule.type,
      },
    ]);
    setNewSchedule({
      courseId: "",
      day: "",
      time: "",
      room: "",
      type: "offline",
    });
  };

  // Action: US-030 Add contents
  const addLearningContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.courseId || !newContent.title) return;
    setContents([...contents, { id: `lc-${Date.now()}`, ...newContent }]);
    setNewContent({ courseId: "", title: "", contentType: "pdf" });
  };

  if (!user) return null;

  return (
    <div className="space-y-6 text-slate-800 pb-12">
      {/* Header text info banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Workspace Master Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lumina Light-ERP Monolith Platform Integration Panel
          </p>
        </div>
        {/* Dynamic subnavigation pill switches */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${activeTab === "payments" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
          >
            Keuangan & Slip (
            {payments.filter((p) => p.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${activeTab === "users" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
          >
            Akun Siswa & Tutor
          </button>
          <button
            onClick={() => setActiveTab("academic")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${activeTab === "academic" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
          >
            Kurikulum & Jadwal Master
          </button>
        </div>
      </div>

      {/* VIEW SUB-MODULE: FINANCES & VERIFICATION (US-027, US-028) */}
      {activeTab === "payments" && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Validasi Slip Pembayaran Kursus
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Mahasiswa</th>
                  <th className="p-3">Mata Kuliah Pilihan</th>
                  <th className="p-3">Nominal Transfer</th>
                  <th className="p-3">Status Verifikasi</th>
                  <th className="p-3 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {pay.id}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {pay.studentName}
                    </td>
                    <td className="p-3 text-slate-500">{pay.courseTitle}</td>
                    <td className="p-3 font-bold text-emerald-600">
                      {pay.amount}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pay.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : pay.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                      >
                        {pay.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {pay.status === "pending" ? (
                        <button
                          onClick={() => setSelectedPayment(pay)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
                        >
                          Periksa Dokumen
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          {pay.notes || "No system remarks"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW SUB-MODULE: USER DIRECTORY ACCOUNTS (US-024, US-025) */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* US-024 Students Area */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Manajemen Data Direktori Mahasiswa (Student)
            </h2>
            <div className="overflow-y-auto max-h-100 border border-slate-100 rounded-xl divide-y divide-slate-100">
              {users
                .filter((u) => u.role === "student")
                .map((student) => {
                  const isInactive = disabledUserIds.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      className={`flex justify-between items-center p-3 text-xs transition-all ${isInactive ? "bg-slate-50/70 opacity-60" : "bg-white hover:bg-slate-50"}`}
                    >
                      <div className="flex-1 pr-4">
                        <p
                          className={`font-bold ${isInactive ? "text-slate-400 line-through" : "text-slate-800"}`}
                        >
                          {student.fullName}
                        </p>
                        <p className="text-slate-400 font-mono mt-0.5">
                          {student.email}
                        </p>
                        {isInactive && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded uppercase">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      {/* Ganti ke Button Icon Edit demi Human Error Prevention */}
                      <button
                        onClick={() => setSelectedUser(student)}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition flex items-center gap-1 font-bold text-[11px]"
                        title="Edit User"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* US-025 Tutors Area */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Manajemen Data Direktori Pengajar (Tutor)
            </h2>
            <div className="overflow-y-auto max-h-[400px] border border-slate-100 rounded-xl divide-y divide-slate-100">
              {users
                .filter((u) => u.role === "teacher")
                .map((tutor) => {
                  const isInactive = disabledUserIds.includes(tutor.id);
                  return (
                    <div
                      key={tutor.id}
                      className={`flex justify-between items-center p-3 text-xs transition-all ${isInactive ? "bg-slate-50/70 opacity-60" : "bg-white hover:bg-slate-50"}`}
                    >
                      <div className="flex-1 pr-4">
                        <p
                          className={`font-bold ${isInactive ? "text-slate-400 line-through" : "text-slate-800"}`}
                        >
                          {tutor.fullName}
                        </p>
                        <p className="text-slate-400 font-mono mt-0.5">
                          {tutor.email}
                        </p>
                        {isInactive && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded uppercase">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      {/* Ganti ke Button Icon Edit demi Human Error Prevention */}
                      <button
                        onClick={() => setSelectedUser(tutor)}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition flex items-center gap-1 font-bold text-[11px]"
                        title="Edit User"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW SUB-MODULE: ACADEMIC FRAMEWORK ARCHITECTURE (US-026, US-029, US-030) */}
      {activeTab === "academic" && (
        <div className="space-y-6">
          {/* US-026: Categories Framework Control */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Kategori Kelas & Bidang Keilmuan (Class Categories)
            </h2>
            <form
              onSubmit={addCategory}
              className="flex flex-wrap gap-3 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-100"
            >
              <div className="flex-1 min-w-[180px]">
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Ilmu Komputer"
                  required
                />
              </div>
              <div className="w-32">
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Kode Unik
                </label>
                <input
                  type="text"
                  value={newCategory.code}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, code: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="CS"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
              >
                Tambah Kategori
              </button>
            </form>
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  <span className="bg-slate-300 px-1 py-0.2 rounded text-[10px] text-slate-800 font-bold font-mono">
                    {cat.code}
                  </span>{" "}
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          {/* US-029: Master Schedules Builder */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Manajemen Alokasi Jadwal Induk Kuliah (Master Schedules)
            </h2>
            <form
              onSubmit={addSchedule}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Pilih Kursus
                </label>
                <select
                  value={newSchedule.courseId}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, courseId: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl focus:outline-none"
                  required
                >
                  <option value="">-- Silahkan Pilih --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Hari
                </label>
                <input
                  type="text"
                  value={newSchedule.day}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, day: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl focus:outline-none"
                  placeholder="Senin"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Jam / Waktu Sesi
                </label>
                <input
                  type="text"
                  value={newSchedule.time}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, time: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl focus:outline-none"
                  placeholder="09:00 - 11:30"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Ruang / Link Rapat
                </label>
                <input
                  type="text"
                  value={newSchedule.room}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, room: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl focus:outline-none"
                  placeholder="R. Lab 402"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 font-bold uppercase text-slate-400">
                  <tr>
                    <th className="p-3">Mata Kuliah</th>
                    <th className="p-3">Hari Operasional</th>
                    <th className="p-3">Alokasi Jam</th>
                    <th className="p-3">Lokasi Ruang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((sch) => {
                    const matchedCourse = courses.find(
                      (c) => c.id === sch.courseId,
                    );
                    return (
                      <tr
                        key={sch.id}
                        className="hover:bg-slate-50/50 font-medium"
                      >
                        <td className="p-3 font-bold text-slate-800">
                          {matchedCourse
                            ? matchedCourse.title
                            : "Unknown Course"}
                        </td>
                        <td className="p-3 text-slate-600">{sch.day}</td>
                        <td className="p-3 font-mono">{sch.time}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-150 text-slate-600 font-bold text-[10px]">
                            {sch.room}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* US-030: Learning Content Publisher */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Penayangan Materi & Konten Modul (Learning Content)
            </h2>
            <form
              onSubmit={addLearningContent}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Pilih Target Kursus
                </label>
                <select
                  value={newContent.courseId}
                  onChange={(e) =>
                    setNewContent({ ...newContent, courseId: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl focus:outline-none"
                  required
                >
                  <option value="">-- Silahkan Pilih --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Judul Konten/Modul
                </label>
                <input
                  type="text"
                  value={newContent.title}
                  onChange={(e) =>
                    setNewContent({ ...newContent, title: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl focus:outline-none"
                  placeholder="e.g., Bab II - Gaya Sentrifugal"
                  required
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                    Tipe
                  </label>
                  <select
                    value={newContent.contentType}
                    onChange={(e) =>
                      setNewContent({
                        ...newContent,
                        contentType: e.target.value as any,
                      })
                    }
                    className="w-full text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl focus:outline-none"
                  >
                    <option value="pdf">Document (PDF)</option>
                    <option value="video">Streaming (Video)</option>
                    <option value="quiz">Interaktif (Quiz)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
                >
                  Upload Konten
                </button>
              </div>
            </form>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
              {contents.map((cnt) => {
                const matchedCourse = courses.find(
                  (c) => c.id === cnt.courseId,
                );
                return (
                  <div
                    key={cnt.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono text-[10px] uppercase font-bold">
                        {cnt.contentType}
                      </span>
                      <p className="font-semibold text-slate-800">
                        {cnt.title}
                      </p>
                    </div>
                    <p className="text-slate-400 text-[11px] font-medium italic">
                      {matchedCourse ? matchedCourse.title : "Global Library"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SECURE MODAL BOX: USER INTERACTIVE CONTROL PANEL ==================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 text-xs text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Manajemen Kontrol User
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  UID: {selectedUser.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-lg">
                {selectedUser.role === "student" ? "🎓" : "👨‍🏫"}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {selectedUser.fullName}
                </h4>
                <p className="text-[10px] font-mono text-slate-400">
                  @{selectedUser.username}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="space-y-2 bg-white border border-slate-100 p-4 rounded-xl shadow-sm font-medium">
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Email Address</span>
                <span className="font-mono text-slate-800">
                  {selectedUser.email}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-mono text-slate-800">
                  {selectedUser.phone}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Registered At</span>
                <span className="text-slate-700">{selectedUser.joinedAt}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Current Status</span>
                <span
                  className={`px-2 py-0.5 font-bold rounded text-[9px] uppercase ${disabledUserIds.includes(selectedUser.id) ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}
                >
                  {disabledUserIds.includes(selectedUser.id)
                    ? "Suspended / Nonaktif"
                    : "Active / Aktif"}
                </span>
              </div>
            </div>

            {/* Proses Eksektif diisolasi di sini untuk mencegah Human Error di Baris Tabel */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => toggleUserStatus(selectedUser.id)}
                className={`py-2 text-xs font-bold rounded-xl border transition ${disabledUserIds.includes(selectedUser.id) ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"}`}
              >
                {disabledUserIds.includes(selectedUser.id)
                  ? "Aktifkan Akun"
                  : "Nonaktifkan Akun"}
              </button>
              <button
                onClick={() => deleteAccount(selectedUser.id)}
                className="py-2 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100 transition"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP SUB-MODAL SCREEN FOR EXTRACTED PAYMENT RECEIPTS */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Validasi Bukti Transfer Manual
              </h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-400">
                Pengirim:{" "}
                <span className="font-bold text-slate-700 text-xs">
                  {selectedPayment.studentName}
                </span>
              </p>
              <p className="text-slate-400">
                Program:{" "}
                <span className="font-semibold text-slate-700">
                  {selectedPayment.courseTitle}
                </span>
              </p>
              <p className="text-slate-400">
                Nominal:{" "}
                <span className="font-bold text-emerald-600 text-xs">
                  {selectedPayment.amount}
                </span>
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center h-44">
              <img
                src={selectedPayment.proofUrl}
                alt="Receipt proof snapshot"
                className="object-contain max-h-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 block uppercase">
                Catatan Verifikator (US-028)
              </label>
              <input
                type="text"
                placeholder="Contoh: Bukti Transfer Sesuai, disetujui"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-slate-50 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => processPayment(selectedPayment.id, "rejected")}
                className="py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition"
              >
                Tolak Pembayaran
              </button>
              <button
                onClick={() => processPayment(selectedPayment.id, "approved")}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Setujui & Aktivasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
