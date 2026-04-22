"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ScheduleActions({
  scheduleId,
  scheduleStatus,
}: {
  scheduleId: string;
  scheduleStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const cancel = async () => {
    if (!window.confirm("Cancel this schedule? All active bookings will be cancelled too.")) return;
    setErr(null); setOk(null);
    try {
      const res = await fetch(
        `/api/admin/tests/schedules/${encodeURIComponent(scheduleId)}/cancel`,
        { method: "POST" },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setErr(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      setOk("Schedule cancelled");
      startTransition(() => router.refresh());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const cancellable = scheduleStatus === "scheduled" || scheduleStatus === "closed";

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
        Actions
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/admin/tests/schedules/${encodeURIComponent(scheduleId)}/attendance.csv`}
          download
          className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
        >
          Download attendance CSV ↓
        </a>
        <button
          type="button"
          onClick={cancel}
          disabled={isPending || !cancellable}
          className="rounded-lg border border-[#b42318]/30 bg-[#fee9e9]/60 px-3 py-1.5 text-xs font-semibold text-[#8b1f1f] hover:bg-[#fee9e9] disabled:cursor-not-allowed disabled:opacity-40"
          title={cancellable ? "Cancel schedule + roll back active bookings" : "Only scheduled/closed can be cancelled"}
        >
          Cancel schedule
        </button>
      </div>
      {err ? <p className="text-xs text-[#8b1f1f]">{err}</p> : null}
      {ok ? <p className="text-xs text-[#166534]">{ok}</p> : null}
    </div>
  );
}
