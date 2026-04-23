import { cn } from "@/shared/lib/cn";

/**
 * A single shared pill component for rendering an applicant / application
 * status. Colour buckets come from the admission-service taxonomy and are
 * intentionally the same across parent + admin surfaces so that e.g.
 * "enrolled" always reads as green, "rejected" always reads as red.
 *
 * Design principle #7 (status is always visible + consistent) lives here.
 */

export type StatusTone = "enrolled" | "in_progress" | "needs_action" | "rejected" | "draft";

const TONE_CLASS: Record<StatusTone, string> = {
  // green — enrolled, test_approved, documents_verified, offer_accepted
  enrolled: "bg-[#e3fcef] text-[#166534] border border-[#166534]/25",
  // blue — in motion but not stuck (submitted, test_scheduled, under review)
  in_progress: "bg-[#dbeafe] text-[#1e40af] border border-[#1e40af]/20",
  // amber — needs parent/admin action (test_pending, payment_pending, documents_pending)
  needs_action: "bg-[#fef3c7] text-[#92400e] border border-[#92400e]/25",
  // red — terminal negatives (rejected, withdrawn, test_failed, expired)
  rejected: "bg-[#fee9e9] text-[#8b1f1f] border border-[#8b1f1f]/25",
  // grey — draft / not_started
  draft: "bg-[var(--ds-soft)] text-[var(--ds-text-secondary)] border border-[var(--ds-border)]",
};

/**
 * Classify an admission-service status string into a visual tone bucket.
 * Mirrors `toneFor` in admissions-common/status-badge.tsx but lives here
 * too so this component doesn't depend on that module.
 */
export function statusToneFor(status: string): StatusTone {
  const s = status.toLowerCase();
  if (
    s === "enroled" ||
    s === "enrolled" ||
    s === "completed" ||
    s === "handed_to_sis" ||
    s === "enrolment_paid" ||
    s === "offer_accepted" ||
    s === "test_approved" ||
    s === "documents_verified" ||
    s === "application_fee_paid" ||
    s === "paid" ||
    s === "verified" ||
    s === "accepted" ||
    s === "offer_released"
  ) {
    return "enrolled";
  }
  if (
    s === "rejected" ||
    s === "expired" ||
    s === "withdrawn" ||
    s === "test_failed" ||
    s === "offer_declined" ||
    s === "failed"
  ) {
    return "rejected";
  }
  if (
    s === "payment_pending" ||
    s === "awaiting_payment" ||
    s === "awaiting_documents" ||
    s === "testing_in_progress" ||
    s === "under_review" ||
    s === "documents_pending" ||
    s === "test_pending" ||
    s === "pending" ||
    s === "payment_review"
  ) {
    return "needs_action";
  }
  if (
    s === "submitted" ||
    s === "application_in_progress" ||
    s === "lead_received" ||
    s === "assessment_scheduled" ||
    s === "test_scheduled" ||
    s === "test_completed" ||
    s === "offer_stage" ||
    s === "offer_issued"
  ) {
    return "in_progress";
  }
  return "draft";
}

type StatusPillProps = {
  /** User-visible label. Do not pass an i18n key — translate at the call site. */
  label: string;
  /** Either the raw status string (we'll classify it) or an explicit tone. */
  status?: string;
  tone?: StatusTone;
  size?: "sm" | "md";
  className?: string;
};

export function StatusPill({ label, status, tone, size = "md", className }: StatusPillProps) {
  const resolvedTone: StatusTone = tone ?? (status ? statusToneFor(status) : "draft");
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-[0.08em]",
        padding,
        TONE_CLASS[resolvedTone],
        className,
      )}
    >
      {label}
    </span>
  );
}
