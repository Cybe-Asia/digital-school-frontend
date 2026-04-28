import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { ParentBookTestClient } from "@/features/admissions-auth/presentation/components/parent-book-test";
import { buildSetupStepIndicator } from "@/features/admissions-auth/presentation/lib/setup-account-steps";
import { getServerI18n } from "@/i18n/server";

// Note: this page is also entered from the parent dashboard with a
// `studentId`/`schoolId` query (no admissionId). In that mode we
// don't have a Lead context to guard on. The guard only triggers
// when admissionId is present — see below.
import { requireSetupStep } from "@/features/admissions-auth/presentation/lib/wizard-guard";

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
  const admissionId = single(sp.admissionId);
  const { t } = await getServerI18n();

  // Wizard-guard mode: admissionId in the URL means the parent came
  // straight from /payment after fee-paid. They must be at
  // application_fee_paid (or further) to book.
  //
  // Dashboard mode: studentId-only URLs come from the parent
  // dashboard's "Book test" CTA after they've already authenticated.
  // Skip the cookie-based guard there — the dashboard already
  // gated entry.
  if (admissionId) {
    await requireSetupStep(admissionId, [
      "application_fee_paid",
      "test_booked",
      "test_completed",
    ]);
  }

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
