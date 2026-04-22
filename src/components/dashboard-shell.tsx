import Link from "next/link";
import {
  buildParentApplicationId,
  getParentApplicationDetailHref,
  getParentApplicationSectionHref,
} from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";
import ParentPortalScrollNav from "@/features/admissions-portal/presentation/components/parent-portal-scroll-nav";
import ParentPortalStickyHeader from "@/features/admissions-portal/presentation/components/parent-portal-sticky-header";
import { AddAnotherChildButton } from "@/features/admissions-auth/presentation/components/add-another-child-button";
import { StatusBadge, StudentStatusStepper } from "@/features/admissions-common/status-badge";
import { getServerI18n } from "@/i18n/server";
import {
  type DashboardConfig,
  type DashboardRole,
  type ParentPortalExperience,
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

function getDashboardRoleHref(role: DashboardRole): string {
  if (role === "staff") {
    return "/admin/admissions";
  }

  return `/dashboard/${role}`;
}

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

function timelineStateClassName(state: ParentPortalExperience["timeline"][number]["state"]): string {
  if (state === "complete") {
    return "bg-[var(--ds-primary)] text-[var(--ds-on-primary)]";
  }

  if (state === "active") {
    return "bg-[var(--ds-highlight)] text-[#0e1b2a]";
  }

  return "bg-[var(--ds-soft)] text-[var(--ds-text-secondary)]";
}

function timelineLineClassName(state: ParentPortalExperience["timeline"][number]["state"]): string {
  if (state === "complete") {
    return "bg-[var(--ds-primary)]";
  }

  if (state === "active") {
    return "bg-[var(--ds-accent)]";
  }

  return "bg-[var(--ds-border)]";
}

function formatBirthDate(value: string | undefined, language: string): string | null {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsedDate);
}

function getStudentPortalHref(
  admissionsContext: NonNullable<DashboardConfig["admissionsContext"]>,
  studentCard: ParentPortalExperience["studentCards"][number],
  index: number,
) {
  const applicationId = buildParentApplicationId(studentCard.studentName, index);

  if (studentCard.status === "attention_needed") {
    return getParentApplicationSectionHref(admissionsContext, applicationId, "documents");
  }

  if (studentCard.status === "excellent") {
    return getParentApplicationSectionHref(admissionsContext, applicationId, "schedule");
  }

  return getParentApplicationDetailHref(admissionsContext, applicationId);
}

export default async function DashboardShell({ config }: DashboardShellProps) {
  const { language, t } = await getServerI18n();
  const todayLabel = new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  const admissionsContext = config.admissionsContext;
  const parentPortal = config.parentPortal;
  const isParentPortal = config.role === "parent" && Boolean(admissionsContext && parentPortal);
  const firstApplicationHref =
    admissionsContext && admissionsContext.students[0]
      ? getParentApplicationDetailHref(
          admissionsContext,
          buildParentApplicationId(admissionsContext.students[0].studentName, 0),
        )
      : null;
  const firstPaymentHref =
    admissionsContext && admissionsContext.students[0]
      ? getParentApplicationSectionHref(
          admissionsContext,
          buildParentApplicationId(admissionsContext.students[0].studentName, 0),
          "payment",
        )
      : null;

  return (
    <div className="dashboard-bg min-h-screen pb-10">
      <div className="mx-auto max-w-[1320px] px-4 pt-6 sm:px-6 lg:px-8">
        {isParentPortal ? (
          <ParentPortalStickyHeader
            brandLabel={t("common.brand.twsi")}
            title={t("dashboard.parent.portal.header.title")}
            subtitle={t("dashboard.parent.portal.header.subtitle", {
              count: admissionsContext?.students.length ?? 0,
              school: parentPortal?.schoolShortName ?? "",
            })}
            actions={
              <Link
                href="/"
                className="rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]"
              >
                {t("common.navigation.home")}
              </Link>
            }
          />
        ) : (
          <header className="brand-header mb-6 flex flex-col gap-4 rounded-3xl p-5 transition-all sm:flex-row sm:items-center sm:justify-between sm:p-6">
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
              {dashboardRoles.map((role) => (
                <Link
                  key={role}
                  href={getDashboardRoleHref(role)}
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
        )}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className={`surface-card h-fit rounded-3xl p-5 sm:p-6 ${isParentPortal ? "lg:sticky lg:top-3 lg:z-10" : ""}`}>
            {isParentPortal ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
                  {t("dashboard.parent.portal.sidebar.title")}
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
                  {t(config.roleLabelKey)}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--ds-text-primary)]">{t(config.titleKey)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(config.subtitleKey)}</p>
              </>
            )}

            {isParentPortal ? (
              <ParentPortalScrollNav items={config.navItems} />
            ) : (
              <nav className="mt-6 space-y-2">
                {config.navItems.map((item) => (
                  <Link
                    key={item.labelKey}
                    href={item.href ?? "#"}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                      item.active
                        ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
                        : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p>{t(item.labelKey, item.descriptionValues)}</p>
                        {item.descriptionKey ? (
                          <p
                            className={`mt-1 text-xs leading-relaxed ${
                              item.active ? "text-[var(--ds-on-primary)]/85" : "text-[var(--ds-text-secondary)]"
                            }`}
                          >
                            {t(item.descriptionKey, item.descriptionValues)}
                          </p>
                        ) : null}
                      </div>
                      {item.badge ? (
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                            item.active
                              ? "bg-[var(--ds-on-primary)]/18 text-[var(--ds-on-primary)]"
                              : "bg-[var(--ds-soft)] text-[var(--ds-text-primary)]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </nav>
            )}
          </aside>

          <main className="space-y-6">
            {isParentPortal ? null : (
              <section className="hero-panel rounded-3xl p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">
                {t("dashboard.shell.experience_eyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)] sm:text-3xl">
                {config.role === "parent" && admissionsContext
                  ? t("dashboard.parent.portal.hero.title", { parent: admissionsContext.parentName })
                  : t(config.roleLabelKey)}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                {config.role === "parent" && admissionsContext
                  ? t("dashboard.parent.portal.hero.description", {
                      count: admissionsContext.students.length,
                      school: parentPortal?.schoolShortName ?? "",
                    })
                  : t("dashboard.shell.experience_description")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={config.role === "parent" && firstApplicationHref ? firstApplicationHref : "#registered-students"}
                  className="cta-primary rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  {config.role === "parent" && admissionsContext
                    ? t("dashboard.parent.portal.hero.primary_cta")
                    : t("common.actions.open_reports")}
                </Link>
                <Link
                  href={config.role === "parent" && admissionsContext ? "#contact-desk" : "#"}
                  className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)]"
                >
                  {config.role === "parent" && admissionsContext
                    ? t("dashboard.parent.portal.hero.secondary_cta")
                    : t("common.actions.view_calendar")}
                </Link>
              </div>
              </section>
            )}

            {config.role === "parent" && admissionsContext && parentPortal ? (
              <>
                <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                  {parentPortal.summaryCards.map((card) => (
                    <article key={card.labelKey} className="surface-card rounded-2xl p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-text-secondary)]">
                        {t(card.labelKey)}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">{card.value}</p>
                      <p className="mt-2 text-sm text-[var(--ds-primary)]">{t(card.helperKey, card.helperValues)}</p>
                    </article>
                  ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                  <div className="space-y-6">
                    <article id="family-overview" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                        {t("dashboard.parent.portal.family.title")}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                        {t("dashboard.parent.portal.family.heading", { parent: admissionsContext.parentName })}
                      </h3>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t("auth.eoi.email_label")}</p>
                          <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">{admissionsContext.email}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t("auth.eoi.location_label")}</p>
                          <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">{admissionsContext.locationSuburb}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t("auth.eoi.school_label")}</p>
                          <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">{t(`auth.eoi.school.${admissionsContext.school}`)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t("dashboard.parent.portal.family.registered_label")}</p>
                          <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">
                            {t("dashboard.parent.portal.family.registered_value", { count: admissionsContext.students.length })}
                          </p>
                        </div>
                      </div>
                    </article>

                    <article id="registered-students" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                            {t("dashboard.parent.portal.students.title")}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                            {t("dashboard.parent.portal.students.heading")}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-[var(--ds-soft)] px-3 py-1 text-xs font-semibold text-[var(--ds-text-primary)]">
                            {t("dashboard.parent.portal.students.count_chip", { count: admissionsContext.students.length })}
                          </span>
                          <AddAnotherChildButton />
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4">
                        {parentPortal.studentCards.map((studentCard, index) => (
                          <div key={`${studentCard.studentName}-${index}`} className="rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4 sm:p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                  {t("auth.additional.student_section_title", { number: index + 1 })}
                                </p>
                                <h4 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">{studentCard.studentName}</h4>
                                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                                  {t("auth.additional.target_grade_label")}: {t(`auth.additional.target_grade.${studentCard.targetGrade}`)}
                                </p>
                              </div>
                              {/* Prefer the real backend status if /me returned it; fall back
                                  to the mock status label for pre-/me deep-linked dashboards. */}
                              {studentCard.applicantStatus ? (
                                <StatusBadge status={studentCard.applicantStatus} />
                              ) : (
                                <span className={statusClassName(studentCard.status)}>{t(studentCard.statusLabelKey)}</span>
                              )}
                            </div>

                            {studentCard.applicantStatus ? (
                              <div className="mt-5">
                                <StudentStatusStepper status={studentCard.applicantStatus} />
                              </div>
                            ) : null}

                            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-8">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                  {t("auth.additional.current_school_label")}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">{studentCard.currentSchool}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                  {t("auth.additional.student_birth_date_label")}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">
                                  {formatBirthDate(studentCard.studentBirthDate, language) ?? t("common.not_provided")}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                  {t("dashboard.parent.portal.students.document_status")}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">{t(studentCard.documentStatusKey)}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                  {t("dashboard.parent.portal.students.stage")}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">{t(studentCard.stageLabelKey)}</p>
                              </div>
                            </div>

                            <div className="mt-5">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t("dashboard.parent.portal.students.progress_label")}</p>
                                <p className="text-sm font-semibold text-[var(--ds-accent)]">{studentCard.progress}%</p>
                              </div>
                              <div className="h-2 rounded-full bg-[var(--ds-surface)]">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-[var(--ds-primary)] to-[var(--ds-highlight)]"
                                  style={{ width: `${studentCard.progress}%` }}
                                  aria-hidden="true"
                                />
                              </div>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                  {t("dashboard.parent.portal.students.next_action")}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">
                                  {t(studentCard.nextActionLabelKey, studentCard.nextActionValues)}
                                </p>
                              </div>
                              <Link
                                href={getStudentPortalHref(admissionsContext, studentCard, index)}
                                className="cta-primary rounded-xl px-4 py-2 text-sm font-semibold"
                              >
                                {t(studentCard.actionLabelKey)}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>

                    <article id="admissions-timeline" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                        {t("dashboard.parent.portal.timeline.title")}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                        {t("dashboard.parent.portal.timeline.heading")}
                      </h3>
                      <div className="mt-5 space-y-4">
                        {parentPortal.timeline.map((step, index) => (
                          <div key={`${step.titleKey}-${index}`} className="flex gap-3">
                            <div className="flex w-8 flex-col items-center">
                              <span className={`mt-1 h-3 w-3 rounded-full ${timelineStateClassName(step.state)}`} />
                              {index < parentPortal.timeline.length - 1 ? (
                                <span className={`mt-2 h-full min-h-8 w-px ${timelineLineClassName(step.state)}`} aria-hidden="true" />
                              ) : null}
                            </div>
                            <div className="flex-1 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(step.titleKey, step.titleValues)}</p>
                                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                  {t(`dashboard.parent.portal.timeline.state.${step.state}`)}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-[var(--ds-text-secondary)]">{t(step.detailKey, step.detailValues)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  </div>

                  <div className="space-y-6">
                    <article id="next-actions" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                        {t("dashboard.parent.portal.actions.title")}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                        {t("dashboard.parent.portal.actions.heading")}
                      </h3>
                      <div className="mt-5 space-y-3">
                        {parentPortal.actions.map((action, index) => (
                          <div key={`${action.titleKey}-${index}`} className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(action.titleKey, action.titleValues)}</p>
                              <span className={priorityClassName(action.priority)}>{t(priorityLabelMap[action.priority])}</span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(action.detailKey, action.detailValues)}</p>
                            <Link
                              href={
                                index < parentPortal.studentCards.length
                                  ? getStudentPortalHref(admissionsContext, parentPortal.studentCards[index], index)
                                  : "#family-overview"
                              }
                              className="mt-4 inline-flex rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)]"
                            >
                              {t(action.ctaLabelKey)}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </article>

                    <article id="payments-center" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                        {t("dashboard.parent.portal.payments.title")}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                        {t("dashboard.parent.portal.payments.heading")}
                      </h3>
                      <div className="mt-5 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                              {t("dashboard.parent.portal.payments.amount_label")}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">{parentPortal.paymentSummary.amount}</p>
                            <p className="mt-2 text-sm text-[var(--ds-text-secondary)]">
                              {t(parentPortal.paymentSummary.helperKey, parentPortal.paymentSummary.helperValues)}
                            </p>
                          </div>
                          <span className="status-pill status-neutral">{t(parentPortal.paymentSummary.statusKey)}</span>
                        </div>
                        <Link
                          href={firstPaymentHref ?? "#payments-center"}
                          className="mt-4 inline-flex cta-primary rounded-xl px-4 py-2 text-sm font-semibold"
                        >
                          {t(parentPortal.paymentSummary.ctaLabelKey)}
                        </Link>
                      </div>
                    </article>

                    <article id="family-updates" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                        {t("dashboard.parent.portal.updates.title")}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                        {t("dashboard.parent.portal.updates.heading")}
                      </h3>
                      <div className="mt-5 space-y-3">
                        {parentPortal.updates.map((update, index) => (
                          <div key={`${update.titleKey}-${index}`} className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(update.titleKey)}</p>
                              <span className="rounded-full bg-[var(--ds-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                {t(update.tagKey)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(update.detailKey, update.detailValues)}</p>
                          </div>
                        ))}
                      </div>
                    </article>

                    <article id="contact-desk" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                        {t("dashboard.parent.portal.contact.title")}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                        {t("dashboard.parent.portal.contact.heading")}
                      </h3>
                      <div className="mt-5 grid gap-3">
                        <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                            {t("dashboard.parent.portal.contact.primary_contact")}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">
                            {t("dashboard.parent.portal.contact.primary_contact_value", { school: parentPortal.schoolShortName })}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                            {t("dashboard.parent.portal.contact.family_email")}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">{admissionsContext.email}</p>
                        </div>
                        <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                            {t("dashboard.parent.portal.contact.response_window")}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">
                            {t("dashboard.parent.portal.contact.response_window_value")}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                            {t("auth.additional.notes_label")}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-[var(--ds-text-primary)]">
                            {admissionsContext.notes?.trim() || t("dashboard.parent.portal.contact.notes_empty")}
                          </p>
                        </div>
                      </div>
                    </article>
                  </div>
                </section>
              </>
            ) : (
              <>
                {admissionsContext ? (
                  <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
                    <article className="surface-card rounded-3xl p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">{t("auth.additional.context_title")}</p>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                        {admissionsContext.students.length === 1
                          ? admissionsContext.studentName
                          : t("auth.additional.student_count_summary", { count: admissionsContext.students.length })}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t("auth.additional.context_hint")}</p>
                    </article>
                  </section>
                ) : null}

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
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
