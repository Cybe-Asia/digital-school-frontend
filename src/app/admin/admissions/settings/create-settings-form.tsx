"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/app/admin/toast";

const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm text-[var(--ds-text-primary)]";

export function CreateSettingsForm() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState({
    school_id: "SCH-IISS",
    academic_year: new Date().getFullYear().toString(),
    application_fee_amount: 500000,
    enrolment_fee_amount: 5000000,
    default_offer_days: 14,
    required_documents: "birth_certificate,family_card,transcript,photo",
    terms_version: "v1.0",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/admin/settings/${encodeURIComponent(state.school_id)}/${encodeURIComponent(state.academic_year)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            application_fee_amount: state.application_fee_amount,
            enrolment_fee_amount: state.enrolment_fee_amount,
            default_offer_days: state.default_offer_days,
            required_documents: state.required_documents,
            terms_version: state.terms_version,
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
      toast.success(`Created ${state.school_id} · ${state.academic_year}`);
      startTransition(() => router.refresh());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4"
    >
      <p className="text-sm font-semibold text-[var(--ds-text-primary)]">Create / update settings</p>
      <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
        POSTing the same (school, AY) combo updates the existing row.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="block text-xs font-semibold text-[var(--ds-text-secondary)]">
          <span className="mb-0.5 block uppercase tracking-wider">School</span>
          <select
            value={state.school_id}
            onChange={(e) => setState({ ...state, school_id: e.target.value })}
            className={INPUT_CLS}
          >
            <option value="SCH-IIHS">IIHS</option>
            <option value="SCH-IISS">IISS</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-[var(--ds-text-secondary)]">
          <span className="mb-0.5 block uppercase tracking-wider">Academic year</span>
          <input
            value={state.academic_year}
            onChange={(e) => setState({ ...state, academic_year: e.target.value })}
            className={INPUT_CLS}
          />
        </label>
        <label className="block text-xs font-semibold text-[var(--ds-text-secondary)]">
          <span className="mb-0.5 block uppercase tracking-wider">App fee (IDR)</span>
          <input
            type="number"
            min={0}
            value={state.application_fee_amount}
            onChange={(e) => setState({ ...state, application_fee_amount: parseInt(e.target.value || "0", 10) })}
            className={INPUT_CLS}
          />
        </label>
        <label className="block text-xs font-semibold text-[var(--ds-text-secondary)]">
          <span className="mb-0.5 block uppercase tracking-wider">Enrolment fee (IDR)</span>
          <input
            type="number"
            min={0}
            value={state.enrolment_fee_amount}
            onChange={(e) => setState({ ...state, enrolment_fee_amount: parseInt(e.target.value || "0", 10) })}
            className={INPUT_CLS}
          />
        </label>
        <label className="block text-xs font-semibold text-[var(--ds-text-secondary)]">
          <span className="mb-0.5 block uppercase tracking-wider">Accept within (days)</span>
          <input
            type="number"
            min={1}
            max={365}
            value={state.default_offer_days}
            onChange={(e) => setState({ ...state, default_offer_days: parseInt(e.target.value || "14", 10) })}
            className={INPUT_CLS}
          />
        </label>
        <label className="block text-xs font-semibold text-[var(--ds-text-secondary)] sm:col-span-2">
          <span className="mb-0.5 block uppercase tracking-wider">Required docs</span>
          <input
            value={state.required_documents}
            onChange={(e) => setState({ ...state, required_documents: e.target.value })}
            className={INPUT_CLS}
          />
        </label>
        <label className="block text-xs font-semibold text-[var(--ds-text-secondary)]">
          <span className="mb-0.5 block uppercase tracking-wider">Terms version</span>
          <input
            value={state.terms_version}
            onChange={(e) => setState({ ...state, terms_version: e.target.value })}
            className={INPUT_CLS}
          />
        </label>
      </div>
      <div className="mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Save settings
        </button>
      </div>
    </form>
  );
}
