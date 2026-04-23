import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Empty-state primitive — visual + heading + explanation + optional CTA.
 * Replaces "No results." plaintext rows scattered across list pages.
 *
 * Design principle #6 — empty states get a real designed shape.
 */

type EmptyStateProps = {
  /** Visual element — an SVG, an emoji, or an <Image />. */
  icon?: ReactNode;
  /** H4-level heading. Already translated. */
  title: string;
  /** One-sentence explainer. Already translated. */
  description?: string;
  /** Optional primary action (Link or Button). */
  action?: ReactNode;
  /** Optional secondary action. */
  secondaryAction?: ReactNode;
  /** Tighten the padding for inline empty states inside existing cards. */
  compact?: boolean;
  className?: string;
};

/**
 * Default illustration — a friendly mascot-style circle that echoes the
 * brand's round, soft aesthetic without bloating the bundle with an
 * actual image asset.
 */
function DefaultIllustration() {
  return (
    <svg
      viewBox="0 0 96 96"
      className="h-20 w-20"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="empty-state-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--ds-primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--ds-accent)" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="44" fill="url(#empty-state-grad)" />
      <path
        d="M28 54h40M34 40h28M40 68h16"
        stroke="var(--ds-primary)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="48" cy="28" r="6" fill="var(--ds-accent)" opacity="0.85" />
    </svg>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[var(--ds-border)] bg-[var(--ds-soft)]/35 text-center",
        compact ? "px-5 py-8" : "px-6 py-12 sm:py-16",
        className,
      )}
    >
      <div className="shrink-0">{icon ?? <DefaultIllustration />}</div>
      <div className="max-w-md space-y-1.5">
        <p className="text-lg font-semibold text-[var(--ds-text-primary)] sm:text-xl">
          {title}
        </p>
        {description ? (
          <p className="text-sm leading-relaxed text-[var(--ds-text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {action || secondaryAction ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
