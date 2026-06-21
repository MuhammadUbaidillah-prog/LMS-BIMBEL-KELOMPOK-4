"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // TODO: implement register logic
    console.log("Register attempt:", { username, email, password, role });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Left side — image */}
        <div className="login-card-image">
          <img
            src="/library-students.png"
            alt="Students studying in library"
          />
        </div>

        {/* Right side — form */}
        <div className="login-card-form">
          <h1 className="login-heading">Register</h1>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Username field */}
            <div className="input-group">
              <label htmlFor="reg-username" className="input-label">
                Username
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="reg-username"
                  type="text"
                  className="login-input"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email field */}
            <div className="input-group">
              <label htmlFor="reg-email" className="input-label">
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
                  id="reg-email"
                  type="email"
                  className="login-input"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="input-group">
              <label htmlFor="reg-password" className="input-label">
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
                    <rect
                      width="18"
                      height="11"
                      x="3"
                      y="11"
                      rx="2"
                      ry="2"
                    />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="reg-password"
                  type="password"
                  className="login-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="input-group">
              <label htmlFor="reg-confirm-password" className="input-label">
                Confirm Password
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
                    <rect
                      width="18"
                      height="11"
                      x="3"
                      y="11"
                      rx="2"
                      ry="2"
                    />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="reg-confirm-password"
                  type="password"
                  className="login-input"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role selection — Teacher & Student */}
            <div className="role-selection">
              <button
                type="button"
                id="reg-role-teacher"
                className={`role-btn ${role === "teacher" ? "active" : ""}`}
                onClick={() => setRole("teacher")}
              >
                Teacher
              </button>
              <button
                type="button"
                id="reg-role-student"
                className={`role-btn ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
              >
                Student
              </button>
            </div>

            {/* Register button */}
            <button
              type="submit"
              id="btn-register"
              className="btn-login-main"
            >
              Register
            </button>
          </form>

          {/* Already have account link */}
          <p className="register-login-link">
            Already have account?{" "}
            <Link href="/login" className="register-link-accent">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
