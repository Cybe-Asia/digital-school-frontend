"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const ATTENDANCE_OPTIONS = [
  "scheduled",
  "checked_in",
  "completed",
  "absent",
  "cancelled",
  "rescheduled",
];

const RESULT_OPTIONS = ["pass", "fail", "borderline", "pending_review"];
const REVIEW_OPTIONS = [
  { value: "", label: "— no review yet —" },
  { value: "approved_for_next_stage", label: "Approve → test_approved" },
  { value: "declined", label: "Decline → test_failed" },
  { value: "needs_second_review", label: "Needs second review" },
];

export type SessionCardSession = {
  testSessionId: string;
  applicantStudentId: string;
  testCode: string;
  attendanceStatus: string;
  checkedInAt?: string | null;
  completedAt?: string | null;
};

export type SessionCardResult = {
  resultStatus?: string;
  scoreTotal?: number | null;
  reviewOutcome?: string | null;
  reviewNotes?: string | null;
} | null;

type Props = {
  session: SessionCardSession;
  studentName?: string;
  existingResult: SessionCardResult;
};

/**
 * Admin card representing one TestSession. Offers two controls stacked:
 *   - Attendance dropdown — walks the session through scheduled → checked_in
 *     → completed (or absent/cancelled/rescheduled).
 *   - Result form — score + review outcome. The review outcome is what
 *     auto-advances the ApplicantStudent to test_approved or test_failed.
 *
 * Both actions POST to the respective proxy and router.refresh() the
 * server-rendered detail page to see the new state.
 */
export function SessionRow({ session, studentName, existingResult }: Props) {
  const router = useRouter();
  const [attendance, setAttendance] = useState(session.attendanceStatus);
  const [resultStatus, setResultStatus] = useState(existingResult?.resultStatus ?? "pending_review");
  const [score, setScore] = useState<string>(
    existingResult?.scoreTotal != null ? String(existingResult.scoreTotal) : "",
  );
  const [reviewOutcome, setReviewOutcome] = useState<string>(existingResult?.reviewOutcome ?? "");
  const [reviewNotes, setReviewNotes] = useState<string>(existingResult?.reviewNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const saveAttendance = async () => {
    setError(null);
    const res = await fetch(
      `/api/admin/tests/sessions/${encodeURIComponent(session.testSessionId)}/attendance`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: attendance }),
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
  };

  const saveResult = async () => {
    setError(null);
    const scoreNum = score.trim() === "" ? null : parseFloat(score);
    const res = await fetch(
      `/api/admin/tests/sessions/${encodeURIComponent(session.testSessionId)}/result`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultStatus,
          scoreTotal: scoreNum,
          reviewOutcome: reviewOutcome || null,
          reviewNotes: reviewNotes || null,
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
    startTransition(() => router.refresh());
  };

  return (
    <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
            {studentName ?? session.applicantStudentId}
          </p>
          <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
            Code: {session.testCode}
            {session.checkedInAt ? ` · checked-in: ${formatDt(session.checkedInAt)}` : ""}
            {session.completedAt ? ` · completed: ${formatDt(session.completedAt)}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {/* Attendance block */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            Attendance
          </p>
          <div className="flex items-center gap-2">
            <select
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1 text-xs"
            >
              {ATTENDANCE_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={saveAttendance}
              disabled={isPending || attendance === session.attendanceStatus}
              className="rounded-lg bg-[var(--ds-primary)] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>

        {/* Result block */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            Result
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={resultStatus}
              onChange={(e) => setResultStatus(e.target.value)}
              className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1 text-xs"
            >
              {RESULT_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.1"
              placeholder="score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-20 rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2 py-1 text-xs"
            />
          </div>
          <select
            value={reviewOutcome}
            onChange={(e) => setReviewOutcome(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1 text-xs"
          >
            {REVIEW_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <textarea
            rows={2}
            placeholder="Review notes (optional)"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1 text-xs"
          />
          <div className="mt-1">
            <button
              type="button"
              onClick={saveResult}
              disabled={isPending}
              className="rounded-lg bg-[var(--ds-primary)] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
            >
              {isPending ? "Saving…" : "Save result"}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-[#b42318]/15 bg-[#fee9e9] px-3 py-2 text-xs text-[#8b1f1f]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function formatDt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
