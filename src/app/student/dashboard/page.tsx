import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student Dashboard | Cybe Digital School",
};

/**
 * Placeholder for the student-facing view. Student login flow +
 * dashboard content will land when the teacher/student persona
 * refactor ships. Today the student persona has no separate credentials.
 */
export default function StudentDashboardPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-primary)]">
        Coming soon
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--ds-text-primary)]">
        Student portal
      </h1>
      <p className="mt-3 text-sm text-[var(--ds-text-secondary)]">
        Students will see their own timetable, attendance, grades, and
        teacher messages here once the persona + role system ships.
        For now, ask a parent or teacher for account access.
      </p>
      <Link
        href="/login"
        className="mt-6 rounded-xl bg-[var(--ds-primary)] px-4 py-2 text-sm font-semibold text-white"
      >
        Go to login
      </Link>
    </div>
  );
}
