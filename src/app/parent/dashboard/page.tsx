import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
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

  const [meResult, sisSnap] = await Promise.all([loadParentMe(), loadParentSisSnapshot()]);

  const meContext =
    meResult.kind === "ok" ? getParentAdmissionsContextFromMePayload(meResult.payload) : null;
  const context = meContext ?? queryContext;

  if (!context) {
    return <ParentDashboardError meResult={meResult} />;
  }

  const latestPayment = meResult.kind === "ok" ? meResult.payload.latestPayment ?? null : null;
  const config = getDashboardConfig("parent", context, sisSnap, latestPayment);
  if (!config) notFound();

  return <DashboardShell config={config} />;
}

function ParentDashboardError({ meResult }: { meResult: MeResult }) {
  const status = meResult.kind === "error" ? meResult.status : 0;
  const detail = meResult.kind === "error" ? meResult.detail : "No parent context returned";
  const isAuth = status === 401 || status === 403;

  return (
    <div className="dashboard-bg min-h-screen pb-10">
      <div className="mx-auto max-w-[760px] px-4 pt-10 sm:px-6">
        <div className="surface-card rounded-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-error,#b91c1c)]">
            Dasbor tidak bisa dimuat
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">
            Kami tidak berhasil mengambil data keluarga Anda
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ds-text-secondary)]">
            Dasbor Orang Tua menolak menampilkan data contoh. Ini adalah
            kesalahan nyata dari layanan <code>/me</code>. Detail di bawah ini
            membantu tim kami memperbaikinya.
          </p>

          <dl className="mt-6 grid gap-3 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/40 p-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="font-semibold text-[var(--ds-text-secondary)]">HTTP status</dt>
              <dd className="font-mono text-[var(--ds-text-primary)]">{status || "n/a"}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="font-semibold text-[var(--ds-text-secondary)]">Detail</dt>
              <dd className="max-w-[420px] break-words text-right font-mono text-xs text-[var(--ds-text-primary)]">
                {detail}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {isAuth ? (
              <Link
                href="/login"
                className="cta-primary rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Login ulang
              </Link>
            ) : (
              <Link
                href="/parent/dashboard"
                className="cta-primary rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Coba lagi
              </Link>
            )}
            <Link
              href="/"
              className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)]"
            >
              Kembali ke beranda
            </Link>
          </div>

          <p className="mt-5 text-xs text-[var(--ds-text-secondary)]">
            Catatan: kami sengaja TIDAK menampilkan dasbor contoh di sini —
            kalau data keluarga tidak tersedia, kami lebih baik kelihatan
            kosong daripada menunjukkan angka palsu.
          </p>
        </div>
      </div>
    </div>
  );
}
