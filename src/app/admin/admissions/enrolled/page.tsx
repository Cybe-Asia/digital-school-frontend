import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { EnrolledFilterBar } from "./enrolled-filter-bar";
import { EmptyState } from "@/app/admin/_components/empty-state";
import { FilterChips, type FilterChip } from "@/app/admin/_components/filter-chips";

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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="surface-card mb-6 rounded-3xl p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#22c55e]/10 text-[#166534]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
            </span>
            <div>
              <span className="eyebrow-chip">Enrolled students</span>
              <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">Enrolled</h1>
              <p className="mt-1.5 text-sm text-[var(--ds-text-secondary)]">
                <span className="font-semibold text-[var(--ds-text-primary)]">{total.toLocaleString()}</span> total · showing {rows.length} · offset {offset}
              </p>
            </div>
          </div>
          <nav>
            <Link
              href="/admin/admissions"
              className="cta-secondary gap-1.5"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <EnrolledFilterBar initial={{ school, yearGroup, status, search }} />

      <FilterChips qs={qs} chips={buildEnrolledChips({ school, yearGroup, status, search })} />

      {rows.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon="🎓"
            title="No enrolled students yet"
            description="Parents must accept their offer and pay the enrolment fee for a record to appear here."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-surface)] shadow-[var(--ds-shadow-soft)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--ds-soft)]/60 text-[11px] uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Student #</th>
                  <th className="px-5 py-3.5 font-bold">Name</th>
                  <th className="px-5 py-3.5 font-bold">School</th>
                  <th className="px-5 py-3.5 font-bold">Year</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold">Parent</th>
                  <th className="px-5 py-3.5 font-bold">Enrolled on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-border)]/70">
                {rows.map((r) => (
                  <tr
                    key={r.studentId}
                    className="transition-colors hover:bg-[var(--ds-soft)]/40"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-[var(--ds-text-primary)]">
                      {r.studentNumber}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/admissions/students/${encodeURIComponent(r.applicantStudentId)}?tab=enrolment`}
                        className="font-semibold text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                      >
                        {r.fullName || "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[var(--ds-text-primary)]">{r.schoolId}</td>
                    <td className="px-5 py-4 text-[var(--ds-text-primary)]">{r.yearGroup ?? "—"}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} size="sm" /></td>
                    <td className="px-5 py-4">
                      <span className="block text-[var(--ds-text-primary)]">{r.parentName || "—"}</span>
                      <span className="mt-0.5 block text-xs text-[var(--ds-text-secondary)]">{r.parentEmail}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--ds-text-secondary)]">{r.enrolmentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pager total={total} limit={limit} offset={offset} qs={qs} />
    </div>
  );
}

function buildEnrolledChips(f: { school: string; yearGroup: string; status: string; search: string }): FilterChip[] {
  const out: FilterChip[] = [];
  if (f.search) out.push({ key: "search", label: `Search: ${f.search}` });
  if (f.school) out.push({ key: "school", label: `School: ${f.school.replace("SCH-", "")}` });
  if (f.yearGroup) out.push({ key: "yearGroup", label: `Year: ${f.yearGroup}` });
  if (f.status) out.push({ key: "status", label: `Status: ${f.status}` });
  return out;
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
