"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { allUsers } from "../lib/dummy-data";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Cari user berdasarkan email, password, dan role
    const user = allUsers.find(
      (u) => u.email === email && u.password === password && u.role === role,
    );

    if (!user) {
      setError("Email, password, atau role salah. Coba lagi!");
      return;
    }

    // Simpan user ke localStorage supaya bisa dipakai di dashboard
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Redirect berdasarkan role
    if (user.role === "student") {
      router.push("/dashboard/student");
    } else {
      router.push("/dashboard/teacher");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Left side — image */}
        <div className="login-card-image">
          <img src="/library-students.png" alt="Students studying in library" />
        </div>

        {/* Right side — form */}
        <div className="login-card-form">
          <h1 className="login-heading">
            Welcome,
            <br />
            Login to your account
          </h1>

          {/* Error message */}
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email field */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email
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
                  placeholder=""
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
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Forgot password */}
            <div className="forgot-password-row">
              <Link href="/forgot-password" className="forgot-password-link">
                forgot the password
              </Link>
            </div>

            {/* Role selection — Teacher & Student only */}
            <div className="role-selection">
              <button
                type="button"
                id="role-teacher"
                className={`role-btn ${role === "teacher" ? "active" : ""}`}
                onClick={() => setRole("teacher")}
              >
                Teacher
              </button>
              <button
                type="button"
                id="role-student"
                className={`role-btn ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
              >
                Student
              </button>
            </div>

            {/* Login button */}
            <button type="submit" id="btn-login" className="btn-login-main">
              Login
            </button>
          </form>

          {/* Don't have account link */}
          <p className="register-login-link">
            Don&apos;t have account?{" "}
            <Link href="/register" className="register-link-accent">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
