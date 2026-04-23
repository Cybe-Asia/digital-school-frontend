import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { EmptyState } from "./empty-state";

/**
 * Thin wrapper over a semantic <table> used by admin list pages.
 * Replaces the ad-hoc "divide-y / border / bg-surface" pattern and gives
 * rows consistent padding, hover, optional row links, and a built-in
 * empty-state slot.
 *
 * Design principle #8 — lists deserve the same care as hero pages.
 */

export type DataTableColumn<Row> = {
  id: string;
  /** Column header label (already translated). */
  header: string;
  /** Optional header className (e.g. `text-right`, `hidden md:table-cell`). */
  headerClassName?: string;
  /** Render a single cell. */
  cell: (row: Row, index: number) => ReactNode;
  /** Cell-level className applied to <td>. */
  cellClassName?: string;
};

type DataTableProps<Row> = {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Build a stable row key. */
  rowKey: (row: Row, index: number) => string;
  /** Optional: when provided, rows render as clickable <Link>s. */
  rowHref?: (row: Row, index: number) => string | undefined;
  /** Rendered above the table as a caption + right-aligned controls. */
  caption?: ReactNode;
  captionRight?: ReactNode;
  /** Empty-state props rendered when rows.length === 0. */
  emptyState?: {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: ReactNode;
  };
  /** Optional footer (pagination, totals). */
  footer?: ReactNode;
  className?: string;
  /** When true, renders a compact row height. */
  dense?: boolean;
};

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  rowHref,
  caption,
  captionRight,
  emptyState,
  footer,
  className,
  dense = false,
}: DataTableProps<Row>) {
  const hasCaption = Boolean(caption || captionRight);

  return (
    <section
      className={cn(
        "surface-card overflow-hidden rounded-3xl",
        className,
      )}
    >
      {hasCaption ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ds-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0">{caption}</div>
          {captionRight ? <div className="flex items-center gap-2">{captionRight}</div> : null}
        </header>
      ) : null}

      {rows.length === 0 && emptyState ? (
        <div className="p-6">
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            action={emptyState.action}
            icon={emptyState.icon}
            compact
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-[var(--ds-text-primary)]">
            <thead>
              <tr className="bg-[var(--ds-soft)]/40">
                {columns.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)] sm:px-6",
                      col.headerClassName,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-border)]/70">
              {rows.map((row, rowIndex) => {
                const key = rowKey(row, rowIndex);
                const href = rowHref?.(row, rowIndex);
                const rowCls = cn(
                  "transition-colors",
                  href ? "hover:bg-[var(--ds-soft)]/40 cursor-pointer" : "hover:bg-[var(--ds-soft)]/25",
                );
                return (
                  <tr key={key} className={rowCls}>
                    {columns.map((col, colIndex) => (
                      <td
                        key={col.id}
                        className={cn(
                          "align-middle px-4 sm:px-6",
                          dense ? "py-2.5" : "py-3.5",
                          col.cellClassName,
                        )}
                      >
                        {/* When a row is linkable, wrap the FIRST cell in a
                            Link so the whole row text participates in the
                            tab order without nesting interactive elements
                            inside cells that already render actions. */}
                        {href && colIndex === 0 ? (
                          <Link href={href} className="block focus:outline-none">
                            {col.cell(row, rowIndex)}
                          </Link>
                        ) : (
                          col.cell(row, rowIndex)
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {footer ? (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ds-border)] px-5 py-3 sm:px-6">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
