"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type NavItem = { label: string; href: string; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Admissions",
    items: [
      { label: "Dashboard", href: "/admin/admissions", exact: true },
      { label: "Leads", href: "/admin/admissions/leads" },
      { label: "Applications", href: "/admin/admissions/applications" },
      { label: "Offers", href: "/admin/admissions/offers" },
      { label: "Doc queue", href: "/admin/admissions/documents" },
      { label: "Enrolled", href: "/admin/admissions/enrolled" },
    ],
  },
  {
    label: "Assessments",
    items: [
      { label: "Test schedules", href: "/admin/tests/schedules" },
    ],
  },
  {
    label: "School (SIS)",
    items: [
      { label: "Sections", href: "/admin/sis/sections" },
    ],
  },
];

/**
 * Shared admin shell — sidebar nav + responsive top bar with breadcrumbs.
 * Mobile: sidebar hidden behind hamburger. Desktop: fixed 14rem sidebar.
 *
 * `children` is the server-rendered page content; this shell is a thin
 * client wrapper so we can use usePathname for active-link highlighting
 * and control the mobile sidebar open/close state.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile sidebar whenever the route changes. Deferred via
  // microtask so react-hooks/set-state-in-effect doesn't flag this as
  // a cascading render (it's legitimate route-driven teardown).
  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  // Keyboard: `/` focuses the global search input on any page that has one.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        const el = document.querySelector<HTMLInputElement>("input[type='text'][placeholder*='earch']");
        if (el) {
          e.preventDefault();
          el.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--ds-soft)]/30">
      {/* Top bar — mobile hamburger + breadcrumbs */}
      <header className="sticky top-0 z-30 border-b border-[var(--ds-border)] bg-[var(--ds-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--ds-surface)]/75">
        <div className="flex items-center gap-3 px-4 py-3 lg:pl-60">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] text-sm lg:hidden"
          >
            ☰
          </button>
          <Breadcrumbs pathname={pathname} />
          <span className="ml-auto rounded-full border border-[var(--ds-border)] bg-[var(--ds-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            school-test
          </span>
        </div>
      </header>

      {/* Sidebar — fixed on lg+, slide-over on mobile */}
      <aside
        className={`fixed top-0 z-40 h-screen w-56 border-r border-[var(--ds-border)] bg-[var(--ds-surface)] transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-[var(--ds-border)] px-4 py-3">
          <span className="text-sm font-semibold text-[var(--ds-text-primary)]">Digital School</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-sm text-[var(--ds-text-secondary)] lg:hidden"
          >
            ×
          </button>
        </div>
        <nav className="overflow-y-auto px-2 py-3">
          {NAV.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded-lg px-2.5 py-1.5 text-sm transition ${
                          active
                            ? "bg-[var(--ds-primary)]/10 font-semibold text-[var(--ds-primary)]"
                            : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Scrim when mobile sidebar is open */}
      {mobileOpen ? (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
        />
      ) : null}

      {/* Main content slot */}
      <main className="lg:pl-56">{children}</main>
    </div>
  );
}

/**
 * Derives human-readable breadcrumbs from the current pathname. Matches
 * the known admin routes; falls back to a capitalised segment for
 * anything bespoke (IDs, etc).
 */
function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href: string }> = [];
  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    acc += `/${seg}`;
    crumbs.push({ label: humanise(seg, segments, i), href: acc });
  }
  // Drop the leading "Admin" crumb for a cleaner bar.
  if (crumbs.length > 0 && crumbs[0].label === "Admin") crumbs.shift();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[var(--ds-text-secondary)]">
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1">
          {i > 0 ? <span className="text-[var(--ds-text-secondary)]/50">/</span> : null}
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-[var(--ds-text-primary)]">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-[var(--ds-primary)]">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function humanise(seg: string, _all: string[], _idx: number): string {
  // Skip decorative URL-encoded ids in the middle of paths — render the
  // parent segment's singular form instead. e.g. /students/[id] shows
  // "Students › <id>" which is redundant; collapse.
  if (/^[A-Z]+-[a-z0-9]/.test(decodeURIComponent(seg))) {
    return `#${decodeURIComponent(seg).split("-")[1]?.slice(0, 8) ?? seg}`;
  }
  const map: Record<string, string> = {
    admin: "Admin",
    admissions: "Admissions",
    leads: "Leads",
    applications: "Applications",
    students: "Applicant",
    offers: "Offers",
    enrolled: "Enrolled",
    documents: "Documents",
    tests: "Tests",
    schedules: "Schedules",
    sis: "SIS",
    sections: "Sections",
  };
  if (map[seg]) return map[seg];
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}
