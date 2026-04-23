import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { ApplicationsFilterBar } from "./applications-filter-bar";

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
type SP = Record<string, string | string[] | undefined>;
function getSP(sp: SP, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export default async function AdminApplicationsPage({
  searchParams,
}: { searchParams: Promise<SP> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[var(--ds-text-primary)]">
        Please log in first.
      </div>
    );
  }

  const sp = await searchParams;
  const status = getSP(sp, "status") ?? "";
  const school = getSP(sp, "school") ?? "";
  const search = getSP(sp, "search") ?? "";
  const dateFrom = getSP(sp, "dateFrom") ?? "";
  const dateTo = getSP(sp, "dateTo") ?? "";
  const hasApplication = getSP(sp, "hasApplication") ?? "";
  const limit = Math.max(1, Math.min(500, parseInt(getSP(sp, "limit") ?? "100", 10) || 100));
  const offset = Math.max(0, parseInt(getSP(sp, "offset") ?? "0", 10) || 0);

  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (school) qs.set("school", school);
  if (search) qs.set("search", search);
  if (dateFrom) qs.set("dateFrom", dateFrom);
  if (dateTo) qs.set("dateTo", dateTo);
  if (hasApplication) qs.set("hasApplication", hasApplication);
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));

  const { admission } = getServerServiceEndpoints();
  let payload: ApiEnvelope<AdminApplication[]> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(`${admission}/admin/applications?${qs.toString()}`, {
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="surface-card mb-6 rounded-3xl p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
            </span>
            <div>
              <span className="eyebrow-chip">Applicants</span>
              <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">Applications</h1>
              <p className="mt-1.5 text-sm text-[var(--ds-text-secondary)]">
                <span className="font-semibold text-[var(--ds-text-primary)]">{applications.length}</span> rows · offset {offset}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <a
              href={`/api/admin/applications.csv?${qs.toString()}`}
              download
              className="cta-secondary gap-1.5"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              Export CSV
            </a>
            <Link
              href="/admin/admissions"
              className="cta-secondary gap-1.5"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <ApplicationsFilterBar initial={{ status, school, search, dateFrom, dateTo, hasApplication }} />

      {applications.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-[var(--ds-border)] bg-[var(--ds-soft)]/35 px-6 py-14 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ds-surface)] text-[var(--ds-primary)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
          </div>
          <p className="text-base font-semibold text-[var(--ds-text-primary)]">No applications yet</p>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">Applications will show up here as parents complete the registration flow.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-surface)] shadow-[var(--ds-shadow-soft)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--ds-soft)]/60 text-[11px] uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Parent</th>
                  <th className="px-5 py-3.5 font-bold">School</th>
                  <th className="px-5 py-3.5 font-bold">Students</th>
                  <th className="px-5 py-3.5 font-bold">Application</th>
                  <th className="px-5 py-3.5 font-bold">Fee</th>
                  <th className="px-5 py-3.5 font-bold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-border)]/70">
                {applications.map((app) => (
                  <tr
                    key={app.lead.admissionId}
                    className="transition-colors hover:bg-[var(--ds-soft)]/40"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/admissions/applications/${encodeURIComponent(app.lead.admissionId)}`}
                        className="group block text-[var(--ds-text-primary)]"
                      >
                        <span className="font-semibold group-hover:text-[var(--ds-primary)]">{app.lead.parentName}</span>
                        <span className="mt-0.5 block text-xs text-[var(--ds-text-secondary)]">{app.lead.email}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[var(--ds-text-primary)]">{app.lead.schoolSelection}</td>
                    <td className="px-5 py-4">
                      {app.students.length === 0 ? (
                        <span className="text-xs text-[var(--ds-text-secondary)]">none yet</span>
                      ) : (
                        <span className="text-[var(--ds-text-primary)]">
                          {app.students.map((s) => s.fullName).join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {app.application ? (
                        <div>
                          <StatusBadge status={app.application.status} size="sm" />
                          <div className="mt-1 text-xs text-[var(--ds-text-secondary)]">
                            {app.application.applicationCode}
                          </div>
                        </div>
                      ) : (
                        <StatusBadge status={app.lead.isVerified ? "submitted" : "pending"} size="sm" label={app.lead.isVerified ? "EOI only" : "pending"} />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {app.latestPayment ? (
                        <div>
                          <StatusBadge status={app.latestPayment.status} size="sm" />
                          <div className="mt-1 text-xs text-[var(--ds-text-secondary)]">
                            {formatMoney(app.latestPayment.amount, app.latestPayment.currency)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--ds-text-secondary)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--ds-text-secondary)]">
                      {formatDate(app.lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
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
