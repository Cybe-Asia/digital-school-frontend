"use client";

import Link from "next/link";
import LanguageToggle from "@/components/language-toggle";
import ThemeToggle from "@/components/theme-toggle";
import { useI18n } from "@/i18n";
import { dashboardData, dashboardRoles } from "@/lib/dashboard-data";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="dashboard-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-[1240px] flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-end gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
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
              href="/dashboard/parent"
              className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--ds-text-primary)]"
            >
              {t("home.hero.parent_cta")}
            </Link>
            <Link
              href="/dashboard/staff"
              className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--ds-text-primary)]"
            >
              {t("home.hero.staff_cta")}
            </Link>
          </div>
        </section>

        <section className="mt-7 grid gap-4 md:grid-cols-3">
          {dashboardRoles.map((role) => {
            const data = dashboardData[role];

            return (
              <article key={role} className="surface-card rounded-3xl p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-text-secondary)]">
                  {t(data.roleLabelKey)}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">{t(data.titleKey)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(data.subtitleKey)}</p>
                <div className="mt-5 space-y-2">
                  {data.metrics.slice(0, 3).map((metric) => (
                    <div key={metric.labelKey} className="flex items-center justify-between rounded-xl bg-[var(--ds-soft)] px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                        {t(metric.labelKey)}
                      </span>
                      <span className="text-sm font-semibold text-[var(--ds-text-primary)]">{metric.value}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/dashboard/${role}`}
                  className="mt-6 inline-flex rounded-xl bg-[var(--ds-primary)] px-4 py-2 text-sm font-semibold text-[var(--ds-on-primary)] transition hover:bg-[var(--ds-cta-fill-2)]"
                >
                  {t("home.role.view", { role: t(data.roleLabelKey) })}
                </Link>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
