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

export const metadata: Metadata = {
  title: "Parent Dashboard | Cybe Digital School",
  description: en["dashboard.parent.subtitle"] ?? "Parent portal",
};

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

type ParentDashboardProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Canonical parent dashboard URL. Mirrors the data-loading logic of the
 * legacy /dashboard/[role] page but at a persona-clear path. The legacy
 * URL still works and shows the same thing so deep-links don't break.
 */
export default async function ParentDashboardPage({ searchParams }: ParentDashboardProps) {
  const query = await searchParams;
  const [mePayload, sisSnap] = await Promise.all([loadParentMe(), loadParentSisSnapshot()]);
  const parentAdmissionsContext =
    getParentAdmissionsContextFromMePayload(mePayload) ??
    getParentAdmissionsContextFromSearchParams(query);

  // No context + no session → send to login. A fresh visitor hitting
  // /parent/dashboard directly should be redirected rather than shown
  // an empty 'mock' state.
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token && !parentAdmissionsContext) {
    redirect("/login");
  }

  const config = getDashboardConfig("parent", parentAdmissionsContext, sisSnap);
  if (!config) notFound();

  return <DashboardShell config={config} />;
}
