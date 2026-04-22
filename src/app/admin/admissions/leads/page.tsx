import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";
import { LeadsFilterBar } from "./leads-filter-bar";
import { EmptyState } from "@/app/admin/_components/empty-state";
import { FilterChips, type FilterChip } from "@/app/admin/_components/filter-chips";

export const metadata: Metadata = {
  title: "Admissions Leads | Admin",
  description: "Top-of-funnel leads + filters.",
};

const SESSION_COOKIE_NAME = "ds-session";

type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type LeadRow = {
  leadId: string;
  parentName: string;
  email: string;
  whatsapp: string;
  school: string;
  leadStatus: string;
  hasApplication: boolean;
  applicationStatus?: string | null;
  applicantCount: number;
  latestPaymentStatus?: string | null;
  latestPaymentType?: string | null;
  submittedAt: string;
};

type LeadsPayload = {
  rows: LeadRow[];
  total: number;
  limit: number;
  offset: number;
};

type SP = Record<string, string | string[] | undefined>;

function param(sp: SP, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

type LeadsPageProps = { searchParams: Promise<SP> };

/**
 * Top-of-funnel admin view. Lists every Lead in the tenant — including
 * those that never submitted a student form (EOI only). Filter bar on top
 * persists its state through the URL query so admins can bookmark/share
 * filtered views.
 *
 * Pagination: server-side via `limit` + `offset`. Default 50 per page.
 */
export default async function AdminLeadsPage({ searchParams }: LeadsPageProps) {
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
  const status = param(sp, "status") ?? "";
  const school = param(sp, "school") ?? "";
  const search = param(sp, "search") ?? "";
  const dateFrom = param(sp, "dateFrom") ?? "";
  const dateTo = param(sp, "dateTo") ?? "";
  const hasApplication = param(sp, "hasApplication") ?? "";
  const limitStr = param(sp, "limit") ?? "50";
  const offsetStr = param(sp, "offset") ?? "0";
  const limit = Math.max(1, Math.min(200, parseInt(limitStr, 10) || 50));
  const offset = Math.max(0, parseInt(offsetStr, 10) || 0);

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
  let httpStatus = 0;
  let payload: ApiEnvelope<LeadsPayload> | null = null;
  try {
    const res = await fetch(`${admission}/admin/leads?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<LeadsPayload> | null;
  } catch {
    // upstream down — payload stays null
  }

  if (httpStatus === 403) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold text-[var(--ds-text-primary)]">Admin access required</h1>
        <p className="mt-2 text-[var(--ds-text-secondary)]">
          Your account isn&apos;t configured as an admin. Ask the cluster operator to
          add your email to <code className="rounded bg-[var(--ds-soft)] px-1.5 py-0.5">ADMIN_EMAILS</code>.
        </p>
      </div>
    );
  }

  if (httpStatus >= 500 || payload == null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold text-[var(--ds-text-primary)]">Couldn&apos;t load leads</h1>
        <p className="mt-2 text-[var(--ds-text-secondary)]">
          {payload?.responseMessage || `HTTP ${httpStatus}`}
        </p>
      </div>
    );
  }

  const { rows, total } = payload.data ?? { rows: [], total: 0, limit, offset };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
            Admissions
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">Leads</h1>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
            {total.toLocaleString()} total · showing {rows.length} · offset {offset}
          </p>
        </div>
        <nav className="text-xs">
          <Link
            href="/admin/admissions/applications"
            className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
          >
            Applications view →
          </Link>
        </nav>
      </header>

      <LeadsFilterBar
        initial={{ status, school, search, dateFrom, dateTo, hasApplication }}
      />

      <FilterChips qs={qs} chips={buildChips({ status, school, search, dateFrom, dateTo, hasApplication })} />

      {rows.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon="🔍"
            title="No leads match these filters"
            description="Try clearing one of the chips above, or broaden the date range."
          />
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--ds-soft)] text-xs uppercase tracking-wider text-[var(--ds-text-secondary)]">
              <tr>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Latest payment</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.leadId}
                  className="border-t border-[var(--ds-border)] hover:bg-[var(--ds-soft)]/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/admissions/leads/${encodeURIComponent(r.leadId)}`}
                      className="block text-[var(--ds-text-primary)] hover:text-[var(--ds-primary)]"
                    >
                      <span className="font-semibold">{r.parentName || "—"}</span>
                      <br />
                      <span className="text-xs text-[var(--ds-text-secondary)]">{r.email}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--ds-text-primary)]">{r.school}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.leadStatus} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {r.applicationStatus ? (
                      <StatusBadge status={r.applicationStatus} size="sm" />
                    ) : (
                      <span className="text-xs text-[var(--ds-text-secondary)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--ds-text-primary)]">{r.applicantCount}</td>
                  <td className="px-4 py-3">
                    {r.latestPaymentStatus ? (
                      <div>
                        <StatusBadge status={r.latestPaymentStatus} size="sm" />
                        <div className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
                          {r.latestPaymentType ?? "—"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--ds-text-secondary)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ds-text-secondary)]">
                    {formatDate(r.submittedAt)}
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

function buildChips(f: {
  status: string;
  school: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  hasApplication: string;
}): FilterChip[] {
  const out: FilterChip[] = [];
  if (f.status) out.push({ key: "status", label: `Status: ${f.status}` });
  if (f.school) out.push({ key: "school", label: `School: ${f.school.replace("SCH-", "")}` });
  if (f.search) out.push({ key: "search", label: `Search: ${f.search}` });
  if (f.dateFrom) out.push({ key: "dateFrom", label: `From: ${f.dateFrom.slice(0, 10)}` });
  if (f.dateTo) out.push({ key: "dateTo", label: `To: ${f.dateTo.slice(0, 10)}` });
  if (f.hasApplication) out.push({ key: "hasApplication", label: f.hasApplication === "true" ? "Has application" : "EOI only" });
  return out;
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

function Pager({
  total,
  limit,
  offset,
  qs,
}: {
  total: number;
  limit: number;
  offset: number;
  qs: URLSearchParams;
}) {
  const prev = Math.max(0, offset - limit);
  const next = offset + limit;
  const atStart = offset === 0;
  const atEnd = next >= total;

  const hrefFor = (newOffset: number): string => {
    const copy = new URLSearchParams(qs);
    copy.set("offset", String(newOffset));
    return `?${copy.toString()}`;
  };

  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-xs">
      <Link
        aria-disabled={atStart}
        href={atStart ? "#" : hrefFor(prev)}
        className={`rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold ${
          atStart ? "pointer-events-none opacity-40" : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
        }`}
      >
        ← Prev
      </Link>
      <Link
        aria-disabled={atEnd}
        href={atEnd ? "#" : hrefFor(next)}
        className={`rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold ${
          atEnd ? "pointer-events-none opacity-40" : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
        }`}
      >
        Next →
      </Link>
    </div>
  );
}
