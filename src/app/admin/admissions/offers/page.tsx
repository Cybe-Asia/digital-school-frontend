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
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
            Admissions
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">Offers</h1>
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
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ds-soft)] text-xs uppercase tracking-wider text-[var(--ds-text-secondary)]">
              <tr>
                <th className="px-4 py-3">Offer</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">School / Year</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Accept by</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.offerId}
                  className={`border-t border-[var(--ds-border)] hover:bg-[var(--ds-soft)]/40 ${r.overdue ? "bg-[#fee9e9]/40" : ""}`}
                >
                  <td className="px-4 py-3 font-semibold text-[var(--ds-text-primary)]">{r.offerCode}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/admissions/students/${encodeURIComponent(r.applicantStudentId)}?tab=offer`}
                      className="font-semibold text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                    >
                      {r.studentName || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[var(--ds-text-primary)]">{r.parentName || "—"}</span>
                    <br />
                    <span className="text-xs text-[var(--ds-text-secondary)]">{r.parentEmail}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--ds-text-primary)]">
                    {r.targetSchoolId}
                    {r.targetYearGroup ? <div className="text-xs text-[var(--ds-text-secondary)]">{r.targetYearGroup} · AY {r.academicYear ?? "—"}</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} size="sm" />
                    {r.acceptanceStatus ? (
                      <div className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">response: {r.acceptanceStatus}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ds-text-secondary)]">
                    {r.ageDays == null ? "—" : `${r.ageDays}d`}
                  </td>
                  <td className={`px-4 py-3 text-xs ${r.overdue ? "font-semibold text-[#8b1f1f]" : "text-[var(--ds-text-secondary)]"}`}>
                    {r.acceptanceDueAt ? formatDate(r.acceptanceDueAt) : "—"}
                    {r.overdue ? " · overdue" : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "issued" || r.status === "draft" ? (
                      <CancelOfferButton offerId={r.offerId} />
                    ) : null}
                  </td>
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
