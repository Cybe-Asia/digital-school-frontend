import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";

type BigButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

/**
 * <BigButton> — the hero CTA. One per screen, full-width on mobile.
 * A soft rounded pill with a real brand green — not a thin rectangle
 * with a gradient trying to look premium.
 */
export function BigButton({
  children,
  href,
  variant = "primary",
  fullWidth = true,
  className = "",
  ...rest
}: BigButtonProps) {
  const cls = [
    variant === "primary" ? "parent-big-btn" : "parent-ghost-btn",
    !fullWidth && "w-auto",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href && !rest.disabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" {...rest} className={cls}>
      {children}
    </button>
  );
}
