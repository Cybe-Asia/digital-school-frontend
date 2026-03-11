"use client";

import Link from "next/link";
import LanguageToggle from "@/components/language-toggle";
import ThemeToggle from "@/components/theme-toggle";
import { useI18n } from "@/i18n";
import {
  type DashboardConfig,
  type DashboardRole,
  dashboardRoles,
  type PriorityId,
  type StatusId,
} from "@/lib/dashboard-data";

type DashboardShellProps = {
  config: DashboardConfig;
};

const roleLabelMap: Record<DashboardRole, string> = {
  student: "dashboard.roles.student",
  parent: "dashboard.roles.parent",
  staff: "dashboard.roles.staff",
};

const statusLabelMap: Record<StatusId, string> = {
  excellent: "dashboard.status.excellent",
  improving: "dashboard.status.improving",
  needs_review: "dashboard.status.needs_review",
  attention_needed: "dashboard.status.attention_needed",
  watchlist: "dashboard.status.watchlist",
  on_track: "dashboard.status.on_track",
  at_risk: "dashboard.status.at_risk",
  delayed: "dashboard.status.delayed",
};

const priorityLabelMap: Record<PriorityId, string> = {
  high: "common.priority.high",
  medium: "common.priority.medium",
  low: "common.priority.low",
};

function statusClassName(status: StatusId): string {
  if (status === "excellent" || status === "on_track" || status === "improving") {
    return "status-pill status-positive";
  }

  if (status === "at_risk" || status === "delayed" || status === "watchlist") {
    return "status-pill status-negative";
  }

  return "status-pill status-neutral";
}

function priorityClassName(priority: PriorityId): string {
  if (priority === "high") {
    return "priority-chip priority-high";
  }

  if (priority === "low") {
    return "priority-chip priority-low";
  }

  return "priority-chip priority-medium";
}

function renderCell(key: string | undefined, text: string | undefined, t: (key: string, values?: Record<string, string | number>) => string) {
  if (key) {
    return t(key);
  }

  return text ?? "";
}

export default function DashboardShell({ config }: DashboardShellProps) {
  const { language, t } = useI18n();
  const todayLabel = new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  return (
    <div className="dashboard-bg min-h-screen pb-10">
      <div className="mx-auto max-w-[1320px] px-4 pt-6 sm:px-6 lg:px-8">
        <header className="brand-header mb-6 flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">
              {t("common.brand.twsi")}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)] sm:text-3xl">
              {t("dashboard.shell.title")}
            </h1>
            <p className="mt-2 text-sm text-[var(--ds-text-secondary)]">{todayLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            {dashboardRoles.map((role) => (
              <Link
                key={role}
                href={`/dashboard/${role}`}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  role === config.role
                    ? "border-transparent bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
                    : "border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text-primary)] hover:bg-[var(--ds-highlight)] hover:text-[#0e1b2a]"
                }`}
              >
                {t(roleLabelMap[role])}
              </Link>
            ))}
            <Link
              href="/"
              className="rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]"
            >
              {t("common.navigation.home")}
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="surface-card h-fit rounded-3xl p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
              {t(config.roleLabelKey)}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">{t(config.titleKey)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(config.subtitleKey)}</p>

            <nav className="mt-6 space-y-2">
              {config.navItems.map((item) => (
                <button
                  key={item.labelKey}
                  type="button"
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                    item.active
                      ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
                      : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>
          </aside>

          <main className="space-y-6">
            <section className="hero-panel rounded-3xl p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">
                {t("dashboard.shell.experience_eyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)] sm:text-3xl">
                {t(config.roleLabelKey)}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                {t("dashboard.shell.experience_description")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className="cta-primary rounded-xl px-4 py-2 text-sm font-semibold">
                  {t("common.actions.open_reports")}
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)]"
                >
                  {t("common.actions.view_calendar")}
                </button>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {config.metrics.map((metric) => (
                <article key={metric.labelKey} className="surface-card rounded-2xl p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-text-secondary)]">
                    {t(metric.labelKey)}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">{metric.value}</p>
                  <p className="mt-2 text-sm text-[var(--ds-primary)]">{t(metric.trendKey)}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
              <article className="surface-card rounded-3xl p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-[var(--ds-text-primary)]">{t("dashboard.shell.learning_pulse_title")}</h3>
                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                  {t("dashboard.shell.learning_pulse_description")}
                </p>
                <div className="mt-5 space-y-4">
                  {config.progress.map((item) => {
                    const width = `${Math.min(100, Math.round((item.value / item.max) * 100))}%`;

                    return (
                      <div key={item.labelKey}>
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                          <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(item.labelKey)}</p>
                          <p className="text-sm font-semibold text-[var(--ds-accent)]">
                            {item.value}/{item.max}
                          </p>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--ds-soft)]">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[var(--ds-primary)] to-[var(--ds-highlight)]"
                            style={{ width }}
                            aria-hidden="true"
                          />
                        </div>
                        <p className="mt-2 text-xs text-[var(--ds-text-secondary)]">{t(item.helperKey)}</p>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="surface-card rounded-3xl p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-[var(--ds-text-primary)]">{t("dashboard.shell.alerts_title")}</h3>
                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t("dashboard.shell.alerts_description")}</p>
                <div className="mt-4 space-y-3">
                  {config.alerts.map((alert) => (
                    <div key={alert.titleKey} className="rounded-2xl border border-[var(--ds-border)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(alert.titleKey)}</p>
                        <span className={priorityClassName(alert.priority)}>{t(priorityLabelMap[alert.priority])}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(alert.detailKey)}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
              <article className="surface-card rounded-3xl p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-[var(--ds-text-primary)]">{t("dashboard.shell.schedule_title")}</h3>
                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t("dashboard.shell.schedule_description")}</p>
                <div className="mt-4 space-y-3">
                  {config.schedule.map((item) => (
                    <div key={`${item.time}-${item.titleKey}`} className="flex gap-3 rounded-2xl border border-[var(--ds-border)] p-4">
                      <div className="w-16 shrink-0 text-sm font-semibold text-[var(--ds-primary)]">{item.time}</div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(item.titleKey)}</p>
                        <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">{t(item.metaKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="surface-card rounded-3xl p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-[var(--ds-text-primary)]">{t(config.tableTitleKey)}</h3>
                  <span className="rounded-full bg-[var(--ds-soft)] px-3 py-1 text-xs font-semibold text-[var(--ds-text-primary)]">
                    {t("dashboard.shell.live_aggregation")}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr>
                        {config.tableColumnKeys.map((columnKey) => (
                          <th
                            key={columnKey}
                            className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]"
                          >
                            {t(columnKey)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {config.tableRows.map((row, index) => (
                        <tr key={`${config.role}-${index}`} className="bg-[var(--ds-soft)]/45">
                          <td className="rounded-l-xl px-3 py-3 text-sm font-semibold text-[var(--ds-text-primary)]">
                            {renderCell(row.columnAKey, row.columnA, t)}
                          </td>
                          <td className="px-3 py-3 text-sm text-[var(--ds-text-primary)]">
                            {renderCell(row.columnBKey, row.columnB, t)}
                          </td>
                          <td className="px-3 py-3 text-sm text-[var(--ds-text-primary)]">
                            {renderCell(row.columnCKey, row.columnC, t)}
                          </td>
                          <td className="rounded-r-xl px-3 py-3">
                            <span className={statusClassName(row.status)}>{t(statusLabelMap[row.status])}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
