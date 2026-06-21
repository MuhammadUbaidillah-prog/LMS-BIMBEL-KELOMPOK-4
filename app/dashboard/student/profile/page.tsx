"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "../../../lib/dummy-data";

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Form states (Editable)
  const [fullName, setFullName] = useState("");
  const [birthInfo, setBirthInfo] = useState("Jakarta, 14 April 2009");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("081234567890");
  const [address, setAddress] = useState("Jl. Merdeka Raya No. 45, Menteng, Jakarta Pusat");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("Siswa aktif bimbingan belajar Lumina LMS. Senang belajar matematika dan sains.");

  // Class info states (Read-only / Disabled)
  const [waliKelas, setWaliKelas] = useState("Drs. Budi Santoso, M.Pd.");
  const [parentName, setParentName] = useState("Abdul Gofar");
  const [ekskul, setEkskul] = useState("Pramuka (Wajib), OSIS");
  const [attendance, setAttendance] = useState("98.5% (Sakit: 1, Alfa: 0)");

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

    // Set from parsed local storage or use defaults
    setFullName(parsed.fullName);
    setEmail(parsed.email);
    setPhone(parsed.phone || "081234567890");
    setUsername(parsed.username);

    // Check if extra fields exist on parsed user, otherwise use screenshot defaults
    const anyParsed = parsed as any;
    if (anyParsed.birthInfo) setBirthInfo(anyParsed.birthInfo);
    if (anyParsed.address) setAddress(anyParsed.address);
    if (anyParsed.parentName) setParentName(anyParsed.parentName);
    if (anyParsed.waliKelas) setWaliKelas(anyParsed.waliKelas);
    if (anyParsed.ekskul) setEkskul(anyParsed.ekskul);
    if (anyParsed.attendance) setAttendance(anyParsed.attendance);
  }, [router]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // Get initials for the circular avatar
  const getInitials = (name: string) => {
    if (!name) return "MG";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !address) {
      alert("Harap lengkapi semua field yang wajib diisi!");
      return;
    }

    const updatedUser = {
      ...user,
      fullName,
      email,
      phone,
      birthInfo,
      address,
      parentName,
      waliKelas,
      ekskul,
      attendance,
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Notify the user of successful save
    alert("Perubahan kontak berhasil disimpan!");
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Column: Avatar & Summary card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center text-3xl font-black text-blue-600 shadow-inner overflow-hidden">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => alert("Fitur unggah foto profil akan segera terintegrasi dengan server cloud.")}
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 shadow hover:bg-blue-700 transition-all border border-white"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          <div>
            <h2 className="font-extrabold text-slate-800 text-base">{fullName}</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Siswa Bimbel</p>
          </div>

          <p className="text-xs text-slate-500 italic px-4 leading-relaxed">
            "{bio}"
          </p>

          <div className="w-full pt-4 border-t border-slate-100 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Username</span>
              <span className="font-bold text-slate-700">@{username}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">ID Siswa</span>
              <span className="font-bold text-slate-700">{user.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Bergabung Pada</span>
              <span className="font-bold text-slate-700">
                {user.joinedAt
                  ? new Date(user.joinedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  : "10 Januari 2026"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Full Student Data Forms */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveProfile} className="bg-white border border-slate-100/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">

            {/* Section 1: Data Lengkap Siswa */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#1b2a4a]">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                  <path d="M6 14h.01M10 14h4" />
                </svg>
                <h2 className="text-base font-extrabold text-[#1b2a4a]">Data Lengkap Siswa</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium h-[42px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Tempat, Tanggal Lahir</label>
                  <input
                    type="text"
                    value={birthInfo}
                    readOnly
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed font-medium h-[42px] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Email Siswa</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium h-[42px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Nomor Telepon / Whatsapp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium h-[42px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Alamat Tinggal</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium h-[42px]"
                />
              </div>
            </div>

            {/* Section 2: Informasi Wali & Kesiswaan */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#1b2a4a]">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h2 className="text-base font-extrabold text-[#1b2a4a]">Informasi Wali & Kesiswaan</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Nama Wali Kelas</label>
                  <input
                    type="text"
                    value={waliKelas}
                    readOnly
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed font-medium h-[42px] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={parentName}
                    readOnly
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed font-medium h-[42px] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Ekstrakurikuler Utama</label>
                  <input
                    type="text"
                    value={ekskul}
                    readOnly
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed font-medium h-[42px] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">Status Kehadiran Semester Ini</label>
                  <div className="w-full bg-[#FFFDF5] border border-[#FCE96F] rounded-xl px-4 py-2.5 text-xs text-[#C27803] font-bold h-[42px] flex items-center shadow-sm">
                    {attendance}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#0b1936] hover:bg-[#15274d] text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all duration-200 uppercase tracking-wider text-center cursor-pointer"
              >
                Simpan Perubahan Kontak
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
