import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

export const metadata: Metadata = {
  title: "Admissions Applications | Admin",
  description: "Review all admissions applications.",
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
    isVerified: boolean;
    createdAt: string;
  };
  students: Array<{ fullName: string; targetGradeLevel: string; currentSchool: string }>;
  latestPayment?: {
    status: string;
    amount: number;
    currency: string;
    paidAt?: string | null;
  } | null;
  application?: {
    applicationId: string;
    applicationCode: string;
    status: string;
  } | null;
};

/**
 * Server-rendered admin review queue. Reads the ds-session cookie,
 * calls admission-service's /admin/applications directly, and renders
 * one table row per Lead. Backend handles the admin-email allowlist;
 * if the requester isn't on the list we render a "not authorised"
 * message instead of the table.
 */
export default async function AdminApplicationsPage() {
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
  let payload: ApiEnvelope<AdminApplication[]> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(`${admission}/admin/applications`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<AdminApplication[]> | null;
  } catch {
    // network failure; payload stays null
  }

  if (httpStatus === 403) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold text-[var(--ds-text-primary)]">Admin access required</h1>
        <p className="mt-2 text-[var(--ds-text-secondary)]">
          Your account isn&apos;t configured as an admin for school-test. Ask the cluster operator
          to add your email to <code className="rounded bg-[var(--ds-soft)] px-1.5 py-0.5">ADMIN_EMAILS</code> in
          the app-config ConfigMap.
        </p>
      </div>
    );
  }

  const applications = payload?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
            Admissions
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">
            Applications
          </h1>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
            {applications.length} total &middot; newest first
          </p>
        </div>
      </header>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-10 text-center text-sm text-[var(--ds-text-secondary)]">
          No applications yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ds-soft)] text-xs uppercase tracking-wider text-[var(--ds-text-secondary)]">
              <tr>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.lead.admissionId}
                  className="border-t border-[var(--ds-border)] hover:bg-[var(--ds-soft)]/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/admissions/applications/${encodeURIComponent(app.lead.admissionId)}`}
                      className="block text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                    >
                      <span className="font-semibold">{app.lead.parentName}</span>
                      <br />
                      <span className="text-xs text-[var(--ds-text-secondary)]">{app.lead.email}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--ds-text-primary)]">{app.lead.schoolSelection}</td>
                  <td className="px-4 py-3">
                    {app.students.length === 0 ? (
                      <span className="text-xs text-[var(--ds-text-secondary)]">none yet</span>
                    ) : (
                      <span className="text-[var(--ds-text-primary)]">
                        {app.students.map((s) => s.fullName).join(", ")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {app.application ? (
                      <div>
                        <StatusPill status={app.application.status} />
                        <div className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
                          {app.application.applicationCode}
                        </div>
                      </div>
                    ) : (
                      <StatusPill status={app.lead.isVerified ? "EOI only" : "pending"} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {app.latestPayment ? (
                      <div>
                        <StatusPill status={app.latestPayment.status} />
                        <div className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
                          {formatMoney(app.latestPayment.amount, app.latestPayment.currency)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--ds-text-secondary)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ds-text-secondary)]">
                    {formatDate(app.lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
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
