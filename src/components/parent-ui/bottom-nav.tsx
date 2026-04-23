"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
};

/**
 * <BottomNav> — mobile-first tab bar pinned to the viewport bottom.
 * Desktop (≥ 900px) hides it entirely; on desktop the parent has
 * enough vertical space that a nav isn't needed.
 *
 * Four tabs max. If we ever grow past four, we overflow into a
 * "more" sheet; never a horizontal scroll strip (that's the old
 * section-nav pattern we're deleting).
 */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="parent-bottom-nav" aria-label="Primary">
      <ul className="grid grid-cols-4 gap-1">
        {items.slice(0, 4).map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                  active
                    ? "text-[color:var(--brand-strong)] bg-[color:var(--brand-wash)]"
                    : "text-[color:var(--ink-500)]"
                }`}
              >
                <span className="h-6 w-6" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute right-3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--warm-coral)] px-1 text-[10px] font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TabIcon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
