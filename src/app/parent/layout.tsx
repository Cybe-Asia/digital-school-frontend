// Parent-tree guard layout.
//
// Everything under `/parent/*` (dashboard, kids, messages, payments)
// matches this layout. Its job is the **role fence**: if the current
// session belongs to a staff email (on the backend's `ADMIN_EMAILS`
// allowlist), we bounce to `/admin/admissions` instead of letting
// the parent UI render. Admins are staff — they should never see
// the parent tree even if they happen to have a Lead record from
// testing.
//
// We intentionally do NOT enforce "must have a session" here — that
// check stays in the individual pages so they can keep their
// deep-link-with-query-context fallback behavior (e.g. magic-link
// previews of the dashboard before login). This layout's only job
// is role-based redirection; auth-presence is the pages' problem.
//
// Cost: one extra call to admission-service `/me` per parent-tree
// navigation. Acceptable — the alternative is duplicating the
// guard into four page files and keeping them in sync forever.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * Call admission-service `/me` and return whether the session email
 * is an admin. Returns `null` on any failure — including missing
 * cookie, network error, and 404/401 responses — so a flaky auth
 * service can never lock a real parent out of their own dashboard.
 * The pages below will show their own "can't load" error panel if
 * `/me` is down.
 */
async function currentSessionIsAdmin(): Promise<boolean | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const { admission } = getServerServiceEndpoints();
  try {
    const res = await fetch(`${admission}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as
      | { data?: { isAdmin?: boolean } }
      | null;
    return body?.data?.isAdmin === true;
  } catch {
    return null;
  }
}

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await currentSessionIsAdmin();
  if (isAdmin === true) {
    redirect("/admin/admissions");
  }
  return children;
}
