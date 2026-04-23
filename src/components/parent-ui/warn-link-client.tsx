"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, useState } from "react";

type WarnLinkClientProps = {
  href: string;
  className?: string;
  children: ReactNode;
  /** When true, clicking shows a confirm dialog before navigating.
   *  When false, this component behaves exactly like a plain Link. */
  warn: boolean;
  /** Heading shown on the confirm dialog. */
  warnTitle: string;
  /** Body shown on the confirm dialog. */
  warnBody: string;
  /** Button label for "proceed anyway". */
  confirmLabel: string;
  /** Button label for "cancel". */
  cancelLabel: string;
};

/**
 * A Link replacement that can pop a confirm dialog before navigating.
 * Used by the parent overview tiles so tapping a gated/locked section
 * (e.g. Documents before the test passes) warns the parent instead of
 * silently sending them to a page where they can't do anything.
 *
 * When `warn` is false, renders a plain next/link with no runtime
 * overhead — the dialog never mounts.
 */
export function WarnLinkClient({
  href,
  className,
  children,
  warn,
  warnTitle,
  warnBody,
  confirmLabel,
  cancelLabel,
}: WarnLinkClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!warn) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(true);
  };

  const onConfirm = () => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6 pt-16 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="warn-link-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand-wash)] text-[color:var(--brand-strong)]" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>
            <h2
              id="warn-link-title"
              className="parent-text-serif text-[22px] leading-tight text-[color:var(--ink-900)]"
            >
              {warnTitle}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
              {warnBody}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
              <button
                type="button"
                onClick={onConfirm}
                className="parent-big-btn w-full sm:w-auto sm:px-6"
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="parent-ghost-btn w-full sm:w-auto sm:px-6"
              >
                {cancelLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
