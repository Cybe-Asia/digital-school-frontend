import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { AuditFilterBar } from "./audit-filter-bar";

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
        <div className="mt-5 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-10 text-center text-sm text-[var(--ds-text-secondary)]">
          No events match. Audit capture is wired into the highest-signal mutations
          (lead status override, settings upsert, offer issue/cancel); more will
          be added incrementally.
        </div>
      ) : (
        <ol className="mt-5 space-y-2">
          {events.map((e) => (
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
                    <span className="ml-0.5 font-mono text-xs text-[var(--ds-text-primary)]">{e.targetId}</span>
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
          ))}
        </ol>
      )}
    </div>
  );
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
