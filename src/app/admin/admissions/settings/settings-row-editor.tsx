"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/app/admin/toast";
import type { Settings } from "./page";

const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm text-[var(--ds-text-primary)]";

/**
 * Inline editor for one (school, AY) settings row. Expands into the
 * full form when the admin clicks Edit; Cancel discards, Save upserts.
 * Uses the toast system for feedback so the list stays quiet when idle.
 */
export function SettingsRowEditor({ initial }: { initial: Settings }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(initial);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/admin/settings/${encodeURIComponent(initial.schoolId)}/${encodeURIComponent(initial.academicYear)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application_fee_amount: state.applicationFeeAmount,
            enrolment_fee_amount: state.enrolmentFeeAmount,
            default_offer_days: state.defaultOfferDays,
            required_documents: state.requiredDocuments,
            terms_version: state.termsVersion,
          }),
        },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        toast.error(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      toast.success(`Saved ${initial.schoolId} · ${initial.academicYear}`);
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  const cancel = () => {
    setState(initial);
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4">
        <div>
          <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
            {initial.schoolId} · AY {initial.academicYear}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
            App fee {formatIDR(initial.applicationFeeAmount)} · Enrolment fee {formatIDR(initial.enrolmentFeeAmount)} ·
            Accept in {initial.defaultOfferDays}d · Terms {initial.termsVersion || "(none)"}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--ds-text-secondary)]/80">
            Last updated {initial.updatedAt ? formatDate(initial.updatedAt) : "—"}
            {initial.updatedBy ? ` by ${initial.updatedBy.slice(0, 12)}…` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-[var(--ds-primary)]/40 bg-[var(--ds-primary)]/5 px-3 py-1.5 text-xs font-semibold text-[var(--ds-primary)] hover:bg-[var(--ds-primary)]/10"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="rounded-2xl border border-[var(--ds-primary)]/40 bg-[var(--ds-surface)] p-4">
      <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
        {initial.schoolId} · AY {initial.academicYear}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Application fee (IDR)">
          <input
            type="number"
            min={0}
            value={state.applicationFeeAmount}
            onChange={(e) => setState({ ...state, applicationFeeAmount: parseInt(e.target.value || "0", 10) })}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Enrolment fee (IDR)">
          <input
            type="number"
            min={0}
            value={state.enrolmentFeeAmount}
            onChange={(e) => setState({ ...state, enrolmentFeeAmount: parseInt(e.target.value || "0", 10) })}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Accept within (days)">
          <input
            type="number"
            min={1}
            max={365}
            value={state.defaultOfferDays}
            onChange={(e) => setState({ ...state, defaultOfferDays: parseInt(e.target.value || "14", 10) })}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Required documents (comma-separated)">
          <input
            type="text"
            placeholder="birth_certificate, family_card, transcript, photo"
            value={state.requiredDocuments}
            onChange={(e) => setState({ ...state, requiredDocuments: e.target.value })}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Terms version">
          <input
            type="text"
            placeholder="v1.2"
            value={state.termsVersion}
            onChange={(e) => setState({ ...state, termsVersion: e.target.value })}
            className={INPUT_CLS}
          />
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Save
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={isPending}
          className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-sm font-semibold text-[var(--ds-text-primary)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-[var(--ds-text-secondary)]">
      <span className="mb-0.5 block uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function formatIDR(n: number): string {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return String(n);
  }
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
