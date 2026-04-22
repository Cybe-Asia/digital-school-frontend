import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { ApplicationStatusForm } from "./application-status-form";

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
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      <nav className="text-sm">
        <Link
          href="/admin/admissions/applications"
          className="text-[var(--ds-primary)] hover:underline"
        >
          ← Back to applications
        </Link>
      </nav>

      <header className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
          Parent application
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">
          {app.lead.parentName}
        </h1>
        <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
          {app.lead.email} &middot; {app.lead.whatsappNumber}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
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
            <StatusPill status={app.application.status} />
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
          <div className="mt-3 space-y-3">
            {app.students.map((s) => (
              <div
                key={s.studentId}
                className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/40 p-4"
              >
                <p className="font-semibold text-[var(--ds-text-primary)]">{s.fullName}</p>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-[var(--ds-text-secondary)] sm:grid-cols-3">
                  <KV label="Date of birth" value={s.dateOfBirth} />
                  <KV label="Current school" value={s.currentSchool} />
                  <KV label="Target grade" value={s.targetGradeLevel} />
                </div>
                {s.notes ? (
                  <p className="mt-3 rounded-lg bg-[var(--ds-soft)] p-3 text-sm text-[var(--ds-text-primary)]">
                    {s.notes}
                  </p>
                ) : null}
              </div>
            ))}
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

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const colorClass =
    s === "paid" || s === "application_fee_paid" || s === "completed"
      ? "bg-[#e3fcef] text-[#166534]"
      : s === "submitted" || s === "verified" || s === "offer_stage"
      ? "bg-[#dbeafe] text-[#1e40af]"
      : s === "payment_pending" ||
        s === "pending" ||
        s === "under_review" ||
        s === "testing_in_progress" ||
        s === "documents_pending"
      ? "bg-[#fef3c7] text-[#92400e]"
      : s === "expired" || s === "failed" || s === "rejected" || s === "withdrawn"
      ? "bg-[#fee9e9] text-[#8b1f1f]"
      : "bg-[var(--ds-soft)] text-[var(--ds-text-primary)]";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
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
