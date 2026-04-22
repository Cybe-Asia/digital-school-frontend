import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { EnrolledFilterBar } from "./enrolled-filter-bar";

export const metadata: Metadata = {
  title: "Enrolled Students | Admin",
  description: "Handed-off students awaiting SIS onboarding.",
};

const SESSION_COOKIE_NAME = "ds-session";
type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Row = {
  studentId: string;
  studentNumber: string;
  schoolId: string;
  yearGroup?: string | null;
  status: string;
  enrolmentDate: string;
  applicantStudentId: string;
  fullName: string;
  parentName: string;
  parentEmail: string;
};

type Payload = { rows: Row[]; total: number; limit: number; offset: number };

type SP = Record<string, string | string[] | undefined>;
function param(sp: SP, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export default async function AdminEnrolledPage({ searchParams }: { searchParams: Promise<SP> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return <div className="mx-auto max-w-3xl px-6 py-10 text-sm">Please log in first.</div>;
  }

  const sp = await searchParams;
  const school = param(sp, "school") ?? "";
  const yearGroup = param(sp, "yearGroup") ?? "";
  const status = param(sp, "status") ?? "";
  const search = param(sp, "search") ?? "";
  const limit = Math.max(1, Math.min(200, parseInt(param(sp, "limit") ?? "50", 10) || 50));
  const offset = Math.max(0, parseInt(param(sp, "offset") ?? "0", 10) || 0);

  const qs = new URLSearchParams();
  if (school) qs.set("school", school);
  if (yearGroup) qs.set("yearGroup", yearGroup);
  if (status) qs.set("status", status);
  if (search) qs.set("search", search);
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));

  const { admission } = getServerServiceEndpoints();
  let payload: ApiEnvelope<Payload> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(`${admission}/admin/enrolled?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<Payload> | null;
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

  const { rows, total } = payload?.data ?? { rows: [], total: 0, limit, offset };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
            Admissions
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">Enrolled students</h1>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
            {total.toLocaleString()} total · showing {rows.length} · offset {offset}
          </p>
        </div>
        <nav className="text-xs">
          <Link
            href="/admin/admissions"
            className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
          >
            ← Dashboard
          </Link>
        </nav>
      </header>

      <EnrolledFilterBar initial={{ school, yearGroup, status, search }} />

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-10 text-center text-sm text-[var(--ds-text-secondary)]">
          No enrolled students yet. Parents must accept their offer and pay the enrolment fee for a record to appear here.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ds-soft)] text-xs uppercase tracking-wider text-[var(--ds-text-secondary)]">
              <tr>
                <th className="px-4 py-3">Student #</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Enrolled on</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.studentId}
                  className="border-t border-[var(--ds-border)] hover:bg-[var(--ds-soft)]/40"
                >
                  <td className="px-4 py-3 font-mono text-xs text-[var(--ds-text-primary)]">
                    {r.studentNumber}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/admissions/students/${encodeURIComponent(r.applicantStudentId)}?tab=enrolment`}
                      className="font-semibold text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                    >
                      {r.fullName || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--ds-text-primary)]">{r.schoolId}</td>
                  <td className="px-4 py-3 text-[var(--ds-text-primary)]">{r.yearGroup ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} size="sm" /></td>
                  <td className="px-4 py-3">
                    <span className="text-[var(--ds-text-primary)]">{r.parentName || "—"}</span>
                    <br />
                    <span className="text-xs text-[var(--ds-text-secondary)]">{r.parentEmail}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ds-text-secondary)]">{r.enrolmentDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager total={total} limit={limit} offset={offset} qs={qs} />
    </div>
  );
}

function Pager({ total, limit, offset, qs }: { total: number; limit: number; offset: number; qs: URLSearchParams }) {
  const prev = Math.max(0, offset - limit);
  const next = offset + limit;
  const atStart = offset === 0;
  const atEnd = next >= total;
  const href = (v: number) => {
    const c = new URLSearchParams(qs);
    c.set("offset", String(v));
    return `?${c.toString()}`;
  };
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-xs">
      <Link
        aria-disabled={atStart}
        href={atStart ? "#" : href(prev)}
        className={`rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold ${
          atStart ? "pointer-events-none opacity-40" : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
        }`}
      >
        ← Prev
      </Link>
      <Link
        aria-disabled={atEnd}
        href={atEnd ? "#" : href(next)}
        className={`rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold ${
          atEnd ? "pointer-events-none opacity-40" : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
        }`}
      >
        Next →
      </Link>
    </div>
  );
}
