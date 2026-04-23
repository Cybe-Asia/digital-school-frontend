import Link from "next/link";
import { getServerI18n } from "@/i18n/server";

/**
 * Role entry-points on the landing page. Labels + destinations are the
 * only things we're confident about; per-role "sample metrics" were
 * dropped when the mock dashboardData fixtures were deleted — we would
 * rather link plainly to each persona than show invented numbers on a
 * public marketing page.
 */
const ROLE_ENTRIES: Array<{
  href: string;
  roleLabelKey: string;
  titleKey: string;
  subtitleKey: string;
}> = [
  {
    href: "/dashboard/student",
    roleLabelKey: "dashboard.student.role_label",
    titleKey: "dashboard.student.title",
    subtitleKey: "dashboard.student.subtitle",
  },
  {
    href: "/parent/dashboard",
    roleLabelKey: "dashboard.parent.role_label",
    titleKey: "dashboard.parent.title",
    subtitleKey: "dashboard.parent.subtitle",
  },
  {
    href: "/admin/admissions",
    roleLabelKey: "dashboard.staff.role_label",
    titleKey: "dashboard.staff.title",
    subtitleKey: "dashboard.staff.subtitle",
  },
];

export default async function HomePageContent() {
  const { t } = await getServerI18n();

  return (
    <div className="dashboard-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-[1240px] flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="hero-panel rounded-3xl p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">
            {t("common.brand.twsi")}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[var(--ds-text-primary)] sm:text-5xl">
            {t("home.hero.title")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--ds-text-secondary)] sm:text-base">
            {t("home.hero.description")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admissions/register" className="cta-primary rounded-xl px-5 py-2.5 text-sm font-semibold">
              {t("home.hero.eoi_cta")}
            </Link>
            <Link href="/dashboard/student" className="cta-primary rounded-xl px-5 py-2.5 text-sm font-semibold">
              {t("home.hero.student_cta")}
            </Link>
            <Link
              href="/parent/dashboard"
              className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--ds-text-primary)]"
            >
              {t("home.hero.parent_cta")}
            </Link>
            <Link
              href="/admin/admissions"
              className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--ds-text-primary)]"
            >
              {t("home.hero.staff_cta")}
            </Link>
          </div>
        </section>

        <section className="mt-7 grid gap-4 md:grid-cols-3">
          {ROLE_ENTRIES.map((entry) => (
            <article key={entry.roleLabelKey} className="surface-card rounded-3xl p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-text-secondary)]">
                {t(entry.roleLabelKey)}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">{t(entry.titleKey)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(entry.subtitleKey)}</p>
              <Link
                href={entry.href}
                className="mt-6 inline-flex rounded-xl bg-[var(--ds-primary)] px-4 py-2 text-sm font-semibold text-[var(--ds-on-primary)] transition hover:bg-[var(--ds-cta-fill-2)]"
              >
                {t("home.role.view", { role: t(entry.roleLabelKey) })}
              </Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
