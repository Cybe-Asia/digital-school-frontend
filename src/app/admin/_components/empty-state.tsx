import type { ReactNode } from "react";

/**
 * Shared empty-state block for admin list pages. Replaces the old
 * one-liner "No X yet" gray boxes with a slightly richer visual that
 * includes an icon, headline, description, and optional CTA.
 *
 * Kept a server component (no hooks) so pages can use it directly
 * without client-boundary overhead.
 */
export function EmptyState({
  icon = "📭",
  title,
  description,
  cta,
}: {
  icon?: string;
  title: string;
  description?: string;
  cta?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--ds-border)] bg-[var(--ds-surface)] px-6 py-10 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ds-soft)] text-2xl" aria-hidden="true">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-[var(--ds-text-primary)]">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-xs text-[var(--ds-text-secondary)]">{description}</p>
      ) : null}
      {cta ? <div className="mt-4 inline-flex">{cta}</div> : null}
    </div>
  );
}
