import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import {
  DashboardConfig,
  DashboardRole,
  dashboardRoles,
} from "@/lib/dashboard-data";

type DashboardShellProps = {
  config: DashboardConfig;
};

const roleLabelMap: Record<DashboardRole, string> = {
  student: "Student",
  parent: "Parent",
  staff: "Staff/Admin",
};

function statusClassName(status: string): string {
  if (status === "Excellent" || status === "On Track" || status === "Improving") {
    return "status-pill status-positive";
  }

  if (status === "At Risk" || status === "Delayed" || status === "Watchlist") {
    return "status-pill status-negative";
  }

  return "status-pill status-neutral";
}

function priorityClassName(priority: string): string {
  if (priority === "High") {
    return "priority-chip priority-high";
  }

  if (priority === "Low") {
    return "priority-chip priority-low";
  }

  return "priority-chip priority-medium";
}

export default function DashboardShell({ config }: DashboardShellProps) {
  const todayLabel = new Intl.DateTimeFormat("en-GB", {
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
              TWSI Digital School
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)] sm:text-3xl">
              Role-Based Dashboard Suite
            </h1>
            <p className="mt-2 text-sm text-[var(--ds-text-secondary)]">{todayLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
                {roleLabelMap[role]}
              </Link>
            ))}
            <Link
              href="/"
              className="rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]"
            >
              Home
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="surface-card h-fit rounded-3xl p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
              {config.roleLabel}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">{config.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{config.subtitle}</p>

            <nav className="mt-6 space-y-2">
              {config.navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                    item.active
                      ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
                      : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="space-y-6">
            <section className="hero-panel rounded-3xl p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">
                Unified Portal Experience
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)] sm:text-3xl">
                {config.roleLabel}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                Built on the roadmap architecture: persona-driven queries, attendance and learning aggregation,
                communication alerts, and finance visibility from one consistent UX layer.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className="cta-primary rounded-xl px-4 py-2 text-sm font-semibold">
                  Open Reports
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)]"
                >
                  View Calendar
                </button>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {config.metrics.map((metric) => (
                <article key={metric.label} className="surface-card rounded-2xl p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-text-secondary)]">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">{metric.value}</p>
                  <p className="mt-2 text-sm text-[var(--ds-primary)]">{metric.trend}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
              <article className="surface-card rounded-3xl p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-[var(--ds-text-primary)]">Learning & Operations Pulse</h3>
                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                  Metrics aligned with roadmap dashboard aggregation contracts.
                </p>
                <div className="mt-5 space-y-4">
                  {config.progress.map((item) => {
                    const width = `${Math.min(100, Math.round((item.value / item.max) * 100))}%`;

                    return (
                      <div key={item.label}>
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                          <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{item.label}</p>
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
                        <p className="mt-2 text-xs text-[var(--ds-text-secondary)]">{item.helper}</p>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="surface-card rounded-3xl p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-[var(--ds-text-primary)]">Alerts & Action Queue</h3>
                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">Prioritized from communication and event rules.</p>
                <div className="mt-4 space-y-3">
                  {config.alerts.map((alert) => (
                    <div key={alert.title} className="rounded-2xl border border-[var(--ds-border)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{alert.title}</p>
                        <span className={priorityClassName(alert.priority)}>{alert.priority}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{alert.detail}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
              <article className="surface-card rounded-3xl p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-[var(--ds-text-primary)]">Today Schedule</h3>
                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">Asia/Jakarta timezone schedule stream.</p>
                <div className="mt-4 space-y-3">
                  {config.schedule.map((item) => (
                    <div key={`${item.time}-${item.title}`} className="flex gap-3 rounded-2xl border border-[var(--ds-border)] p-4">
                      <div className="w-16 shrink-0 text-sm font-semibold text-[var(--ds-primary)]">{item.time}</div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{item.title}</p>
                        <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">{item.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="surface-card rounded-3xl p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-[var(--ds-text-primary)]">{config.tableTitle}</h3>
                  <span className="rounded-full bg-[var(--ds-soft)] px-3 py-1 text-xs font-semibold text-[var(--ds-text-primary)]">
                    Live Aggregation
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr>
                        {config.tableColumns.map((column) => (
                          <th
                            key={column}
                            className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {config.tableRows.map((row) => (
                        <tr key={`${row.columnA}-${row.columnB}`} className="bg-[var(--ds-soft)]/45">
                          <td className="rounded-l-xl px-3 py-3 text-sm font-semibold text-[var(--ds-text-primary)]">
                            {row.columnA}
                          </td>
                          <td className="px-3 py-3 text-sm text-[var(--ds-text-primary)]">{row.columnB}</td>
                          <td className="px-3 py-3 text-sm text-[var(--ds-text-primary)]">{row.columnC}</td>
                          <td className="rounded-r-xl px-3 py-3">
                            <span className={statusClassName(row.status)}>{row.status}</span>
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
