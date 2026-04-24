import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";
import { BigButton, Screen, Tile } from "@/components/parent-ui";
import { getServerI18n } from "@/i18n/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import {
  getDashboardConfig,
  getParentAdmissionsContextFromMePayload,
  getParentAdmissionsContextFromSearchParams,
  type ParentMePayload,
  type ParentMessage,
  type ParentSisSnapshot,
} from "@/lib/dashboard-data";
import en from "@/i18n/translations/en.json";

const SESSION_COOKIE_NAME = "ds-session";

export const metadata: Metadata = {
  title: "Parent Dashboard | TWSI",
  description: en["dashboard.parent.subtitle"] ?? "Parent portal",
};

type MeResult =
  | { kind: "ok"; payload: ParentMePayload }
  | { kind: "error"; status: number; detail: string };

/**
 * Call the admission-service /me endpoint with the cookie JWT and return
 * either the payload or a structured error. We intentionally do NOT
 * swallow failures into null — the parent dashboard must never silently
 * render the generic/mock shell when real data is supposed to be there.
 */
async function loadParentMe(): Promise<MeResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return { kind: "error", status: 401, detail: "No ds-session cookie" };
  }
  const { admission } = getServerServiceEndpoints();
  try {
    const res = await fetch(`${admission}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const raw = await res.text().catch(() => "");
    if (!res.ok) {
      return { kind: "error", status: res.status, detail: raw.slice(0, 400) || res.statusText };
    }
    let body: { data?: ParentMePayload } | null = null;
    try {
      body = raw ? (JSON.parse(raw) as { data?: ParentMePayload }) : null;
    } catch {
      return { kind: "error", status: res.status, detail: "Invalid JSON from /me" };
    }
    if (!body?.data) {
      return { kind: "error", status: res.status, detail: "Empty data field in /me response" };
    }
    return { kind: "ok", payload: body.data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { kind: "error", status: 0, detail: `Network error: ${msg}` };
  }
}

/**
 * Fetch the parent's inbox from the admission-service. Returns [] on any
 * failure so a messages-system outage can never blank the rest of the
 * dashboard — the updates card falls back to its empty-state row.
 */
async function loadParentMessages(): Promise<ParentMessage[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return [];
  const { admission } = getServerServiceEndpoints();
  try {
    const res = await fetch(`${admission}/me/messages`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json().catch(() => null)) as { data?: unknown } | null;
    return Array.isArray(body?.data) ? (body!.data as ParentMessage[]) : [];
  } catch {
    return [];
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
 * Canonical parent dashboard URL. Strict: requires real /me payload or an
 * explicit query-param context. When neither is available, renders an
 * error panel — no generic/mock shell fallback.
 */
export default async function ParentDashboardPage({ searchParams }: ParentDashboardProps) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  // No session AND no deep-link context → send to login, not to error.
  const queryContext = getParentAdmissionsContextFromSearchParams(query);
  if (!token && !queryContext) {
    redirect("/login");
  }

  const [meResult, sisSnap, messages] = await Promise.all([
    loadParentMe(),
    loadParentSisSnapshot(),
    loadParentMessages(),
  ]);

  // Hard fence: staff (emails on ADMIN_EMAILS) must never see the
  // parent tree, even if they also happen to have a Lead record from
  // testing. Admins belong on /admin/admissions. We short-circuit as
  // soon as /me confirms `isAdmin` so the downstream payload parsing
  // can assume we're dealing with a real parent session.
  if (meResult.kind === "ok" && meResult.payload.isAdmin === true) {
    redirect("/admin/admissions");
  }

  const meContext =
    meResult.kind === "ok" ? getParentAdmissionsContextFromMePayload(meResult.payload) : null;
  const context = meContext ?? queryContext;

  if (!context) {
    return await renderParentDashboardError(meResult);
  }

  const latestPayment = meResult.kind === "ok" ? meResult.payload.latestPayment ?? null : null;
  const unreadMessageCount =
    meResult.kind === "ok" && typeof meResult.payload.unreadMessageCount === "number"
      ? meResult.payload.unreadMessageCount
      : null;
  const config = getDashboardConfig(
    "parent",
    context,
    sisSnap,
    latestPayment,
    messages,
    unreadMessageCount,
  );
  if (!config) notFound();

  return <DashboardShell config={config} />;
}

async function renderParentDashboardError(meResult: MeResult) {
  const { t } = await getServerI18n();
  const status = meResult.kind === "error" ? meResult.status : 0;
  const detail = meResult.kind === "error" ? meResult.detail : "No parent context returned";
  const isAuth = status === 401 || status === 403;
  // 404 here usually means "admin-only account with no Lead". Give
  // them a direct link out instead of a generic 'try again'.
  const looksLikeAdminOnly = status === 404 && detail.toLowerCase().includes("lead");

  return (
    <Screen>
      <Tile variant="hero">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--warm-coral)]">
          {t("parent.error.cant_load_title")}
        </p>
        <h1 className="parent-text-serif mt-3 text-[clamp(26px,5vw,34px)] leading-tight text-[color:var(--ink-900)]">
          {looksLikeAdminOnly
            ? t("parent.error.admin_only_body")
            : t("parent.error.cant_load_body")}
        </h1>
        <p className="mt-3 font-mono text-[11px] text-[color:var(--ink-400)]">
          {status || "n/a"} · {detail}
        </p>
        <div className="mt-6">
          <BigButton
            href={
              looksLikeAdminOnly
                ? "/admin/admissions"
                : isAuth
                  ? "/login"
                  : "/parent/dashboard"
            }
          >
            {looksLikeAdminOnly
              ? t("parent.error.to_admin")
              : isAuth
                ? t("parent.error.to_login")
                : t("parent.error.retry")}
          </BigButton>
        </div>
        <div className="mt-3 text-center">
          <Link
            href="/"
            className="text-sm text-[color:var(--ink-500)] underline underline-offset-4"
          >
            {t("common.navigation.home")}
          </Link>
        </div>
      </Tile>
    </Screen>
  );
}
