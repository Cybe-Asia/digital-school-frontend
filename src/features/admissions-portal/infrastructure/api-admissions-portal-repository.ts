import type { AdmissionsPortalRepository } from "@/features/admissions-portal/domain/ports/admissions-portal-repository";
import type {
  AdmissionsPortalContext,
  ApplicationAssessment,
  ApplicationDecision,
  ApplicationDetail,
  ApplicationDocument,
  ApplicationPayment,
  ApplicationPaymentLineItem,
  ApplicationSummary,
  ApplicationTimelineStep,
  ApplicationStatus,
  PaymentStatus,
} from "@/features/admissions-portal/domain/types";
import type { SchoolCode } from "@/features/admissions-auth/domain/types";
import { buildParentApplicationId } from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";
import {
  fetchParentMe,
  type ParentMeFetchResult,
  type ParentMeRawPayment,
  type ParentMeRawStudent,
  type ParentMeRichPayload,
} from "@/features/admissions-portal/infrastructure/fetch-parent-me";

const PAYMENT_METHODS = [
  {
    id: "va-bca",
    labelKey: "admissions.portal.payment.method.va_bca",
    descriptionKey: "admissions.portal.payment.method.va_bca_description",
  },
  {
    id: "manual-transfer",
    labelKey: "admissions.portal.payment.method.manual_transfer",
    descriptionKey: "admissions.portal.payment.method.manual_transfer_description",
  },
  {
    id: "card",
    labelKey: "admissions.portal.payment.method.card",
    descriptionKey: "admissions.portal.payment.method.card_description",
  },
] as const;

type MeFetcher = (token: string | undefined | null) => Promise<ParentMeFetchResult>;

/**
 * Parent-application repository backed by the real admission-service `/me`
 * endpoint. One fetch per request; applications are derived from either the
 * nested `applications[]` array (preferred, one entry per ApplicantStudent)
 * or — as a fallback for older backend builds — by pairing the flat
 * `students[]` array with the single `latestPayment`.
 */
export class ApiAdmissionsPortalRepository implements AdmissionsPortalRepository {
  private cached: ParentMeRichPayload | null = null;
  private cachedErrorThrown = false;

  constructor(
    private readonly authToken: string | undefined | null,
    private readonly fetcher: MeFetcher = fetchParentMe,
  ) {}

  async getApplications(context: AdmissionsPortalContext): Promise<ApplicationSummary[]> {
    const payload = await this.loadPayload();
    if (!payload) return [];
    return buildApplicationRecords(payload, context).map((record) => record.summary);
  }

  async getApplicationDetail(
    context: AdmissionsPortalContext,
    applicationId: string,
  ): Promise<ApplicationDetail | null> {
    const payload = await this.loadPayload();
    if (!payload) return null;

    const records = buildApplicationRecords(payload, context);
    const match = records.find((record) => record.summary.id === applicationId);
    if (!match) return null;
    return match.detail;
  }

  private async loadPayload(): Promise<ParentMeRichPayload | null> {
    if (this.cached) return this.cached;
    if (this.cachedErrorThrown) return null;

    const result = await this.fetcher(this.authToken);
    if (result.kind === "ok") {
      this.cached = result.payload;
      return result.payload;
    }
    // We deliberately do NOT surface network errors to the UI here — the
    // page-data loader has already decided the user is authenticated, and
    // the caller's `notFound()` fallback will render when we return null.
    // Logged in server output for debugging.
    if (result.kind === "error") {
      // eslint-disable-next-line no-console
      console.error("[ApiAdmissionsPortalRepository] /me fetch failed", result.status, result.detail);
    }
    this.cachedErrorThrown = true;
    return null;
  }
}

type ApplicationRecord = {
  summary: ApplicationSummary;
  detail: ApplicationDetail;
};

function buildApplicationRecords(
  payload: ParentMeRichPayload,
  context: AdmissionsPortalContext,
): ApplicationRecord[] {
  // The admission-service data model is: ONE Lead → ONE Application →
  // MANY ApplicantStudents. `/me.applications[0].students[]` therefore
  // enumerates every kid in the same Application. The dashboard iterates
  // `payload.students` (flat, authoritative) when building each student
  // card; we mirror that here so dashboard links like
  // `/dashboard/parent/applications/student-2-fatima-.../documents`
  // resolve to a real record instead of 404.
  const flatStudents = payload.students ?? [];
  const nested = Array.isArray(payload.applications) ? payload.applications : [];

  // Build a per-studentId payment lookup from the nested applications[]
  // so if the backend ever splits invoices per child, we pick the right
  // one. Today all kids share the Lead-scoped latestPayment.
  const paymentByStudentId = new Map<string, ParentMeRawPayment>();
  const leadByStudentId = new Map<string, ParentMeRichPayload["lead"]>();
  nested.forEach((app) => {
    const appLead = { ...payload.lead, ...(app.lead ?? {}) } as ParentMeRichPayload["lead"];
    const appStudents = app.students ?? (app.student ? [app.student] : []);
    appStudents.forEach((s) => {
      if (s.studentId && app.latestPayment) {
        paymentByStudentId.set(s.studentId, app.latestPayment);
      }
      if (s.studentId) leadByStudentId.set(s.studentId, appLead);
    });
  });

  return flatStudents.map((student, index) => {
    const payment =
      (student.studentId && paymentByStudentId.get(student.studentId)) ||
      payload.latestPayment ||
      null;
    const leadForApp =
      (student.studentId && leadByStudentId.get(student.studentId)) || payload.lead;
    return buildRecord(context, student, index, payment, leadForApp);
  });
}

function extractStudent(
  list: ParentMeRawStudent[] | undefined,
  single: ParentMeRawStudent | undefined,
  rootList: ParentMeRichPayload["students"] | undefined,
  index: number,
): ParentMeRawStudent | null {
  if (list && list[0]) return list[0];
  if (single) return single;
  if (rootList && rootList[index]) return rootList[index];
  return null;
}

function buildRecord(
  context: AdmissionsPortalContext,
  student: ParentMeRawStudent,
  index: number,
  payment: ParentMeRawPayment | null,
  lead: ParentMeRichPayload["lead"],
): ApplicationRecord {
  const studentName = student.fullName?.trim() || `Student ${index + 1}`;
  const summary: ApplicationSummary = buildSummary(student, studentName, index, payment);
  // Prefer real backend values; fall back to per-school defaults only
  // when the lead hasn't been picked up yet, so the UI label is never
  // blank. Any admin assignment overrides the fallback.
  const admissionsOwner =
    lead?.assignedAdminName?.trim() || admissionsOwnerFor(context.school);
  const intakeLabel = lead?.intakeLabel?.trim() || intakeLabelFor(context.school);
  const detail: ApplicationDetail = {
    ...summary,
    parentName: context.parentName,
    parentEmail: context.email,
    school: context.school,
    locationSuburb: context.locationSuburb,
    submittedAt: "",
    lastUpdatedAt: payment?.paidAt ?? "",
    admissionsOwner,
    intakeLabel,
    // Real Neo4j Student id — plumbed through for the schedule-booking
    // POST so the parent can actually reserve a slot. Pre-/me deep
    // links may omit this field, in which case the schedule view shows
    // an inline "contact admissions" error instead of a dead button.
    studentId: student.studentId,
    studentBirthDate: student.dateOfBirth,
    familyNotes: context.notes,
    payment: buildPayment(context, payment),
    documents: buildDocuments(student, index),
    assessment: buildAssessment(student),
    decision: buildDecision(student),
    timeline: buildTimeline(student, payment),
  };

  return { summary, detail };
}

function buildSummary(
  student: ParentMeRawStudent,
  studentName: string,
  index: number,
  payment: ParentMeRawPayment | null,
): ApplicationSummary {
  const { status, statusLabelKey, progress, nextActionLabelKey, nextActionDetailKey } =
    deriveSummarySignals(student.applicantStatus, payment?.status);

  return {
    id: buildParentApplicationId(studentName, index),
    studentIndex: index,
    studentName,
    currentSchool: student.currentSchool ?? "",
    targetGrade: student.targetGradeLevel ?? "",
    status,
    statusLabelKey,
    progress,
    nextActionLabelKey,
    nextActionDetailKey,
  };
}

/**
 * Translate the backend signals (applicantStatus + payment.status) into the
 * UI enums the admissions-portal domain expects.
 *
 * This mirrors the full 16-state machine declared in admission-services'
 * `models/student_model.rs` (STUDENT_DRAFT … STUDENT_WITHDRAWN). Defensive
 * fallback (`lead_received`) catches any status the backend adds later —
 * parents see "application is still with us" rather than a false "done".
 */
function deriveSummarySignals(
  applicantStatus: string | undefined,
  paymentStatus: string | undefined,
): {
  status: ApplicationStatus;
  statusLabelKey: string;
  progress: number;
  nextActionLabelKey: string;
  nextActionDetailKey: string;
} {
  const paid = paymentStatus === "paid";
  const paymentPending = paymentStatus === "pending" || paymentStatus === "pending_verification";
  const normalised = (applicantStatus ?? "").toLowerCase();

  // Terminal / post-decision states — drawn first so a "rejected" stays
  // "rejected" even if the payment status happens to be "paid".
  if (normalised === "rejected" || normalised === "offer_declined" || normalised === "test_failed") {
    return build("rejected", "admissions.portal.application.status.rejected", 0, "track_payment");
  }
  if (normalised === "withdrawn") {
    return build("withdrawn", "admissions.portal.application.status.withdrawn", 0, "track_payment");
  }

  // Post-admissions: student has been handed off to SIS (enrolled in a
  // Section). This is Ahmad's status in the seed — progress is 100%.
  if (normalised === "handed_to_sis") {
    return build("enroled", "admissions.portal.application.status.enroled", 100, "track_payment");
  }
  if (normalised === "enrolment_paid" || normalised === "accepted" || normalised === "enroled") {
    return build("accepted", "admissions.portal.application.status.offer_released", 95, "track_payment");
  }

  // Offer stage
  if (normalised === "offer_accepted") {
    return build("accepted", "admissions.portal.application.status.offer_released", 90, "track_payment");
  }
  if (normalised === "offer_issued" || normalised === "offer_released") {
    return build("offer_released", "admissions.portal.application.status.offer_released", 85, "upload_documents");
  }

  // Review stage
  if (normalised === "documents_verified") {
    return build("under_review", "admissions.portal.application.status.under_review", 80, "track_payment");
  }
  if (normalised === "documents_pending" || normalised === "documents_review") {
    return build("awaiting_documents", "admissions.portal.application.status.awaiting_documents", 74, "upload_documents");
  }
  if (normalised === "test_approved" || normalised === "under_review" || normalised === "assessment_completed") {
    return build("under_review", "admissions.portal.application.status.under_review", 68, "upload_documents");
  }
  if (normalised === "test_completed") {
    return build("under_review", "admissions.portal.application.status.under_review", 62, "upload_documents");
  }
  if (normalised === "test_scheduled") {
    return build("assessment_scheduled", "admissions.portal.application.status.assessment_scheduled", 58, "book_assessment");
  }
  if (normalised === "test_pending" || normalised === "assessment_scheduled") {
    return build("assessment_scheduled", "admissions.portal.application.status.under_review", 50, "book_assessment");
  }

  // Payment stage
  if (paymentPending) {
    return build("payment_review", "admissions.portal.application.status.payment_review", 38, "track_payment");
  }
  if (paid) {
    return build("under_review", "admissions.portal.application.status.under_review", 45, "book_assessment");
  }

  // Submission stage
  if (normalised === "submitted" || normalised === "application_in_progress") {
    return build("awaiting_payment", "admissions.portal.application.status.payment_review", 25, "track_payment");
  }
  if (normalised === "draft") {
    return build("lead_received", "admissions.portal.application.status.lead_received", 10, "track_payment");
  }

  return build("lead_received", "admissions.portal.application.status.lead_received", 15, "track_payment");

  function build(
    status: ApplicationStatus,
    statusLabelKey: string,
    progress: number,
    action: "track_payment" | "upload_documents" | "book_assessment",
  ) {
    return {
      status,
      statusLabelKey,
      progress,
      nextActionLabelKey: `admissions.portal.application.action.${action}`,
      nextActionDetailKey: `admissions.portal.application.action_detail.${action}`,
    };
  }
}

function admissionsOwnerFor(school: SchoolCode): string {
  // TODO(admissions-portal): source owner from admission-service when the
  // per-lead assignment endpoint ships. For now use school defaults so the
  // UI label is never empty.
  return school === "iihs" ? "Farah Putri" : "Alya Ramadhani";
}

function intakeLabelFor(school: SchoolCode): string {
  // TODO(admissions-portal): derive from lead.intake once backend exposes it.
  return school === "iihs" ? "AY 2026/2027" : "T1 2026/2027";
}

function mapPaymentStatus(raw: string | undefined): PaymentStatus {
  if (raw === "paid") return "paid";
  if (raw === "pending_verification") return "pending_verification";
  return "unpaid";
}

function buildPayment(
  context: AdmissionsPortalContext,
  payment: ParentMeRawPayment | null,
): ApplicationPayment {
  const status = mapPaymentStatus(payment?.status);
  const amount = formatAmount(payment?.amount, payment?.currency, context.school);
  const statusLabelKey = `admissions.portal.payment.status.${status}`;
  const helperKey = status === "paid"
    ? "admissions.portal.payment.helper.paid"
    : status === "pending_verification"
      ? "admissions.portal.payment.helper.pending_verification"
      : "admissions.portal.payment.helper.unpaid";
  const ctaLabelKey = status === "paid"
    ? "admissions.portal.payment.cta.download"
    : "admissions.portal.payment.cta.pay_now";

  return {
    amount,
    dueDate: payment?.dueAt ?? "",
    status,
    statusLabelKey,
    invoiceNumber: payment?.invoiceNumber ?? payment?.paymentId ?? "",
    referenceNumber: payment?.referenceNumber ?? "",
    helperKey,
    ctaLabelKey,
    methods: [...PAYMENT_METHODS],
    lineItems: buildPaymentLineItems(payment),
    updates: buildPaymentUpdates(status),
  };
}

function formatAmount(
  raw: number | string | null | undefined,
  currency: string | null | undefined,
  school: SchoolCode,
): string {
  const numeric = typeof raw === "number" ? raw : raw ? Number(raw) : NaN;
  if (Number.isFinite(numeric) && numeric > 0) {
    const locale = currency === "IDR" || !currency ? "id-ID" : "en-US";
    const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    const prefix = currency && currency !== "IDR" ? currency : "Rp";
    return `${prefix} ${formatter.format(numeric)}`;
  }
  // Fallback to registration defaults when the backend hasn't issued an
  // invoice yet — keeps the summary legible instead of blank.
  return school === "iihs" ? "Rp 2.400.000" : "Rp 2.100.000";
}

/**
 * Map the backend-provided invoice line items into the UI shape. Returns
 * an empty array when the backend hasn't itemised the invoice — the UI
 * surfaces a "breakdown not available" empty state rather than fabricated
 * defaults.
 */
function buildPaymentLineItems(
  payment: ParentMeRawPayment | null,
): ApplicationPaymentLineItem[] {
  const items = payment?.lineItems ?? [];
  if (items.length === 0) return [];

  return items.map((item, index) => ({
    id: `line-${index + 1}`,
    label: item.description,
    amount: formatLineItemAmount(item.amount, item.currency),
  }));
}

function formatLineItemAmount(amount: number, currency: string): string {
  const numeric = Number.isFinite(amount) ? amount : 0;
  const locale = currency === "IDR" || !currency ? "id-ID" : "en-US";
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const prefix = currency && currency !== "IDR" ? currency : "Rp";
  return `${prefix} ${formatter.format(numeric)}`;
}

function buildPaymentUpdates(status: PaymentStatus): ApplicationPayment["updates"] {
  return [
    {
      id: "invoice-created",
      titleKey: "admissions.portal.payment.update.invoice_created",
      detailKey: "admissions.portal.payment.update.invoice_created_detail",
      state: "complete",
    },
    {
      id: "family-action",
      titleKey:
        status === "unpaid"
          ? "admissions.portal.payment.update.payment_needed"
          : "admissions.portal.payment.update.payment_received",
      detailKey:
        status === "unpaid"
          ? "admissions.portal.payment.update.payment_needed_detail"
          : "admissions.portal.payment.update.payment_received_detail",
      state: status === "unpaid" ? "active" : "complete",
    },
    {
      id: "finance-review",
      titleKey: "admissions.portal.payment.update.finance_review",
      detailKey:
        status === "paid"
          ? "admissions.portal.payment.update.finance_review_complete_detail"
          : "admissions.portal.payment.update.finance_review_pending_detail",
      state: status === "paid" ? "complete" : "upcoming",
    },
    {
      id: "application-release",
      titleKey: "admissions.portal.payment.update.application_release",
      detailKey:
        status === "paid"
          ? "admissions.portal.payment.update.application_release_detail"
          : "admissions.portal.payment.update.application_release_pending_detail",
      state: status === "paid" ? "active" : "upcoming",
    },
  ];
}

function buildDocuments(student: ParentMeRawStudent, index: number): ApplicationDocument[] {
  // TODO(admissions-portal): swap to a real /me/documents endpoint when
  // available. Today we keep the four canonical requirements and mark them
  // all as missing unless applicantStatus signals documents_pending (where
  // we leave the upload surface visible).
  const labels = [
    "admissions.portal.documents.birth_certificate",
    "admissions.portal.documents.parent_id",
    "admissions.portal.documents.report_card",
    "admissions.portal.documents.student_photo",
  ] as const;
  const helpers = [
    "admissions.portal.documents.helper.birth_certificate",
    "admissions.portal.documents.helper.parent_id",
    "admissions.portal.documents.helper.report_card",
    "admissions.portal.documents.helper.student_photo",
  ] as const;

  return labels.map((labelKey, docIndex) => ({
    id: `${(student.studentId || String(index + 1)).slice(0, 24)}-${docIndex + 1}`,
    labelKey,
    status: "missing",
    statusLabelKey: "admissions.portal.documents.status.missing",
    helperKey: helpers[docIndex],
  }));
}

function buildAssessment(student: ParentMeRawStudent): ApplicationAssessment {
  const normalised = (student.applicantStatus ?? "").toLowerCase();

  // Post-assessment states — the kid has either passed the test and
  // moved forward in the funnel, or gone all the way to enrolment.
  // Every one of these must short-circuit the booking surface so the
  // schedule page renders the "completed" / "celebration" tile instead
  // of offering to book a new test (which the backend rejects 409).
  const postAssessmentStatuses = new Set([
    "test_approved",
    "test_completed",
    "documents_pending",
    "documents_verified",
    "offer_issued",
    "offer_released",
    "offer_accepted",
    "enrolment_paid",
    "accepted",
    "enroled",
    "handed_to_sis",
  ]);
  if (postAssessmentStatuses.has(normalised)) {
    return {
      status: "completed",
      resultStatus: "passed",
      statusLabelKey: "admissions.portal.assessment.status.completed",
      titleKey: "admissions.portal.assessment.title.completed",
      helperKey: "admissions.portal.assessment.helper.completed",
      ctaLabelKey: "admissions.portal.assessment.cta.review_result",
    };
  }

  if (normalised === "test_failed") {
    return {
      status: "completed",
      resultStatus: "failed",
      statusLabelKey: "admissions.portal.assessment.status.completed",
      titleKey: "admissions.portal.assessment.title.completed",
      helperKey: "admissions.portal.assessment.helper.completed",
      ctaLabelKey: "admissions.portal.assessment.cta.review_result",
    };
  }

  // Terminal rejection / withdrawal — don't offer booking.
  if (normalised === "rejected" || normalised === "withdrawn") {
    return {
      status: "completed",
      resultStatus: "pending",
      statusLabelKey: "admissions.portal.assessment.status.completed",
      titleKey: "admissions.portal.assessment.title.completed",
      helperKey: "admissions.portal.assessment.helper.completed",
      ctaLabelKey: "admissions.portal.assessment.cta.review_result",
    };
  }

  if (normalised === "test_pending" || normalised === "test_scheduled" || normalised === "assessment_scheduled") {
    return {
      status: "scheduled",
      resultStatus: "pending",
      statusLabelKey: "admissions.portal.assessment.status.scheduled",
      titleKey: "admissions.portal.assessment.title.scheduled",
      helperKey: "admissions.portal.assessment.helper.scheduled",
      ctaLabelKey: "admissions.portal.assessment.cta.reschedule",
    };
  }

  return {
    status: "not_booked",
    resultStatus: "pending",
    statusLabelKey: "admissions.portal.assessment.status.not_booked",
    titleKey: "admissions.portal.assessment.title.not_booked",
    helperKey: "admissions.portal.assessment.helper.not_booked",
    ctaLabelKey: "admissions.portal.assessment.cta.book_now",
  };
}

function buildDecision(student: ParentMeRawStudent): ApplicationDecision {
  const normalised = (student.applicantStatus ?? "").toLowerCase();

  // Any post-offer-accepted state (enroled, handed_to_sis) means the
  // decision is accepted and the student is enrolled. handed_to_sis
  // in particular is the "past the admissions funnel entirely" state
  // — the decision card should read as complete, not still-in-review.
  if (
    normalised === "enrolment_paid" ||
    normalised === "accepted" ||
    normalised === "enroled" ||
    normalised === "offer_accepted" ||
    normalised === "handed_to_sis"
  ) {
    return {
      status: "accepted",
      statusLabelKey: "admissions.portal.decision.status.accepted",
      titleKey: "admissions.portal.decision.title.accepted",
      helperKey: "admissions.portal.decision.helper.accepted",
      ctaLabelKey: "admissions.portal.decision.cta.view_offer",
    };
  }

  if (normalised === "offer_issued" || normalised === "offer_released") {
    return {
      status: "offer_released",
      statusLabelKey: "admissions.portal.decision.status.offer_released",
      titleKey: "admissions.portal.decision.title.offer_released",
      helperKey: "admissions.portal.decision.helper.offer_released",
      ctaLabelKey: "admissions.portal.decision.cta.view_offer",
    };
  }

  return {
    status: "pending",
    statusLabelKey: "admissions.portal.decision.status.pending",
    titleKey: "admissions.portal.decision.title.pending",
    helperKey: "admissions.portal.decision.helper.pending",
    ctaLabelKey: "admissions.portal.decision.cta.wait",
  };
}

function buildTimeline(
  student: ParentMeRawStudent,
  payment: ParentMeRawPayment | null,
): ApplicationTimelineStep[] {
  const normalised = (student.applicantStatus ?? "").toLowerCase();
  const paid = payment?.status === "paid";
  const offered = normalised === "offer_issued" || normalised === "offer_released" || normalised === "accepted" || normalised === "enrolment_paid" || normalised === "enroled";
  const enroled = normalised === "enrolment_paid" || normalised === "enroled" || normalised === "accepted";
  const underReview = paid && !offered;

  return [
    {
      id: "lead",
      titleKey: "admissions.portal.timeline.lead.title",
      detailKey: "admissions.portal.timeline.lead.detail",
      state: "complete",
    },
    {
      id: "account",
      titleKey: "admissions.portal.timeline.account.title",
      detailKey: "admissions.portal.timeline.account.detail",
      state: "complete",
    },
    {
      id: "application",
      titleKey: "admissions.portal.timeline.application.title",
      detailKey: "admissions.portal.timeline.application.detail",
      state: paid ? "complete" : "active",
    },
    {
      id: "review",
      titleKey: "admissions.portal.timeline.review.title",
      detailKey: "admissions.portal.timeline.review.detail",
      state: offered ? "complete" : underReview ? "active" : "upcoming",
    },
    {
      id: "offer",
      titleKey: "admissions.portal.timeline.offer.title",
      detailKey: "admissions.portal.timeline.offer.detail",
      state: enroled ? "complete" : offered ? "active" : "upcoming",
    },
    {
      id: "enrollment",
      titleKey: "admissions.portal.timeline.enrollment.title",
      detailKey: "admissions.portal.timeline.enrollment.detail",
      state: enroled ? "complete" : "upcoming",
    },
  ];
}
