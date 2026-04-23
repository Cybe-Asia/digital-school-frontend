import Link from "next/link";
import { cookies } from "next/headers";
import { BigButton, KidAvatar, Screen, Tile } from "@/components/parent-ui";
import { getParentApplications } from "@/features/admissions-portal/application/get-parent-applications";
import { createAdmissionsPortalRepository } from "@/features/admissions-portal/infrastructure/create-admissions-portal-repository";
import { fetchParentMe } from "@/features/admissions-portal/infrastructure/fetch-parent-me";
import { getParentApplicationDetailHref } from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";
import { getParentAdmissionsContextFromMePayload } from "@/lib/dashboard-data";
import { getServerI18n } from "@/i18n/server";
import { ArrowIcon } from "@/components/parent-ui/icons";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * 404 for parent application routes. Redesigned 2026. Instead of a
 * "page not found" with a breadcrumb + status pill, we use the warm
 * parent canvas and list the parent's real kids so they can recover
 * in one tap.
 */
export default async function ParentApplicationNotFound() {
  const { t } = await getServerI18n();

  let children: { id: string; studentName: string }[] = [];
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
          }));
        }
      }
    }
  } catch {
    // Swallow — fall through to empty state.
  }

  return (
    <Screen>
      <Tile variant="hero" className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
          404
        </p>
        <h1 className="parent-text-serif mt-2 text-[clamp(26px,5vw,34px)] leading-tight text-[color:var(--ink-900)]">
          {t("ui.not_found.title")}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
          {t("ui.not_found.description")}
        </p>
      </Tile>

      {children.length > 0 ? (
        <div className="space-y-3">
          {children.map((child) => (
            <Tile key={child.id} href={getParentApplicationDetailHref(child.id)}>
              <div className="flex items-center gap-3">
                <KidAvatar name={child.studentName} size={44} />
                <p className="parent-text-serif flex-1 text-[17px] text-[color:var(--ink-900)]">
                  {child.studentName}
                </p>
                <span className="h-4 w-4 text-[color:var(--ink-400)]" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </div>
            </Tile>
          ))}
        </div>
      ) : (
        <Tile variant="flat">
          <p className="text-sm text-[color:var(--ink-500)]">
            {t("ui.not_found.no_students")}
          </p>
        </Tile>
      )}

      <div className="mt-6">
        <BigButton href="/parent/dashboard" variant="ghost">
          {t("ui.not_found.back_to_dashboard")}
        </BigButton>
      </div>

      <p className="mt-4 text-center text-sm">
        <Link
          href="/"
          className="text-[color:var(--ink-400)] underline underline-offset-4"
        >
          {t("common.navigation.home")}
        </Link>
      </p>
    </Screen>
  );
}
