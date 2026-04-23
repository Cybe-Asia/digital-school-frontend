import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { OffersFilterBar } from "./offers-filter-bar";
import { CancelOfferButton } from "./cancel-offer-button";
import { EmptyState } from "@/app/admin/_components/empty-state";
import { FilterChips, type FilterChip } from "@/app/admin/_components/filter-chips";

export const metadata: Metadata = {
  title: "Admissions Offers | Admin",
  description: "Cross-student offers dashboard with aging.",
};

const SESSION_COOKIE_NAME = "ds-session";
type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Row = {
  offerId: string;
  offerCode: string;
  status: string;
  targetSchoolId: string;
  targetYearGroup?: string | null;
  academicYear?: string | null;
  issuedAt?: string | null;
  acceptanceDueAt?: string | null;
  applicantStudentId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  ageDays?: number | null;
  overdue: boolean;
  acceptanceStatus?: string | null;
};

type Payload = { rows: Row[]; total: number; limit: number; offset: number };

type SP = Record<string, string | string[] | undefined>;
function param(sp: SP, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export default async function AdminOffersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return <div className="mx-auto max-w-3xl px-6 py-10 text-sm">Please log in first.</div>;

  const sp = await searchParams;
  const status = param(sp, "status") ?? "";
  const school = param(sp, "school") ?? "";
  const search = param(sp, "search") ?? "";
  const onlyOverdue = param(sp, "onlyOverdue") === "true";
  const limit = Math.max(1, Math.min(200, parseInt(param(sp, "limit") ?? "50", 10) || 50));
  const offset = Math.max(0, parseInt(param(sp, "offset") ?? "0", 10) || 0);

  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (school) qs.set("school", school);
  if (search) qs.set("search", search);
  if (onlyOverdue) qs.set("onlyOverdue", "true");
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));

  const { admission } = getServerServiceEndpoints();
  let payload: ApiEnvelope<Payload> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(`${admission}/admin/offers?${qs.toString()}`, {
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
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            </span>
            <div>
              <span className="eyebrow-chip">Offers</span>
              <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">Offer letters</h1>
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

      <OffersFilterBar initial={{ status, school, search, onlyOverdue }} />

      <FilterChips qs={qs} chips={buildOfferChips({ status, school, search, onlyOverdue })} />

      {rows.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon="📨"
            title="No offers match these filters"
            description={onlyOverdue ? "No overdue offers — the intake is healthy." : "Clear a chip or broaden the filters."}
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-surface)] shadow-[var(--ds-shadow-soft)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--ds-soft)]/60 text-[11px] uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Offer</th>
                  <th className="px-5 py-3.5 font-bold">Applicant</th>
                  <th className="px-5 py-3.5 font-bold">Parent</th>
                  <th className="px-5 py-3.5 font-bold">School / Year</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold">Age</th>
                  <th className="px-5 py-3.5 font-bold">Accept by</th>
                  <th className="px-5 py-3.5 font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-border)]/70">
                {rows.map((r) => (
                  <tr
                    key={r.offerId}
                    className={`transition-colors hover:bg-[var(--ds-soft)]/40 ${r.overdue ? "bg-[#fee9e9]/30" : ""}`}
                  >
                    <td className="px-5 py-4 font-mono text-[13px] font-semibold text-[var(--ds-text-primary)]">{r.offerCode}</td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/admissions/students/${encodeURIComponent(r.applicantStudentId)}?tab=offer`}
                        className="font-semibold text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                      >
                        {r.studentName || "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block text-[var(--ds-text-primary)]">{r.parentName || "—"}</span>
                      <span className="mt-0.5 block text-xs text-[var(--ds-text-secondary)]">{r.parentEmail}</span>
                    </td>
                    <td className="px-5 py-4 text-[var(--ds-text-primary)]">
                      {r.targetSchoolId}
                      {r.targetYearGroup ? <div className="text-xs text-[var(--ds-text-secondary)]">{r.targetYearGroup} · AY {r.academicYear ?? "—"}</div> : null}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} size="sm" />
                      {r.acceptanceStatus ? (
                        <div className="mt-1 text-xs text-[var(--ds-text-secondary)]">response: {r.acceptanceStatus}</div>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--ds-text-secondary)]">
                      {r.ageDays == null ? "—" : `${r.ageDays}d`}
                    </td>
                    <td className={`px-5 py-4 text-xs ${r.overdue ? "font-semibold text-[#8b1f1f]" : "text-[var(--ds-text-secondary)]"}`}>
                      {r.acceptanceDueAt ? formatDate(r.acceptanceDueAt) : "—"}
                      {r.overdue ? <span className="ml-1.5 rounded-full bg-[#fee9e9] px-2 py-0.5 text-[10px] font-bold uppercase text-[#8b1f1f]">Overdue</span> : null}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {r.status === "issued" || r.status === "draft" ? (
                        <CancelOfferButton offerId={r.offerId} />
                      ) : null}
                    </td>
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

function buildOfferChips(f: {
  status: string;
  school: string;
  search: string;
  onlyOverdue: boolean;
}): FilterChip[] {
  const out: FilterChip[] = [];
  if (f.status) out.push({ key: "status", label: `Status: ${f.status}` });
  if (f.school) out.push({ key: "school", label: `School: ${f.school.replace("SCH-", "")}` });
  if (f.search) out.push({ key: "search", label: `Search: ${f.search}` });
  if (f.onlyOverdue) out.push({ key: "onlyOverdue", label: "Overdue only" });
  return out;
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
