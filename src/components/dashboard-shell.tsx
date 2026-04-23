import Link from "next/link";
import {
  buildParentApplicationId,
  getParentApplicationDetailHref,
  getParentApplicationSectionHref,
} from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";
import ParentPortalScrollNav from "@/features/admissions-portal/presentation/components/parent-portal-scroll-nav";
import ParentPortalStickyHeader from "@/features/admissions-portal/presentation/components/parent-portal-sticky-header";
import ParentMobileActionBar from "@/features/admissions-portal/presentation/components/parent-mobile-action-bar";
import { AddAnotherChildButton } from "@/features/admissions-auth/presentation/components/add-another-child-button";
import { LogoutButton } from "@/features/admissions-auth/presentation/components/logout-button";
import LanguageToggle from "@/components/language-toggle";
import { ParentOffersCard } from "@/features/admissions-auth/presentation/components/parent-offers-card";
import { ParentSectionsCard } from "@/features/admissions-auth/presentation/components/parent-sections-card";
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

function priorityOrderValue(priority: PriorityId): number {
  if (priority === "high") return 0;
  if (priority === "medium") return 1;
  return 2;
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
  _admissionsContext: NonNullable<DashboardConfig["admissionsContext"]>,
  studentCard: ParentPortalExperience["studentCards"][number],
  index: number,
) {
  const applicationId = buildParentApplicationId(studentCard.studentName, index);

  if (studentCard.status === "attention_needed") {
    return getParentApplicationSectionHref(applicationId, "documents");
  }

  if (studentCard.status === "excellent") {
    return getParentApplicationSectionHref(applicationId, "schedule");
  }

  return getParentApplicationDetailHref(applicationId);
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
          buildParentApplicationId(admissionsContext.students[0].studentName, 0),
        )
      : null;
  const firstPaymentHref =
    admissionsContext && admissionsContext.students[0]
      ? getParentApplicationSectionHref(
          buildParentApplicationId(admissionsContext.students[0].studentName, 0),
          "payment",
        )
      : null;

  return (
    <div className={`dashboard-bg min-h-screen ${isParentPortal ? "pb-28 lg:pb-10" : "pb-10"}`}>
      <div className="mx-auto max-w-[1320px] px-4 pt-6 sm:px-6 lg:px-8">
        {isParentPortal ? (
          <ParentPortalStickyHeader
            brandLabel={t("common.brand.twsi")}
            title={t("dashboard.parent.portal.header.greeting", {
              parent: admissionsContext?.parentName ?? "",
            })}
            subtitle={t("dashboard.parent.portal.header.subtitle", {
              parent: admissionsContext?.parentName ?? "",
              count: admissionsContext?.students.length ?? 0,
              school: parentPortal?.schoolShortName ?? "",
            })}
            actions={
              <>
                <LanguageToggle />
                <LogoutButton />
              </>
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
                  {parentPortal.summaryCards.map((card, index) => {
                    const hasSentence = Boolean(card.titleKey);
                    const toneDot =
                      card.tone === "positive"
                        ? "bg-[#22c55e]"
                        : card.tone === "warning"
                          ? "bg-[#ef4444]"
                          : card.tone === "info"
                            ? "bg-[var(--ds-primary)]"
                            : "bg-[var(--ds-border)]";
                    const toneRing =
                      card.tone === "positive"
                        ? "ring-[#22c55e]/30"
                        : card.tone === "warning"
                          ? "ring-[#ef4444]/30"
                          : card.tone === "info"
                            ? "ring-[var(--ds-primary)]/30"
                            : "ring-[var(--ds-border)]";

                    const inner = hasSentence ? (
                      <>
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ring-4 ${toneRing}`} aria-hidden="true">
                          <span className={`h-2 w-2 rounded-full ${toneDot}`} />
                        </span>
                        <p className="mt-4 text-[15px] font-semibold leading-snug text-[var(--ds-text-primary)]">
                          {t(card.titleKey!, card.titleValues)}
                        </p>
                        {card.subtitleKey ? (
                          <p className="mt-1.5 text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                            {t(card.subtitleKey, card.subtitleValues)}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ds-text-secondary)]">
                          {t(card.labelKey)}
                        </p>
                        <p className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-[var(--ds-text-primary)]">{card.value}</p>
                        <p className="mt-2.5 text-sm font-semibold text-[var(--ds-primary)]">{t(card.helperKey, card.helperValues)}</p>
                      </>
                    );

                    const classes = `stat-tile block relative ${card.href ? "card-interactive" : ""}`;

                    return card.href ? (
                      <Link
                        key={`${card.titleKey ?? card.labelKey}-${index}`}
                        href={card.href}
                        className={classes}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <article
                        key={`${card.titleKey ?? card.labelKey}-${index}`}
                        className={classes}
                      >
                        {inner}
                      </article>
                    );
                  })}
                </section>

                <section className="space-y-6">
                  {/* 1. Action items — highest-priority first. Parents should
                         see what needs doing before they see anything else. */}
                  <article id="action-items" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z" /></svg>
                        </span>
                        <div>
                          <p className="section-eyebrow">{t("dashboard.parent.portal.actions.title")}</p>
                          <h3 className="mt-1.5 section-title">
                            {t("dashboard.parent.portal.actions.heading")}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      {[...parentPortal.actions]
                        .sort((a, b) => priorityOrderValue(a.priority) - priorityOrderValue(b.priority))
                        .map((action, index) => {
                          // The action card and its CTA must visually belong
                          // to the SAME child (design principle #2). We derive
                          // the owning student from the action's titleValues so
                          // the CTA label and the target route are always in
                          // lockstep with the title above it.
                          const studentName =
                            (typeof action.titleValues?.student === "string" ? action.titleValues.student : undefined) ??
                            (typeof action.detailValues?.student === "string" ? action.detailValues.student : undefined) ??
                            "";
                          const ownerIndex = studentName
                            ? parentPortal.studentCards.findIndex((s) => s.studentName === studentName)
                            : -1;
                          const linkedIndex = ownerIndex >= 0 ? ownerIndex : Math.min(index, parentPortal.studentCards.length - 1);
                          const linkedCard =
                            linkedIndex >= 0 ? parentPortal.studentCards[linkedIndex] : undefined;
                          const href = linkedCard
                            ? getStudentPortalHref(admissionsContext, linkedCard, linkedIndex)
                            : "#registered-students";
                          // Frame the whole card as a visually bounded unit. A
                          // coloured left stripe + student-avatar header make
                          // it unambiguous which kid this card is about.
                          const initials = studentName
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part.charAt(0).toUpperCase())
                            .join("");
                          const stripeCls = action.priority === "high"
                            ? "bg-[#ef4444]"
                            : action.priority === "medium"
                              ? "bg-[#f59e0b]"
                              : "bg-[var(--ds-primary)]";
                          return (
                            <div
                              key={`${action.titleKey}-${index}`}
                              className="relative overflow-hidden rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 transition hover:border-[var(--ds-primary)]/50 hover:shadow-[var(--ds-shadow-soft)]"
                              data-student={studentName || undefined}
                            >
                              <span className={`absolute left-0 top-0 h-full w-1 ${stripeCls}`} aria-hidden="true" />
                              {studentName ? (
                                <div className="mb-3 flex items-center gap-2.5">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ds-primary)]/12 text-[11px] font-bold text-[var(--ds-primary)]" aria-hidden="true">
                                    {initials || "?"}
                                  </span>
                                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                                    {t("auth.additional.student_section_title", { number: linkedIndex >= 0 ? linkedIndex + 1 : index + 1 })} <span className="text-[var(--ds-primary)]">{studentName}</span>
                                  </p>
                                </div>
                              ) : null}
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-[15px] font-semibold leading-snug text-[var(--ds-text-primary)]">{t(action.titleKey, action.titleValues)}</p>
                                <span className={priorityClassName(action.priority)}>{t(priorityLabelMap[action.priority])}</span>
                              </div>
                              <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{t(action.detailKey, action.detailValues)}</p>
                              <Link
                                href={href}
                                className="cta-secondary mt-4 gap-1.5"
                              >
                                {t(action.ctaLabelKey, studentName ? { student: studentName } : undefined)}
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                              </Link>
                            </div>
                          );
                        })}
                    </div>
                  </article>

                  {/* Offer + enrolment card — self-hides when neither
                      applies for any of the parent's kids. Client-side
                      fetch to /api/me/offers so it picks up Accept/
                      Decline state changes without a full page reload. */}
                  <ParentOffersCard />

                  {/* SIS — "my child at school" card. Self-hides until
                      admin assigns the kid to a Section. */}
                  <ParentSectionsCard />

                  {/* 2. My children cards — condensed when SIS is live. */}
                  <article id="registered-students" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-6 sm:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /></svg>
                          </span>
                          <div>
                            <p className="section-eyebrow">
                              {t("dashboard.parent.portal.students.title")}
                            </p>
                            <h3 className="mt-1.5 section-title">
                              {t("dashboard.parent.portal.students.heading")}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="rounded-full border border-[var(--ds-border)] bg-[var(--ds-soft)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ds-text-primary)]">
                            {t("dashboard.parent.portal.students.count_chip", { count: admissionsContext.students.length })}
                          </span>
                          <AddAnotherChildButton />
                        </div>
                      </div>
                      <div className="mt-6 grid gap-5">
                        {parentPortal.studentCards.map((studentCard, index) => {
                          const initials = studentCard.studentName
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part.charAt(0).toUpperCase())
                            .join("");
                          return (
                          <div
                            key={`${studentCard.studentName}-${index}`}
                            className="relative overflow-hidden rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 sm:p-6 shadow-[var(--ds-shadow-soft)] transition hover:shadow-[var(--ds-shadow-strong)]"
                            data-student={studentCard.studentName}
                          >
                            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--ds-primary)] via-[var(--ds-highlight)] to-[var(--ds-accent)]" aria-hidden="true" />
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="flex items-start gap-4 min-w-0">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--ds-primary)] to-[var(--ds-cta-fill-2)] text-lg font-bold text-[var(--ds-on-primary)] shadow-[0_10px_24px_-14px_rgba(11,110,79,0.6)]" aria-hidden="true">
                                  {initials || "?"}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                                    {t("auth.additional.student_section_title", { number: index + 1 })}
                                  </p>
                                  <h4 className="mt-1.5 text-xl font-semibold leading-tight text-[var(--ds-text-primary)] sm:text-[1.35rem]">{studentCard.studentName}</h4>
                                  <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                                    {t("auth.additional.target_grade_label")}: <span className="font-semibold text-[var(--ds-text-primary)]">{t(`auth.additional.target_grade.${studentCard.targetGrade}`)}</span>
                                  </p>
                                </div>
                              </div>
                              {/* Prefer the real backend status if /me returned it; fall back
                                  to the mock status label for pre-/me deep-linked dashboards. */}
                              <div className="shrink-0">
                                {studentCard.applicantStatus ? (
                                  <StatusBadge status={studentCard.applicantStatus} />
                                ) : (
                                  <span className={statusClassName(studentCard.status)}>{t(studentCard.statusLabelKey)}</span>
                                )}
                              </div>
                            </div>

                            {studentCard.applicantStatus ? (
                              <div className="mt-5">
                                <StudentStatusStepper status={studentCard.applicantStatus} />
                              </div>
                            ) : null}

                            {studentCard.applicantStatus === "test_pending" && studentCard.studentId ? (
                              <div className="mt-4 rounded-2xl border border-[var(--ds-primary)]/30 bg-[var(--ds-primary)]/5 p-4">
                                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
                                  {t("dashboard.parent.tests.book_ready_title", { student: studentCard.studentName })}
                                </p>
                                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                                  {t("dashboard.parent.tests.book_ready_description")}
                                </p>
                                <Link
                                  href={`/auth/setup-account/tests?studentId=${encodeURIComponent(studentCard.studentId)}&schoolId=SCH-${(admissionsContext.school ?? "iiss").toUpperCase()}`}
                                  className="mt-3 inline-flex items-center rounded-lg bg-[var(--ds-primary)] px-4 py-2 text-sm font-semibold text-white"
                                >
                                  {t("dashboard.parent.tests.book_cta")}
                                </Link>
                              </div>
                            ) : null}

                            {studentCard.applicantStatus === "test_scheduled" ? (
                              <div className="mt-4 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/60 p-4">
                                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
                                  {t("dashboard.parent.tests.booked_title")}
                                </p>
                                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                                  {t("dashboard.parent.tests.booked_description", { student: studentCard.studentName })}
                                </p>
                              </div>
                            ) : null}

                            {studentCard.applicantStatus === "documents_pending" ? (
                              <div className="mt-4 rounded-2xl border border-[var(--ds-primary)]/30 bg-[var(--ds-primary)]/5 p-4">
                                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
                                  {t("dashboard.parent.docs.pending_title", { student: studentCard.studentName })}
                                </p>
                                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                                  {t("dashboard.parent.docs.pending_description")}
                                </p>
                                <Link
                                  href="/auth/setup-account/documents"
                                  className="mt-3 inline-flex items-center rounded-lg bg-[var(--ds-primary)] px-4 py-2 text-sm font-semibold text-white"
                                >
                                  {t("dashboard.parent.docs.upload_cta")}
                                </Link>
                              </div>
                            ) : null}

                            {studentCard.applicantStatus === "documents_verified" ? (
                              <div className="mt-4 rounded-2xl border border-[var(--ds-border)] bg-[#e3fcef] p-4">
                                <p className="text-sm font-semibold text-[#166534]">
                                  {t("dashboard.parent.docs.verified_title")}
                                </p>
                                <p className="mt-1 text-sm text-[#166534]">
                                  {t("dashboard.parent.docs.verified_description", { student: studentCard.studentName })}
                                </p>
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
                                {t(studentCard.actionLabelKey, { student: studentCard.studentName })}
                              </Link>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    </article>

                  {/* 3. SIS today — attendance + latest grade per kid. Only
                         renders when at least one kid has a studentId. */}
                  {parentPortal.sisToday.length > 0 ? (
                    <article id="sis-today" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-6 sm:p-8">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>
                        </span>
                        <div>
                          <p className="section-eyebrow">
                            {t("dashboard.parent.portal.sis_today.title")}
                          </p>
                          <h3 className="mt-1.5 section-title">
                            {t("dashboard.parent.portal.sis_today.heading")}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {parentPortal.sisToday.map((kid, idx) => {
                          const tone =
                            kid.attendanceStatus === "present" || kid.attendanceStatus === "late"
                              ? "border-l-4 border-l-[#22c55e]"
                              : kid.attendanceStatus === "absent"
                                ? "border-l-4 border-l-[#ef4444]"
                                : "border-l-4 border-l-[var(--ds-border)]";
                          return (
                            <div key={`${kid.studentName}-${idx}`} className={`rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4 ${tone}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{kid.studentName}</p>
                                  {kid.sectionName ? (
                                    <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">{kid.sectionName}</p>
                                  ) : null}
                                </div>
                                {kid.homeroomTeacherName ? (
                                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                    {kid.homeroomTeacherName}
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                  {t("dashboard.parent.portal.sis_today.attendance_label")}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">
                                  {t(kid.attendanceLabelKey)}
                                </p>
                                <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
                                  {t(kid.attendanceDetailKey, kid.attendanceDetailValues)}
                                </p>
                              </div>

                              {kid.latestGrade ? (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                    {t("dashboard.parent.portal.sis_today.grade_label")}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-[var(--ds-text-primary)]">
                                    {kid.latestGrade.subject} · {kid.latestGrade.scoreText} ({kid.latestGrade.percentage}%)
                                  </p>
                                  <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
                                    {kid.latestGrade.term}
                                  </p>
                                </div>
                              ) : (
                                <p className="mt-3 text-xs text-[var(--ds-text-secondary)]">
                                  {t("dashboard.parent.portal.sis_today.no_grades_yet")}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  ) : null}

                  {/* 4. Payments center. */}
                  <article id="payments-center" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-6 sm:p-8">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></svg>
                        </span>
                        <div>
                          <p className="section-eyebrow">
                            {t("dashboard.parent.portal.payments.title")}
                          </p>
                          <h3 className="mt-1.5 section-title">
                            {t("dashboard.parent.portal.payments.heading")}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-6 rounded-2xl border border-[var(--ds-border)] bg-gradient-to-br from-[var(--ds-soft)]/80 via-[var(--ds-surface)] to-[var(--ds-soft)]/40 p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                              {t("dashboard.parent.portal.payments.amount_label")}
                            </p>
                            <p className="mt-3 text-[2.25rem] font-semibold leading-none tracking-tight text-[var(--ds-text-primary)]">{parentPortal.paymentSummary.amount}</p>
                            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                              {t(parentPortal.paymentSummary.helperKey, parentPortal.paymentSummary.helperValues)}
                            </p>
                          </div>
                          <span className="status-pill status-neutral shrink-0">{t(parentPortal.paymentSummary.statusKey)}</span>
                        </div>
                        <Link
                          href={firstPaymentHref ?? "#payments-center"}
                          className="mt-5 inline-flex items-center gap-2 cta-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
                        >
                          {t(parentPortal.paymentSummary.ctaLabelKey)}
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                        </Link>
                      </div>
                    </article>

                    <article id="family-updates" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-6 sm:p-8">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v12H5.5L4 18z" /></svg>
                        </span>
                        <div>
                          <p className="section-eyebrow">
                            {t("dashboard.parent.portal.updates.title")}
                          </p>
                          <h3 className="mt-1.5 section-title">
                            {t("dashboard.parent.portal.updates.heading")}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {parentPortal.updates.map((update, index) => {
                          const displayTitle =
                            update.title ?? (update.titleKey ? t(update.titleKey) : "");
                          const displayDetail =
                            update.detail ?? (update.detailKey ? t(update.detailKey, update.detailValues) : "");
                          const rowKey = `${update.titleKey ?? update.title ?? "update"}-${index}`;
                          return (
                            <div key={rowKey} className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{displayTitle}</p>
                                <span className="rounded-full bg-[var(--ds-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">
                                  {t(update.tagKey)}
                                </span>
                              </div>
                              {displayDetail ? (
                                <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{displayDetail}</p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </article>

                  {/* 6. Admissions timeline — collapsed for enrolled kids
                         because it's mostly historical context by then. */}
                  <details id="admissions-timeline" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-5 sm:p-6">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                          {t("dashboard.parent.portal.timeline.title")}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                          {t("dashboard.parent.portal.timeline.heading")}
                        </h3>
                      </div>
                      <span aria-hidden="true" className="text-xs font-semibold text-[var(--ds-text-secondary)]">
                        {t("dashboard.parent.portal.collapsible.expand_hint")}
                      </span>
                    </summary>
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
                  </details>

                  {/* 7. Family info + contact — merged into one collapsible
                         footer. Rarely opened once onboarding is done. */}
                  <details id="contact-desk" className="parent-portal-section surface-card scroll-mt-28 rounded-3xl p-5 sm:p-6">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                          {t("dashboard.parent.portal.family_footer.title")}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
                          {t("dashboard.parent.portal.family_footer.heading")}
                        </h3>
                      </div>
                      <span aria-hidden="true" className="text-xs font-semibold text-[var(--ds-text-secondary)]">
                        {t("dashboard.parent.portal.collapsible.expand_hint")}
                      </span>
                    </summary>

                    <div id="family-overview" className="mt-5 grid gap-3 sm:grid-cols-2">
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
                  </details>
                </section>

                {/* Mobile-only action bar. Pinned to the viewport bottom. */}
                <ParentMobileActionBar
                  payHref={firstPaymentHref ?? "#payments-center"}
                  payBadge={parentPortal.hasUnpaidPayment}
                />
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
