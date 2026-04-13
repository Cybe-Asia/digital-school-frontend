import Link from "next/link";
import type { ReactNode } from "react";
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
import { cn } from "@/shared/lib/cn";

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

function portalSectionClassName(state: "complete" | "current" | "locked", isActive: boolean) {
  if (isActive && state !== "locked") {
    return "border-[var(--ds-primary)] bg-[var(--ds-primary)] text-[var(--ds-on-primary)] shadow-[0_18px_38px_-28px_rgba(15,92,69,0.55)]";
  }

  if (state === "complete") {
    return "border-[color-mix(in_srgb,var(--ds-primary)_40%,var(--ds-border))] bg-[color-mix(in_srgb,var(--ds-surface)_40%,var(--ds-soft))] text-[var(--ds-text-primary)] hover:border-[var(--ds-primary)]/55";
  }

  if (state === "current") {
    return "border-[color-mix(in_srgb,var(--ds-primary)_60%,var(--ds-border))] bg-[var(--ds-surface)] text-[var(--ds-text-primary)] hover:-translate-y-0.5 hover:border-[var(--ds-primary)]";
  }

  return "border-[color-mix(in_srgb,#d14b52_38%,var(--ds-border))] bg-[color-mix(in_srgb,var(--ds-surface)_82%,transparent)] text-[var(--ds-text-secondary)]";
}

function portalSectionIconWrapClassName(state: "complete" | "current" | "locked", isActive: boolean) {
  if (isActive && state !== "locked") {
    return "border-[color-mix(in_srgb,var(--ds-on-primary)_24%,transparent)] bg-[color-mix(in_srgb,var(--ds-on-primary)_18%,transparent)] text-[var(--ds-on-primary)]";
  }

  if (state === "complete") {
    return "border-[color-mix(in_srgb,var(--ds-primary)_36%,var(--ds-border))] bg-[color-mix(in_srgb,var(--ds-primary)_12%,var(--ds-surface))] text-[var(--ds-primary)]";
  }

  if (state === "current") {
    return "border-[color-mix(in_srgb,var(--ds-primary)_45%,var(--ds-border))] bg-[color-mix(in_srgb,var(--ds-primary)_10%,var(--ds-surface))] text-[var(--ds-primary)]";
  }

  return "border-[color-mix(in_srgb,#d14b52_40%,var(--ds-border))] bg-[color-mix(in_srgb,#d14b52_10%,var(--ds-surface))] text-[#b83d44]";
}

function getPortalSectionStateLabelKey(state: "complete" | "current" | "locked") {
  return `admissions.portal.journey.state.${state}`;
}

function SectionStateIcon({ state }: { state: "complete" | "current" | "locked" }) {
  if (state === "complete") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (state === "current") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.5 2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

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
  context: AdmissionsPortalContext,
  application: ApplicationDetail,
  id: "registration" | "payment" | "schedule" | "result" | "documents",
) {
  if (id === "registration") {
    return getParentApplicationDetailHref(context, application.id);
  }

  if (id === "payment") {
    return getParentApplicationSectionHref(context, application.id, "payment");
  }

  if (id === "documents") {
    return getParentApplicationSectionHref(context, application.id, "documents");
  }

  return getParentApplicationSectionHref(context, application.id, "schedule");
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

function getSectionHref(context: AdmissionsPortalContext, applicationId: string, section: ParentApplicationSection) {
  if (section === "overview") {
    return getParentApplicationDetailHref(context, applicationId);
  }

  return getParentApplicationSectionHref(context, applicationId, section);
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
  context: AdmissionsPortalContext,
  application: ApplicationDetail,
  gate: "payment" | "documents" | "assessment",
) {
  if (gate === "payment") {
    return getParentApplicationSectionHref(context, application.id, "payment");
  }

  if (gate === "assessment") {
    return isAssessmentBookingLocked(application)
      ? getParentApplicationSectionHref(context, application.id, "payment")
      : getParentApplicationSectionHref(context, application.id, "schedule");
  }

  if (isAssessmentBookingLocked(application)) {
    return getParentApplicationSectionHref(context, application.id, "payment");
  }

  if (isDocumentUploadLocked(application)) {
    return getParentApplicationSectionHref(context, application.id, "schedule");
  }

  return getParentApplicationSectionHref(context, application.id, "documents");
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

function getPaymentPrimaryActionHref(context: AdmissionsPortalContext, application: ApplicationDetail) {
  if (application.payment.status === "paid") {
    return getParentApplicationSectionHref(context, application.id, "schedule");
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

function getSchedulePrimaryActionHref(context: AdmissionsPortalContext, application: ApplicationDetail) {
  if (isAssessmentBookingLocked(application)) {
    return getParentApplicationSectionHref(context, application.id, "payment");
  }

  if (application.assessment.status === "completed" && application.assessment.resultStatus === "passed") {
    return getParentApplicationSectionHref(context, application.id, "documents");
  }

  if (application.assessment.status === "completed") {
    return "#assessment-result";
  }

  return "#available-slots";
}

function getCurrentActionHref(
  context: AdmissionsPortalContext,
  application: ApplicationDetail,
  journeyStageId: "registration" | "payment" | "schedule" | "result" | "documents",
) {
  if (journeyStageId === "payment") {
    return getPaymentPrimaryActionHref(context, application);
  }

  if (journeyStageId === "schedule") {
    return getSchedulePrimaryActionHref(context, application);
  }

  if (journeyStageId === "result") {
    return "#assessment-result";
  }

  if (journeyStageId === "documents") {
    return getParentApplicationSectionHref(context, application.id, "documents");
  }

  return getParentApplicationDetailHref(context, application.id);
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
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <article className="surface-card rounded-3xl p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">{eyebrow}</p>
      <p className="mt-2 text-base font-semibold text-[var(--ds-text-primary)]">{title}</p>
      {detail ? <p className="mt-2 text-sm text-[var(--ds-text-secondary)]">{detail}</p> : null}
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
    ? getParentApplicationSectionHref(context, application.id, "payment")
    : getParentApplicationSectionHref(context, application.id, "schedule");
  const documentGateActionLabelKey = assessmentBookingLocked ? application.payment.ctaLabelKey : application.assessment.ctaLabelKey;
  const primaryActionHref = getCurrentActionHref(context, application, currentJourneyStage.id);
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

  return (
    <div className="dashboard-bg min-h-screen pb-10">
      <div className="mx-auto max-w-[1360px] px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <section className="brand-header rounded-[32px] p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={dashboardHref}
              className="rounded-full border border-[var(--ds-border)] bg-[color-mix(in_srgb,var(--ds-surface)_88%,transparent)] px-3.5 py-2 text-sm font-semibold text-[var(--ds-text-primary)] transition hover:border-[var(--ds-primary)]"
            >
              {t("admissions.portal.back_to_dashboard")}
            </Link>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--ds-surface)_78%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
              {t("admissions.portal.application.eyebrow")}
            </span>
            <span className={statusClassName(application.status)}>{t(application.statusLabelKey)}</span>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_312px]">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
                {t("admissions.portal.journey.title")}
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight text-[var(--ds-text-primary)] sm:text-[2rem] lg:text-[2.35rem]">
                {application.studentName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ds-text-secondary)]">
                {t("admissions.portal.journey.description", translationValues)}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm text-[var(--ds-text-secondary)]">
                <span>{t(`auth.additional.target_grade.${application.targetGrade}`)}</span>
                <span>·</span>
                <span>{application.currentSchool}</span>
                <span>·</span>
                <span>{application.id}</span>
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

            <div className="mt-4 grid gap-3 lg:grid-cols-5">
              {journeyStages.map((stage, index) => (
                <Link
                  key={stage.id}
                  href={getJourneyStageHref(context, application, stage.id)}
                  className={`group rounded-[24px] border p-3.5 transition-transform duration-200 hover:-translate-y-0.5 ${journeyStateClassName(stage.state)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                      {t("admissions.portal.journey.step_label", { step: index + 1 })}
                    </span>
                    <span className={journeyStateBadgeClassName(stage.state)}>{t(getJourneyStateLabelKey(stage.state))}</span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[var(--ds-text-primary)]">
                    {t(getJourneyStageTitleKey(stage.id))}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--ds-text-secondary)]">
                    {t(getJourneyStageDetailKey(stage.id), translationValues)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <section className="surface-card rounded-3xl p-4">
              <div className="space-y-2">
                {portalSections.map((section) => {
                  const isActive = section.id === activeSection;
                  const isLocked = section.state === "locked";
                  const label = t(`admissions.portal.nav.${section.id}.label`);
                  const content = (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{label}</span>
                      <span
                        className={cn(
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                          portalSectionIconWrapClassName(section.state, isActive),
                        )}
                      >
                        <SectionStateIcon state={section.state} />
                        <span className="sr-only">{t(getPortalSectionStateLabelKey(section.state))}</span>
                      </span>
                    </div>
                  );

                  if (isLocked) {
                    return (
                      <div
                        key={section.id}
                        aria-disabled="true"
                        className={cn(
                          "block cursor-not-allowed rounded-2xl border px-4 py-3 transition",
                          portalSectionClassName(section.state, isActive),
                        )}
                      >
                        {content}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={section.id}
                      href={getSectionHref(context, application.id, section.id as ParentApplicationSection)}
                      className={cn(
                        "block rounded-2xl border px-4 py-3 transition duration-200",
                        portalSectionClassName(section.state, isActive),
                      )}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </section>

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
                    href={getParentApplicationDetailHref(context, item.id)}
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
          </aside>

          <main className="space-y-4">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <CompactCard
                eyebrow={t("admissions.portal.overview.summary.payment_status")}
                title={t(application.payment.statusLabelKey)}
                detail={t(getPaymentDueContextKey(application))}
              />
              <CompactCard
                eyebrow={t("admissions.portal.overview.summary.document_status")}
                title={t("admissions.portal.documents.progress_value", { done: uploadedDocuments, total: application.documents.length })}
                detail={`${documentProgress}%`}
              />
              <CompactCard
                eyebrow={t("admissions.portal.schedule.status_label")}
                title={t(application.assessment.statusLabelKey)}
                detail={application.assessment.scheduleLabel ?? t(application.assessment.helperKey)}
              />
              <CompactCard
                eyebrow={t("admissions.portal.decision_page.current_status_label")}
                title={t(application.decision.statusLabelKey)}
                detail={t(application.decision.helperKey)}
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
                          href={getReadinessActionHref(context, application, gate)}
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
                        href={getPaymentPrimaryActionHref(context, application)}
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

                  <div className="mt-5 grid gap-3 lg:grid-cols-3">
                    {application.payment.methods.map((method) => (
                      <article key={method.id} className="rounded-[26px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 transition-transform duration-200 hover:-translate-y-0.5">
                        <p className="text-base font-semibold text-[var(--ds-text-primary)]">{t(method.labelKey)}</p>
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
                    {application.payment.lineItems.map((lineItem) => (
                      <div key={lineItem.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_auto]">
                        <div>
                          <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t(lineItem.labelKey)}</p>
                          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t(lineItem.helperKey)}</p>
                        </div>
                        <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{lineItem.amount}</p>
                      </div>
                    ))}
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
                      <Link href={getSchedulePrimaryActionHref(context, application)} className="inline-flex cta-primary rounded-xl px-4 py-2.5 text-sm font-semibold">
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

                    <div className="mt-5 grid gap-3 lg:grid-cols-3">
                      {availableSlots.map((slot) => (
                        <article key={slot.id} className="rounded-[26px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5 transition-transform duration-200 hover:-translate-y-0.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-text-secondary)]">
                            {t(slot.labelKey)}
                          </p>
                          <p className="mt-3 text-lg font-semibold text-[var(--ds-text-primary)]">
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
                        href={getParentApplicationSectionHref(context, application.id, "payment")}
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
