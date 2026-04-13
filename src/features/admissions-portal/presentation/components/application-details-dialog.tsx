"use client";

import { useEffect, useState } from "react";

type ApplicationDetailsDialogProps = {
  openLabel: string;
  closeLabel: string;
  title: string;
  description: string;
  items: Array<{
    label: string;
    value: string;
  }>;
  notesTitle: string;
  notesValue: string;
};

export function ApplicationDetailsDialog({
  openLabel,
  closeLabel,
  title,
  description,
  items,
  notesTitle,
  notesValue,
}: ApplicationDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]/45 hover:bg-[var(--ds-soft)]/40"
      >
        {openLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgb(16_33_50_/_0.52)] p-3 sm:items-center sm:p-6"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-details-dialog-title"
            className="w-full max-w-2xl rounded-[30px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 shadow-[0_30px_80px_-40px_rgba(16,33,50,0.8)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                  {openLabel}
                </p>
                <h2 id="application-details-dialog-title" className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">
                  {title}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ds-text-secondary)]">{description}</p>
              </div>
              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]/45 hover:bg-[var(--ds-soft)]/40"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <div key={item.label} className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/25 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--ds-text-primary)]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/25 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">{notesTitle}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ds-text-primary)]">{notesValue}</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]/45 hover:bg-[var(--ds-soft)]/40"
              >
                {closeLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
