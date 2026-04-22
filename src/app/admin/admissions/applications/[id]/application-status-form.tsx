"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const STATUSES = [
  "draft",
  "submitted",
  "payment_pending",
  "application_fee_paid",
  "testing_in_progress",
  "under_review",
  "documents_pending",
  "offer_stage",
  "completed",
  "withdrawn",
  "expired",
  "rejected",
] as const;

type Props = {
  /** Lead id — backend resolves to the linked Application. */
  leadId: string;
  currentStatus: string;
};

/**
 * Client-side dropdown the admin uses to walk an Application through its
 * lifecycle (spec §4.4). Posts to /api/admin/applications/:id/status
 * which proxies to admission-service; on success, calls router.refresh()
 * so the server-rendered detail page re-fetches and shows the new
 * status pill without a full reload.
 */
export function ApplicationStatusForm({ leadId, currentStatus }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty = value !== currentStatus;

  const onSave = async () => {
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/applications/${encodeURIComponent(leadId)}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: value }),
        },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      // Refetch the server component so the status pill + summary update.
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
        Advance status
      </label>
      <select
        className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-sm text-[var(--ds-text-primary)]"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isPending}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!dirty || isPending}
        onClick={onSave}
        className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
      {error ? <span className="text-xs text-[#8b1f1f]">{error}</span> : null}
    </div>
  );
}
