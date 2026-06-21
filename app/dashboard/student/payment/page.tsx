"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentPayment from "../../../components/StudentPayment";
import { User } from "../../../lib/dummy-data";

export default function StudentPaymentPage() {
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

  return <StudentPayment user={user} />;
}
