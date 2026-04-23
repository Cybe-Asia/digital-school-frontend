"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n";
import type { NavItem } from "@/lib/dashboard-data";

type ParentPortalScrollNavProps = {
  items: NavItem[];
};

function getSectionIdFromHref(href: string | undefined): string | null {
  if (!href || !href.startsWith("#")) {
    return null;
  }

  return href.slice(1) || null;
}

/**
 * Renders a numeric badge (preferred) or a legacy string badge beside a
 * nav item. Hidden when the count is zero so nav items don't shout
 * "0 new".
 */
function renderNavBadge(
  badgeCount: number | undefined,
  badge: string | undefined,
  isActive: boolean,
) {
  const numericLabel = typeof badgeCount === "number" && badgeCount > 0 ? String(badgeCount) : null;
  const label = numericLabel ?? (badge && badge.length > 0 ? badge : null);
  if (!label) return null;

  // Warning-style red pill when a numeric count surfaces something the
  // parent probably wants to notice (absences, unpaid, urgent actions).
  // The neutral style matches the previous pill.
  const isUrgent = numericLabel !== null && (badgeCount ?? 0) > 0;

  return (
    <span
      className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-semibold ${
        isActive
          ? "bg-[var(--ds-on-primary)]/18 text-[var(--ds-on-primary)]"
          : isUrgent
            ? "bg-[#fee9e9] text-[#8b1f1f]"
            : "bg-[var(--ds-soft)] text-[var(--ds-text-primary)]"
      }`}
    >
      {label}
    </span>
  );
}

export default function ParentPortalScrollNav({ items }: ParentPortalScrollNavProps) {
  const { t } = useI18n();
  const sectionIds = useMemo(
    () => items.map((item) => getSectionIdFromHref(item.href)).filter((value): value is string => Boolean(value)),
    [items],
  );
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
    if (!sectionIds.length) {
      return;
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target.id) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-22% 0px -58% 0px",
        threshold: [0.2, 0.4, 0.65],
      },
    );

    sections.forEach((section) => observer.observe(section));

    const handleHashChange = () => {
      const nextHash = window.location.hash.replace("#", "");

      if (nextHash) {
        setActiveSection(nextHash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [sectionIds]);

  return (
    <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:flex-col lg:space-y-2 lg:overflow-visible lg:pb-0">
      {items.map((item) => {
        const sectionId = getSectionIdFromHref(item.href);
        const isActive = sectionId ? activeSection === sectionId : Boolean(item.active);

        return (
          <Link
            key={item.labelKey}
            href={item.href ?? "#"}
            className={`flex w-fit shrink-0 items-center justify-between gap-3 rounded-xl px-4 py-2 text-sm font-semibold transition lg:w-full lg:px-3 ${
              isActive
                ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)] shadow-[var(--ds-shadow-soft)]"
                : "bg-[var(--ds-surface)] text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)] lg:bg-transparent lg:hover:bg-[var(--ds-soft)]"
            }`}
          >
            <p className="whitespace-nowrap">{t(item.labelKey, item.descriptionValues)}</p>
            {renderNavBadge(item.badgeCount, item.badge, isActive)}
          </Link>
        );
      })}
    </nav>
  );
}
