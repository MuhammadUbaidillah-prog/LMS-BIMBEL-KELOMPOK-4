"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  getStudentCourses,
  getStudentStats,
  getStudentGrades,
  getSubject,
  courses,
} from "../../lib/dummy-data";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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

  const stats = getStudentStats(user.id);
  const studentCourses = getStudentCourses(user.id);
  const studentGrades = getStudentGrades(user.id);

  // Highest score
  const highestGrade =
    studentGrades.length > 0
      ? studentGrades.reduce((best, g) => (g.score > best.score ? g : best))
      : null;

  const highestCourse = highestGrade
    ? courses.find((c) => c.id === highestGrade.courseId)
    : null;
  const highestSubject = highestCourse
    ? getSubject(highestCourse.subjectId)
    : null;

  const avgScore =
    studentGrades.length > 0
      ? (
        studentGrades.reduce((sum, g) => sum + g.score, 0) /
        studentGrades.length
      ).toFixed(1)
      : "0";

  return (
    <div className="student-dashboard">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-card-header">
            <span className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </span>
            <span className="stat-label">Total Courses</span>
          </div>
          <span className="stat-value">{stats.totalCourses}</span>
        </div>

        <div className="stat-card stat-pink">
          <div className="stat-card-header">
            <span className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
            </span>
            <span className="stat-label">Pending Assignment</span>
          </div>
          <span className="stat-value">{stats.pendingAssignments}</span>
        </div>

        <div className="stat-card stat-yellow">
          <div className="stat-card-header">
            <span className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </span>
            <span className="stat-label">the average score</span>
          </div>
          <span className="stat-value">{avgScore}</span>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-card-header">
            <span className="stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </span>
            <span className="stat-label">the highest score</span>
          </div>
          <span className="stat-value">
            {highestGrade ? highestGrade.score : "—"}
            {highestSubject && (
              <span className="stat-subject">{highestSubject.name}</span>
            )}
          </span>
        </div>
      </div>

      {/* My Course */}
      <div className="section-block">
        <h2 className="section-title">My Course</h2>
        <div className="course-cards-grid">
          {studentCourses.map((course) => {
            const subject = getSubject(course.subjectId);
            return (
              <div key={course.id} className="course-card">
                <div className="course-card-image">
                  <div
                    className="course-card-placeholder"
                    style={{
                      background: subject
                        ? `linear-gradient(135deg, ${subject.color}22, ${subject.color}44)`
                        : undefined,
                    }}
                  >
                    <span style={{ fontSize: "2rem" }}>
                      {subject?.icon ?? "📚"}
                    </span>
                    <span>{subject?.name ?? "Course"}</span>
                  </div>
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-name">{course.title}</h3>
                  <p className="course-card-progress-label">
                    Progress: {course.progress}%
                  </p>
                  <div className="course-card-bar-bg">
                    <div
                      className="course-card-bar-fill"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/student/course?id=${course.id}`)}
                    className="btn-masuk-kelas"
                  >
                    Masuk Kelas
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
