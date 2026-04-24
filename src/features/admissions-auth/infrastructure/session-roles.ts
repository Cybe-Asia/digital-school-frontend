import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

export type SessionRoles = {
  /** Whether there is a valid ds-session cookie. False = logged out. */
  authenticated: boolean;
  /** Email on the session JWT. Empty string when logged out. */
  email: string;
  /** True when the logged-in User has a Lead (parent portal is meaningful). */
  hasLead: boolean;
  /** True when the logged-in email is in ADMIN_EMAILS. */
  isAdmin: boolean;
  /** Primary Lead id when hasLead — useful for building deep links. */
  leadId: string | null;
};

export const EMPTY_ROLES: SessionRoles = {
  authenticated: false,
  email: "",
  hasLead: false,
  isAdmin: false,
  leadId: null,
};

/**
 * Server-side helper. Resolves the roles of the current session by
 * calling admission-service /me/roles. Any failure (no cookie, no
 * network, non-OK) collapses to EMPTY_ROLES so callers can render a
 * logged-out shell without branching.
 *
 * Call from server components (layouts, page.tsx). Never throws.
 */
export async function getSessionRoles(): Promise<SessionRoles> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return EMPTY_ROLES;

  const { admission } = getServerServiceEndpoints();
  try {
    const res = await fetch(`${admission}/me/roles`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return EMPTY_ROLES;
    const body = (await res.json().catch(() => null)) as
      | {
          responseCode?: number;
          data?: { email?: string; hasLead?: boolean; isAdmin?: boolean; leadId?: string | null };
        }
      | null;
    const data = body?.data;
    if (!data) return EMPTY_ROLES;
    return {
      authenticated: Boolean(data.email),
      email: data.email ?? "",
      hasLead: Boolean(data.hasLead),
      isAdmin: Boolean(data.isAdmin),
      leadId: data.leadId ?? null,
    };
  } catch {
    return EMPTY_ROLES;
  }
}
