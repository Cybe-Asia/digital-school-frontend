"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/app/admin/toast";

/**
 * Admin-side action buttons for a single lead. Each action POSTs to the
 * matching admin-scoped proxy, which forwards the session JWT to
 * admission-service. On success we `router.refresh()` so the server
 * component re-renders the updated status / notes.
 */
export function LeadActionsPanel({
  leadId,
  leadStatus,
}: {
  leadId: string;
  leadStatus: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [statusOverride, setStatusOverride] = useState(leadStatus);

  const resend = async () => {
    try {
      const res = await fetch(
        `/api/admin/leads/${encodeURIComponent(leadId)}/resend-verification`,
        { method: "POST" },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        toast.error(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      toast.success("Verification email queued");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  const addNote = async () => {
    const body = note.trim();
    if (!body) return;
    try {
      const res = await fetch(
        `/api/admin/leads/${encodeURIComponent(leadId)}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        },
      );
      const payload = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (payload?.responseCode ?? res.status) >= 400) {
        toast.error(payload?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      setNote("");
      toast.success("Note added");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  const saveStatus = async () => {
    if (statusOverride === leadStatus) return;
    try {
      const res = await fetch(
        `/api/admin/leads/${encodeURIComponent(leadId)}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusOverride }),
        },
      );
      const payload = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (payload?.responseCode ?? res.status) >= 400) {
        toast.error(payload?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      toast.success(`Lead status set to ${statusOverride}`);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  const markDropped = async () => {
    if (!window.confirm("Mark this lead as dropped? They'll still be visible in filtered lists.")) return;
    setStatusOverride("dropped");
    try {
      const res = await fetch(
        `/api/admin/leads/${encodeURIComponent(leadId)}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "dropped" }),
        },
      );
      const payload = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (payload?.responseCode ?? res.status) >= 400) {
        toast.error(payload?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      toast.success("Lead marked dropped");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="mt-3 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Verification
        </p>
        <button
          type="button"
          onClick={resend}
          disabled={isPending || leadStatus !== "new"}
          className="mt-2 w-full rounded-lg border border-[var(--ds-primary)]/40 bg-[var(--ds-primary)]/5 px-3 py-2 text-xs font-semibold text-[var(--ds-primary)] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[var(--ds-primary)]/10"
          title={
            leadStatus !== "new"
              ? "Only available for leads still in 'new' state"
              : "Send a fresh verification email"
          }
        >
          Resend verification email
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Override status
        </p>
        <div className="mt-2 flex items-center gap-2">
          <select
            value={statusOverride}
            onChange={(e) => setStatusOverride(e.target.value)}
            className="w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2 py-1.5 text-xs"
          >
            <option value="new">new</option>
            <option value="verified">verified</option>
            <option value="paid">paid</option>
            <option value="dropped">dropped</option>
          </select>
          <button
            type="button"
            onClick={saveStatus}
            disabled={isPending || statusOverride === leadStatus}
            className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </button>
        </div>
        <button
          type="button"
          onClick={markDropped}
          disabled={isPending || leadStatus === "dropped"}
          className="mt-2 w-full rounded-lg border border-[#b42318]/30 bg-[#fee9e9]/60 px-3 py-1.5 text-xs font-semibold text-[#8b1f1f] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#fee9e9]"
        >
          Mark as dropped
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Internal note
        </p>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Jot something only admins will see…"
          maxLength={4000}
          className="mt-2 w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={isPending || note.trim().length === 0}
          className="mt-2 w-full rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add note
        </button>
      </div>
    </div>
  );
}
