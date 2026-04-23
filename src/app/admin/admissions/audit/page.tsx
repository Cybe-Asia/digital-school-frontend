import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { AuditFilterBar } from "./audit-filter-bar";
import { EmptyState } from "@/app/admin/_components/empty-state";

export const metadata: Metadata = {
  title: "Audit Log | Admin",
};

const SESSION_COOKIE_NAME = "ds-session";
type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Event = {
  eventId: string;
  actorLeadId: string;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  diff?: string | null;
  createdAt: string;
};

type SP = Record<string, string | string[] | undefined>;
function param(sp: SP, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<SP> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return <div className="mx-auto max-w-3xl px-6 py-10 text-sm">Please log in first.</div>;

  const sp = await searchParams;
  const actorEmail = param(sp, "actorEmail") ?? "";
  const action = param(sp, "action") ?? "";
  const targetType = param(sp, "targetType") ?? "";
  const targetId = param(sp, "targetId") ?? "";
  const limit = Math.max(1, Math.min(500, parseInt(param(sp, "limit") ?? "100", 10) || 100));
  const offset = Math.max(0, parseInt(param(sp, "offset") ?? "0", 10) || 0);

  const qs = new URLSearchParams();
  if (actorEmail) qs.set("actorEmail", actorEmail);
  if (action) qs.set("action", action);
  if (targetType) qs.set("targetType", targetType);
  if (targetId) qs.set("targetId", targetId);
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));

  const { admission } = getServerServiceEndpoints();
  let events: Event[] = [];
  let httpStatus = 0;
  try {
    const res = await fetch(`${admission}/admin/audit?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    httpStatus = res.status;
    const payload = (await res.json().catch(() => null)) as ApiEnvelope<Event[]> | null;
    events = payload?.data ?? [];
  } catch {
    // upstream down
  }
  if (httpStatus === 403) {
    return <div className="mx-auto max-w-3xl px-6 py-10 text-sm"><h1 className="text-xl font-semibold">Admin access required</h1></div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="surface-card mb-6 rounded-3xl p-6 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg>
          </span>
          <div>
            <span className="eyebrow-chip">Audit trail</span>
            <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--ds-text-primary)]">Admin audit log</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-[var(--ds-text-secondary)]">
              Append-only record of every admin mutation. Newest first. Filters narrow the window.
            </p>
          </div>
        </div>
      </header>

      <AuditFilterBar initial={{ actorEmail, action, targetType, targetId }} />

      {events.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon="📜"
            title="No events match"
            description="Audit capture covers every admin mutation in the codebase. If the list is empty, the filter is narrowing it out — try clearing a field."
          />
        </div>
      ) : (
        <ol className="mt-6 space-y-2">
          {events.map((e) => {
            const targetHref = hrefForTarget(e.targetType, e.targetId);
            return (
              <li
                key={e.eventId}
                className="relative rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4 text-sm transition hover:border-[var(--ds-primary)]/40 hover:shadow-[var(--ds-shadow-soft)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3 min-w-0">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="10" /></svg>
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--ds-text-primary)]">
                        <span className="inline-flex items-center rounded-md bg-[var(--ds-soft)] px-1.5 py-0.5 font-mono text-[11px]">{e.action}</span>
                        <span className="mx-1.5 text-[var(--ds-text-secondary)]">→</span>
                        <span className="text-[var(--ds-text-secondary)]">{e.targetType}:</span>
                        {targetHref ? (
                          <Link href={targetHref} className="ml-0.5 font-mono text-xs text-[var(--ds-primary)] hover:underline">
                            {e.targetId}
                          </Link>
                        ) : (
                          <span className="ml-0.5 font-mono text-xs text-[var(--ds-text-primary)]">{e.targetId}</span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
                        by <span className="font-semibold text-[var(--ds-text-primary)]">{e.actorEmail ?? e.actorLeadId}</span> · {formatDate(e.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                {e.diff ? (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-[var(--ds-soft)]/60 p-3 text-[11px] leading-snug text-[var(--ds-text-primary)]">
                    {prettyJson(e.diff)}
                  </pre>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/**
 * Pick a sensible detail page for each target_type so admins can jump
 * from an audit row straight into the record. `settings` and `schedule`
 * land on their list/detail pages; bespoke ids (e.g. offer_id) return
 * null so we render them as plain text.
 */
function hrefForTarget(targetType: string, targetId: string): string | null {
  if (!targetId) return null;
  switch (targetType) {
    case "lead":
      return `/admin/admissions/leads/${encodeURIComponent(targetId)}`;
    case "student":
      return `/admin/admissions/students/${encodeURIComponent(targetId)}`;
    case "application":
      // application_id maps to a Lead; leaving as plain text for now.
      return null;
    case "offer":
      return `/admin/admissions/offers?search=${encodeURIComponent(targetId)}`;
    case "schedule":
      return `/admin/tests/schedules/${encodeURIComponent(targetId)}`;
    case "section":
      return `/admin/sis/sections/${encodeURIComponent(targetId)}`;
    case "settings":
      return `/admin/admissions/settings`;
    case "document_artifact":
      // Artifact detail lives under a request; we don't resolve the
      // owning request here cheaply, so link to the global queue.
      return `/admin/admissions/documents`;
    default:
      return null;
  }
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
