import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { DocQueueFilterBar } from "./doc-queue-filter-bar";

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
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
            Admissions
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">Document review queue</h1>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
            {total.toLocaleString()} total · showing {rows.length} · oldest first
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

      <DocQueueFilterBar initial={{ status, school, search, minAgeDays }} />

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-10 text-center text-sm text-[var(--ds-text-secondary)]">
          No artifacts match these filters. 🎉
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ds-soft)] text-xs uppercase tracking-wider text-[var(--ds-text-secondary)]">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const hot = (r.ageDays ?? 0) >= 3;
                return (
                  <tr key={r.documentArtifactId} className={`border-t border-[var(--ds-border)] hover:bg-[var(--ds-soft)]/40 ${hot ? "bg-[#fee9e9]/30" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[var(--ds-text-primary)]">{r.fileName}</p>
                      <p className="text-xs text-[var(--ds-text-secondary)]">{r.documentType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/admissions/students/${encodeURIComponent(r.applicantStudentId)}?tab=documents`}
                        className="font-semibold text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                      >
                        {r.studentName || "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[var(--ds-text-primary)]">{r.parentName}</span>
                      <br />
                      <span className="text-xs text-[var(--ds-text-secondary)]">{r.parentEmail}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--ds-text-primary)]">{r.school}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} size="sm" /></td>
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-secondary)]">{formatBytes(r.sizeBytes)}</td>
                    <td className={`px-4 py-3 text-xs ${hot ? "font-semibold text-[#8b1f1f]" : "text-[var(--ds-text-secondary)]"}`}>
                      {r.ageDays == null ? "—" : `${r.ageDays}d`}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--ds-text-secondary)]">{formatDate(r.uploadedAt)}</td>
                    <td className="px-4 py-3 text-right text-xs">
                      <Link
                        href={`/admin/admissions/students/${encodeURIComponent(r.applicantStudentId)}?tab=documents`}
                        className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2 py-1 font-semibold text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                );
              })}
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
      <Link aria-disabled={atStart} href={atStart ? "#" : href(prev)} className={`rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold ${atStart ? "pointer-events-none opacity-40" : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"}`}>← Prev</Link>
      <Link aria-disabled={atEnd} href={atEnd ? "#" : href(next)} className={`rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold ${atEnd ? "pointer-events-none opacity-40" : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"}`}>Next →</Link>
    </div>
  );
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
