import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { DocQueueFilterBar } from "./doc-queue-filter-bar";
import { EmptyState } from "@/app/admin/_components/empty-state";
import { FilterChips, type FilterChip } from "@/app/admin/_components/filter-chips";

export const metadata: Metadata = {
  title: "Document Review Queue | Admin",
  description: "Cross-student artifacts awaiting review.",
};

const SESSION_COOKIE_NAME = "ds-session";
type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Row = {
  documentArtifactId: string;
  documentRequestId: string;
  applicantStudentId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  school: string;
  documentType: string;
  fileName: string;
  sizeBytes: number;
  status: string;
  uploadedAt: string;
  ageDays?: number | null;
};

type Payload = { rows: Row[]; total: number; limit: number; offset: number };

type SP = Record<string, string | string[] | undefined>;
function param(sp: SP, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export default async function AdminDocQueuePage({ searchParams }: { searchParams: Promise<SP> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return <div className="mx-auto max-w-3xl px-6 py-10 text-sm">Please log in first.</div>;

  const sp = await searchParams;
  const status = param(sp, "status") ?? "";
  const school = param(sp, "school") ?? "";
  const search = param(sp, "search") ?? "";
  const minAgeDays = param(sp, "minAgeDays") ?? "";
  const limit = Math.max(1, Math.min(200, parseInt(param(sp, "limit") ?? "50", 10) || 50));
  const offset = Math.max(0, parseInt(param(sp, "offset") ?? "0", 10) || 0);

  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (school) qs.set("school", school);
  if (search) qs.set("search", search);
  if (minAgeDays) qs.set("minAgeDays", minAgeDays);
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));

  const { admission } = getServerServiceEndpoints();
  let payload: ApiEnvelope<Payload> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(`${admission}/admin/document-queue?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<Payload> | null;
  } catch {
    // upstream down
  }
  if (httpStatus === 403) {
    return <div className="mx-auto max-w-3xl px-6 py-10 text-sm"><h1 className="text-xl font-semibold">Admin access required</h1></div>;
  }

  const { rows, total } = payload?.data ?? { rows: [], total: 0, limit, offset };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="surface-card mb-6 rounded-3xl p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15l2 2 4-4" /></svg>
            </span>
            <div>
              <span className="eyebrow-chip">Document verification</span>
              <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">Document queue</h1>
              <p className="mt-1.5 text-sm text-[var(--ds-text-secondary)]">
                <span className="font-semibold text-[var(--ds-text-primary)]">{total.toLocaleString()}</span> total · showing {rows.length} · oldest first
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

      <DocQueueFilterBar initial={{ status, school, search, minAgeDays }} />

      <FilterChips qs={qs} chips={buildDocChips({ status, school, search, minAgeDays })} />

      {rows.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon="🎉"
            title="Queue is empty"
            description="Every uploaded artifact has been reviewed. Nothing waiting."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-surface)] shadow-[var(--ds-shadow-soft)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--ds-soft)]/60 text-[11px] uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">File</th>
                  <th className="px-5 py-3.5 font-bold">Applicant</th>
                  <th className="px-5 py-3.5 font-bold">Parent</th>
                  <th className="px-5 py-3.5 font-bold">School</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold">Size</th>
                  <th className="px-5 py-3.5 font-bold">Age</th>
                  <th className="px-5 py-3.5 font-bold">Uploaded</th>
                  <th className="px-5 py-3.5 font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-border)]/70">
                {rows.map((r) => {
                  const hot = (r.ageDays ?? 0) >= 3;
                  return (
                    <tr key={r.documentArtifactId} className={`transition-colors hover:bg-[var(--ds-soft)]/40 ${hot ? "bg-[#fee9e9]/25" : ""}`}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[var(--ds-text-primary)]">{r.fileName}</p>
                        <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">{r.documentType}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/admissions/students/${encodeURIComponent(r.applicantStudentId)}?tab=documents`}
                          className="font-semibold text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                        >
                          {r.studentName || "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className="block text-[var(--ds-text-primary)]">{r.parentName}</span>
                        <span className="mt-0.5 block text-xs text-[var(--ds-text-secondary)]">{r.parentEmail}</span>
                      </td>
                      <td className="px-5 py-4 text-[var(--ds-text-primary)]">{r.school}</td>
                      <td className="px-5 py-4"><StatusBadge status={r.status} size="sm" /></td>
                      <td className="px-5 py-4 text-xs text-[var(--ds-text-secondary)]">{formatBytes(r.sizeBytes)}</td>
                      <td className={`px-5 py-4 text-xs ${hot ? "font-semibold text-[#8b1f1f]" : "text-[var(--ds-text-secondary)]"}`}>
                        {r.ageDays == null ? "—" : `${r.ageDays}d`}
                        {hot ? <span className="ml-1.5 rounded-full bg-[#fee9e9] px-2 py-0.5 text-[10px] font-bold uppercase text-[#8b1f1f]">Stale</span> : null}
                      </td>
                      <td className="px-5 py-4 text-xs text-[var(--ds-text-secondary)]">{formatDate(r.uploadedAt)}</td>
                      <td className="px-5 py-4 text-right text-xs">
                        <Link
                          href={`/admin/admissions/students/${encodeURIComponent(r.applicantStudentId)}?tab=documents`}
                          className="cta-secondary gap-1"
                        >
                          Review
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
      <Link aria-disabled={atStart} href={atStart ? "#" : href(prev)} className={`rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold ${atStart ? "pointer-events-none opacity-40" : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"}`}>← Prev</Link>
      <Link aria-disabled={atEnd} href={atEnd ? "#" : href(next)} className={`rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold ${atEnd ? "pointer-events-none opacity-40" : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"}`}>Next →</Link>
    </div>
  );
}

function buildDocChips(f: { status: string; school: string; search: string; minAgeDays: string }): FilterChip[] {
  const out: FilterChip[] = [];
  if (f.status) out.push({ key: "status", label: `Status: ${f.status}` });
  if (f.school) out.push({ key: "school", label: `School: ${f.school.replace("SCH-", "")}` });
  if (f.search) out.push({ key: "search", label: `Search: ${f.search}` });
  if (f.minAgeDays) out.push({ key: "minAgeDays", label: `≥ ${f.minAgeDays}d old` });
  return out;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
