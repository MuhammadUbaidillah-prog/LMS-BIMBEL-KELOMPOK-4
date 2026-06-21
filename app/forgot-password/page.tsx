"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement forgot password logic
    console.log("Forgot password for:", email);
    setSubmitted(true);
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        {/* Lock icon */}
        <div className="forgot-icon-wrapper">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
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
        </div>

        <h1 className="forgot-heading">Forgot Password?</h1>
        <p className="forgot-description">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="forgot-form">
            {/* Email field */}
            <div className="input-group">
              <label htmlFor="forgot-email" className="input-label">
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
                  id="forgot-email"
                  type="email"
                  className="login-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" id="btn-forgot" className="btn-login-main">
              Send
            </button>
          </form>
        ) : (
          <div className="forgot-success">
            <div className="forgot-success-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="forgot-success-text">
              A reset link has been sent to <strong>{email}</strong>. Please check your inbox.
            </p>
          </div>
        )}

        {/* Back to login link */}
        <p className="register-login-link">
          Remember your password?{" "}
          <Link href="/login" className="register-link-accent">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
