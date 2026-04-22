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
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
          Admissions
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">Audit log</h1>
        <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
          Append-only record of admin actions. Newest first. Filters narrow the window.
        </p>
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
        <ol className="mt-5 space-y-2">
          {events.map((e) => {
            const targetHref = hrefForTarget(e.targetType, e.targetId);
            return (
              <li
                key={e.eventId}
                className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--ds-text-primary)]">
                      <span className="font-mono text-xs">{e.action}</span>
                      {" → "}
                      <span className="text-[var(--ds-text-secondary)]">{e.targetType}:</span>
                      {targetHref ? (
                        <Link href={targetHref} className="ml-0.5 font-mono text-xs text-[var(--ds-primary)] hover:underline">
                          {e.targetId}
                        </Link>
                      ) : (
                        <span className="ml-0.5 font-mono text-xs text-[var(--ds-text-primary)]">{e.targetId}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
                      by {e.actorEmail ?? e.actorLeadId} · {formatDate(e.createdAt)}
                    </p>
                  </div>
                </div>
                {e.diff ? (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--ds-soft)] p-2 text-[11px] leading-snug text-[var(--ds-text-primary)]">
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
