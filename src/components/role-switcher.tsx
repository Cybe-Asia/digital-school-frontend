import Link from "next/link";
import type { SessionRoles } from "@/features/admissions-auth/infrastructure/session-roles";

type ActiveView = "parent" | "admin";

type RoleSwitcherProps = {
  roles: SessionRoles;
  activeView: ActiveView;
  labels: {
    parent: string;
    admin: string;
    switchToParent: string;
    switchToAdmin: string;
  };
};

/**
 * Pill-shaped toggle shown in the header of both the parent portal
 * and the admin shell, but only for users who actually have access
 * to both views. Edge cases handled:
 *
 * - Not authenticated → renders nothing. Header stays clean for
 *   logged-out visitors.
 * - Parent-only (has Lead, NOT in ADMIN_EMAILS) → renders nothing.
 *   No admin link to tempt a user who'd just get 403.
 * - Admin-only (no Lead, IS admin) → renders only the 'admin' pill
 *   as the active segment. No 'parent' option; sending them to the
 *   parent dashboard would just show the 'no Lead' error panel.
 * - Hybrid (has Lead AND is admin) → both pills, the one matching
 *   activeView is styled as selected, the other is a Link.
 *
 * SSR-friendly: pure markup, no client hooks. The caller passes in
 * the pre-resolved roles (from getSessionRoles()) and the active view
 * for the current page.
 */
export function RoleSwitcher({ roles, activeView, labels }: RoleSwitcherProps) {
  if (!roles.authenticated) return null;

  const showParent = roles.hasLead;
  const showAdmin = roles.isAdmin;
  // Only one identity → pill would be a no-op. Hide it; the header
  // still shows the brand + logout, nothing lost.
  if (!showParent || !showAdmin) return null;

  const parentActive = activeView === "parent";
  const adminActive = activeView === "admin";

  return (
    <nav
      aria-label="Role switcher"
      className="inline-flex items-center rounded-full border border-[var(--ds-border,rgba(0,0,0,0.08))] bg-[color:var(--ds-soft,rgba(0,0,0,0.03))] p-1 text-xs font-semibold"
    >
      <Link
        href="/parent/dashboard"
        aria-current={parentActive ? "page" : undefined}
        title={parentActive ? labels.parent : labels.switchToParent}
        className={`rounded-full px-3 py-1.5 tracking-wide transition ${
          parentActive
            ? "bg-[color:var(--brand,#2f8f6b)] text-white shadow-sm"
            : "text-[color:var(--ds-text-primary,#1a1a1a)] hover:bg-[color:var(--ds-surface,#fff)]"
        }`}
      >
        {labels.parent}
      </Link>
      <Link
        href="/admin/admissions"
        aria-current={adminActive ? "page" : undefined}
        title={adminActive ? labels.admin : labels.switchToAdmin}
        className={`rounded-full px-3 py-1.5 tracking-wide transition ${
          adminActive
            ? "bg-[color:var(--brand,#2f8f6b)] text-white shadow-sm"
            : "text-[color:var(--ds-text-primary,#1a1a1a)] hover:bg-[color:var(--ds-surface,#fff)]"
        }`}
      >
        {labels.admin}
      </Link>
    </nav>
  );
}
