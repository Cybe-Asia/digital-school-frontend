import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * A tall, visually confident hero for the top of index / overview pages.
 * Unlike <PageHeader />, this is the "we hired a real product designer"
 * piece — distinct gradient surface, big H1, eyebrow chip, room for a
 * right-aligned action cluster.
 *
 * Content flow: eyebrow (context) → H1 (who/what) → subtitle (one line)
 * → pills / meta row → actions. Design principles #1, #2, #3.
 */

type PageHeroProps = {
  /** Small uppercase accent above the H1. Already translated. */
  eyebrow?: string;
  /** Primary H1. Already translated. */
  title: string;
  /** One-line context string (already translated). */
  subtitle?: string;
  /** Optional meta row — render pills, chips, counters, etc. */
  meta?: ReactNode;
  /** Right-aligned action cluster (CTAs). */
  actions?: ReactNode;
  /** Extra detail panel pinned to the right at xl breakpoints. */
  aside?: ReactNode;
  /** Control vertical rhythm. `lg` for marquee pages, `md` for most. */
  size?: "md" | "lg";
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  aside,
  size = "md",
  className,
}: PageHeroProps) {
  const titleCls =
    size === "lg"
      ? "text-[1.75rem] sm:text-[2.1rem] lg:text-[2.4rem]"
      : "text-2xl sm:text-[1.9rem]";

  return (
    <section
      className={cn(
        "hero-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10",
        className,
      )}
    >
      {/* Ambient color splashes — pulled from the theme vars so dark
          variants stay coherent. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--ds-radial-a)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[var(--ds-radial-b)] blur-3xl"
      />

      <div
        className={cn(
          "relative grid gap-6",
          aside ? "xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]" : "",
        )}
      >
        <div className="min-w-0">
          {eyebrow ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ds-primary)]" aria-hidden="true" />
              {eyebrow}
            </span>
          ) : null}
          <h1
            className={cn(
              "mt-4 font-semibold leading-[1.08] tracking-tight text-[var(--ds-text-primary)]",
              titleCls,
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ds-text-secondary)]">
              {subtitle}
            </p>
          ) : null}
          {meta ? <div className="mt-5 flex flex-wrap items-center gap-2">{meta}</div> : null}
          {actions ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}
