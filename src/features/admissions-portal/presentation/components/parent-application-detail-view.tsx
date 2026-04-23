import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader, type Breadcrumb } from "@/components/ui/page-header";
import { StudentSwitcher, type StudentSwitcherItem } from "@/components/ui/student-switcher";
import { StickyAside, type StickyAsideItem } from "@/components/ui/sticky-aside";
import { statusToneFor } from "@/components/ui/status-pill";
import { getParentDashboardHref } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import {
  getAdmissionsJourneyStages,
  getAdmissionsPortalSections,
  getAssessmentPaymentGateKey,
  getAssessmentResultHelperKey,
  getAssessmentResultLabelKey,
  getCurrentAdmissionsJourneyStage,
  getDocumentUploadGateKey,
  isAssessmentBookingLocked,
  isAssessmentFailed,
  isDocumentUploadLocked,
} from "@/features/admissions-portal/domain/application-flow";
import { ApplicationDetailsDialog } from "@/features/admissions-portal/presentation/components/application-details-dialog";
import type {
  AdmissionsPortalContext,
  ApplicationDetail,
  ApplicationSummary,
} from "@/features/admissions-portal/domain/types";
import {
  getParentApplicationDetailHref,
  getParentApplicationSectionHref,
  type ParentApplicationSection,
} from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";
import { getServerI18n } from "@/i18n/server";

type ParentApplicationDetailViewProps = {
  activeSection: ParentApplicationSection;
  application: ApplicationDetail;
  applications: ApplicationSummary[];
  context: AdmissionsPortalContext;
};

function statusClassName(status: ApplicationDetail["status"]) {
  if (status === "accepted" || status === "offer_released") {
    return "status-pill status-positive";
  }

  if (status === "awaiting_documents" || status === "awaiting_payment") {
    return "status-pill status-negative";
  }

  return "status-pill status-neutral";
}

function documentStatusClassName(status: ApplicationDetail["documents"][number]["status"]) {
  if (status === "verified") {
    return "status-pill status-positive";
  }

  if (status === "missing") {
    return "status-pill status-negative";
  }

  return "status-pill status-neutral";
}

function assessmentResultClassName(resultStatus: ApplicationDetail["assessment"]["resultStatus"]) {
  if (resultStatus === "passed") {
    return "status-pill status-positive";
  }

  if (resultStatus === "failed") {
    return "status-pill status-negative";
  }

  return "status-pill status-neutral";
}

function journeyStateClassName(state: "complete" | "current" | "upcoming" | "locked" | "attention") {
  if (state === "complete") {
    return "border-[color-mix(in_srgb,var(--ds-primary)_48%,var(--ds-border))] bg-[color-mix(in_srgb,var(--ds-surface)_30%,var(--ds-soft))]";
  }

  if (state === "current") {
    return "border-[color-mix(in_srgb,var(--ds-primary)_65%,var(--ds-border))] bg-[var(--ds-surface)] shadow-[0_18px_38px_-28px_rgba(15,92,69,0.55)]";
  }

  if (state === "attention") {
    return "border-[color-mix(in_srgb,var(--ds-primary)_22%,var(--ds-border))] bg-[color-mix(in_srgb,var(--ds-surface)_70%,var(--ds-soft))]";
  }

  if (state === "locked") {
    return "border-[var(--ds-border)] bg-[color-mix(in_srgb,var(--ds-surface)_84%,transparent)] opacity-78";
  }

  return "border-[var(--ds-border)] bg-[color-mix(in_srgb,var(--ds-surface)_76%,var(--ds-soft))]";
}

function journeyStateBadgeClassName(state: "complete" | "current" | "upcoming" | "locked" | "attention") {
  if (state === "complete") {
    return "status-pill status-positive";
  }

  if (state === "current" || state === "upcoming") {
    return "status-pill status-neutral";
  }

  return "status-pill status-negative";
}

// portalSectionClassName / portalSectionIconWrapClassName / SectionStateIcon
// were replaced by the shared <StickyAside> primitive — see above.

function getJourneyStateLabelKey(state: "complete" | "current" | "upcoming" | "locked" | "attention") {
  return `admissions.portal.journey.state.${state}`;
}

function getJourneyStageTitleKey(id: "registration" | "payment" | "schedule" | "result" | "documents") {
  return `admissions.portal.journey.step.${id}.title`;
}

function getJourneyStageDetailKey(id: "registration" | "payment" | "schedule" | "result" | "documents") {
  return `admissions.portal.journey.step.${id}.detail`;
}

function getJourneyStageHref(
  application: ApplicationDetail,
  id: "registration" | "payment" | "schedule" | "result" | "documents",
) {
  if (id === "registration") {
    return getParentApplicationDetailHref(application.id);
  }

  if (id === "payment") {
    return getParentApplicationSectionHref(application.id, "payment");
  }

  if (id === "documents") {
    return getParentApplicationSectionHref(application.id, "documents");
  }

  return getParentApplicationSectionHref(application.id, "schedule");
}

function formatDate(value: string | undefined, language: string): string {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsedDate);
}

function formatDateTime(value: string, language: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(parsedDate).replace(",", " ·");
}

function getSchoolShortName(school: AdmissionsPortalContext["school"]) {
  return school === "iihs" ? "IIHS" : "IISS";
}

function getSectionHref(applicationId: string, section: ParentApplicationSection) {
  if (section === "overview") {
    return getParentApplicationDetailHref(applicationId);
  }

  return getParentApplicationSectionHref(applicationId, section);
}

function getDocumentActionLabelKey(
  application: ApplicationDetail,
  status: ApplicationDetail["documents"][number]["status"],
) {
  if (isDocumentUploadLocked(application) && status !== "verified") {
    return "admissions.portal.documents.action.locked";
  }

  if (status === "missing") {
    return "admissions.portal.documents.action.upload";
  }

  if (status === "uploaded") {
    return "admissions.portal.documents.action.replace";
  }

  return "admissions.portal.documents.action.view";
}

function getPaymentDueContextKey(application: ApplicationDetail) {
  if (application.payment.status === "paid") {
    return "admissions.portal.payment.due_context.paid";
  }

  if (application.payment.status === "pending_verification") {
    return "admissions.portal.payment.due_context.pending";
  }

  return "admissions.portal.payment.due_context.due_soon";
}

function getReadinessLabelKey(
  application: ApplicationDetail,
  gate: "payment" | "documents" | "assessment",
  uploadedDocuments: number,
) {
  if (gate === "payment") {
    return application.payment.statusLabelKey;
  }

  if (gate === "documents") {
    return uploadedDocuments === application.documents.length
      ? "admissions.portal.documents.summary.ready"
      : "admissions.portal.documents.summary.incomplete";
  }

  return application.assessment.statusLabelKey;
}

function getReadinessActionHref(
  application: ApplicationDetail,
  gate: "payment" | "documents" | "assessment",
) {
  if (gate === "payment") {
    return getParentApplicationSectionHref(application.id, "payment");
  }

  if (gate === "assessment") {
    return isAssessmentBookingLocked(application)
      ? getParentApplicationSectionHref(application.id, "payment")
      : getParentApplicationSectionHref(application.id, "schedule");
  }

  if (isAssessmentBookingLocked(application)) {
    return getParentApplicationSectionHref(application.id, "payment");
  }

  if (isDocumentUploadLocked(application)) {
    return getParentApplicationSectionHref(application.id, "schedule");
  }

  return getParentApplicationSectionHref(application.id, "documents");
}

function getReadinessActionLabelKey(application: ApplicationDetail, gate: "payment" | "documents" | "assessment") {
  if (gate === "payment") {
    return application.payment.ctaLabelKey;
  }

  if (gate === "assessment") {
    return isAssessmentBookingLocked(application) ? application.payment.ctaLabelKey : application.assessment.ctaLabelKey;
  }

  if (isAssessmentBookingLocked(application)) {
    return application.payment.ctaLabelKey;
  }

  if (isDocumentUploadLocked(application)) {
    return application.assessment.ctaLabelKey;
  }

  return "admissions.portal.documents.upload_cta";
}

function getCurrentJourneyDetailKey(
  application: ApplicationDetail,
  journeyStageId: "registration" | "payment" | "schedule" | "result" | "documents",
) {
  if (journeyStageId === "payment") {
    return application.payment.helperKey;
  }

  if (journeyStageId === "schedule") {
    return isAssessmentBookingLocked(application)
      ? getAssessmentPaymentGateKey(application.payment.status)
      : application.assessment.helperKey;
  }

  if (journeyStageId === "result") {
    return application.assessment.status === "completed"
      ? getAssessmentResultHelperKey(application)
      : "admissions.portal.journey.step.result.waiting_detail";
  }

  if (journeyStageId === "documents") {
    return isDocumentUploadLocked(application)
      ? getDocumentUploadGateKey(application)
      : "admissions.portal.journey.step.documents.ready_detail";
  }

  return "admissions.portal.journey.step.registration.detail";
}

function getPaymentPrimaryActionHref(application: ApplicationDetail) {
  if (application.payment.status === "paid") {
    return getParentApplicationSectionHref(application.id, "schedule");
  }

  return "#payment-methods";
}

function getPaymentPrimaryActionLabelKey(application: ApplicationDetail) {
  if (application.payment.status === "paid") {
    return "admissions.portal.payment.primary_action.continue_schedule";
  }

  return "admissions.portal.payment.primary_action.choose_method";
}

function getPaymentPrimaryActionVariant(application: ApplicationDetail) {
  return application.payment.status === "paid"
    ? "inline-flex rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ds-text-primary)]"
    : "inline-flex cta-primary rounded-xl px-4 py-2.5 text-sm font-semibold";
}

function getSchedulePrimaryActionLabelKey(application: ApplicationDetail) {
  if (isAssessmentBookingLocked(application)) {
    return application.payment.ctaLabelKey;
  }

  if (application.assessment.status === "completed" && application.assessment.resultStatus === "passed") {
    return "admissions.portal.schedule.primary_action.open_documents";
  }

  if (application.assessment.status === "completed") {
    return application.assessment.ctaLabelKey;
  }

  return "admissions.portal.schedule.primary_action.choose_slot";
}

function getSchedulePrimaryActionHref(application: ApplicationDetail) {
  if (isAssessmentBookingLocked(application)) {
    return getParentApplicationSectionHref(application.id, "payment");
  }

  if (application.assessment.status === "completed" && application.assessment.resultStatus === "passed") {
    return getParentApplicationSectionHref(application.id, "documents");
  }

  if (application.assessment.status === "completed") {
    return "#assessment-result";
  }

  return "#available-slots";
}

function getCurrentActionHref(
  application: ApplicationDetail,
  journeyStageId: "registration" | "payment" | "schedule" | "result" | "documents",
) {
  if (journeyStageId === "payment") {
    return getPaymentPrimaryActionHref(application);
  }

  if (journeyStageId === "schedule") {
    return getSchedulePrimaryActionHref(application);
  }

  if (journeyStageId === "result") {
    return "#assessment-result";
  }

  if (journeyStageId === "documents") {
    return getParentApplicationSectionHref(application.id, "documents");
  }

  return getParentApplicationDetailHref(application.id);
}

function getCurrentActionLabelKey(
  application: ApplicationDetail,
  journeyStageId: "registration" | "payment" | "schedule" | "result" | "documents",
) {
  if (journeyStageId === "payment") {
    return getPaymentPrimaryActionLabelKey(application);
  }

  if (journeyStageId === "schedule") {
    return getSchedulePrimaryActionLabelKey(application);
  }

  if (journeyStageId === "result") {
    return application.assessment.ctaLabelKey;
  }

  if (journeyStageId === "documents") {
    return "admissions.portal.documents.upload_cta";
  }

  return "admissions.portal.application.primary_cta";
}

function CompactCard({
  eyebrow,
  title,
  detail,
  action,
  tone = "neutral",
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
  tone?: "neutral" | "positive" | "warning" | "accent";
}) {
  const accent =
    tone === "positive"
      ? "before:bg-[#22c55e]"
      : tone === "warning"
        ? "before:bg-[#f59e0b]"
        : tone === "accent"
          ? "before:bg-[var(--ds-primary)]"
          : "before:bg-[var(--ds-border)]";
  return (
    <article className={`relative surface-card rounded-3xl p-5 sm:p-6 before:absolute before:left-0 before:top-6 before:bottom-6 before:w-1 before:rounded-full ${accent}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">{eyebrow}</p>
      <p className="mt-3 text-[1.05rem] font-semibold leading-snug text-[var(--ds-text-primary)]">{title}</p>
      {detail ? <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{detail}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  );
}

export async function ParentApplicationDetailView({
  activeSection,
  application,
  applications,
  context,
}: ParentApplicationDetailViewProps) {
  const { language, t } = await getServerI18n();
  const schoolShortName = getSchoolShortName(application.school);
  const translationValues = {
    student: application.studentName,
    school: schoolShortName,
    parent: application.parentName,
  };
  const dashboardHref = getParentDashboardHref({
    parentName: context.parentName,
    email: context.email,
    school: context.school,
    students: context.students,
    hasExistingStudents: context.hasExistingStudents,
    existingChildrenCount: context.existingChildrenCount,
    locationSuburb: context.locationSuburb,
    notes: context.notes,
  });
  const journeyStages = getAdmissionsJourneyStages(application);
  const portalSections = getAdmissionsPortalSections(application);
  const currentJourneyStage = getCurrentAdmissionsJourneyStage(journeyStages);
  const completedStages = journeyStages.filter((step) => step.state === "complete").length;
  const uploadedDocuments = application.documents.filter((document) => document.status !== "missing").length;
  const documentProgress = Math.round((uploadedDocuments / Math.max(application.documents.length, 1)) * 100);
  const dueDateLabel = formatDate(application.payment.dueDate, language);
  const submittedAtLabel = formatDate(application.submittedAt, language);
  const lastUpdatedAtLabel = formatDate(application.lastUpdatedAt, language);
  const birthDateLabel = formatDate(application.studentBirthDate, language);
  const assessmentBookingLocked = isAssessmentBookingLocked(application);
  const documentUploadLocked = isDocumentUploadLocked(application);
  const assessmentGateDetailKey = assessmentBookingLocked ? getAssessmentPaymentGateKey(application.payment.status) : null;
  const documentGateDetailKey = documentUploadLocked ? getDocumentUploadGateKey(application) : null;
  const documentGateActionHref = assessmentBookingLocked
    ? getParentApplicationSectionHref(application.id, "payment")
    : getParentApplicationSectionHref(application.id, "schedule");
  const documentGateActionLabelKey = assessmentBookingLocked ? application.payment.ctaLabelKey : application.assessment.ctaLabelKey;
  const primaryActionHref = getCurrentActionHref(application, currentJourneyStage.id);
  const primaryActionLabelKey = getCurrentActionLabelKey(application, currentJourneyStage.id);
  const currentJourneyTitleKey = getJourneyStageTitleKey(currentJourneyStage.id);
  const currentJourneyDetailKey = getCurrentJourneyDetailKey(application, currentJourneyStage.id);
  const availableSlots = [
    { id: "slot-1", startsAt: "2026-04-18T09:00:00+07:00", labelKey: "admissions.portal.schedule.slot.primary" },
    { id: "slot-2", startsAt: "2026-04-19T13:30:00+07:00", labelKey: "admissions.portal.schedule.slot.secondary" },
    { id: "slot-3", startsAt: "2026-04-21T16:00:00+07:00", labelKey: "admissions.portal.schedule.slot.backup" },
  ] as const;
  const familyRegisteredValueKey =
    context.students.length > 1
      ? "admissions.portal.sidebar.family_registered_value"
      : "admissions.portal.sidebar.family_registered_value_single";
  const applicationDetailsItems = [
    {
      label: t("admissions.portal.application.student_birth_date"),
      value: birthDateLabel || t("common.not_provided"),
    },
    {
      label: t("admissions.portal.application.meta.submitted_at"),
      value: submittedAtLabel,
    },
    {
      label: t("admissions.portal.application.meta.updated_at"),
      value: lastUpdatedAtLabel,
    },
    {
      label: t("admissions.portal.application.meta.owner"),
      value: application.admissionsOwner,
    },
    {
      label: t("admissions.portal.application.meta.intake"),
      value: application.intakeLabel,
    },
    {
      label: t("admissions.portal.application.location"),
      value: application.locationSuburb,
    },
  ];
  const familyNotesValue = application.familyNotes?.trim() ? application.familyNotes : t("admissions.portal.application.family_notes_empty");

  // Build page-level subject-naming aids used by <PageHeader> so every
  // sub-route (documents / payment / schedule / decision) always makes it
  // obvious *whose* data the page is about — see design principle #3.
  const sectionLabelKey = `admissions.portal.nav.${activeSection}.label` as const;
  const sectionBreadcrumbKey = `ui.breadcrumb.${activeSection}` as const;
  const pageTitle =
    activeSection === "overview"
      ? application.studentName
      : `${t(sectionLabelKey)} · ${application.studentName}`;
  const subtitleContext = t("ui.subtitle.student_context", {
    grade: t(`auth.additional.target_grade.${application.targetGrade}`),
    school: schoolShortName,
    status: t(application.statusLabelKey),
  });
  const pageBreadcrumbs: Breadcrumb[] = [
    { label: t("ui.breadcrumb.home"), href: "/" },
    { label: t("ui.breadcrumb.parent_dashboard"), href: dashboardHref },
    {
      label: application.studentName,
      href: activeSection === "overview" ? undefined : getParentApplicationDetailHref(application.id),
    },
  ];
  if (activeSection !== "overview") {
    pageBreadcrumbs.push({ label: t(sectionBreadcrumbKey) });
  }

  // Student switcher — one tab per sibling application. We anchor each
  // tab on the *same sub-section* the user is currently viewing, so
  // clicking "Fatima" while on "Payment for Ahmad" lands on "Payment for
  // Fatima" (not bounces back to her overview).
  const switcherItems: StudentSwitcherItem[] = applications.map((summary) => ({
    id: summary.id,
    studentName: summary.studentName,
    href:
      activeSection === "overview"
        ? getParentApplicationDetailHref(summary.id)
        : getParentApplicationSectionHref(summary.id, activeSection),
    statusLabel: t(summary.statusLabelKey),
    statusRawValue: summary.status,
    statusTone: statusToneFor(summary.status),
  }));

  // Derive "needs action" badges for the section nav — design principle
  // #5. Badge shows when that section has something the parent must do.
  const paymentNeedsAction = application.payment.status !== "paid";
  const documentsNeedsAction =
    !documentUploadLocked && application.documents.some((d) => d.status === "missing");
  const scheduleNeedsAction =
    !assessmentBookingLocked && application.assessment.status === "not_booked";
  const decisionNeedsAction = application.decision.status === "offer_released";

  const sectionNavItems: StickyAsideItem[] = portalSections.map((section) => {
    const sectionId = section.id as ParentApplicationSection;
    const isActive = sectionId === activeSection;
    const isLocked = section.state === "locked";
    const needsAction =
      sectionId === "payment"
        ? paymentNeedsAction
        : sectionId === "documents"
          ? documentsNeedsAction
          : sectionId === "schedule"
            ? scheduleNeedsAction
            : sectionId === "decision"
              ? decisionNeedsAction
              : false;
    return {
      id: sectionId,
      label: t(`admissions.portal.nav.${sectionId}.label`),
      href: getSectionHref(application.id, sectionId),
      active: isActive,
      disabled: isLocked,
      badge: needsAction && !isLocked ? t("ui.section_nav.needs_action_badge") : undefined,
      badgeTone: needsAction ? "warn" : undefined,
    } as StickyAsideItem;
  });

  const sectionNavAriaLabel = t("ui.section_nav.aria_label", { student: application.studentName });

  return (
    <div className="dashboard-bg min-h-screen pb-10">
      <div className="mx-auto max-w-[1360px] px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <section className="brand-header rounded-[32px] p-4 sm:p-5 lg:p-6">
          <PageHeader
            breadcrumbs={pageBreadcrumbs}
            eyebrow={t("admissions.portal.application.eyebrow")}
            title={pageTitle}
            subtitle={subtitleContext}
            statusLabel={t(application.statusLabelKey)}
            statusRawValue={application.status}
            size="hero"
          />

          {switcherItems.length > 1 ? (
            <div className="mt-4">
              <StudentSwitcher
                items={switcherItems}
                activeId={application.id}
                ariaLabel={t("ui.student_switcher.aria_label")}
              />
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_312px]">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                {t("admissions.portal.journey.title")}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ds-text-secondary)]">
                {t("admissions.portal.journey.description", translationValues)}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm text-[var(--ds-text-secondary)]">
                <span>{t(`auth.additional.target_grade.${application.targetGrade}`)}</span>
                <span>·</span>
                <span>{application.currentSchool}</span>
                <span>·</span>
                <span>{t("ui.subtitle.application_id", { id: application.id })}</span>
              </div>
            </div>

            <div className="rounded-[26px] border border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)] bg-[color-mix(in_srgb,var(--ds-surface)_88%,transparent)] p-4 shadow-[0_18px_38px_-28px_rgba(16,33,50,0.55)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-text-secondary)]">
                {t("admissions.portal.application.action_center")}
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)] sm:text-xl">
                {t(currentJourneyTitleKey)}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ds-text-secondary)]">
                {t(currentJourneyDetailKey, translationValues)}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <span className={journeyStateBadgeClassName(currentJourneyStage.state)}>
                  {t(getJourneyStateLabelKey(currentJourneyStage.state))}
                </span>
                <span className="text-sm text-[var(--ds-text-secondary)]">
                  {t("admissions.portal.stage_tracker.progress", { done: completedStages, total: journeyStages.length })}
                </span>
              </div>
              <Link href={primaryActionHref} className="mt-4 inline-flex cta-primary rounded-xl px-4 py-2.5 text-sm font-semibold">
                {t(primaryActionLabelKey)}
              </Link>
            </div>
          </div>
        </section>

        <section className="surface-card mt-4 rounded-[30px] p-4 sm:p-5">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-text-secondary)]">
                  {t("admissions.portal.stage_tracker.title")}
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ds-text-secondary)]">
                  {t("admissions.portal.stage_tracker.description")}
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
                {t("admissions.portal.stage_tracker.progress", { done: completedStages, total: journeyStages.length })}
              </p>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-5">
              {journeyStages.map((stage, index) => {
                const isDone = stage.state === "complete";
                const isCurrent = stage.state === "current";
                return (
                  <Link
                    key={stage.id}
                    href={getJourneyStageHref(application, stage.id)}
                    className={`group relative rounded-[24px] border p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--ds-shadow-soft)] ${journeyStateClassName(stage.state)}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                        isDone
                          ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
                          : isCurrent
                            ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)] ring-4 ring-[var(--ds-primary)]/20"
                            : "bg-[var(--ds-border)] text-[var(--ds-text-secondary)]"
                      }`} aria-hidden="true">
                        {isDone ? (
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className={journeyStateBadgeClassName(stage.state)}>{t(getJourneyStateLabelKey(stage.state))}</span>
                    </div>
                    <p className="mt-4 text-[15px] font-semibold leading-snug text-[var(--ds-text-primary)]">
                      {t(getJourneyStageTitleKey(stage.id))}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--ds-text-secondary)]">
                      {t(getJourneyStageDetailKey(stage.id), translationValues)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="space-y-4 lg:self-start">
            <StickyAside
              items={sectionNavItems}
              eyebrow={t("ui.section_nav.eyebrow")}
              ariaLabel={sectionNavAriaLabel}
            />

            <section className="surface-card rounded-3xl p-4">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                    {t("admissions.portal.application.parent_owner")}
                  </p>
                  <p className="mt-1 font-semibold text-[var(--ds-text-primary)]">{application.parentName}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                      {t("admissions.portal.sidebar.family_school")}
                    </p>
                    <p className="mt-1 font-semibold text-[var(--ds-text-primary)]">{schoolShortName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                      {t("admissions.portal.sidebar.family_registered")}
                    </p>
                    <p className="mt-1 font-semibold text-[var(--ds-text-primary)]">
                      {t(familyRegisteredValueKey, { count: context.students.length, siblings: Math.max(context.students.length - 1, 0) })}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="surface-card rounded-3xl p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                {t("admissions.portal.sidebar.other_students")}
              </p>
              <div className="mt-3 space-y-2">
                {applications.map((item) => (
                  <Link
                    key={item.id}
                    href={getParentApplicationDetailHref(item.id)}
                    className={`block rounded-2xl border px-4 py-3 transition ${
                      item.id === application.id
                        ? "border-[var(--ds-primary)] bg-[var(--ds-soft)]"
                        : "border-[var(--ds-border)] bg-[var(--ds-surface)] hover:border-[var(--ds-primary)]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{item.studentName}</p>
                      <span className={statusClassName(item.status)}>{t(item.statusLabelKey)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <main className="space-y-4">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <CompactCard
                eyebrow={t("admissions.portal.overview.summary.payment_status")}
                title={t(application.payment.statusLabelKey)}
                detail={t(getPaymentDueContextKey(application))}
                tone={application.payment.status === "paid" ? "positive" : "warning"}
              />
              <CompactCard
                eyebrow={t("admissions.portal.overview.summary.document_status")}
                title={t("admissions.portal.documents.progress_value", { done: uploadedDocuments, total: application.documents.length })}
                detail={`${documentProgress}%`}
                tone={uploadedDocuments === application.documents.length ? "positive" : "accent"}
              />
              <CompactCard
                eyebrow={t("admissions.portal.schedule.status_label")}
                title={t(application.assessment.statusLabelKey)}
                detail={application.assessment.scheduleLabel ?? t(application.assessment.helperKey)}
                tone={application.assessment.status === "completed" ? "positive" : "accent"}
              />
              <CompactCard
                eyebrow={t("admissions.portal.decision_page.current_status_label")}
                title={t(application.decision.statusLabelKey)}
                detail={t(application.decision.helperKey)}
                tone={application.decision.status === "offer_released" ? "positive" : "neutral"}
              />
            </section>

            {activeSection === "overview" ? (
              <>
                <section className="grid gap-4 xl:grid-cols-3">
                  {(["payment", "documents", "assessment"] as const).map((gate) => (
                    <CompactCard
                      key={gate}
                      eyebrow={t(`admissions.portal.overview.readiness.${gate}`)}
                      title={t(getReadinessLabelKey(application, gate, uploadedDocuments))}
                      action={
                        <Link
                          href={getReadinessActionHref(application, gate)}
                          className="inline-flex rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)]"
                        >
                          {t(getReadinessActionLabelKey(application, gate))}
                        </Link>
                      }
                    />
                  ))}
                </section>

                <section className="surface-card rounded-3xl p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                        {t("admissions.portal.compact.application_details")}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--ds-text-secondary)]">
                        {t("admissions.portal.application.details_teaser")}
                      </p>
                    </div>
                    <ApplicationDetailsDialog
                      openLabel={t("admissions.portal.application.details_open")}
                      closeLabel={t("admissions.portal.application.details_close")}
                      title={t("admissions.portal.application.details_title")}
                      description={t("admissions.portal.application.details_description", translationValues)}
                      items={applicationDetailsItems}
                      notesTitle={t("admissions.portal.application.family_notes")}
                      notesValue={familyNotesValue}
                    />
                  </div>
                </section>
              </>
            ) : null}

            {activeSection === "payment" ? (
              <>
                <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <CompactCard
                    eyebrow={t("admissions.portal.payment.title")}
                    title={application.payment.amount}
                    detail={`${t("admissions.portal.payment.due_date_label")}: ${dueDateLabel}`}
                    action={
                      <Link
                        href={getPaymentPrimaryActionHref(application)}
                        className={getPaymentPrimaryActionVariant(application)}
                      >
                        {t(getPaymentPrimaryActionLabelKey(application))}
                      </Link>
                    }
                  />
                  <CompactCard
                    eyebrow={t("admissions.portal.payment.after_payment_title")}
                    title={t("admissions.portal.payment.after_payment_heading")}
                    detail={t("admissions.portal.payment.after_payment_description")}
                  />
                </section>

                <section id="payment-methods" className="surface-card rounded-3xl p-5 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                        {t("admissions.portal.payment.methods_title")}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">
                        {t("admissions.portal.payment.methods_heading")}
                      </h2>
                    </div>
                    <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 px-4 py-3 text-sm">
                      <p className="font-semibold text-[var(--ds-text-primary)]">{application.payment.invoiceNumber}</p>
                      <p className="mt-1 text-[var(--ds-text-secondary)]">{application.payment.referenceNumber}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 lg:grid-cols-3">
                    {application.payment.methods.map((method) => (
                      <article key={method.id} className="group relative overflow-hidden rounded-[26px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 transition card-interactive">
                        <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)] transition group-hover:bg-[var(--ds-primary)] group-hover:text-[var(--ds-on-primary)]" aria-hidden="true">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                        </span>
                        <p className="pr-10 text-[15px] font-semibold text-[var(--ds-text-primary)]">{t(method.labelKey)}</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--ds-text-secondary)]">{t(method.descriptionKey)}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <details className="surface-card rounded-3xl p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ds-text-primary)]">
                    {t("admissions.portal.compact.invoice_breakdown")}
                  </summary>
                  <div className="mt-4 divide-y divide-[var(--ds-border)] rounded-2xl border border-[var(--ds-border)]">
                    {application.payment.lineItems.length === 0 ? (
                      <div className="px-4 py-4">
                        <p className="text-sm text-[var(--ds-text-secondary)]">
                          {t("admissions.portal.payment.breakdown.empty")}
                        </p>
                      </div>
                    ) : (
                      application.payment.lineItems.map((lineItem) => {
                        const labelText = lineItem.label ?? (lineItem.labelKey ? t(lineItem.labelKey) : "");
                        const helperText = lineItem.helperKey ? t(lineItem.helperKey) : null;
                        return (
                          <div key={lineItem.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_auto]">
                            <div>
                              <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{labelText}</p>
                              {helperText ? (
                                <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{helperText}</p>
                              ) : null}
                            </div>
                            <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{lineItem.amount}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </details>

                <details className="surface-card rounded-3xl p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ds-text-primary)]">
                    {t("admissions.portal.compact.payment_timeline")}
                  </summary>
                  <div className="mt-4 space-y-3">
                    {application.payment.updates.map((update) => (
                      <div key={update.id} className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/35 p-4">
                        <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(update.titleKey)}</p>
                        <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t(update.detailKey)}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </>
            ) : null}

            {activeSection === "documents" ? (
              <div className="flex flex-col gap-5">
                {documentGateDetailKey ? (
                  <section className="rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/45 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-3xl">
                        <span className="status-pill status-negative">{t("admissions.portal.documents.gate.badge")}</span>
                        <h2 className="mt-3 text-xl font-semibold text-[var(--ds-text-primary)]">
                          {t("admissions.portal.documents.gate.title")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                          {t(documentGateDetailKey, translationValues)}
                        </p>
                      </div>
                      <Link
                        href={documentGateActionHref}
                        className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ds-text-primary)]"
                      >
                        {t(documentGateActionLabelKey)}
                      </Link>
                    </div>
                  </section>
                ) : null}

                <section className="surface-card rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 w-full max-w-xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                        {t("admissions.portal.documents.summary_label")}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">
                        {t("admissions.portal.documents.progress_value", { done: uploadedDocuments, total: application.documents.length })}
                      </h2>
                      
                      <div className="mt-5 flex items-center gap-4">
                        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--ds-border)]/60">
                          <div 
                            className="absolute inset-y-0 left-0 bg-[var(--ds-primary)] transition-all duration-700 ease-out" 
                            style={{ width: `${documentProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[var(--ds-text-primary)]">{documentProgress}%</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden surface-card rounded-3xl">
                  <div className="divide-y divide-[var(--ds-border)]">
                    {application.documents.map((document) => {
                      const isMissing = document.status === "missing";
                      const isLockedAction = documentUploadLocked && document.status !== "verified";
                      const rowClass = isMissing ? "bg-[var(--ds-soft)]/30 hover:bg-[var(--ds-soft)]/50" : "hover:bg-[var(--ds-soft)]/30";
  
                      return (
                        <article key={document.id} className={`p-5 sm:p-6 transition-colors ${rowClass}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                <h3 className="text-base font-semibold text-[var(--ds-text-primary)] truncate">{t(document.labelKey)}</h3>
                                <span className={documentStatusClassName(document.status)}>{t(document.statusLabelKey)}</span>
                              </div>
                              <p className="text-sm text-[var(--ds-text-secondary)] leading-relaxed max-w-2xl">{t(document.helperKey)}</p>
                            </div>
                            <div className="flex shrink-0">
                              <button
                                type="button"
                                disabled={isLockedAction}
                                aria-disabled={isLockedAction}
                                className={`w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                                  isLockedAction
                                    ? "cursor-not-allowed border border-[var(--ds-border)] bg-[var(--ds-soft)] text-[var(--ds-text-secondary)] opacity-70"
                                    : isMissing
                                    ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)] hover:opacity-90 shadow-sm"
                                    : "border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text-primary)] hover:border-[var(--ds-primary)]/50 hover:bg-[var(--ds-soft)]/50"
                                }`}
                              >
                                {t(getDocumentActionLabelKey(application, document.status))}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <details className="surface-card rounded-3xl p-6 group">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[var(--ds-text-primary)] select-none outline-none">
                    {t("admissions.portal.compact.help")}
                    <span className="text-[var(--ds-text-secondary)] transition-transform duration-200 group-open:rotate-180">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                    {t("admissions.portal.documents.support_description", translationValues)}
                  </p>
                </details>
              </div>
            ) : null}

            {activeSection === "schedule" ? (
              <>
                <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <CompactCard
                    eyebrow={t("admissions.portal.schedule.title")}
                    title={t(application.assessment.statusLabelKey)}
                    detail={application.assessment.scheduleLabel ?? t(application.assessment.helperKey)}
                    action={
                      <Link href={getSchedulePrimaryActionHref(application)} className="inline-flex cta-primary rounded-xl px-4 py-2.5 text-sm font-semibold">
                        {t(getSchedulePrimaryActionLabelKey(application))}
                      </Link>
                    }
                  />
                  <CompactCard
                    eyebrow={t("admissions.portal.schedule.after_assessment_title")}
                    title={t("admissions.portal.schedule.after_assessment_heading")}
                    detail={t("admissions.portal.schedule.after_assessment_description")}
                  />
                </section>

                {!assessmentBookingLocked && application.assessment.status !== "completed" ? (
                  <section id="available-slots" className="surface-card rounded-3xl p-5 sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                          {t("admissions.portal.schedule.slots_title")}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-[var(--ds-text-primary)]">
                          {t("admissions.portal.schedule.slots_heading")}
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ds-text-secondary)]">
                          {t("admissions.portal.schedule.slots_description", translationValues)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 lg:grid-cols-3">
                      {availableSlots.map((slot) => (
                        <article key={slot.id} className="group relative overflow-hidden rounded-[26px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 transition card-interactive">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]" aria-hidden="true">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                          </span>
                          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                            {t(slot.labelKey)}
                          </p>
                          <p className="mt-2 text-lg font-semibold leading-snug text-[var(--ds-text-primary)]">
                            {formatDateTime(slot.startsAt, language)} WIB
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--ds-text-secondary)]">
                            {t("admissions.portal.schedule.slots_helper")}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}

                {assessmentGateDetailKey ? (
                  <section className="rounded-3xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/45 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-3xl">
                        <span className="status-pill status-negative">{t("admissions.portal.schedule.gate.badge")}</span>
                        <h2 className="mt-3 text-xl font-semibold text-[var(--ds-text-primary)]">
                          {t("admissions.portal.schedule.gate.title")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                          {t(assessmentGateDetailKey, translationValues)}
                        </p>
                      </div>
                      <Link
                        href={getParentApplicationSectionHref(application.id, "payment")}
                        className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ds-text-primary)]"
                      >
                        {t(application.payment.ctaLabelKey)}
                      </Link>
                    </div>
                  </section>
                ) : null}

                {application.assessment.status === "completed" ? (
                  <section id="assessment-result" className="surface-card rounded-3xl p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                        {t("admissions.portal.assessment.result_label")}
                      </p>
                      <span className={assessmentResultClassName(application.assessment.resultStatus)}>
                        {t(getAssessmentResultLabelKey(application.assessment.resultStatus))}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--ds-text-secondary)]">
                      {t(getAssessmentResultHelperKey(application), translationValues)}
                    </p>
                    {isAssessmentFailed(application) ? (
                      <p className="mt-3 text-sm font-semibold text-[var(--ds-text-primary)]">
                        {t("admissions.portal.documents.gate.assessment_failed")}
                      </p>
                    ) : null}
                  </section>
                ) : null}

                <details className="surface-card rounded-3xl p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ds-text-primary)]">
                    {t("admissions.portal.compact.more_details")}
                  </summary>
                  <div className="mt-4 space-y-2">
                    {["device", "documents", "support"].map((item) => (
                      <p key={item} className="text-sm text-[var(--ds-text-secondary)]">
                        {t(`admissions.portal.schedule.prep.${item}`)}
                      </p>
                    ))}
                  </div>
                </details>
              </>
            ) : null}

            {activeSection === "decision" ? (
              <>
                <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <CompactCard
                    eyebrow={t("admissions.portal.decision_page.title")}
                    title={t(application.decision.statusLabelKey)}
                    detail={t(application.decision.helperKey)}
                    action={
                      <button type="button" className="cta-primary rounded-xl px-4 py-2.5 text-sm font-semibold">
                        {t(application.decision.ctaLabelKey)}
                      </button>
                    }
                  />
                  <CompactCard
                    eyebrow={t("admissions.portal.compact.readiness")}
                    title={t("admissions.portal.stage_tracker.progress", { done: completedStages, total: journeyStages.length })}
                    detail={t(currentJourneyTitleKey)}
                  />
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                  {(["payment", "documents", "assessment"] as const).map((gate) => (
                    <CompactCard
                      key={gate}
                      eyebrow={t(`admissions.portal.decision_page.gate.${gate}`)}
                      title={t(getReadinessLabelKey(application, gate, uploadedDocuments))}
                    />
                  ))}
                </section>

                <details className="surface-card rounded-3xl p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--ds-text-primary)]">
                    {t("admissions.portal.compact.more_details")}
                  </summary>
                  <p className="mt-4 text-sm text-[var(--ds-text-secondary)]">
                    {t("admissions.portal.decision_page.next_steps_description", translationValues)}
                  </p>
                </details>
              </>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
