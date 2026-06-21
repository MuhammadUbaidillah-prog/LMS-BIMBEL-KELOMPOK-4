"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import LightbulbIcon from "../../components/LightbulbIcon";
import { User } from "../../lib/dummy-data";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  }, [router]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  const isPaymentPage = pathname === "/dashboard/student/payment";

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard/student",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      active: pathname === "/dashboard/student",
    },
    {
      id: "class",
      label: "Class",
      href: "/dashboard/student/class",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      active: pathname === "/dashboard/student/class",
    },
    {
      id: "course",
      label: "Course",
      href: "/dashboard/student/course",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
      active: pathname === "/dashboard/student/course",
    },
    {
      id: "assignment",
      label: "Assignment",
      href: "/dashboard/student/assignment",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 13H8" /><path d="M16 17H8" /><path d="M16 13h-2" />
        </svg>
      ),
      active: pathname === "/dashboard/student/assignment",
    },
    {
      id: "grades",
      label: "Grades",
      href: "/dashboard/student/grades",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      active: pathname === "/dashboard/student/grades",
    },
    {
      id: "payment",
      label: "Payment",
      href: "/dashboard/student/payment",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
      active: pathname === "/dashboard/student/payment",
    },
    {
      id: "profile",
      label: "Profile",
      href: "/dashboard/student/profile",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      ),
      active: pathname === "/dashboard/student/profile",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-mobile-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <LightbulbIcon />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-lumina">LUMINA</span>
            <span className="sidebar-logo-lms">LMS</span>
          </div>
          <p className="sidebar-tagline">
            Light Up Your Potential in Every Lesson
          </p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              id={`nav-${item.id}`}
              className={`sidebar-nav-item ${item.active ? "active" : ""}`}
              onClick={() => {
                setSidebarOpen(false);
              }}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-logout">
          <button
            id="nav-logout"
            className="sidebar-nav-item logout-item"
            onClick={handleLogout}
          >
            <span className="sidebar-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </span>
            <span className="sidebar-nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="dashboard-main bg-slate-50/50">
        {/* Top Bar */}
        <header className="dashboard-topbar flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white">
          <button
            className="mobile-menu-btn md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>

          {/* Welcome greeting on the left of topbar */}
          {pathname === "/dashboard/student" ? (
            <div className="flex-1 text-left pl-4 md:pl-0">
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                Halo, {user.fullName}! 👋
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium hidden sm:block">
                Welcome to Lumina
              </p>
            </div>
          ) : pathname === "/dashboard/student/payment" ? (
            <div className="flex-1 text-left pl-4 md:pl-0">
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                Halo, {user.fullName}! 👋
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium hidden sm:block">
                Tetap semangat belajar dan selesaikan pembayaran tepat waktu ya.
              </p>
            </div>
          ) : pathname === "/dashboard/student/assignment" ? (
            <div className="flex-1 text-left pl-4 md:pl-0">
              <h1 className="text-xl font-bold text-slate-800 leading-tight flex items-center gap-2">
                Assignment <span className="text-lg">📝</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block font-medium">
                Pantau dan selesaikan tugas belajarmu sebelum batas waktu berakhir.
              </p>
            </div>
          ) : pathname === "/dashboard/student/course" ? (
            <div className="flex-1 text-left pl-4 md:pl-0">
              <h1 className="text-xl font-bold text-slate-800 leading-tight">
                Course 📚
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block font-medium">
                Akses seluruh materi, video, kuis, dan progres belajarmu di sini.
              </p>
            </div>
          ) : pathname === "/dashboard/student/grades" ? (
            <div className="flex-1 text-left pl-4 md:pl-0">
              <h1 className="text-xl font-bold text-slate-800 leading-tight">
                Grades 📊
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block font-medium">
                Lihat transkrip nilai, feedback, dan rapor hasil belajar Anda.
              </p>
            </div>
          ) : pathname === "/dashboard/student/profile" ? (
            <div className="flex-1 text-left pl-4 md:pl-0">
              <h1 className="text-lg md:text-xl font-extrabold text-slate-800 leading-tight">
                Student Profile - LuminaLMS
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block font-semibold">
                Manajemen data induk kesiswaan dan informasi detail akun belajar Anda.
              </p>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* User profile section matching screenshot */}
          <div className="topbar-user flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer mr-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-white">
                2
              </span>
            </button>

            {/* Profile Dropdown Group */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100 cursor-pointer group">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>

              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Siswa
                </span>
              </div>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
