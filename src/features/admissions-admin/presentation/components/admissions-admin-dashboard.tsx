import Link from "next/link";
import type { AdmissionsAdminDashboard as AdmissionsAdminDashboardData } from "@/features/admissions-admin/domain/types";
import { getServerI18n } from "@/i18n/server";

type AdmissionsAdminDashboardProps = {
  dashboard: AdmissionsAdminDashboardData;
};

export default async function AdmissionsAdminDashboard({ dashboard }: AdmissionsAdminDashboardProps) {
  const { t } = await getServerI18n();

  return (
    <div className="dashboard-bg min-h-screen pb-10">
      <div className="mx-auto max-w-[1380px] px-4 pt-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[32px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-primary)]">
                {t("admissions.admin.eyebrow")}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-[var(--ds-text-primary)]">
                {t("admissions.admin.title")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--ds-text-secondary)]">
                {t("admissions.admin.description")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]"
              >
                {t("common.navigation.home")}
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["pipeline", "applications", "payments", "documents", "decisions"].map((item) => (
              <span
                key={item}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  item === "pipeline"
                    ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
                    : "border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text-primary)]"
                }`}
              >
                {t(`admissions.admin.nav.${item}`)}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.summaryCards.map((card) => (
            <article key={card.labelKey} className="surface-card rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                {t(card.labelKey)}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ds-text-primary)]">{card.value}</p>
              <p className="mt-2 text-sm text-[var(--ds-text-secondary)]">{t(card.helperKey)}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <article className="surface-card rounded-[32px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                  {t("admissions.admin.pipeline.title")}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">
                  {t("admissions.admin.pipeline.heading")}
                </h2>
              </div>
              <span className="rounded-full bg-[var(--ds-soft)] px-3 py-1 text-xs font-semibold text-[var(--ds-text-primary)]">
                {t("admissions.admin.pipeline.today")}
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
              {dashboard.pipeline.map((column) => (
                <section key={column.titleKey} className="rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(column.titleKey)}</p>
                    <span className="rounded-full bg-[var(--ds-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--ds-text-primary)]">
                      {column.count}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {column.items.map((item) => (
                      <article key={`${item.studentName}-${item.parentName}`} className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{item.studentName}</p>
                            <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">{item.parentName}</p>
                          </div>
                          <span className="status-pill status-neutral">{t(item.badgeKey)}</span>
                        </div>
                        <p className="mt-3 text-sm text-[var(--ds-text-secondary)]">{t(item.detailKey)}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <div className="space-y-6">
            <article className="surface-card rounded-[32px] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                {t("admissions.admin.queue.title")}
              </p>
              <div className="mt-4 space-y-3">
                {dashboard.priorityQueues.map((queue) => (
                  <div key={queue.titleKey} className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(queue.titleKey)}</p>
                      <span className="rounded-full bg-[var(--ds-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--ds-text-primary)]">
                        {queue.count}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--ds-text-secondary)]">{t(queue.helperKey)}</p>
                    <button type="button" className="mt-4 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)]">
                      {t(queue.ctaKey)}
                    </button>
                  </div>
                ))}
              </div>
            </article>

            <article className="surface-card rounded-[32px] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                {t("admissions.admin.timeline.title")}
              </p>
              <div className="mt-4 space-y-3">
                {dashboard.upcomingItems.map((item) => (
                  <div key={`${item.time}-${item.titleKey}`} className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">{item.time}</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--ds-text-primary)]">{t(item.titleKey)}</p>
                    <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t(item.detailKey)}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
