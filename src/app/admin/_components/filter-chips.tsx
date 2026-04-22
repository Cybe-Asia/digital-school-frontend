"use client";

import Link from "next/link";

export type FilterChip = {
  /** The URL query-param key this chip represents. */
  key: string;
  /** Shown on the chip — short human-readable label. */
  label: string;
};

/**
 * Renders the currently-applied filters as dismissable pills so admins
 * see at a glance what's narrowing the list, and can drop one filter
 * without clearing everything. Each × link produces a new URL with
 * just that key removed; `offset` is reset to 0 so results line up.
 *
 * Pass the current URLSearchParams as `qs` — we read from it and never
 * mutate. The list-page server component already builds this.
 */
export function FilterChips({
  chips,
  qs,
}: {
  chips: FilterChip[];
  qs: URLSearchParams;
}) {
  if (chips.length === 0) return null;
  const hrefWithout = (key: string) => {
    const copy = new URLSearchParams(qs);
    copy.delete(key);
    copy.set("offset", "0");
    const s = copy.toString();
    return s ? `?${s}` : "?";
  };
  const clearAllHref = "?offset=0";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <Link
          key={c.key}
          href={hrefWithout(c.key)}
          className="group inline-flex items-center gap-1 rounded-full border border-[var(--ds-primary)]/30 bg-[var(--ds-primary)]/5 px-2 py-0.5 text-[11px] font-semibold text-[var(--ds-primary)] hover:bg-[var(--ds-primary)]/10"
          aria-label={`Remove filter ${c.label}`}
        >
          <span>{c.label}</span>
          <span aria-hidden="true" className="text-sm leading-none opacity-70 group-hover:opacity-100">×</span>
        </Link>
      ))}
      {chips.length > 1 ? (
        <Link
          href={clearAllHref}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--ds-text-secondary)] hover:bg-[var(--ds-soft)]"
        >
          Clear all
        </Link>
      ) : null}
    </div>
  );
}
