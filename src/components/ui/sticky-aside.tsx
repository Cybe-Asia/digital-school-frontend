import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * A small sticky section-nav primitive used on per-application pages so
 * the five section links (Overview / Payment / Documents / Schedule /
 * Decision) remain visible as the user scrolls. Each item may surface a
 * pending-action badge so "Documents (2)" reads as "2 things need doing".
 *
 * Design principle #5 (sticky + labelled).
 */

export type StickyAsideItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
  /** Optional "2 pending" or "!" badge. */
  badge?: string;
  badgeTone?: "info" | "warn" | "danger";
  /** Optional sub-description under the label. */
  description?: string;
  /** Trailing icon rendered on the far right (overrides badge). */
  icon?: ReactNode;
};

type StickyAsideProps = {
  items: StickyAsideItem[];
  /** Optional eyebrow rendered above the list. */
  eyebrow?: string;
  ariaLabel?: string;
  className?: string;
};

function badgeClass(tone: StickyAsideItem["badgeTone"], isActive: boolean) {
  if (isActive) {
    return "bg-[var(--ds-on-primary)]/18 text-[var(--ds-on-primary)]";
  }
  if (tone === "danger") return "bg-[#fee9e9] text-[#8b1f1f]";
  if (tone === "warn") return "bg-[#fef3c7] text-[#92400e]";
  return "bg-[var(--ds-soft)] text-[var(--ds-text-primary)]";
}

export function StickyAside({ items, eyebrow, ariaLabel, className }: StickyAsideProps) {
  return (
    <aside
      aria-label={ariaLabel ?? "Section navigation"}
      className={cn(
        "surface-card h-fit rounded-3xl p-3 lg:sticky lg:top-6",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
          {eyebrow}
        </p>
      ) : null}
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = Boolean(item.active);
          const base =
            "flex items-start justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition";
          const tone = isActive
            ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)] shadow-[0_12px_22px_-18px_rgba(11,110,79,0.55)]"
            : item.disabled
              ? "text-[var(--ds-text-secondary)] opacity-70 cursor-not-allowed"
              : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]";

          const content = (
            <>
              <div className="min-w-0">
                <p className="truncate">{item.label}</p>
                {item.description ? (
                  <p
                    className={cn(
                      "mt-0.5 truncate text-[11px] font-medium leading-relaxed",
                      isActive ? "text-[var(--ds-on-primary)]/80" : "text-[var(--ds-text-secondary)]",
                    )}
                  >
                    {item.description}
                  </p>
                ) : null}
              </div>
              {item.icon ? (
                <span className="shrink-0">{item.icon}</span>
              ) : item.badge ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                    badgeClass(item.badgeTone, isActive),
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </>
          );

          if (item.disabled) {
            return (
              <div
                key={item.id}
                aria-disabled="true"
                className={cn(base, tone)}
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(base, tone)}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
