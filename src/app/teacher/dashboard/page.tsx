import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teacher Dashboard | TWSI",
};

/**
 * Placeholder for the teacher-facing view. Today homeroom teachers are
 * stored as free-text fields on Section (admin-side); proper
 * (:Teacher) nodes + teacher-scoped login land in a later sprint.
 */
export default function TeacherDashboardPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-primary)]">
        Coming soon
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--ds-text-primary)]">
        Teacher portal
      </h1>
      <p className="mt-3 text-sm text-[var(--ds-text-secondary)]">
        Teachers will see their assigned sections, record attendance,
        enter grades, and message parents here. Requires the Teacher
        persona + login — coming in the next sprint.
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
