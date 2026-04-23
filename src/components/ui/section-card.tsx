import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * A card with a deliberate shape: optional icon, title, subtitle,
 * body slot, and actions footer. Replaces the ad-hoc
 * "surface-card rounded-3xl p-5 with a <p> + <h3> + children" pattern
 * that had grown inconsistent across the portal.
 *
 * Design principle #5 — cards with intent.
 */

type SectionCardProps = {
  /** Optional icon rendered in a tinted circle to the left of the title. */
  icon?: ReactNode;
  /** Short uppercase accent ("ACTION ITEMS"). Already translated. */
  eyebrow?: string;
  /** Card title. Already translated. */
  title?: string;
  /** Subtitle rendered under the title. Already translated. */
  subtitle?: string;
  /** Right-aligned header controls (chips, links). */
  headerRight?: ReactNode;
  /** Main card body. */
  children?: ReactNode;
  /** Actions footer pinned below the body. */
  footer?: ReactNode;
  /** Visual tone — drives the left accent stripe. */
  tone?: "neutral" | "accent" | "positive" | "warning" | "danger" | "info";
  /** Render as a "sunken" read-only panel instead of an elevated card. */
  variant?: "elevated" | "sunken" | "bare";
  /** Optional id (for scroll-into-view anchors). */
  id?: string;
  className?: string;
};

const TONE_STRIPE: Record<NonNullable<SectionCardProps["tone"]>, string> = {
  neutral: "before:bg-[var(--ds-border)]",
  accent: "before:bg-[var(--ds-primary)]",
  positive: "before:bg-[#22c55e]",
  warning: "before:bg-[#f59e0b]",
  danger: "before:bg-[#ef4444]",
  info: "before:bg-[var(--ds-highlight)]",
};

const VARIANT_CLASS: Record<NonNullable<SectionCardProps["variant"]>, string> = {
  elevated:
    "bg-[var(--ds-surface)] border border-[var(--ds-border)] shadow-[var(--ds-shadow-soft)]",
  sunken: "bg-[var(--ds-soft)]/45 border border-[var(--ds-border)]/70",
  bare: "bg-transparent",
};

export function SectionCard({
  icon,
  eyebrow,
  title,
  subtitle,
  headerRight,
  children,
  footer,
  tone,
  variant = "elevated",
  id,
  className,
}: SectionCardProps) {
  const hasStripe = Boolean(tone);
  const hasHeader = Boolean(eyebrow || title || subtitle || headerRight || icon);

  return (
    <article
      id={id}
      className={cn(
        "relative rounded-3xl p-6 sm:p-7 transition-colors",
        VARIANT_CLASS[variant],
        hasStripe &&
          cn(
            "before:absolute before:left-0 before:top-6 before:bottom-6 before:w-1 before:rounded-full",
            TONE_STRIPE[tone!],
          ),
        className,
      )}
    >
      {hasHeader ? (
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-soft)] text-[var(--ds-primary)]">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h3
                  className={cn(
                    "text-[var(--ds-text-primary)]",
                    eyebrow ? "mt-1.5" : "",
                    "text-xl font-semibold leading-snug sm:text-[1.35rem]",
                  )}
                >
                  {title}
                </h3>
              ) : null}
              {subtitle ? (
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          {headerRight ? <div className="flex shrink-0 items-center gap-2">{headerRight}</div> : null}
        </header>
      ) : null}
      {children ? <div className={hasHeader ? "mt-5" : ""}>{children}</div> : null}
      {footer ? (
        <footer className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--ds-border)]/70 pt-5">
          {footer}
        </footer>
      ) : null}
    </article>
  );
}
