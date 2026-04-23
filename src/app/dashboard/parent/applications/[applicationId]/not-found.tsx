import Link from "next/link";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { getParentApplications } from "@/features/admissions-portal/application/get-parent-applications";
import { createAdmissionsPortalRepository } from "@/features/admissions-portal/infrastructure/create-admissions-portal-repository";
import { fetchParentMe } from "@/features/admissions-portal/infrastructure/fetch-parent-me";
import { getParentApplicationDetailHref } from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";
import { getParentAdmissionsContextFromMePayload } from "@/lib/dashboard-data";
import { getServerI18n } from "@/i18n/server";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * Specific 404 page that replaces the generic Next.js `not-found` for the
 * parent application routes. Design principle #6: list the parent's real
 * children with their current status so they can recover with one click
 * instead of staring at "page not found".
 */
export default async function ParentApplicationNotFound() {
  const { t } = await getServerI18n();

  // Fetch the parent's real children so we can list them. If the session
  // is absent or the /me call fails, render a graceful fallback pointing
  // back to the dashboard — we never want this page to itself 500.
  let children: { id: string; studentName: string; statusLabel: string; statusRaw: string }[] = [];
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const meResult = await fetchParentMe(token);
      if (meResult.kind === "ok") {
        const context = getParentAdmissionsContextFromMePayload(meResult.payload);
        if (context) {
          const repository = createAdmissionsPortalRepository(token);
          const applications = await getParentApplications(repository, context);
          children = applications.map((app) => ({
            id: app.id,
            studentName: app.studentName,
            statusLabel: t(app.statusLabelKey),
            statusRaw: app.status,
          }));
        }
      }
    }
  } catch {
    // Swallow — fall through to empty state.
  }

  return (
    <div className="dashboard-bg min-h-screen pb-10 pt-6 sm:pt-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="surface-card rounded-3xl p-5 sm:p-6">
          <PageHeader
            breadcrumbs={[
              { label: t("ui.breadcrumb.home"), href: "/" },
              { label: t("ui.breadcrumb.parent_dashboard"), href: "/parent/dashboard" },
              { label: t("ui.breadcrumb.application") },
            ]}
            eyebrow={t("ui.breadcrumb.application")}
            title={t("ui.not_found.title")}
            subtitle={t("ui.not_found.description")}
            size="compact"
          />

          <div className="mt-5">
            {children.length === 0 ? (
              <p className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/50 p-4 text-sm text-[var(--ds-text-primary)]">
                {t("ui.not_found.no_students")}
              </p>
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                  {t("ui.not_found.students_header")}
                </p>
                <ul className="mt-3 space-y-2">
                  {children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={getParentApplicationDetailHref(child.id)}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-3 transition hover:border-[var(--ds-primary)]"
                      >
                        <span className="truncate text-sm font-semibold text-[var(--ds-text-primary)]">
                          {child.studentName}
                        </span>
                        <StatusPill
                          label={child.statusLabel || t("ui.not_found.child_status_fallback")}
                          status={child.statusRaw}
                          size="sm"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-5">
              <Link
                href="/parent/dashboard"
                className="cta-primary inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                {t("ui.not_found.back_to_dashboard")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
