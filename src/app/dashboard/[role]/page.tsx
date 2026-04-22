import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import {
  getDashboardConfig,
  getParentAdmissionsContextFromMePayload,
  getParentAdmissionsContextFromSearchParams,
  type ParentMePayload,
  type ParentSisSnapshot,
} from "@/lib/dashboard-data";
import en from "@/i18n/translations/en.json";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * Fetch the authenticated parent's profile + students + latest payment from
 * the admission-service. Returns null if the call fails — the dashboard then
 * falls back to the legacy URL-param path so existing deep-links keep
 * working while we roll this out.
 */
async function loadParentMe(): Promise<ParentMePayload | null> {
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
      | { responseCode?: number; data?: ParentMePayload }
      | null;
    return body?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Parent-scoped SIS snapshot: sections + attendance + grades for every
 * kid the current parent owns. Each sub-call downgrades to [] on
 * failure — the dashboard renders partial data rather than blanking
 * out when only one call is flaky.
 */
async function loadParentSisSnapshot(): Promise<ParentSisSnapshot> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return { sections: [], attendance: [], grades: [] };

  const { admission } = getServerServiceEndpoints();
  const headers = { Authorization: `Bearer ${token}` };
  const fetchJson = async (path: string) => {
    try {
      const res = await fetch(`${admission}${path}`, { headers, cache: "no-store" });
      if (!res.ok) return [];
      const body = (await res.json().catch(() => null)) as { data?: unknown } | null;
      return Array.isArray(body?.data) ? body!.data : [];
    } catch {
      return [];
    }
  };

  const [sections, attendance, grades] = await Promise.all([
    fetchJson("/me/sections"),
    fetchJson("/me/attendance"),
    fetchJson("/me/grades"),
  ]);

  return {
    sections: sections as ParentSisSnapshot["sections"],
    attendance: attendance as ParentSisSnapshot["attendance"],
    grades: grades as ParentSisSnapshot["grades"],
  };
}

type DashboardPageProps = {
  params: Promise<{ role: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<DashboardPageProps, "params">): Promise<Metadata> {
  const { role } = await params;

  if (role === "staff") {
    return {
      title: en["admissions.admin.metadata_title"],
      description: en["admissions.admin.metadata_description"],
    };
  }

  const config = getDashboardConfig(role);

  if (!config) {
    return {
      title: "Dashboard Not Found",
    };
  }

  const roleLabelKey = config.roleLabelKey as keyof typeof en;
  const subtitleKey = config.subtitleKey as keyof typeof en;

  return {
    title: `${en[roleLabelKey]} Dashboard | ${en["common.brand.twsi"]}`,
    description: en[subtitleKey],
  };
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { role } = await params;

  if (role === "staff") {
    redirect("/admin/admissions");
  }

  const query = await searchParams;
  // Prefer the authoritative profile from /me (cookie-authenticated) over
  // URL params. Falls back to the legacy URL path if the /me call fails or
  // returns partial data.
  let parentAdmissionsContext = null;
  let parentSisSnapshot: ParentSisSnapshot | null = null;
  if (role === "parent") {
    const [mePayload, sisSnap] = await Promise.all([loadParentMe(), loadParentSisSnapshot()]);
    parentAdmissionsContext =
      getParentAdmissionsContextFromMePayload(mePayload) ??
      getParentAdmissionsContextFromSearchParams(query);
    parentSisSnapshot = sisSnap;
  }
  const config = getDashboardConfig(role, parentAdmissionsContext, parentSisSnapshot);

  if (!config) {
    notFound();
  }

  return <DashboardShell config={config} />;
}
