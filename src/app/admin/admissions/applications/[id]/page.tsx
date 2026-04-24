import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge, StudentStatusStepper } from "@/features/admissions-common/status-badge";
import { ApplicationStatusForm } from "./application-status-form";
import { StudentStatusForm } from "./student-status-form";
import { AdminOpenDocumentRequestButton } from "./admin-open-document-request";
import { AdminIssueOfferButton } from "./admin-issue-offer";

export const metadata: Metadata = {
  title: "Application detail | Admin",
};

const SESSION_COOKIE_NAME = "ds-session";

type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type AdminApplication = {
  lead: {
    admissionId: string;
    parentName: string;
    email: string;
    whatsappNumber: string;
    schoolSelection: string;
    location?: string | null;
    occupation?: string | null;
    hearAboutSchool?: string | null;
    referralCode?: string | null;
    existingStudents?: number | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  students: Array<{
    studentId: string;
    fullName: string;
    dateOfBirth: string;
    currentSchool: string;
    targetGradeLevel: string;
    notes?: string;
    applicantStatus?: string;
    applicationMode?: string;
    ageAtApplication?: number | null;
    // Online-assessment results from Moodle, synced by admission-
    // service's /online-test/sync endpoint. All five are nullable
    // until the student has actually started/finished the quiz —
    // the UI treats "no data" and "not_started" identically.
    onlineTestState?: string | null;
    onlineTestScore?: number | null;
    onlineTestMaxScore?: number | null;
    onlineTestPercentage?: number | null;
    onlineTestCompletedAt?: string | null;
  }>;
  latestPayment?: {
    paymentId: string;
    status: string;
    amount: number;
    currency: string;
    paymentMethod?: string | null;
    hostedInvoiceUrl?: string | null;
    paidAt?: string | null;
  } | null;
  application?: {
    applicationId: string;
    applicationCode: string;
    status: string;
    applicationChannel: string;
    submittedAt: string;
    updatedAt: string;
  } | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[var(--ds-text-primary)]">
        Please log in first.
      </div>
    );
  }

  const { admission } = getServerServiceEndpoints();
  let payload: ApiEnvelope<AdminApplication> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(
      `${admission}/admin/applications/${encodeURIComponent(id)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<AdminApplication> | null;
  } catch {
    // fall through to 502 render below
  }

  if (httpStatus === 403) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[var(--ds-text-primary)]">
        Admin access required.
      </div>
    );
  }
  if (httpStatus === 404) {
    notFound();
  }

  const app = payload?.data;
  if (!app) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[#8b1f1f]">
        Could not load this application (status {httpStatus || "unknown"}).
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <nav className="text-sm">
        <Link
          href="/admin/admissions/applications"
          className="inline-flex items-center gap-1.5 text-[var(--ds-primary)] hover:underline"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to applications
        </Link>
      </nav>

      <header className="hero-panel relative overflow-hidden rounded-[28px] p-6 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--ds-radial-a)] blur-3xl" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--ds-primary)] to-[var(--ds-cta-fill-2)] text-xl font-bold text-[var(--ds-on-primary)] shadow-[0_12px_28px_-14px_rgba(11,110,79,0.6)]" aria-hidden="true">
            {(app.lead.parentName ?? "?").split(" ").slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("")}
          </span>
          <div className="min-w-0">
            <span className="eyebrow-chip">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ds-primary)]" aria-hidden="true" />
              Parent application
            </span>
            <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">
              {app.lead.parentName}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--ds-text-secondary)]">
              <span className="font-semibold text-[var(--ds-text-primary)]">{app.lead.email}</span> · {app.lead.whatsappNumber}
            </p>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
          <KV label="School" value={app.lead.schoolSelection} />
          <KV
            label="Email verified"
            value={app.lead.isVerified ? "yes" : "no"}
          />
          <KV label="Submitted" value={formatDate(app.lead.createdAt)} />
          <KV label="Referral" value={app.lead.referralCode ?? "—"} />
          <KV label="Location" value={app.lead.location ?? "—"} />
          <KV label="Occupation" value={app.lead.occupation ?? "—"} />
          <KV label="Heard about us" value={app.lead.hearAboutSchool ?? "—"} />
          <KV
            label="Existing students"
            value={app.lead.existingStudents != null ? String(app.lead.existingStudents) : "—"}
          />
        </div>
      </header>

      {app.application ? (
        <section className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--ds-text-primary)]">
                Application lifecycle
              </h2>
              <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                {app.application.applicationCode} &middot; {app.application.applicationChannel}
              </p>
            </div>
            <StatusBadge status={app.application.status} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <KV label="Submitted" value={formatDate(app.application.submittedAt)} />
            <KV label="Last touched" value={formatDate(app.application.updatedAt)} />
            <KV label="Application id" value={app.application.applicationId} />
          </div>
          <div className="mt-5 border-t border-[var(--ds-border)] pt-5">
            <ApplicationStatusForm
              leadId={app.lead.admissionId}
              currentStatus={app.application.status}
            />
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--ds-text-primary)]">
            No application yet
          </h2>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
            The parent hasn&apos;t submitted the students form yet, so no Application
            lifecycle has started. The EOI Lead still exists and they can resume
            from their email link.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
        <h2 className="text-lg font-semibold text-[var(--ds-text-primary)]">
          Students ({app.students.length})
        </h2>
        {app.students.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ds-text-secondary)]">
            No student details submitted yet.
          </p>
        ) : (
          <div className="mt-3 space-y-5">
            {app.students.map((s, idx) => {
              const status = s.applicantStatus ?? "submitted";
              return (
                <div
                  key={s.studentId}
                  className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/40 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
                        Student {idx + 1}
                      </p>
                      <p className="mt-0.5 text-lg font-semibold text-[var(--ds-text-primary)]">
                        {s.fullName}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="mt-4">
                    <StudentStatusStepper status={status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-[var(--ds-text-secondary)] sm:grid-cols-4">
                    <KV label="Date of birth" value={s.dateOfBirth} />
                    <KV
                      label="Age"
                      value={s.ageAtApplication != null ? `${s.ageAtApplication}y` : "—"}
                    />
                    <KV label="Target grade" value={s.targetGradeLevel} />
                    <KV label="Mode" value={s.applicationMode ?? "new"} />
                    <div className="col-span-2 sm:col-span-4">
                      <KV label="Current school" value={s.currentSchool} />
                    </div>
                  </div>

                  {s.notes ? (
                    <p className="mt-3 rounded-lg bg-[var(--ds-soft)] p-3 text-sm text-[var(--ds-text-primary)]">
                      {s.notes}
                    </p>
                  ) : null}

                  <div className="mt-4 border-t border-[var(--ds-border)] pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
                      Online assessment
                    </p>
                    <TestResultPanel student={s} />
                  </div>

                  <div className="mt-4 border-t border-[var(--ds-border)] pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
                      Advance student status
                    </p>
                    <StudentStatusForm
                      studentId={s.studentId}
                      currentStatus={status}
                    />
                  </div>

                  <div className="mt-3 border-t border-[var(--ds-border)] pt-3">
                    <AdminOpenDocumentRequestButton
                      studentId={s.studentId}
                      leadId={app.lead.admissionId}
                    />
                  </div>

                  <div className="mt-3 border-t border-[var(--ds-border)] pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
                      Offer
                    </p>
                    <AdminIssueOfferButton
                      studentId={s.studentId}
                      applicantStatus={status}
                      defaultSchoolId={`SCH-${(app.lead.schoolSelection || "IISS").toUpperCase()}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
        <h2 className="text-lg font-semibold text-[var(--ds-text-primary)]">Latest payment</h2>
        {app.latestPayment ? (
          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <KV label="Payment ID" value={app.latestPayment.paymentId} />
            <KV label="Status" value={app.latestPayment.status} />
            <KV
              label="Amount"
              value={formatMoney(app.latestPayment.amount, app.latestPayment.currency)}
            />
            <KV label="Method" value={app.latestPayment.paymentMethod ?? "—"} />
            <KV label="Paid at" value={app.latestPayment.paidAt ? formatDate(app.latestPayment.paidAt) : "—"} />
            {app.latestPayment.hostedInvoiceUrl ? (
              <div className="col-span-2 sm:col-span-3">
                <a
                  href={app.latestPayment.hostedInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ds-primary)] hover:underline"
                >
                  Open Xendit invoice ↗
                </a>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--ds-text-secondary)]">
            No payment attempted yet.
          </p>
        )}
      </section>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-[var(--ds-text-primary)]">{value}</p>
    </div>
  );
}

/**
 * Pass threshold used to colour the test-result badge and show the
 * admin a subtle "consider rejection" hint for failed attempts. Hard-
 * coded at 60 % for now; when per-school configuration lands this
 * constant should move to the school's admin settings record.
 */
const ADMIN_PASS_THRESHOLD_PCT = 60;

/**
 * Render the online-assessment block inside a student card on the
 * admin detail page. Shows four distinct states with clear guidance
 * so the admin knows what action (if any) to take:
 *
 *   - never started → plain "Not started yet" note
 *   - in progress   → amber pill + explanation that attempt is live
 *   - finished pass → green pill, score + %, "Ready to issue offer" hint
 *   - finished fail → red pill, score + %, "Consider rejection" hint
 *
 * All data points come from the Student node; the admission-service
 * syncs them from Moodle whenever the parent dashboard polls.
 */
function TestResultPanel({
  student,
}: {
  student: {
    onlineTestState?: string | null;
    onlineTestScore?: number | null;
    onlineTestMaxScore?: number | null;
    onlineTestPercentage?: number | null;
    onlineTestCompletedAt?: string | null;
  };
}) {
  const state = student.onlineTestState ?? null;

  if (state === "in_progress") {
    return (
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          In progress
        </span>
        <p className="text-xs text-[var(--ds-text-secondary)]">
          Student has opened the quiz but not yet submitted. Scores will
          appear here automatically once the attempt is finished.
        </p>
      </div>
    );
  }

  if (state === "finished") {
    const score = student.onlineTestScore ?? 0;
    const max = student.onlineTestMaxScore ?? 0;
    const pct = student.onlineTestPercentage ?? 0;
    const passed = pct >= ADMIN_PASS_THRESHOLD_PCT;
    const badgeCls = passed
      ? "bg-green-50 text-green-800"
      : "bg-red-50 text-red-800";
    const hint = passed
      ? "Above the 60 % threshold — ready to issue an offer once documents are verified."
      : `Below the ${ADMIN_PASS_THRESHOLD_PCT} % threshold. Consider setting the student status to "rejected" or requesting a retake.`;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeCls}`}>
            {formatScore(score)}/{formatScore(max)} · {pct}%
          </span>
          {student.onlineTestCompletedAt ? (
            <span className="text-xs text-[var(--ds-text-secondary)]">
              Completed {formatDate(student.onlineTestCompletedAt)}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-[var(--ds-text-secondary)]">{hint}</p>
      </div>
    );
  }

  return (
    <p className="text-sm text-[var(--ds-text-secondary)]">
      Not started yet. Parent can launch the assessment from their
      dashboard once the application fee has been paid.
    </p>
  );
}

/**
 * Trim trailing zeros from Moodle's float marks so "3.00" renders as
 * "3" but "2.5" is preserved. Shared with the applications list cell.
 */
function formatScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
