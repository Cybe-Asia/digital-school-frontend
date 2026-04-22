"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const STATUSES = [
  "draft",
  "submitted",
  "test_pending",
  "test_scheduled",
  "test_completed",
  "test_approved",
  "test_failed",
  "documents_pending",
  "documents_verified",
  "offer_issued",
  "offer_accepted",
  "offer_declined",
  "enrolment_paid",
  "handed_to_sis",
  "rejected",
  "withdrawn",
] as const;

type Props = {
  studentId: string;
  currentStatus: string;
};

/**
 * Admin-only per-child status dropdown. Sits under each student card on
 * the application detail page. Idempotent: Save is disabled until the
 * user actually changes the dropdown, then POSTs to the per-student
 * transition proxy and refreshes the server-rendered page.
 */
export function StudentStatusForm({ studentId, currentStatus }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty = value !== currentStatus;

  const onSave = async () => {
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/students/${encodeURIComponent(studentId)}/status`,
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
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1 text-xs text-[var(--ds-text-primary)]"
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
        className="rounded-lg bg-[var(--ds-primary)] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
      {error ? <span className="text-xs text-[#8b1f1f]">{error}</span> : null}
    </div>
  );
}
