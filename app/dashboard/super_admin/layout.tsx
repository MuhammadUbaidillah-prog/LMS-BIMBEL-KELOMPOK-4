"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import LightbulbIcon from "../../components/LightbulbIcon";
import { User } from "../../lib/dummy-data";

export default function AdminLayout({
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
      router.push("/login/admin");
      return;
    }
    const parsed: User = JSON.parse(stored);
    if (parsed.role !== "admin") {
      router.push("/login/admin");
      return;
    }
    setUser(parsed);
  }, [router]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading Admin Space...</p>
      </div>
    );
  }

  const navItems = [
    {
      id: "dashboard",
      label: "Admin Panel",
      href: "/dashboard/admin",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      active: pathname === "/dashboard/admin",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login/admin");
  };

  return (
    <div className="dashboard-layout">
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
            <span className="sidebar-logo-lms">ERP</span>
          </div>
          <p className="sidebar-tagline">
            Central Administration Control Panel
          </p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              id={`nav-admin-${item.id}`}
              className={`sidebar-nav-item ${item.active ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-logout">
          <button
            id="nav-admin-logout"
            className="sidebar-nav-item logout-item"
            onClick={handleLogout}
          >
            <span className="sidebar-nav-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </span>
            <span className="sidebar-nav-label">Logout Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="dashboard-main bg-slate-50/50">
        <header className="dashboard-topbar flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white">
          <button
            className="mobile-menu-btn md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>

          <div className="flex-1 text-left pl-4 md:pl-0">
            <h1 className="text-base font-bold text-slate-800 leading-tight">
              System Admin Console
            </h1>
            <p className="text-[11px] text-red-500 mt-0.5 font-bold uppercase tracking-wider">
              Root Access Active
            </p>
          </div>

          <div className="topbar-user flex items-center gap-3">
            <div className="flex items-center gap-3 pl-4 cursor-pointer group">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-red-200 bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-red-600"
                >
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-semibold text-slate-800">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Global Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
