import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { StatusPill, type StatusTone } from "./status-pill";

/**
 * Consistent page header used by every non-landing user-facing page.
 *
 * Design principle #1 (page header is unambiguous) is the motivation:
 *   - breadcrumb answers "where am I"
 *   - H1 answers "whose data is this"
 *   - subtitle answers the key identifying context (grade, school, status)
 *   - the optional status pill answers "what state are they in"
 *
 * Layout: stacked on narrow, inline on wide. Breadcrumb wraps gracefully.
 */

export type Breadcrumb = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  breadcrumbs?: Breadcrumb[];
  /** Short eyebrow text above H1 (e.g. "PARENT PORTAL"). */
  eyebrow?: string;
  /** H1 — always name the subject ("Dokumen Ahmad Budi Santoso"). */
  title: string;
  /** One-line key context ("Kelas 7 · IISS · status: handed_to_sis"). */
  subtitle?: string;
  /** Optional status pill pinned top-right. */
  statusLabel?: string;
  statusTone?: StatusTone;
  statusRawValue?: string;
  /** Optional trailing actions (buttons, links). Render at the right. */
  actions?: ReactNode;
  className?: string;
  /** Render a compact/tighter variant for second-level pages. */
  size?: "hero" | "compact";
};

export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  subtitle,
  statusLabel,
  statusTone,
  statusRawValue,
  actions,
  className,
  size = "hero",
}: PageHeaderProps) {
  const showStatus = Boolean(statusLabel);
  const titleSizeCls = size === "hero" ? "text-2xl sm:text-[2rem] lg:text-[2.3rem]" : "text-xl sm:text-2xl";

  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--ds-text-secondary)]">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${idx}`} className="flex items-center gap-x-1.5">
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="font-medium text-[var(--ds-text-secondary)] transition hover:text-[var(--ds-primary)]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "font-medium",
                        isLast ? "text-[var(--ds-text-primary)]" : "text-[var(--ds-text-secondary)]",
                      )}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast ? <span aria-hidden="true">/</span> : null}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ds-primary)]">
              {eyebrow}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className={cn("font-semibold leading-tight text-[var(--ds-text-primary)]", titleSizeCls)}>
              {title}
            </h1>
            {showStatus ? (
              <StatusPill
                label={statusLabel!}
                status={statusRawValue}
                tone={statusTone}
                size={size === "hero" ? "md" : "sm"}
              />
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ds-text-secondary)]">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
