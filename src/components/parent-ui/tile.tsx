import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "default" | "flat" | "hero" | "celebrate";

/**
 * <Tile> — the ONE card style across the new parent/student portal.
 * Variants:
 *   - default   : white rounded surface for content groups
 *   - flat      : cream tint, used inside larger surfaces
 *   - hero      : soft warm-green → cream gradient for the "next step"
 *   - celebrate : sunset gradient for milestone moments (enrolled ✓)
 * If `href` is set the tile becomes a big tap target (Link).
 */
export function Tile({
  children,
  variant = "default",
  href,
  className = "",
  as = "article",
}: {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  className?: string;
  as?: "article" | "section" | "div";
}) {
  const cls = [
    "parent-tile",
    variant === "flat" && "parent-tile--flat",
    variant === "hero" && "parent-tile--hero",
    variant === "celebrate" && "parent-tile--celebrate",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={`${cls} block`}>
        {children}
      </Link>
    );
  }

  const Tag = as as "article";
  return <Tag className={cls}>{children}</Tag>;
}
