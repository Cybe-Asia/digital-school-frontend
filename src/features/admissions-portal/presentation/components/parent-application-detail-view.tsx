import Link from "next/link";
import {
  isAssessmentBookingLocked,
  isDocumentUploadLocked,
} from "@/features/admissions-portal/domain/application-flow";
import type {
  AdmissionsPortalContext,
  ApplicationDetail,
  ApplicationSummary,
} from "@/features/admissions-portal/domain/types";
import {
  getParentApplicationDetailHref,
  getParentApplicationSectionHref,
  type ParentApplicationSection,
  buildParentApplicationId,
} from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";
import { ParentScheduleBooking } from "@/features/admissions-portal/presentation/components/parent-schedule-booking";
import { ParentOnlineTestCard } from "@/features/admissions-portal/presentation/components/parent-online-test-card";
import { ParentDocumentUpload } from "@/features/admissions-portal/presentation/components/parent-document-upload";
import { WarnLinkClient } from "@/components/parent-ui/warn-link-client";
import { PayButtonClient } from "@/components/parent-ui/pay-button-client";
import { KidAvatar, Screen, Tile, BigButton } from "@/components/parent-ui";
import {
  ArrowIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocIcon,
  LockIcon,
  WalletIcon,
} from "@/components/parent-ui/icons";
import { getServerI18n } from "@/i18n/server";

type ParentApplicationDetailViewProps = {
  activeSection: ParentApplicationSection;
  application: ApplicationDetail;
  applications: ApplicationSummary[];
  context: AdmissionsPortalContext;
};

/**
 * Per-kid detail page. One screen, one job.
 *
 * Old version had 5 sub-views, each with a page header + breadcrumbs +
 * stage tracker + 4 summary tiles + section nav sidebar + sibling
 * switcher + details dialog — it was the spreadsheet-feeling dashboard
 * the user asked us to throw out.
 *
 * New version reads the activeSection prop and renders ONE focused
 * screen. Never all five sub-sections at once. Back links to the home
 * feed, minimal chrome, giant single primary CTA when applicable.
 */
export async function ParentApplicationDetailView({
  activeSection,
  application,
  applications: _applications,
  context,
}: ParentApplicationDetailViewProps) {
  const { t } = await getServerI18n();
  const schoolShortName = application.school === "iihs" ? "IIHS" : "IISS";
  const firstName = application.studentName.split(" ")[0] ?? application.studentName;
  const appId = application.id;
  void context; // reserved for future "switch kid" links; not rendered here.
  void _applications;

  return (
    <Screen>
      {/* Compact back bar. Only thing in the top slot — no title, no
          eyebrow, no switcher. The headline below carries the name. */}
      <BackBar t={t} />

      {activeSection === "overview" ? (
        <OverviewScreen
          t={t}
          application={application}
          firstName={firstName}
          schoolShortName={schoolShortName}
          appId={appId}
        />
      ) : null}

      {activeSection === "payment" ? (
        <PaymentScreen
          t={t}
          application={application}
          firstName={firstName}
          admissionId={context.admissionId}
        />
      ) : null}

      {activeSection === "documents" ? (
        <DocumentsScreen
          t={t}
          application={application}
          firstName={firstName}
        />
      ) : null}

      {activeSection === "schedule" ? (
        <ScheduleScreen
          t={t}
          application={application}
          firstName={firstName}
          schoolShortName={schoolShortName}
        />
      ) : null}

      {activeSection === "decision" ? (
        <DecisionScreen
          t={t}
          application={application}
          firstName={firstName}
        />
      ) : null}
    </Screen>
  );
}

/* ---------------- Shared fragments --------------------------------- */

function BackBar({
  t,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  return (
    <div className="mb-6 flex items-center">
      <Link
        href="/parent/dashboard"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-[color:var(--ink-500)] hover:bg-[color:var(--cream-100)] hover:text-[color:var(--ink-900)]"
      >
        <span
          className="inline-block h-4 w-4 rotate-180"
          aria-hidden="true"
        >
          <ArrowIcon />
        </span>
        {t("parent.detail.back")}
      </Link>
    </div>
  );
}

function StudentHeader({
  t,
  studentName,
  firstName,
  stageKey,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  studentName: string;
  firstName: string;
  stageKey: string;
}) {
  return (
    <header className="mb-6 flex items-center gap-4">
      <KidAvatar name={studentName} size={56} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
          {t("parent.detail.status_eyebrow", { name: firstName })}
        </p>
        <h1 className="parent-text-serif mt-1 text-[clamp(24px,4.5vw,30px)] leading-tight text-[color:var(--ink-900)]">
          {t(stageKey, { name: firstName })}
        </h1>
      </div>
    </header>
  );
}

/* ---------------- Overview screen ---------------------------------- */

function OverviewScreen({
  t,
  application,
  firstName,
  schoolShortName,
  appId,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  application: ApplicationDetail;
  firstName: string;
  schoolShortName: string;
  appId: string;
}) {
  const payment = application.payment;
  const docsTotal = application.documents.length;
  const docsMissing = application.documents.filter(
    (d) => d.status === "missing",
  ).length;
  const assessmentLocked = isAssessmentBookingLocked(application);
  const docsLocked = isDocumentUploadLocked(application);

  const cards = [
    {
      id: "payment",
      title: t("parent.detail.card.payment_title"),
      body:
        payment.status === "paid"
          ? t("parent.detail.card.payment_body_paid")
          : payment.status === "pending_verification"
            ? t("parent.detail.card.payment_body_verifying")
            : t("parent.detail.card.payment_body_unpaid", {
                amount: payment.amount,
              }),
      href: getParentApplicationSectionHref(appId, "payment"),
      icon: <WalletIcon />,
      done: payment.status === "paid",
      // Payment is never locked — parent should always be able to
      // open it to pay or see receipt.
      warn: null as null | { title: string; body: string },
    },
    {
      id: "schedule",
      title: t("parent.detail.card.schedule_title"),
      body:
        application.assessment.status === "scheduled"
          ? t("parent.detail.card.schedule_body_booked", {
              when: application.assessment.scheduleLabel ?? "",
            })
          : assessmentLocked
            ? t("parent.detail.card.schedule_body_locked")
            : t("parent.detail.card.schedule_body_none", { name: firstName }),
      href: getParentApplicationSectionHref(appId, "schedule"),
      icon: <CalendarIcon />,
      done:
        application.assessment.status === "completed" ||
        application.assessment.status === "scheduled",
      warn: assessmentLocked
        ? {
            title: t("parent.detail.warn.schedule_locked_title"),
            body: t("parent.detail.warn.schedule_locked_body", { name: firstName }),
          }
        : null,
    },
    {
      id: "documents",
      title: t("parent.detail.card.documents_title"),
      body:
        docsMissing === 0
          ? t("parent.detail.card.documents_body_done")
          : docsLocked
            ? // Docs are gated by `!isAssessmentPassed` — the test, NOT
              // the payment. Use a distinct copy so parents don't get
              // 'Available after payment' when payment is already done.
              application.assessment.status === "scheduled"
              ? t("parent.detail.card.documents_body_after_test")
              : application.assessment.status === "not_booked"
                ? t("parent.detail.card.documents_body_after_booking")
                : t("parent.detail.card.documents_body_after_result")
            : t("parent.detail.card.documents_body_missing", {
                missing: docsMissing,
                total: docsTotal,
              }),
      href: getParentApplicationSectionHref(appId, "documents"),
      icon: <DocIcon />,
      done: docsMissing === 0,
      warn: docsLocked
        ? {
            title: t("parent.detail.warn.documents_locked_title"),
            body: t("parent.detail.warn.documents_locked_body", { name: firstName }),
          }
        : null,
    },
    {
      id: "decision",
      title: t("parent.detail.card.decision_title"),
      body:
        application.decision.status === "accepted"
          ? t("parent.detail.card.decision_body_accepted")
          : application.decision.status === "offer_released"
            ? t("parent.detail.card.decision_body_ready")
            : t("parent.detail.card.decision_body_wait"),
      href: getParentApplicationSectionHref(appId, "decision"),
      icon: <CheckCircleIcon />,
      done: application.decision.status === "accepted",
      warn:
        application.decision.status === "pending" && docsLocked
          ? {
              title: t("parent.detail.warn.decision_locked_title"),
              body: t("parent.detail.warn.decision_locked_body", { name: firstName }),
            }
          : null,
    },
  ];

  return (
    <>
      <header className="mb-6 flex items-center gap-4">
        <KidAvatar name={application.studentName} size={64} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
            {t("parent.detail.status_eyebrow", { name: firstName })}
          </p>
          <h1 className="parent-text-serif mt-1 text-[clamp(26px,5vw,36px)] leading-tight text-[color:var(--ink-900)]">
            {t("parent.detail.overview_headline", {
              name: firstName,
              // targetGrade may be a known enum slug ("year7") or an ad-hoc
              // string from the backend ("Grade 7"). Translate when a key
              // exists, otherwise render the raw string — never show the
              // key itself in the UI.
              grade: translateTargetGrade(t, application.targetGrade),
              school: schoolShortName,
            })}
          </h1>
        </div>
      </header>

      <p className="mb-6 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
        {t("parent.detail.overview_lede", { name: firstName })}
      </p>

      <div className="space-y-3">
        {cards.map((c) => {
          const locked = Boolean(c.warn);
          const body = (
            <div className={`flex items-center gap-3 ${locked ? "opacity-60" : ""}`}>
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  c.done
                    ? "bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]"
                    : locked
                      ? "bg-[color:var(--ink-100,#f0ece6)] text-[color:var(--ink-500)]"
                      : "bg-[color:var(--cream-100)] text-[color:var(--ink-500)]"
                }`}
                aria-hidden="true"
              >
                <span className="h-5 w-5">
                  {locked ? <LockIcon /> : c.icon}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="parent-text-serif text-[18px] leading-tight text-[color:var(--ink-900)]">
                  {c.title}
                </p>
                <p className="mt-0.5 text-sm text-[color:var(--ink-500)]">
                  {c.body}
                </p>
              </div>
              <span
                className={`${
                  locked
                    ? "text-[color:var(--ink-400)]"
                    : "text-[color:var(--ink-400)] group-hover:text-[color:var(--brand)]"
                }`}
                aria-hidden="true"
              >
                <span className="inline-block h-5 w-5">
                  <ArrowIcon />
                </span>
              </span>
            </div>
          );
          return (
            <WarnLinkClient
              key={c.id}
              href={c.href}
              className={`parent-tile group block ${
                locked ? "parent-tile--locked" : ""
              }`}
              warn={locked}
              warnTitle={c.warn?.title ?? ""}
              warnBody={c.warn?.body ?? ""}
              confirmLabel={t("parent.detail.warn.confirm")}
              cancelLabel={t("parent.detail.warn.cancel")}
            >
              {body}
            </WarnLinkClient>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Payment screen ---------------------------------- */

function PaymentScreen({
  t,
  application,
  firstName,
  admissionId,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  application: ApplicationDetail;
  firstName: string;
  admissionId: string | undefined;
}) {
  const payment = application.payment;
  const paid = payment.status === "paid";
  const hasRealAmount = payment.amount && payment.amount !== "—";

  return (
    <>
      <header className="mb-6 flex items-center gap-4">
        <KidAvatar name={application.studentName} size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
            {t("parent.detail.status_eyebrow", { name: firstName })}
          </p>
          <h1 className="parent-text-serif mt-1 text-[clamp(24px,4.5vw,30px)] leading-tight text-[color:var(--ink-900)]">
            {paid
              ? t("parent.detail.payment.header_paid", { name: firstName })
              : hasRealAmount
                ? t("parent.detail.payment.header_due", {
                    name: firstName,
                    amount: payment.amount,
                  })
                : t("parent.detail.payment.header_none", { name: firstName })}
          </h1>
        </div>
      </header>

      {paid ? (
        <Tile variant="celebrate">
          <div className="parent-confetti" aria-hidden="true" />
          <div className="relative">
            <span
              className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-[color:var(--brand-strong)]"
              aria-hidden="true"
            >
              <span className="h-6 w-6">
                <CheckCircleIcon />
              </span>
            </span>
            <h2 className="parent-text-serif text-[clamp(24px,4.5vw,30px)] leading-tight">
              {t(payment.statusLabelKey)}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--ink-700)]">
              {t(payment.helperKey)}
            </p>
          </div>
        </Tile>
      ) : !hasRealAmount ? (
        <Tile variant="flat">
          <p className="text-[15px] leading-relaxed text-[color:var(--ink-500)]">
            {t("parent.detail.payment.none_body", { name: firstName })}
          </p>
        </Tile>
      ) : (
        <Tile variant="hero">
          <p className="parent-focus__eyebrow">
            {t("admissions.portal.payment.amount_label")}
          </p>
          <p className="parent-text-serif mt-1 text-[clamp(36px,7vw,52px)] leading-none text-[color:var(--ink-900)]">
            {payment.amount}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
            {t(payment.helperKey)}
          </p>
          <div className="mt-6">
            {admissionId ? (
              <PayButtonClient
                admissionId={admissionId}
                existingInvoiceUrl={payment.hostedInvoiceUrl}
              />
            ) : (
              <p className="text-sm text-[color:var(--ink-500)]">
                {t("parent.detail.payment.xendit_missing_lead")}
              </p>
            )}
          </div>
          <p className="mt-4 text-xs text-[color:var(--ink-500)]">
            {t("parent.detail.payment.xendit_disclosure")}
          </p>
        </Tile>
      )}
    </>
  );
}

/* ---------------- Documents screen -------------------------------- */

function DocumentsScreen({
  t,
  application,
  firstName,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  application: ApplicationDetail;
  firstName: string;
}) {
  const locked = isDocumentUploadLocked(application);

  if (locked) {
    return (
      <>
        <BackHeaderOnly />
        <Tile variant="hero">
          <h1 className="parent-text-serif text-[clamp(24px,4.5vw,32px)] leading-tight">
            {t("parent.detail.documents.locked_title")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
            {t("parent.detail.documents.locked_body", { name: firstName })}
          </p>
          <div className="mt-6">
            <BigButton
              href={getParentApplicationSectionHref(application.id, "payment")}
            >
              {t("parent.detail.payment.pay_now")}
            </BigButton>
          </div>
        </Tile>
      </>
    );
  }

  return (
    <>
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
          {t("parent.detail.card.documents_title")}
        </p>
        <h1 className="parent-text-serif mt-2 text-[clamp(28px,5vw,40px)] leading-tight text-[color:var(--ink-900)]">
          {t("parent.detail.documents.headline", { name: firstName })}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
          {t("parent.detail.documents.lede")}
        </p>
      </header>

      {/* Real document upload wired to /api/me/document-requests
          multipart proxy. The static `application.documents` list below
          is kept as a fallback visual summary when there is no real
          DocumentRequest seeded yet (e.g. a kid whose application was
          jump-started past the admissions stage in demo seed). */}
      <ParentDocumentUpload studentId={application.studentId ?? undefined} />

      <div className="mt-6 space-y-3">
        {application.documents.map((doc) => {
          const verified = doc.status === "verified";
          const uploaded = doc.status === "uploaded";
          const label = verified
            ? t("parent.detail.documents.item_verified")
            : uploaded
              ? t("parent.detail.documents.item_replace")
              : t("parent.detail.documents.item_upload");

          return (
            <Tile key={doc.id}>
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    verified
                      ? "bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]"
                      : "bg-[color:var(--cream-100)] text-[color:var(--ink-500)]"
                  }`}
                  aria-hidden="true"
                >
                  <span className="h-5 w-5">
                    {verified ? <CheckCircleIcon /> : <DocIcon />}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="parent-text-serif text-[17px] leading-snug text-[color:var(--ink-900)]">
                    {t(doc.labelKey)}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--ink-500)]">
                    {t(doc.helperKey)}
                  </p>
                </div>
              </div>
              {!verified ? (
                <div className="mt-4">
                  <BigButton variant="ghost">{label}</BigButton>
                </div>
              ) : null}
            </Tile>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Schedule screen --------------------------------- */

function ScheduleScreen({
  t,
  application,
  firstName,
  schoolShortName,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  application: ApplicationDetail;
  firstName: string;
  schoolShortName: string;
}) {
  const locked = isAssessmentBookingLocked(application);
  // Real Neo4j Student id piped from the /me payload. When absent (pre-
  // /me deep links), the booking view self-limits to a "coming soon"
  // message rather than firing POSTs the backend can't resolve.
  const kidStudentId = application.studentId ?? null;

  if (locked) {
    return (
      <>
        <BackHeaderOnly />
        <Tile variant="hero">
          <h1 className="parent-text-serif text-[clamp(24px,4.5vw,32px)] leading-tight">
            {t("parent.detail.schedule.locked_title")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
            {t("parent.detail.schedule.locked_body")}
          </p>
          <div className="mt-6">
            <BigButton
              href={getParentApplicationSectionHref(application.id, "payment")}
            >
              {t("parent.detail.payment.pay_now")}
            </BigButton>
          </div>
        </Tile>
      </>
    );
  }

  if (application.assessment.status === "scheduled") {
    return (
      <>
        <BackHeaderOnly />
        <Tile variant="celebrate">
          <div className="parent-confetti" aria-hidden="true" />
          <div className="relative">
            <span
              className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-[color:var(--brand-strong)]"
              aria-hidden="true"
            >
              <span className="h-6 w-6">
                <CheckCircleIcon />
              </span>
            </span>
            <h1 className="parent-text-serif text-[clamp(24px,4.5vw,30px)] leading-tight">
              {t("parent.detail.schedule.booked_title")}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-700)]">
              {t("parent.detail.schedule.booked_body", {
                name: firstName,
                when: application.assessment.scheduleLabel ?? "",
              })}
            </p>
          </div>
        </Tile>
      </>
    );
  }

  if (application.assessment.status === "completed") {
    return (
      <>
        <BackHeaderOnly />
        <Tile variant="hero">
          <h1 className="parent-text-serif text-[clamp(24px,4.5vw,30px)] leading-tight">
            {t("parent.detail.schedule.completed_title")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
            {t("parent.detail.schedule.completed_body")}
          </p>
        </Tile>
      </>
    );
  }

  // Real booking surface, wired to live slot endpoints.
  return (
    <>
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
          {t("parent.detail.card.schedule_title")}
        </p>
        <h1 className="parent-text-serif mt-2 text-[clamp(28px,5vw,40px)] leading-tight text-[color:var(--ink-900)]">
          {t("parent.detail.schedule.headline", { name: firstName })}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
          {t("parent.detail.schedule.lede")}
        </p>
      </header>

      {kidStudentId ? (
        <div className="flex flex-col gap-5">
          {/*
           * Online (Moodle) option — sits above the in-person booking
           * so the fast path is the first thing parents see. The
           * card owns its own CTA; clicking opens Moodle in a new
           * tab via /api/me/students/:id/moodle-launch.
           */}
          <ParentOnlineTestCard
            studentId={kidStudentId}
            firstName={firstName}
            schoolShortName={schoolShortName}
            t={t}
          />

          {/*
           * Divider + secondary header explaining the in-person
           * alternative. Kept as a clearly-labeled second option
           * rather than a buried sub-section — some parents will
           * prefer on-campus (younger kids, connectivity concerns).
           */}
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-[color:var(--ink-200)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
              {t("parent.detail.schedule.or_divider")}
            </span>
            <div className="h-px flex-1 bg-[color:var(--ink-200)]" />
          </div>

          <div>
            <h2 className="parent-text-serif text-[clamp(18px,3.5vw,22px)] leading-tight text-[color:var(--ink-900)]">
              {t("parent.detail.schedule.in_person_title")}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--ink-500)]">
              {t("parent.detail.schedule.in_person_body")}
            </p>
          </div>

          <ParentScheduleBooking
            studentId={kidStudentId}
            studentName={application.studentName}
            schoolId={`SCH-${schoolShortName}`}
          />
        </div>
      ) : (
        <Tile variant="flat">
          <p className="text-sm text-[color:var(--ink-500)]">
            {t("parent.detail.schedule.no_slots_title")}
          </p>
        </Tile>
      )}
    </>
  );
}

/* ---------------- Decision screen --------------------------------- */

function DecisionScreen({
  t,
  application,
  firstName,
}: {
  t: (key: string, values?: Record<string, string | number>) => string;
  application: ApplicationDetail;
  firstName: string;
}) {
  const status = application.decision.status;

  if (status === "accepted") {
    return (
      <>
        <BackHeaderOnly />
        <Tile variant="celebrate">
          <div className="parent-confetti" aria-hidden="true" />
          <div className="relative">
            <span
              className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-[color:var(--brand-strong)]"
              aria-hidden="true"
            >
              <span className="h-6 w-6">
                <CheckCircleIcon />
              </span>
            </span>
            <h1 className="parent-text-serif text-[clamp(26px,5vw,34px)] leading-tight">
              {t("parent.detail.decision.accepted_title")}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-700)]">
              {t("parent.detail.decision.accepted_body", { name: firstName })}
            </p>
          </div>
        </Tile>
      </>
    );
  }

  if (status === "offer_released") {
    return (
      <>
        <BackHeaderOnly />
        <Tile variant="hero">
          <h1 className="parent-text-serif text-[clamp(26px,5vw,34px)] leading-tight">
            {t("parent.detail.decision.offer_title")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
            {t("parent.detail.decision.offer_body", { name: firstName })}
          </p>
          <div className="mt-6">
            <BigButton>{t(application.decision.ctaLabelKey)}</BigButton>
          </div>
        </Tile>
      </>
    );
  }

  return (
    <>
      <BackHeaderOnly />
      <Tile variant="hero">
        <h1 className="parent-text-serif text-[clamp(24px,4.5vw,30px)] leading-tight">
          {t("parent.detail.decision.pending_title")}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
          {t("parent.detail.decision.pending_body")}
        </p>
      </Tile>
    </>
  );
}

/* ---------------- Utilities --------------------------------------- */

function translateTargetGrade(
  t: (key: string, values?: Record<string, string | number>) => string,
  raw: string | undefined | null,
): string {
  const value = (raw ?? "").trim();
  if (!value) return "";
  const key = `auth.additional.target_grade.${value}`;
  const translated = t(key);
  // i18next-style resolvers echo the key back when unmatched; when the
  // echo happens, fall back to the raw value so the UI never shows a
  // dotted key like "auth.additional.target_grade.Grade 7".
  return translated === key ? value : translated;
}

function BackHeaderOnly() {
  // When a screen renders a hero tile as its entire content, we skip
  // the StudentHeader row (it would repeat the kid's name twice).
  return null;
}

// Kept re-exports to avoid breaking callers that imported these two
// helpers historically. They're simple pass-throughs.
export { buildParentApplicationId, getParentApplicationDetailHref };
