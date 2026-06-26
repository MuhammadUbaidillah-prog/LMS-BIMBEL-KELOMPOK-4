"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Adjusted path to look up two directories back to 'lib' from 'app/login/admin'
import { allUsers } from "../../lib/dummy-data";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Find user strictly matching email, password, and the 'admin' role
    const user = allUsers.find(
      (u) => u.email === email && u.password === password && u.role === "admin",
    );

    // If no matching user is found, or they don't have the admin role
    if (!user) {
      setError("Email atau password salah, atau Anda bukan Admin!");
      return;
    }

    // Save user to localStorage for session persistence across dashboards
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Exclusive redirect to the admin dashboard
    router.push("/dashboard/admin");
  };

  return (
    <div className="login-page-admin ">
      <div className="login-card">
        {/* Left side — image */}
        <div className="login-card-image">
          <img src="/library-students.png" alt="Students studying in library" />
        </div>

        {/* Right side — form */}
        <div className="login-card-form">
          <h1 className="login-heading">
            Admin Console,
            <br />
            Login to control panel
          </h1>

          {/* Error message */}
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email field */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Admin Email
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login button */}
            <button type="submit" id="btn-login" className="btn-login-main">
              Login as Admin
            </button>
          </form>

          {/* Return link to standard login page */}
          <p className="register-login-link">
            Not an admin?{" "}
            <Link href="/login" className="register-link-accent">
              Back to User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
