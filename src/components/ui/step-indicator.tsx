import { cn } from "@/shared/lib/cn";

/**
 * Progress strip shown at the top of setup-account pages so parents
 * always know "am I nearly done".
 *
 * Design principle #9. Not a replacement for navigation — just an
 * at-a-glance "Step 2 of 5: Add students" affordance. Read-only.
 */

export type Step = {
  /** Short label rendered below the dot on wider screens. */
  label: string;
};

type StepIndicatorProps = {
  steps: Step[];
  /** Zero-based index of the currently active step. */
  currentIndex: number;
  /** Localized "Step X of Y" headline. Pass the translated value. */
  summaryLabel?: string;
  className?: string;
};

export function StepIndicator({ steps, currentIndex, summaryLabel, className }: StepIndicatorProps) {
  if (steps.length === 0) {
    return null;
  }

  const safeIndex = Math.max(0, Math.min(currentIndex, steps.length - 1));
  const progressPct = Math.round(((safeIndex + 1) / steps.length) * 100);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3 sm:p-4",
        className,
      )}
    >
      {summaryLabel ? (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
          {summaryLabel}
        </p>
      ) : null}

      <div
        className="relative h-1.5 overflow-hidden rounded-full bg-[var(--ds-border)]/60"
        role="progressbar"
        aria-valuenow={safeIndex + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={summaryLabel ?? "Progress"}
      >
        <div
          className="absolute inset-y-0 left-0 bg-[var(--ds-primary)] transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <ol className="mt-3 flex items-center justify-between gap-1">
        {steps.map((step, idx) => {
          const isPast = idx < safeIndex;
          const isCurrent = idx === safeIndex;
          return (
            <li
              key={`${step.label}-${idx}`}
              className="flex flex-1 flex-col items-center gap-1"
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  isPast
                    ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
                    : isCurrent
                      ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)] ring-4 ring-[var(--ds-primary)]/20"
                      : "bg-[var(--ds-border)] text-[var(--ds-text-secondary)]",
                )}
              >
                {isPast ? (
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden text-center text-[10px] font-semibold leading-tight sm:block",
                  isCurrent
                    ? "text-[var(--ds-primary)]"
                    : isPast
                      ? "text-[var(--ds-text-primary)]"
                      : "text-[var(--ds-text-secondary)]",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
