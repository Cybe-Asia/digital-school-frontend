import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Root layout primitive for every authenticated/user-facing page. Gives
 * pages a consistent max width, gutter, top rhythm, and the radial
 * `dashboard-bg` decoration. Does NOT render a header — page content
 * decides whether to render a <PageHero /> or a tighter <PageHeader />.
 *
 * Design principles #1 (unambiguous structure) and #4 (generous
 * whitespace) live here.
 */

type PageShellProps = {
  children: ReactNode;
  /** Optional element rendered above everything — usually a sticky app bar. */
  topBar?: ReactNode;
  /** Optional element pinned to the bottom of the viewport on mobile. */
  bottomBar?: ReactNode;
  /** Override the default 1320px container ceiling. */
  maxWidth?: "md" | "lg" | "xl" | "2xl";
  /** Whether to render the ambient radial gradient background. */
  decorated?: boolean;
  className?: string;
  /** Outer padding override — defaults to generous top / bottom gutters. */
  paddingClassName?: string;
};

const MAX_WIDTH_CLASS: Record<NonNullable<PageShellProps["maxWidth"]>, string> = {
  md: "max-w-[920px]",
  lg: "max-w-[1120px]",
  xl: "max-w-[1320px]",
  "2xl": "max-w-[1440px]",
};

export function PageShell({
  children,
  topBar,
  bottomBar,
  maxWidth = "xl",
  decorated = true,
  className,
  paddingClassName,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen",
        decorated ? "dashboard-bg" : "bg-[var(--ds-bg)]",
        bottomBar ? "pb-28 lg:pb-12" : "pb-12",
        className,
      )}
    >
      {topBar}
      <div
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:px-8",
          paddingClassName ?? "pt-6 sm:pt-8",
          MAX_WIDTH_CLASS[maxWidth],
        )}
      >
        {children}
      </div>
      {bottomBar}
    </div>
  );
}
