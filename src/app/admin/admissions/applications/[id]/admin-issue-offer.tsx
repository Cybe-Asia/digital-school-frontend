"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  studentId: string;
  /** Student's applicantStatus from /admin/applications detail —
   *  drives whether the button is enabled. Backend re-enforces too. */
  applicantStatus: string;
  /** Offer's target school. Defaults to the school from the Lead. */
  defaultSchoolId: string;
};

/**
 * Admin button + small form to issue an Offer for one applicant.
 * Requires the kid to be in `documents_verified`; backend 409s
 * otherwise. Default acceptance window is 14 days; admin can edit.
 */
export function AdminIssueOfferButton({ studentId, applicantStatus, defaultSchoolId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [schoolId, setSchoolId] = useState(defaultSchoolId || "SCH-IISS");
  const [yearGroup, setYearGroup] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [daysToAccept, setDaysToAccept] = useState(14);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const eligible = applicantStatus === "documents_verified";

  const onSubmit = async () => {
    setError(null);
    const due = new Date();
    due.setDate(due.getDate() + daysToAccept);
    try {
      const res = await fetch(
        `/api/admin/students/${encodeURIComponent(studentId)}/offer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetSchoolId: schoolId,
            targetYearGroup: yearGroup || null,
            academicYear: academicYear || null,
            acceptanceDueAt: due.toISOString(),
            decisionNotes: notes || null,
          }),
        },
      );
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (!eligible) {
    return (
      <p className="text-xs text-[var(--ds-text-secondary)]">
        Offer: available once student reaches{" "}
        <code className="rounded bg-[var(--ds-soft)] px-1">documents_verified</code>.
      </p>
    );
  }

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-[var(--ds-primary)]/40 bg-[var(--ds-primary)]/5 px-3 py-1.5 text-xs font-semibold text-[var(--ds-primary)] hover:bg-[var(--ds-primary)]/10"
        >
          + Issue offer
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
        Issue offer
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field label="Target school">
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            className={INPUT_CLS}
          >
            <option value="SCH-IIHS">IIHS</option>
            <option value="SCH-IISS">IISS</option>
          </select>
        </Field>
        <Field label="Year group">
          <input
            type="text"
            placeholder="e.g. Grade 7"
            value={yearGroup}
            onChange={(e) => setYearGroup(e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Academic year">
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Accept within (days)">
          <input
            type="number"
            min={1}
            value={daysToAccept}
            onChange={(e) => setDaysToAccept(parseInt(e.target.value, 10) || 14)}
            className={INPUT_CLS}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notes (internal)">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-[#8b1f1f]">{error}</p> : null}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          {isPending ? "Issuing…" : "Issue offer"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={isPending}
          className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ds-text-primary)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2 py-1 text-xs";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-[var(--ds-text-secondary)]">
      <span className="mb-0.5 block uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}
