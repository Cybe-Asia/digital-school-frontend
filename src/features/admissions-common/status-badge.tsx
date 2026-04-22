/**
 * Shared status badge + stepper used by both parent dashboard and admin
 * review queue. Keeps the color scheme consistent across the app so a
 * "test_approved" pill looks the same everywhere.
 *
 * Status taxonomy comes from admission-service:
 *   - Application-level (§4.4): draft, submitted, payment_pending,
 *     application_fee_paid, testing_in_progress, under_review,
 *     documents_pending, offer_stage, completed, withdrawn, expired,
 *     rejected
 *   - ApplicantStudent-level: draft, submitted, test_pending,
 *     test_scheduled, test_completed, test_approved, test_failed,
 *     documents_pending, documents_verified, offer_issued,
 *     offer_accepted, offer_declined, enrolment_paid, handed_to_sis,
 *     rejected, withdrawn
 *
 * Both taxonomies share the same color buckets below.
 */

type Tone = "neutral" | "info" | "warn" | "success" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-[var(--ds-soft)] text-[var(--ds-text-primary)]",
  info: "bg-[#dbeafe] text-[#1e40af]",
  warn: "bg-[#fef3c7] text-[#92400e]",
  success: "bg-[#e3fcef] text-[#166534]",
  danger: "bg-[#fee9e9] text-[#8b1f1f]",
};

/** Classify a status string into a color bucket. */
export function toneFor(status: string): Tone {
  const s = status.toLowerCase();
  if (
    s === "completed" ||
    s === "handed_to_sis" ||
    s === "enrolment_paid" ||
    s === "offer_accepted" ||
    s === "test_approved" ||
    s === "documents_verified" ||
    s === "application_fee_paid" ||
    s === "paid" ||
    s === "verified"
  ) {
    return "success";
  }
  if (
    s === "rejected" ||
    s === "expired" ||
    s === "withdrawn" ||
    s === "test_failed" ||
    s === "offer_declined" ||
    s === "failed"
  ) {
    return "danger";
  }
  if (
    s === "payment_pending" ||
    s === "testing_in_progress" ||
    s === "under_review" ||
    s === "documents_pending" ||
    s === "test_pending" ||
    s === "test_scheduled" ||
    s === "pending"
  ) {
    return "warn";
  }
  if (
    s === "submitted" ||
    s === "offer_stage" ||
    s === "offer_issued" ||
    s === "test_completed"
  ) {
    return "info";
  }
  return "neutral";
}

/** Replace underscores with spaces and title-case for display. */
export function prettifyStatus(status: string): string {
  return status
    .split("_")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

type StatusBadgeProps = {
  status: string;
  /** Optional: override pretty label (useful for i18n keys). */
  label?: string;
  /** `md` is the default; `sm` for dense tables. */
  size?: "sm" | "md";
};

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const tone = toneFor(status);
  const cls = TONE_CLASSES[tone];
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs";
  return (
    <span className={`inline-block rounded-full font-semibold ${padding} ${cls}`}>
      {label ?? prettifyStatus(status)}
    </span>
  );
}

// ---- Stepper ---------------------------------------------------------------

/**
 * Canonical happy-path stages for an ApplicantStudent. Terminals
 * (rejected/withdrawn/declined/failed) are rendered separately as a
 * "Rejected at {stage}" badge rather than occupying a step slot.
 */
const STUDENT_HAPPY_PATH: { key: string; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "test_pending", label: "Test" },
  { key: "test_approved", label: "Test passed" },
  { key: "documents_pending", label: "Documents" },
  { key: "documents_verified", label: "Docs verified" },
  { key: "offer_issued", label: "Offer" },
  { key: "offer_accepted", label: "Accepted" },
  { key: "enrolment_paid", label: "Enrolled" },
];

/** Earlier statuses that collapse onto a step. */
const STATUS_TO_STEP_INDEX: Record<string, number> = {
  draft: 0,
  submitted: 0,
  test_pending: 1,
  test_scheduled: 1,
  test_completed: 1,
  test_approved: 2,
  test_failed: 2,
  documents_pending: 3,
  documents_verified: 4,
  offer_issued: 5,
  offer_accepted: 6,
  offer_declined: 5,
  enrolment_paid: 7,
  handed_to_sis: 7,
};

const TERMINAL_NEGATIVE = new Set(["rejected", "withdrawn", "test_failed", "offer_declined"]);

type StudentStepperProps = {
  status: string;
};

/**
 * Horizontal progress bar showing where an ApplicantStudent is in the
 * funnel. Highlights the current step, greens out completed ones, and
 * greys out future ones. Surfaces terminal failure inline.
 */
export function StudentStatusStepper({ status }: StudentStepperProps) {
  const isTerminalNegative = TERMINAL_NEGATIVE.has(status);
  const currentIdx = STATUS_TO_STEP_INDEX[status] ?? 0;

  return (
    <div className="space-y-2">
      <ol className="flex w-full items-center gap-1">
        {STUDENT_HAPPY_PATH.map((step, idx) => {
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx && !isTerminalNegative;
          const isFuture = idx > currentIdx;
          const dotClass = isPast
            ? "bg-[#166534]"
            : isCurrent
            ? "bg-[var(--ds-primary)] ring-4 ring-[var(--ds-primary)]/20"
            : "bg-[var(--ds-border)]";
          const lineClass = isPast ? "bg-[#166534]" : "bg-[var(--ds-border)]";
          return (
            <li
              key={step.key}
              className="flex flex-1 flex-col items-center gap-1.5"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex w-full items-center">
                <div
                  className={`h-1 flex-1 ${idx === 0 ? "bg-transparent" : lineClass}`}
                />
                <div className={`h-3 w-3 shrink-0 rounded-full ${dotClass}`} />
                <div
                  className={`h-1 flex-1 ${
                    idx === STUDENT_HAPPY_PATH.length - 1 ? "bg-transparent" : isFuture ? "bg-[var(--ds-border)]" : lineClass
                  }`}
                />
              </div>
              <span
                className={`text-center text-[10px] font-medium leading-tight ${
                  isCurrent
                    ? "text-[var(--ds-primary)]"
                    : isPast
                    ? "text-[#166534]"
                    : "text-[var(--ds-text-secondary)]"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      {isTerminalNegative ? (
        <div className="rounded-lg border border-[#b42318]/15 bg-[#fee9e9] px-3 py-2 text-xs text-[#8b1f1f]">
          {prettifyStatus(status)}
        </div>
      ) : null}
    </div>
  );
}
