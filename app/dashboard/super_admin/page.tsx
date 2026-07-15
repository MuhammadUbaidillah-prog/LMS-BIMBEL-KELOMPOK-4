"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, allUsers as initialUsers } from "../../lib/dummy-data";

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // State khusus hak akses Super Admin: Manajemen Direktori User
  const [disabledUserIds, setDisabledUserIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      router.push("/login/admin");
      return;
    }
    const parsed: User = JSON.parse(stored);
    
    // Sinkronisasi dengan property role 'superadmin' di dummy-data.ts Anda
    if (parsed.role !== "superadmin") {
      router.push("/login/admin");
      return;
    }
    setUser(parsed);
    setUsers(initialUsers);
  }, [router]);

  // Action: Toggle Aktif/Nonaktifkan akun (Siswa & Tutor)
  const toggleUserStatus = (id: string) => {
    setDisabledUserIds((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id],
    );
  };

  // Action: Hapus Akun User Permanen dari View local state
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

  if (!user) return null;

  return (
    <div className="space-y-6 text-slate-800 pb-12">
      {/* Header text info banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Workspace Master Administration (Super Admin)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lumina Light-ERP Monolith Platform Integration Panel
          </p>
        </div>
        {/* Menu Tab Tunggal Eksklusif Super Admin */}
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 text-xs font-bold rounded-xl border bg-blue-600 text-white border-blue-600 shadow-md transition">
            Akun Siswa & Tutor
          </button>
        </div>
      </div>

      {/* VIEW SUB-MODULE: USER DIRECTORY ACCOUNTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students Area */}
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
                      <p className={`font-bold ${isInactive ? "text-slate-400 line-through" : "text-slate-800"}`}>
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
                    <button
                      onClick={() => setSelectedUser(student)}
                      className="p-2 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition flex items-center gap-1 font-bold text-[11px]"
                      title="Edit User"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Tutors Area */}
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
                      <p className={`font-bold ${isInactive ? "text-slate-400 line-through" : "text-slate-800"}`}>
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
                    <button
                      onClick={() => setSelectedUser(tutor)}
                      className="p-2 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition flex items-center gap-1 font-bold text-[11px]"
                      title="Edit User"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

      {/* POPUP SUB-MODAL INTERACTIVE CONTROL PANEL */}
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
    </div>
  );
}