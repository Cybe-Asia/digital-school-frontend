import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { StatusPill, type StatusTone } from "./status-pill";

/**
 * Horizontal student tabs rendered at the top of every application
 * sub-page when a parent has more than one kid. Clicking a tab routes
 * to the same sub-section for the sibling, so that scrolling through
 * "payment for Ahmad" and wanting to see "payment for Fatima" is one
 * click away instead of back-then-click-another-card.
 *
 * Design principle #4. Keeps the visual grouping tight so a CTA labelled
 * for a specific kid cannot route to the wrong kid — the active tab is
 * the single source of truth for whose data we're looking at.
 */

export type StudentSwitcherItem = {
  id: string;
  studentName: string;
  href: string;
  /** Applicant status for the pill. Optional — omit to skip the pill. */
  statusLabel?: string;
  statusRawValue?: string;
  statusTone?: StatusTone;
};

type StudentSwitcherProps = {
  items: StudentSwitcherItem[];
  activeId: string;
  /** Localized label for the "add another child" control. */
  addLabel?: string;
  addHref?: string;
  /** Aria label for the surrounding nav. Pass an already-translated string. */
  ariaLabel?: string;
  className?: string;
};

export function StudentSwitcher({
  items,
  activeId,
  addLabel,
  addHref,
  ariaLabel,
  className,
}: StudentSwitcherProps) {
  if (items.length <= 1 && !addHref) {
    // Nothing to switch between and no add action — don't show the strip.
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel ?? "Students"}
      className={cn(
        "scrollbar-none -mx-1 flex w-full items-center gap-2 overflow-x-auto rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-1.5",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)] shadow-[0_10px_22px_-14px_rgba(11,110,79,0.55)]"
                : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]",
            )}
          >
            <span>{item.studentName}</span>
            {item.statusLabel ? (
              <StatusPill
                label={item.statusLabel}
                status={item.statusRawValue}
                tone={item.statusTone}
                size="sm"
                className={cn(isActive ? "bg-[var(--ds-on-primary)]/20 text-[var(--ds-on-primary)] border-transparent" : "")}
              />
            ) : null}
          </Link>
        );
      })}
      {addHref ? (
        <Link
          href={addHref}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-[var(--ds-border)] px-3 py-2 text-sm font-semibold text-[var(--ds-text-secondary)] transition hover:border-[var(--ds-primary)] hover:text-[var(--ds-primary)]"
        >
          <span aria-hidden="true">+</span>
          <span>{addLabel ?? "Add student"}</span>
        </Link>
      ) : null}
    </nav>
  );
}
