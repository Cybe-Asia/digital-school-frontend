import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { LeadActionsPanel } from "./lead-actions-panel";

export const metadata: Metadata = {
  title: "Lead Detail | Admin",
};

const SESSION_COOKIE_NAME = "ds-session";

type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type LeadDetail = {
  detail: {
    lead: {
      lead_id: string;
      tenant_id: string;
      status: string;
      parent_name: string;
      email: string;
      mobile: string;
      whatsapp: string;
      location_suburb?: string | null;
      occupation?: string | null;
      target_school_preference: string;
      existing_students?: number | null;
      referral_code?: string | null;
      hear_about_school?: string | null;
      eoi_submitted_at: string;
    };
    applicationId?: string | null;
    applicationStatus?: string | null;
    applicantCount: number;
    latestPaymentStatus?: string | null;
    latestPaymentType?: string | null;
    latestPaymentAmount?: number | null;
    hostedInvoiceUrl?: string | null;
    offerStatus?: string | null;
    offerCode?: string | null;
    enrolledStudentNumber?: string | null;
  };
  notes: Array<{
    noteId: string;
    leadId: string;
    body: string;
    authorLeadId: string;
    authorEmail?: string | null;
    createdAt: string;
  }>;
  students: Array<{
    studentId: string;
    fullName: string;
    targetGradeLevel: string;
    currentSchool?: string | null;
    dateOfBirth?: string | null;
    applicantStatus?: string | null;
  }>;
};

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  let payload: ApiEnvelope<LeadDetail> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(`${admission}/admin/leads/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<LeadDetail> | null;
  } catch {
    // upstream down
  }

  if (httpStatus === 403) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold">Admin access required</h1>
      </div>
    );
  }
  if (httpStatus === 404 || !payload?.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold">Lead not found</h1>
        <p className="mt-2 text-[var(--ds-text-secondary)]">
          {payload?.responseMessage || `HTTP ${httpStatus}`}
        </p>
        <Link href="/admin/admissions/leads" className="mt-3 inline-block text-sm text-[var(--ds-primary)]">
          ← Back to leads
        </Link>
      </div>
    );
  }

  const { detail, notes, students } = payload.data;
  const lead = detail.lead;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-xs">
        <Link href="/admin/admissions/leads" className="inline-flex items-center gap-1.5 text-[var(--ds-primary)] hover:underline">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to leads
        </Link>
      </nav>

      <header className="hero-panel relative mb-7 overflow-hidden rounded-[28px] p-6 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--ds-radial-a)] blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--ds-primary)] to-[var(--ds-cta-fill-2)] text-xl font-bold text-[var(--ds-on-primary)] shadow-[0_12px_28px_-14px_rgba(11,110,79,0.6)]" aria-hidden="true">
              {(lead.parent_name ?? "?").split(" ").slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("")}
            </span>
            <div className="min-w-0">
              <span className="eyebrow-chip">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ds-primary)]" aria-hidden="true" />
                Lead · {lead.lead_id.split("-")[1]?.slice(0, 10) ?? lead.lead_id}
              </span>
              <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">
                {lead.parent_name}
              </h1>
              <p className="mt-1.5 text-sm text-[var(--ds-text-secondary)]">
                <span className="font-semibold text-[var(--ds-text-primary)]">{lead.email}</span> · {lead.whatsapp}
              </p>
              <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
                {lead.target_school_preference} · EOI submitted {formatDate(lead.eoi_submitted_at)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={lead.status} />
            {detail.applicationStatus ? (
              <StatusBadge status={detail.applicationStatus} size="sm" />
            ) : null}
            {detail.offerStatus ? (
              <StatusBadge status={detail.offerStatus} size="sm" label={`offer: ${detail.offerStatus}`} />
            ) : null}
            {detail.enrolledStudentNumber ? (
              <StatusBadge status="enrolled" size="sm" label={`🎓 ${detail.enrolledStudentNumber}`} />
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <section className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 sm:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            Details
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-[var(--ds-text-secondary)]">Location</dt>
            <dd className="text-[var(--ds-text-primary)]">{lead.location_suburb ?? "—"}</dd>
            <dt className="text-[var(--ds-text-secondary)]">Occupation</dt>
            <dd className="text-[var(--ds-text-primary)]">{lead.occupation ?? "—"}</dd>
            <dt className="text-[var(--ds-text-secondary)]">Existing students</dt>
            <dd className="text-[var(--ds-text-primary)]">{lead.existing_students ?? 0}</dd>
            <dt className="text-[var(--ds-text-secondary)]">Referral code</dt>
            <dd className="text-[var(--ds-text-primary)]">{lead.referral_code ?? "—"}</dd>
            <dt className="text-[var(--ds-text-secondary)]">Heard via</dt>
            <dd className="text-[var(--ds-text-primary)]">{lead.hear_about_school ?? "—"}</dd>
            <dt className="text-[var(--ds-text-secondary)]">Applicant count</dt>
            <dd className="text-[var(--ds-text-primary)]">{detail.applicantCount}</dd>
            <dt className="text-[var(--ds-text-secondary)]">Latest payment</dt>
            <dd className="text-[var(--ds-text-primary)]">
              {detail.latestPaymentStatus
                ? `${detail.latestPaymentStatus} · ${detail.latestPaymentType ?? "—"}${
                    detail.latestPaymentAmount ? ` · ${formatAmount(detail.latestPaymentAmount)}` : ""
                  }`
                : "—"}
            </dd>
            <dt className="text-[var(--ds-text-secondary)]">Invoice link</dt>
            <dd>
              {detail.hostedInvoiceUrl ? (
                <a
                  href={detail.hostedInvoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--ds-primary)] hover:underline"
                >
                  Open ↗
                </a>
              ) : (
                <span className="text-[var(--ds-text-primary)]">—</span>
              )}
            </dd>
          </dl>

          {detail.applicationId ? (
            <div className="mt-4">
              <Link
                href={`/admin/admissions/applications/${encodeURIComponent(lead.lead_id)}`}
                className="text-sm font-semibold text-[var(--ds-primary)] hover:underline"
              >
                Open application detail →
              </Link>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            Admin actions
          </h2>
          <LeadActionsPanel
            leadId={lead.lead_id}
            leadStatus={lead.status}
          />
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Students on this application
        </h2>
        {students.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ds-text-secondary)]">
            None submitted yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {students.map((s) => (
              <li
                key={s.studentId}
                className="flex items-center justify-between rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/30 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-semibold text-[var(--ds-text-primary)]">{s.fullName}</span>
                  <span className="ml-2 text-xs text-[var(--ds-text-secondary)]">
                    {s.targetGradeLevel}
                    {s.currentSchool ? ` · from ${s.currentSchool}` : ""}
                  </span>
                </div>
                {s.applicantStatus ? (
                  <StatusBadge status={s.applicantStatus} size="sm" />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Internal notes
        </h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--ds-text-secondary)]">
            No notes yet — add one from the Admin actions panel.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {notes.map((n) => (
              <li
                key={n.noteId}
                className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/30 p-3 text-sm"
              >
                <p className="whitespace-pre-wrap text-[var(--ds-text-primary)]">{n.body}</p>
                <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
                  {n.authorEmail ?? n.authorLeadId} · {formatDate(n.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "—";
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

function formatAmount(n: number): string {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return String(n);
  }
}
