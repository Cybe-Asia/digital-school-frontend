import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { LogoutButton } from "@/features/admissions-auth/presentation/components/logout-button";
import LanguageToggle from "@/components/language-toggle";

const SESSION_COOKIE_NAME = "ds-session";

type AdminMePayload = {
  lead?: {
    parentName?: string;
    email?: string;
  };
};

type AdminIdentity = {
  displayName: string;
  email: string;
};

/**
 * Loads the currently-signed-in admin's display name + email via the
 * shared `/me` endpoint. The admission-service returns a lead record
 * even for admin accounts; we reuse `parentName` as the display name.
 * Falls back to generic copy when the token is missing or the upstream
 * errors — header must still render something sensible.
 */
async function loadAdminIdentity(): Promise<AdminIdentity | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const { admission } = getServerServiceEndpoints();
  try {
    const res = await fetch(`${admission}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as { data?: AdminMePayload } | null;
    const lead = body?.data?.lead;
    if (!lead?.email) return null;
    return {
      displayName: lead.parentName || lead.email,
      email: lead.email,
    };
  } catch {
    return null;
  }
}

/**
 * Admin shell header. Mirrors the parent portal sticky header layout
 * (brand, title, actions). Admins are staff — the role fence in
 * `/parent/layout.tsx` redirects them away from the parent tree, so
 * there's no role-switcher here. If an admin genuinely needs to see
 * the parent flow (e.g. the dev testing both sides), they use a
 * separate account, not a view-toggle.
 */
export default async function AdminShellHeader() {
  const identity = await loadAdminIdentity();

  return (
    <header className="surface-card mb-6 flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ds-primary)]">
          Admin · Admissions
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-[var(--ds-text-primary)]">
            {identity ? `Hi, ${identity.displayName}` : "Admin console"}
          </h1>
          <span className="rounded-full border border-[var(--ds-border)] bg-[var(--ds-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
            Admin
          </span>
        </div>
        {identity ? (
          <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">{identity.email}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LanguageToggle />
        <Link
          href="/"
          className="rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]"
        >
          Home
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
