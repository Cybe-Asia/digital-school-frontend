import Link from "next/link";
import {
  buildParentApplicationId,
  getParentApplicationDetailHref,
  getParentApplicationSectionHref,
} from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";
import { LogoutButton } from "@/features/admissions-auth/presentation/components/logout-button";
import LanguageToggle from "@/components/language-toggle";
import { RoleSwitcher } from "@/components/role-switcher";
import { getSessionRoles } from "@/features/admissions-auth/infrastructure/session-roles";
import { getServerI18n } from "@/i18n/server";
import { BigButton, KidAvatar, Screen, Tile } from "@/components/parent-ui";
import {
  ArrowIcon,
  CheckCircleIcon,
  HeartIcon,
  MailIcon,
  SparkleIcon,
  WalletIcon,
} from "@/components/parent-ui/icons";
import type { DashboardConfig, ParentPortalExperience } from "@/lib/dashboard-data";

type DashboardShellProps = {
  config: DashboardConfig;
};

/**
 * The ONE parent-facing home. Rewritten from scratch (2026 redesign).
 *
 * Design choices, for the next engineer who inherits this:
 *   1. One giant warm greeting. Serif display type. Hour-of-day
 *      adjusted. Name + emoji.
 *   2. A SINGLE "next step" hero tile — the one thing this parent
 *      should do today. Derived from the highest-priority action.
 *      If nothing is pending, it becomes a celebrate tile ("all clear").
 *   3. Children as soft avatar-led cards. First name only.
 *   4. Everything below is progressive disclosure: today's attendance,
 *      messages, payments. Collapsed into compact tiles, never
 *      blasted across a 4-column grid.
 *
 * What's gone (on purpose): the sticky header, scroll-nav, 4-card
 * summary grid, breadcrumbs, status pills, stepper inside every kid
 * card, the details-dialog teaser, the timeline accordion, the
 * family-footer accordion. All of that was the old "dressed-up admin
 * dashboard" look we rejected.
 */
export default async function DashboardShell({ config }: DashboardShellProps) {
  const { language, t } = await getServerI18n();
  const roles = await getSessionRoles();
  const admissionsContext = config.admissionsContext;
  const parentPortal = config.parentPortal;

  // Parent-portal is the ONLY surface this component renders now —
  // the legacy generic student/staff shell lived here historically but
  // those roles redirect away before reaching this code. Any non-parent
  // config therefore just shows the fresh parent frame with empty
  // slots, which is a safer default than silently rendering the old
  // admin-looking layout.
  if (!admissionsContext || !parentPortal) {
    return (
      <Screen>
        <FirstName>{config.role}</FirstName>
        <Tile variant="hero">
          <p className="text-sm text-[color:var(--ink-500)]">
            {t("dashboard.parent.portal.updates.empty")}
          </p>
        </Tile>
      </Screen>
    );
  }

  // Pick the highest-priority pending action. Everything else on the
  // home feed is contextual supporting info.
  const nextAction =
    [...parentPortal.actions].sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 } as const;
      return rank[a.priority] - rank[b.priority];
    })[0] ?? null;

  // Translate action into a "you can click this" target by matching it
  // back to the owning student via the student name interpolation.
  const actionOwnerIndex = (() => {
    const studentName =
      (typeof nextAction?.titleValues?.student === "string"
        ? nextAction.titleValues.student
        : undefined) ??
      (typeof nextAction?.detailValues?.student === "string"
        ? nextAction.detailValues.student
        : undefined) ??
      "";
    if (!studentName) return 0;
    const idx = parentPortal.studentCards.findIndex(
      (s) => s.studentName === studentName,
    );
    return idx >= 0 ? idx : 0;
  })();
  const actionOwnerCard = parentPortal.studentCards[actionOwnerIndex];
  const actionHref = actionOwnerCard
    ? pickDeepLinkForStudent(actionOwnerCard, actionOwnerIndex)
    : "#";

  const firstName = admissionsContext.parentName.split(" ")[0] ?? admissionsContext.parentName;
  const greeting = resolveTimeOfDayGreetingKey();

  const hasAnyPending = parentPortal.actions.some((a) => a.priority !== "low");

  return (
    <Screen>
      {/* Top bar — brand lockup + language + logout. Intentionally
          not sticky; parents scroll once and we don't want a chrome
          strip fighting content for attention on mobile. */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--brand)] text-white"
            aria-hidden="true"
          >
            <span className="h-4 w-4">
              <HeartIcon />
            </span>
          </span>
          <span className="parent-text-serif text-base text-[color:var(--ink-900)]">
            Cybe
          </span>
        </div>
        <div className="flex items-center gap-2">
          <RoleSwitcher
            roles={roles}
            activeView="parent"
            labels={{
              parent: t("role_switcher.parent"),
              admin: t("role_switcher.admin"),
              switchToParent: t("role_switcher.switch_to_parent"),
              switchToAdmin: t("role_switcher.switch_to_admin"),
            }}
          />
          <LanguageToggle />
          <LogoutButton />
        </div>
      </header>

      {/* Greeting — the moment of warmth. Large serif, one line, the
          kid's first name mentioned by name in the sub-line. */}
      <section className="mb-6">
        <p className="text-sm text-[color:var(--ink-500)]">
          {t(greeting, { name: firstName })}
        </p>
        <h1 className="parent-text-serif mt-2 text-[clamp(34px,6vw,48px)] leading-[1.05] text-[color:var(--ink-900)]">
          {parentPortal.studentCards.length === 1
            ? t("parent.home.hello_solo", {
                kid: parentPortal.studentCards[0].studentName.split(" ")[0],
              })
            : t("parent.home.hello_many", {
                count: parentPortal.studentCards.length,
              })}
        </h1>
      </section>

      {/* The one next step. Either a hero ("here's what to do") or a
          celebrate card ("you're all clear today"). */}
      {nextAction && hasAnyPending ? (
        <Tile variant="hero" className="mb-6">
          <div className="flex items-start gap-3">
            <span
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand)] text-white"
              aria-hidden="true"
            >
              <span className="h-5 w-5">
                <SparkleIcon />
              </span>
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
                {t("parent.home.next_step_eyebrow")}
              </p>
              <h2 className="parent-text-serif mt-2 text-[clamp(22px,4vw,28px)] leading-snug text-[color:var(--ink-900)]">
                {t(nextAction.titleKey, nextAction.titleValues)}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
                {t(nextAction.detailKey, nextAction.detailValues)}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <BigButton href={actionHref}>
              {t(nextAction.ctaLabelKey, nextAction.titleValues)}
              <span className="h-4 w-4">
                <ArrowIcon />
              </span>
            </BigButton>
          </div>
        </Tile>
      ) : (
        <Tile variant="celebrate" className="mb-6">
          <div className="parent-confetti" aria-hidden="true" />
          <div className="relative">
            <span
              className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-[color:var(--brand-strong)]"
              aria-hidden="true"
            >
              <span className="h-5 w-5">
                <CheckCircleIcon />
              </span>
            </span>
            <h2 className="parent-text-serif text-[clamp(24px,4.5vw,30px)] leading-tight text-[color:var(--ink-900)]">
              {t("parent.home.all_clear_title")}
            </h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[color:var(--ink-700)]">
              {t("parent.home.all_clear_body", { name: firstName })}
            </p>
          </div>
        </Tile>
      )}

      {/* Kids feed. One card per kid. No stepper, no status pills, no
          8-field grid — just "here's your kid, here's where they are,
          tap to open their file". */}
      <section className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="parent-text-serif text-[20px] text-[color:var(--ink-900)]">
            {t("parent.home.kids_heading")}
          </h3>
          {parentPortal.studentCards.length > 1 ? (
            <span className="text-sm text-[color:var(--ink-400)]">
              {t("parent.home.kids_count", {
                count: parentPortal.studentCards.length,
              })}
            </span>
          ) : null}
        </div>
        <div className="space-y-3">
          {parentPortal.studentCards.map((kid, index) => {
            const appId = buildParentApplicationId(kid.studentName, index);
            const href = getParentApplicationDetailHref(appId);
            const firstName = kid.studentName.split(" ")[0] ?? kid.studentName;
            const stageLine = resolveStageLine(t, kid.applicantStatus, firstName);
            const isEnrolled =
              kid.applicantStatus === "handed_to_sis" ||
              kid.applicantStatus === "enrolment_paid" ||
              kid.applicantStatus === "offer_accepted";

            return (
              <Tile key={appId} href={href} className="group">
                <div className="flex items-center gap-4">
                  <KidAvatar name={kid.studentName} size={52} />
                  <div className="min-w-0 flex-1">
                    <p className="parent-text-serif text-[19px] leading-tight text-[color:var(--ink-900)]">
                      {firstName}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-[color:var(--ink-500)]">
                      {stageLine}
                    </p>
                  </div>
                  <span
                    className="text-[color:var(--ink-400)] group-hover:text-[color:var(--brand)]"
                    aria-hidden="true"
                  >
                    <span className="inline-block h-5 w-5">
                      <ArrowIcon />
                    </span>
                  </span>
                </div>

                {isEnrolled ? (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-strong)]">
                    <span className="h-3.5 w-3.5">
                      <CheckCircleIcon />
                    </span>
                    {t("parent.home.kid_enrolled_chip")}
                  </div>
                ) : null}
              </Tile>
            );
          })}
        </div>
      </section>

      {/* Today snapshot — ONLY when SIS attendance is live. Otherwise
          hidden. Design principle #3: if it doesn't apply right now,
          don't show a placeholder tile. */}
      {parentPortal.sisToday.length > 0 ? (
        <section className="mb-6">
          <h3 className="parent-text-serif mb-3 text-[20px] text-[color:var(--ink-900)]">
            {t("parent.home.today_heading")}
          </h3>
          <div className="space-y-2">
            {parentPortal.sisToday.map((kid, idx) => (
              <Tile key={`sis-${idx}`} variant="flat">
                <div className="flex items-start gap-3">
                  <KidAvatar name={kid.studentName} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[color:var(--ink-900)]">
                      {t(kid.attendanceLabelKey)}
                    </p>
                    <p className="mt-0.5 text-sm text-[color:var(--ink-500)]">
                      {t(kid.attendanceDetailKey, kid.attendanceDetailValues)}
                    </p>
                    {kid.latestGrade ? (
                      <p className="mt-2 text-xs text-[color:var(--ink-700)]">
                        {kid.latestGrade.subject} ·{" "}
                        <span className="font-semibold">
                          {kid.latestGrade.scoreText}
                        </span>{" "}
                        ({kid.latestGrade.percentage}%)
                      </p>
                    ) : null}
                  </div>
                </div>
              </Tile>
            ))}
          </div>
        </section>
      ) : null}

      {/* Messages peek — top 3 from the parent's inbox. Collapsed
          feed, no "read more" accordions. */}
      {parentPortal.updates.length > 0 ? (
        <section className="mb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="parent-text-serif text-[20px] text-[color:var(--ink-900)]">
              {t("parent.home.messages_heading")}
            </h3>
            {parentPortal.unreadUpdates > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--warm-coral)]/15 px-2.5 py-1 text-xs font-semibold text-[color:var(--warm-coral)]">
                {t("parent.home.unread_badge", {
                  count: parentPortal.unreadUpdates,
                })}
              </span>
            ) : null}
          </div>
          <div className="space-y-2">
            {parentPortal.updates.slice(0, 3).map((update, idx) => {
              const title = update.title ?? (update.titleKey ? t(update.titleKey) : "");
              const detail =
                update.detail ?? (update.detailKey ? t(update.detailKey, update.detailValues) : "");
              return (
                <Tile key={`upd-${idx}`} variant="flat">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]"
                      aria-hidden="true"
                    >
                      <span className="h-4 w-4">
                        <MailIcon />
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[color:var(--ink-900)]">
                        {title}
                      </p>
                      {detail ? (
                        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-[color:var(--ink-500)]">
                          {detail}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Tile>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Payment peek — only when unpaid. Never "you have 0 pending
          invoices ✓", that's clutter. */}
      {parentPortal.hasUnpaidPayment ? (
        <section className="mb-6">
          <Tile>
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--warm-amber)]/20 text-[color:var(--warm-amber)]"
                aria-hidden="true"
              >
                <span className="h-5 w-5">
                  <WalletIcon />
                </span>
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[color:var(--ink-900)]">
                  {t("parent.home.payment_reminder_title", {
                    amount: parentPortal.paymentSummary.amount,
                  })}
                </p>
                <p className="mt-0.5 text-sm text-[color:var(--ink-500)]">
                  {t("parent.home.payment_reminder_body")}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <BigButton
                variant="ghost"
                href={
                  parentPortal.studentCards[0]
                    ? getParentApplicationSectionHref(
                        buildParentApplicationId(
                          parentPortal.studentCards[0].studentName,
                          0,
                        ),
                        "payment",
                      )
                    : "#"
                }
              >
                {t(parentPortal.paymentSummary.ctaLabelKey)}
              </BigButton>
            </div>
          </Tile>
        </section>
      ) : null}

      {/* Footer nav — desktop only; mobile parents use the bottom tab
          bar further down. Simple text links, no pills, no badges. */}
      <nav className="mt-10 hidden items-center justify-center gap-5 text-sm text-[color:var(--ink-400)] md:flex">
        <Link href="/parent/dashboard" className="hover:text-[color:var(--brand-strong)]">
          {t("parent.nav.home")}
        </Link>
        <Link href="#messages" className="hover:text-[color:var(--brand-strong)]">
          {t("parent.nav.messages")}
        </Link>
        <span aria-hidden>·</span>
        <span>{language.toUpperCase()}</span>
      </nav>

      {/* Mobile bottom tab bar — hidden on desktop via CSS. Four
          canonical destinations; the first is always "home". */}
      <MobileTabBar parentPortal={parentPortal} t={t} />
    </Screen>
  );
}

/* ---------------------------------------------------------------- */

function FirstName({ children }: { children: string }) {
  return <p className="text-sm text-[color:var(--ink-500)]">{children}</p>;
}

function MobileTabBar({
  parentPortal,
  t,
}: {
  parentPortal: ParentPortalExperience;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  // Rendered here as server markup so navigation works without JS.
  // The active-state highlight in <BottomNav /> reads usePathname() so
  // it stays correct as the parent moves around.
  return (
    <>
      {/* Safe-area spacer so content never disappears behind the tab bar. */}
      <div className="h-16 md:hidden" aria-hidden="true" />
      <div className="md:hidden">
        <BottomNavClient
          unreadMessages={parentPortal.unreadUpdates}
          hasUnpaidPayment={parentPortal.hasUnpaidPayment}
          homeLabel={t("parent.nav.home")}
          messagesLabel={t("parent.nav.messages")}
          paymentsLabel={t("parent.nav.payments")}
          kidsLabel={t("parent.nav.kids")}
        />
      </div>
    </>
  );
}

// Thin server-only wrapper around the client BottomNav so the server
// component can pass translated labels down without dragging the i18n
// context into the client boundary.
import BottomNavClient from "@/components/parent-ui/bottom-nav-client";

function resolveTimeOfDayGreetingKey(): string {
  // Server renders in ICT (Asia/Jakarta) per the rest of the app.
  const hour = new Date().getUTCHours() + 7; // +07:00 WIB
  const h = (hour + 24) % 24;
  if (h < 11) return "parent.home.greeting_morning";
  if (h < 15) return "parent.home.greeting_midday";
  if (h < 18) return "parent.home.greeting_afternoon";
  return "parent.home.greeting_evening";
}

function resolveStageLine(
  t: (key: string, values?: Record<string, string | number>) => string,
  applicantStatus: string | undefined,
  firstName: string,
): string {
  const status = applicantStatus ?? "submitted";
  // Map every backend status to a warm one-liner. Principle #4: talk
  // like a human, not like a database.
  const map: Record<string, string> = {
    draft: "parent.stage_line.draft",
    submitted: "parent.stage_line.submitted",
    test_pending: "parent.stage_line.test_pending",
    test_scheduled: "parent.stage_line.test_scheduled",
    test_completed: "parent.stage_line.test_completed",
    test_approved: "parent.stage_line.test_approved",
    test_failed: "parent.stage_line.test_failed",
    documents_pending: "parent.stage_line.documents_pending",
    documents_verified: "parent.stage_line.documents_verified",
    offer_issued: "parent.stage_line.offer_issued",
    offer_accepted: "parent.stage_line.offer_accepted",
    offer_declined: "parent.stage_line.offer_declined",
    enrolment_paid: "parent.stage_line.enrolment_paid",
    handed_to_sis: "parent.stage_line.handed_to_sis",
    rejected: "parent.stage_line.rejected",
    withdrawn: "parent.stage_line.withdrawn",
  };
  const key = map[status] ?? "parent.stage_line.submitted";
  return t(key, { name: firstName });
}

function pickDeepLinkForStudent(
  kid: ParentPortalExperience["studentCards"][number],
  index: number,
): string {
  const appId = buildParentApplicationId(kid.studentName, index);
  const st = kid.applicantStatus;
  if (st === "test_pending") return getParentApplicationSectionHref(appId, "schedule");
  if (st === "documents_pending") return getParentApplicationSectionHref(appId, "documents");
  if (st === "offer_issued") return getParentApplicationSectionHref(appId, "decision");
  return getParentApplicationDetailHref(appId);
}

