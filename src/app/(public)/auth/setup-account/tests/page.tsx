import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { ParentBookTestClient } from "@/features/admissions-auth/presentation/components/parent-book-test";
import { buildSetupStepIndicator } from "@/features/admissions-auth/presentation/lib/setup-account-steps";
import { getServerI18n } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Book test",
  description: "Pick a test slot for your child.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Parent-facing test booking page. Entered from the dashboard's "Book
 * test now" CTA on a student card whose applicantStatus == "test_pending".
 *
 * Fetches available schedules client-side (so the capacity chip stays
 * live), lets the parent pick one, and POSTs to /api/tests/sessions.
 */
export default async function ParentBookTestPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const studentId = single(sp.studentId);
  const schoolId = single(sp.schoolId);
  const { t } = await getServerI18n();

  return (
    <AuthShell
      eyebrow="auth.booktest.eyebrow"
      title="auth.booktest.title"
      description="auth.booktest.description"
      stepIndicator={buildSetupStepIndicator(t, "tests")}
    >
      <ParentBookTestClient studentId={studentId} schoolId={schoolId} />
    </AuthShell>
  );
}

function single(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}
