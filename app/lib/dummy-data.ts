// ==========================================
// DUMMY DATA — LMS Bimbel (Lumina LMS)
// ==========================================

// ---------- TYPES ----------

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "admin" | "superadmin";
  fullName: string;
  avatar: string;
  phone: string;
  joinedAt: string;
  access?: string[]; // For admin users, list of access permissions
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Course {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  teacherId: string;
  thumbnail: string;
  totalModules: number;
  completedModules: number;
  progress: number; // 0-100
  status: "ongoing" | "completed" | "not_started";
  enrolledStudents: string[];
  createdAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  type: "video" | "reading" | "quiz";
  duration: string;
  isCompleted: boolean;
  order: number;
}

export interface Schedule {
  id: string;
  courseId: string;
  teacherId: string;
  day: string;
  time: string;
  room: string;
  type: "online" | "offline";
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded" | "late";
  score?: number;
  maxScore: number;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  score: number;
  maxScore: number;
  gradedAt: string;
  feedback: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "assignment";
  isRead: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  priority: "low" | "medium" | "high";
}

// ---------- USERS ----------

export const students: User[] = [
  {
    id: "s1",
    username: "budi_santoso",
    email: "budi@student.lumina.id",
    password: "password123",
    role: "student",
    fullName: "Budi Santoso",
    avatar: "/avatars/student1.png",
    phone: "081234567890",
    joinedAt: "2025-08-15",
  },
  {
    id: "s2",
    username: "siti_rahayu",
    email: "siti@student.lumina.id",
    password: "password123",
    role: "student",
    fullName: "Siti Rahayu",
    avatar: "/avatars/student2.png",
    phone: "081234567891",
    joinedAt: "2025-09-01",
  },
  {
    id: "s3",
    username: "andi_pratama",
    email: "andi@student.lumina.id",
    password: "password123",
    role: "student",
    fullName: "Andi Pratama",
    avatar: "/avatars/student3.png",
    phone: "081234567892",
    joinedAt: "2025-09-10",
  },
];

export const teachers: User[] = [
  {
    id: "t1",
    username: "pak_ahmad",
    email: "ahmad@teacher.lumina.id",
    password: "password123",
    role: "teacher",
    fullName: "Ahmad Fauzi, S.Pd",
    avatar: "/avatars/teacher1.png",
    phone: "082345678901",
    joinedAt: "2025-01-10",
  },
  {
    id: "t2",
    username: "bu_dewi",
    email: "dewi@teacher.lumina.id",
    password: "password123",
    role: "teacher",
    fullName: "Dewi Lestari, M.Pd",
    avatar: "/avatars/teacher2.png",
    phone: "082345678902",
    joinedAt: "2025-02-15",
  },
  {
    id: "t3",
    username: "pak_rudi",
    email: "rudi@teacher.lumina.id",
    password: "password123",
    role: "teacher",
    fullName: "Rudi Hermawan, S.Si",
    avatar: "/avatars/teacher3.png",
    phone: "082345678903",
    joinedAt: "2025-03-01",
  },
  {
    id: "t4",
    username: "bu_nina",
    email: "nina@teacher.lumina.id",
    password: "password123",
    role: "teacher",
    fullName: "Nina Kartika, S.Pd",
    avatar: "/avatars/teacher4.png",
    phone: "082345678904",
    joinedAt: "2025-03-20",
  },
];

export const admins: User[] = [
  {
    id: "a1",
    username: "admin_lumina",
    email: "admin@lumina.id",
    password: "admin123",
    role: "admin",
    fullName: "Admin Lumina",
    avatar: "/avatars/admin.png",
    phone: "085555555555",
    joinedAt: "2025-01-01",
    access: ["manage_users",
      "manage_courses",
      "view_reports"]
  }
];

export const superadmin: User[] = [
  {
    id: "sa1",
    username: "super_admin_lumina",
    email: "superadmin@lumina.id",
    password: "superadmin123",
    role: "superadmin",
    fullName: "Super Admin Lumina",
    avatar: "/avatars/admin.png",
    phone: "085555555555",
    joinedAt: "2025-01-01",
    access: [
      "manage_users",
      "manage_courses",
      "view_reports",
    ],
  },
];

export const allUsers: User[] = [
  ...students,
  ...teachers,
  ...admins,
  ...superadmin,
];

// ---------- SUBJECTS ----------

export const subjects: Subject[] = [
  { id: "sub1", name: "Matematika", icon: "📐", color: "#6C5CE7", description: "Aljabar, Geometri, Kalkulus" },
  { id: "sub2", name: "Fisika", icon: "⚡", color: "#0984E3", description: "Mekanika, Termodinamika, Optik" },
  { id: "sub3", name: "Kimia", icon: "🧪", color: "#00B894", description: "Kimia Organik & Anorganik" },
  { id: "sub4", name: "Biologi", icon: "🧬", color: "#E17055", description: "Sel, Genetika, Ekologi" },
  { id: "sub5", name: "B. Inggris", icon: "🌍", color: "#FDCB6E", description: "Grammar, Reading, Writing" },
  { id: "sub6", name: "B. Indonesia", icon: "📝", color: "#E84393", description: "Sastra, Tata Bahasa, Menulis" },
  { id: "sub7", name: "Ekonomi", icon: "📊", color: "#00BEC4", description: "Akuntansi, Mikro, Makro" },
];

// ---------- COURSES ----------

export const courses: Course[] = [
  {
    id: "c1",
    subjectId: "sub1",
    title: "Matematika Kelas 10 - Semester 1",
    description: "Materi lengkap matematika SMA kelas 10 semester 1 meliputi aljabar, fungsi, dan trigonometri dasar.",
    teacherId: "t1",
    thumbnail: "/thumbnails/math.png",
    totalModules: 12,
    completedModules: 8,
    progress: 67,
    status: "ongoing",
    enrolledStudents: ["s1", "s2", "s3"],
    createdAt: "2025-08-20",
  },
  {
    id: "c2",
    subjectId: "sub2",
    title: "Fisika Kelas 10 - Mekanika",
    description: "Konsep dasar mekanika: gerak lurus, hukum Newton, usaha dan energi.",
    teacherId: "t3",
    thumbnail: "/thumbnails/physics.png",
    totalModules: 10,
    completedModules: 5,
    progress: 50,
    status: "ongoing",
    enrolledStudents: ["s1", "s2"],
    createdAt: "2025-08-22",
  },
  {
    id: "c3",
    subjectId: "sub3",
    title: "Kimia Dasar - Struktur Atom",
    description: "Pengenalan kimia dasar, struktur atom, tabel periodik, dan ikatan kimia.",
    teacherId: "t2",
    thumbnail: "/thumbnails/chemistry.png",
    totalModules: 8,
    completedModules: 8,
    progress: 100,
    status: "completed",
    enrolledStudents: ["s1", "s3"],
    createdAt: "2025-09-01",
  },
  {
    id: "c4",
    subjectId: "sub4",
    title: "Biologi - Sel dan Jaringan",
    description: "Struktur sel, organel, pembelahan sel, dan jaringan tumbuhan & hewan.",
    teacherId: "t2",
    thumbnail: "/thumbnails/biology.png",
    totalModules: 9,
    completedModules: 3,
    progress: 33,
    status: "ongoing",
    enrolledStudents: ["s1", "s2", "s3"],
    createdAt: "2025-09-05",
  },
  {
    id: "c5",
    subjectId: "sub5",
    title: "English Grammar Essentials",
    description: "Tenses, modals, conditionals, and passive voice for intermediate learners.",
    teacherId: "t4",
    thumbnail: "/thumbnails/english.png",
    totalModules: 10,
    completedModules: 0,
    progress: 0,
    status: "not_started",
    enrolledStudents: ["s1"],
    createdAt: "2025-09-15",
  },
  {
    id: "c6",
    subjectId: "sub6",
    title: "Bahasa Indonesia - Teks Prosedur & Eksposisi",
    description: "Menulis dan menganalisis teks prosedur, eksposisi, dan teks argumentasi.",
    teacherId: "t4",
    thumbnail: "/thumbnails/indonesian.png",
    totalModules: 7,
    completedModules: 5,
    progress: 71,
    status: "ongoing",
    enrolledStudents: ["s1", "s2"],
    createdAt: "2025-09-10",
  },
  {
    id: "c7",
    subjectId: "sub7",
    title: "Ekonomi Kelas 10 - Semester 1",
    description: "Belajar dasar-dasar akuntansi dan ekonomi keuangan.",
    teacherId: "t4",
    thumbnail: "/thumbnails/economics.png",
    totalModules: 8,
    completedModules: 4,
    progress: 50,
    status: "ongoing",
    enrolledStudents: ["s1", "s2"],
    createdAt: "2025-09-12",
  },
];

// ---------- MODULES ----------

export const modules: Module[] = [
  // Matematika modules
  { id: "m1", courseId: "c1", title: "Pengenalan Aljabar", type: "video", duration: "45 min", isCompleted: true, order: 1 },
  { id: "m2", courseId: "c1", title: "Persamaan Linear", type: "reading", duration: "30 min", isCompleted: true, order: 2 },
  { id: "m3", courseId: "c1", title: "Quiz: Aljabar Dasar", type: "quiz", duration: "20 min", isCompleted: true, order: 3 },
  { id: "m4", courseId: "c1", title: "Fungsi dan Grafik", type: "video", duration: "50 min", isCompleted: true, order: 4 },
  { id: "m5", courseId: "c1", title: "Fungsi Komposisi", type: "reading", duration: "35 min", isCompleted: true, order: 5 },
  { id: "m6", courseId: "c1", title: "Quiz: Fungsi", type: "quiz", duration: "25 min", isCompleted: true, order: 6 },
  { id: "m7", courseId: "c1", title: "Trigonometri Dasar", type: "video", duration: "55 min", isCompleted: true, order: 7 },
  { id: "m8", courseId: "c1", title: "Identitas Trigonometri", type: "reading", duration: "40 min", isCompleted: true, order: 8 },
  { id: "m9", courseId: "c1", title: "Persamaan Trigonometri", type: "video", duration: "45 min", isCompleted: false, order: 9 },
  { id: "m10", courseId: "c1", title: "Quiz: Trigonometri", type: "quiz", duration: "30 min", isCompleted: false, order: 10 },
  { id: "m11", courseId: "c1", title: "Logaritma", type: "video", duration: "50 min", isCompleted: false, order: 11 },
  { id: "m12", courseId: "c1", title: "Ujian Akhir Semester 1", type: "quiz", duration: "60 min", isCompleted: false, order: 12 },

  // Fisika modules
  { id: "m13", courseId: "c2", title: "Besaran dan Satuan", type: "video", duration: "40 min", isCompleted: true, order: 1 },
  { id: "m14", courseId: "c2", title: "Gerak Lurus Beraturan", type: "video", duration: "50 min", isCompleted: true, order: 2 },
  { id: "m15", courseId: "c2", title: "GLBB", type: "reading", duration: "35 min", isCompleted: true, order: 3 },
  { id: "m16", courseId: "c2", title: "Quiz: Kinematika", type: "quiz", duration: "25 min", isCompleted: true, order: 4 },
  { id: "m17", courseId: "c2", title: "Hukum Newton I & II", type: "video", duration: "55 min", isCompleted: true, order: 5 },
  { id: "m18", courseId: "c2", title: "Hukum Newton III", type: "video", duration: "45 min", isCompleted: false, order: 6 },
  { id: "m19", courseId: "c2", title: "Usaha dan Energi", type: "reading", duration: "40 min", isCompleted: false, order: 7 },
  { id: "m20", courseId: "c2", title: "Quiz: Dinamika", type: "quiz", duration: "30 min", isCompleted: false, order: 8 },
  { id: "m21", courseId: "c2", title: "Momentum dan Impuls", type: "video", duration: "50 min", isCompleted: false, order: 9 },
  { id: "m22", courseId: "c2", title: "Ujian Mekanika", type: "quiz", duration: "60 min", isCompleted: false, order: 10 },
];

// ---------- SCHEDULES ----------

export const schedules: Schedule[] = [
  { id: "sch1", courseId: "c1", teacherId: "t1", day: "Senin", time: "08:00 - 09:30", room: "Room A1", type: "offline" },
  { id: "sch2", courseId: "c1", teacherId: "t1", day: "Rabu", time: "08:00 - 09:30", room: "Room A1", type: "offline" },
  { id: "sch3", courseId: "c2", teacherId: "t3", day: "Selasa", time: "10:00 - 11:30", room: "Zoom Meeting", type: "online" },
  { id: "sch4", courseId: "c2", teacherId: "t3", day: "Kamis", time: "10:00 - 11:30", room: "Zoom Meeting", type: "online" },
  { id: "sch5", courseId: "c3", teacherId: "t2", day: "Rabu", time: "13:00 - 14:30", room: "Lab Kimia", type: "offline" },
  { id: "sch6", courseId: "c4", teacherId: "t2", day: "Jumat", time: "08:00 - 09:30", room: "Room B2", type: "offline" },
  { id: "sch7", courseId: "c5", teacherId: "t4", day: "Senin", time: "13:00 - 14:30", room: "Google Meet", type: "online" },
  { id: "sch8", courseId: "c6", teacherId: "t4", day: "Kamis", time: "13:00 - 14:30", room: "Room C1", type: "offline" },
];

// ---------- ASSIGNMENTS ----------

export const assignments: Assignment[] = [
  { id: "a1", courseId: "c3", title: "Chemistry Lab: Kesetimbangan Kimia", description: "Laporan praktikum kesetimbangan kimia", dueDate: "2 Juni 2026", status: "graded", score: 95, maxScore: 100 },
  { id: "a2", courseId: "c1", title: "Tugas 4: Trigonometri & Fungsi SMA", description: "Selesaikan soal trigonometri nomor 1-15", dueDate: "22 Juni 2026, 23:59 WIB", status: "pending", maxScore: 100 },
  { id: "a3", courseId: "c2", title: "Laporan Praktikum GLB", description: "Buat laporan praktikum gerak lurus beraturan", dueDate: "12 Juni 2026", status: "submitted", maxScore: 100 },
  { id: "a4", courseId: "c2", title: "Praktikum Mandiri: Hukum Newton II", description: "Kerjakan soal aplikasi hukum Newton II", dueDate: "Besok, 18 Juni 2026", status: "pending", maxScore: 100 },
  { id: "a5", courseId: "c7", title: "Ekonomi: Akuntansi Jurnal Penyesuaian", description: "Gambarkan pencatatan jurnal penyesuaian", dueDate: "28 Mei 2026", status: "graded", score: 88, maxScore: 100 },
  { id: "a6", courseId: "c3", title: "Latihan Soal: Ikatan Kovalen & Ion", description: "Gambarkan struktur lewis untuk senyawa kovalen", dueDate: "25 Juni 2026, 18:00 WIB", status: "pending", maxScore: 100 },
  { id: "a7", courseId: "c6", title: "Menulis Teks Eksposisi", description: "Tulis teks eksposisi minimal 500 kata", dueDate: "8 Juni 2026", status: "graded", score: 91, maxScore: 100 },
  { id: "a8", courseId: "c5", title: "English Focus: Analytical Essay", description: "Write a short analytical essay about environmental issues", dueDate: "20 Mei 2026", status: "graded", score: 90, maxScore: 100 },
  { id: "a9", courseId: "c1", title: "Latihan Persamaan Linear", description: "Kerjakan 10 soal aljabar linear", dueDate: "15 Mei 2026", status: "graded", score: 85, maxScore: 100 },
  { id: "a10", courseId: "c1", title: "Quiz Aljabar Dasar", description: "Kuis singkat aljabar dasar", dueDate: "18 Mei 2026", status: "graded", score: 80, maxScore: 100 },
  { id: "a11", courseId: "c2", title: "Soal Kinematika Gerak", description: "Kerjakan soal gerak lurus dan GLBB", dueDate: "25 Mei 2026", status: "graded", score: 92, maxScore: 100 },
  { id: "a12", courseId: "c2", title: "Quiz Besaran Fisika", description: "Kuis mengenai besaran dan satuan fisika", dueDate: "28 Mei 2026", status: "graded", score: 87, maxScore: 100 },
  { id: "a13", courseId: "c4", title: "Laporan Sel Bawang", description: "Laporan praktikum pengamatan sel bawang", dueDate: "3 Juni 2026", status: "graded", score: 84, maxScore: 100 },
  { id: "a14", courseId: "c4", title: "Quiz Organel Sel", description: "Kuis fungsi organel sel hewan dan tumbuhan", dueDate: "5 Juni 2026", status: "graded", score: 89, maxScore: 100 },
  { id: "a15", courseId: "c6", title: "Analisis Teks Prosedur", description: "Menganalisis struktur kebahasaan teks prosedur", dueDate: "9 Juni 2026", status: "graded", score: 92, maxScore: 100 },
];

// ---------- GRADES ----------

export const grades: Grade[] = [
  { id: "g1", studentId: "s1", courseId: "c3", assignmentId: "a1", score: 95, maxScore: 100, gradedAt: "2026-06-02", feedback: "Bagus! Analisis kesetimbangan kimia sangat rinci." },
  { id: "g2", studentId: "s1", courseId: "c7", assignmentId: "a5", score: 88, maxScore: 100, gradedAt: "2026-05-28", feedback: "Sangat baik, jurnal penyesuaian seimbang." },
  { id: "g3", studentId: "s1", courseId: "c6", assignmentId: "a7", score: 91, maxScore: 100, gradedAt: "2026-06-08", feedback: "Analisis struktur kebahasaan lengkap." },
  { id: "g4", studentId: "s1", courseId: "c5", assignmentId: "a8", score: 90, maxScore: 100, gradedAt: "2026-05-20", feedback: "Argumen analitis sangat runtut." },
  { id: "g5", studentId: "s1", courseId: "c1", assignmentId: "a9", score: 85, maxScore: 100, gradedAt: "2026-05-15", feedback: "Langkah-langkah pengerjaan jelas." },
  { id: "g6", studentId: "s1", courseId: "c1", assignmentId: "a10", score: 80, maxScore: 100, gradedAt: "2026-05-18", feedback: "Tingkatkan ketelitian hitungan." },
  { id: "g7", studentId: "s1", courseId: "c2", assignmentId: "a11", score: 92, maxScore: 100, gradedAt: "2026-05-25", feedback: "Pemahaman kinematika luar biasa." },
  { id: "g8", studentId: "s1", courseId: "c2", assignmentId: "a12", score: 87, maxScore: 100, gradedAt: "2026-05-28", feedback: "Bagus, pelajari lagi dimensi besaran." },
  { id: "g9", studentId: "s1", courseId: "c4", assignmentId: "a13", score: 84, maxScore: 100, gradedAt: "2026-06-03", feedback: "Gambar sel rapi, keterangan lengkap." },
  { id: "g10", studentId: "s1", courseId: "c4", assignmentId: "a14", score: 89, maxScore: 100, gradedAt: "2026-06-05", feedback: "Pemahaman fungsi organel sangat baik." },
  { id: "g11", studentId: "s1", courseId: "c6", assignmentId: "a15", score: 92, maxScore: 100, gradedAt: "2026-06-09", feedback: "Analisis teks prosedur sangat baik." },
];

// ---------- NOTIFICATIONS ----------

export const notifications: Notification[] = [
  { id: "n1", userId: "s1", title: "Tugas Baru", message: "PR Trigonometri telah ditambahkan. Deadline: 15 Juni 2026", type: "assignment", isRead: false, createdAt: "2026-06-08T10:00:00" },
  { id: "n2", userId: "s1", title: "Nilai Keluar", message: "Nilai Latihan Soal Aljabar sudah tersedia: 85/100", type: "success", isRead: false, createdAt: "2026-06-07T14:30:00" },
  { id: "n3", userId: "s1", title: "Jadwal Berubah", message: "Kelas Fisika hari Kamis dipindah ke jam 13:00", type: "warning", isRead: true, createdAt: "2026-06-06T09:00:00" },
  { id: "n4", userId: "s1", title: "Pengumuman", message: "Libur nasional tanggal 1 Juni, kelas ditiadakan", type: "info", isRead: true, createdAt: "2026-05-28T08:00:00" },
  { id: "n5", userId: "s1", title: "Deadline Mendekat", message: "Tugas Menulis Teks Eksposisi deadline besok!", type: "warning", isRead: false, createdAt: "2026-06-07T18:00:00" },
];

// ---------- ANNOUNCEMENTS ----------

export const announcements: Announcement[] = [
  { id: "ann1", title: "Ujian Akhir Semester", content: "Ujian akhir semester akan dilaksanakan mulai tanggal 20-28 Juni 2026. Pastikan semua tugas sudah dikumpulkan.", authorId: "t1", createdAt: "2026-06-05", priority: "high" },
  { id: "ann2", title: "Workshop Coding", content: "Workshop coding gratis untuk semua siswa pada tanggal 25 Juni 2026 di Lab Komputer.", authorId: "t3", createdAt: "2026-06-03", priority: "medium" },
  { id: "ann3", title: "Perpustakaan Baru", content: "Koleksi buku baru telah tersedia di perpustakaan digital. Silakan akses melalui menu Library.", authorId: "t2", createdAt: "2026-06-01", priority: "low" },
];

// ---------- HELPER FUNCTIONS ----------

/** Get the currently logged-in student (default: Budi) */
export const getCurrentStudent = (): User => students[0];

/** Get courses enrolled by a specific student */
export const getStudentCourses = (studentId: string): Course[] =>
  courses.filter((c) => c.enrolledStudents.includes(studentId));

/** Get modules for a course */
export const getCourseModules = (courseId: string): Module[] =>
  modules.filter((m) => m.courseId === courseId).sort((a, b) => a.order - b.order);

/** Get teacher info by ID */
export const getTeacher = (teacherId: string): User | undefined =>
  teachers.find((t) => t.id === teacherId);

/** Get subject by ID */
export const getSubject = (subjectId: string): Subject | undefined =>
  subjects.find((s) => s.id === subjectId);

/** Get assignments for a student's courses */
export const getStudentAssignments = (studentId: string): Assignment[] => {
  const studentCourseIds = getStudentCourses(studentId).map((c) => c.id);
  return assignments.filter((a) => studentCourseIds.includes(a.courseId));
};

/** Get grades for a student */
export const getStudentGrades = (studentId: string): Grade[] =>
  grades.filter((g) => g.studentId === studentId);

/** Get notifications for a user */
export const getUserNotifications = (userId: string): Notification[] =>
  notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

/** Get unread notification count */
export const getUnreadCount = (userId: string): number =>
  notifications.filter((n) => n.userId === userId && !n.isRead).length;

/** Get schedules for a student's courses */
export const getStudentSchedules = (studentId: string): (Schedule & { courseName: string; teacherName: string })[] => {
  const studentCourseIds = getStudentCourses(studentId).map((c) => c.id);
  return schedules
    .filter((s) => studentCourseIds.includes(s.courseId))
    .map((s) => {
      const course = courses.find((c) => c.id === s.courseId);
      const teacher = getTeacher(s.teacherId);
      return {
        ...s,
        courseName: course?.title ?? "",
        teacherName: teacher?.fullName ?? "",
      };
    });
};

/** Calculate student overall stats */
export const getStudentStats = (studentId: string) => {
  const studentCourses = getStudentCourses(studentId);
  const studentGrades = getStudentGrades(studentId);
  const studentAssignments = getStudentAssignments(studentId);

  const totalCourses = studentCourses.length;
  const completedCourses = studentCourses.filter((c) => c.status === "completed").length;
  const avgProgress = totalCourses > 0
    ? Math.round(studentCourses.reduce((sum, c) => sum + c.progress, 0) / totalCourses)
    : 0;
  const avgGrade = studentGrades.length > 0
    ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
    : 0;
  const pendingAssignments = studentAssignments.filter((a) => a.status === "pending").length;

  return {
    totalCourses,
    completedCourses,
    ongoingCourses: studentCourses.filter((c) => c.status === "ongoing").length,
    avgProgress,
    avgGrade,
    pendingAssignments,
    totalAssignments: studentAssignments.length,
  };
};
