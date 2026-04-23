import type { ReactNode } from "react";

/**
 * <Screen> — the single page-level container for every parent-facing
 * route. Gives each page the same vertical rhythm, cream canvas, and
 * generous bottom padding so the sticky mobile tab bar never overlaps
 * content. Parent design principle #2: mobile-first, desktop is just
 * mobile + more side whitespace.
 */
export function Screen({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="parent-root">
      <div className={`parent-shell ${className}`}>{children}</div>
    </div>
  );
}
