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
} from "@/features/admissions-portal/domain/types";
import { buildParentApplicationId } from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";

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

export class MockAdmissionsPortalRepository implements AdmissionsPortalRepository {
  async getApplications(context: AdmissionsPortalContext): Promise<ApplicationSummary[]> {
    return context.students.map((student, index) => createApplicationSummary(student.studentName, student.currentSchool, student.targetGrade, index));
  }

  async getApplicationDetail(context: AdmissionsPortalContext, applicationId: string): Promise<ApplicationDetail | null> {
    const studentIndex = context.students.findIndex(
      (student, index) => buildParentApplicationId(student.studentName, index) === applicationId,
    );

    if (studentIndex < 0) {
      return null;
    }

    const student = context.students[studentIndex];
    const summary = createApplicationSummary(student.studentName, student.currentSchool, student.targetGrade, studentIndex);

    return {
      ...summary,
      parentName: context.parentName,
      parentEmail: context.email,
      school: context.school,
      locationSuburb: context.locationSuburb,
      submittedAt: "2026-03-18",
      lastUpdatedAt: studentIndex === 0 ? "2026-03-25" : studentIndex === 1 ? "2026-03-24" : "2026-03-23",
      admissionsOwner: context.school === "iihs" ? "Farah Putri" : "Alya Ramadhani",
      intakeLabel: context.school === "iihs" ? "AY 2026/2027" : "T1 2026/2027",
      studentBirthDate: student.studentBirthDate,
      familyNotes: context.notes,
      payment: createPayment(context, studentIndex),
      documents: createDocuments(studentIndex),
      assessment: createAssessment(studentIndex),
      decision: createDecision(studentIndex),
      timeline: createTimeline(),
    };
  }
}

function createApplicationSummary(studentName: string, currentSchool: string, targetGrade: string, index: number): ApplicationSummary {
  const templates = [
    {
      status: "payment_review" as const,
      statusLabelKey: "admissions.portal.application.status.payment_review",
      progress: 38,
      nextActionLabelKey: "admissions.portal.application.action.track_payment",
      nextActionDetailKey: "admissions.portal.application.action_detail.track_payment",
    },
    {
      status: "awaiting_documents" as const,
      statusLabelKey: "admissions.portal.application.status.awaiting_documents",
      progress: 74,
      nextActionLabelKey: "admissions.portal.application.action.upload_documents",
      nextActionDetailKey: "admissions.portal.application.action_detail.upload_documents",
    },
    {
      status: "under_review" as const,
      statusLabelKey: "admissions.portal.application.status.under_review",
      progress: 61,
      nextActionLabelKey: "admissions.portal.application.action.book_assessment",
      nextActionDetailKey: "admissions.portal.application.action_detail.book_assessment",
    },
  ] as const;
  const template = templates[index % templates.length];

  return {
    id: buildParentApplicationId(studentName, index),
    studentIndex: index,
    studentName,
    currentSchool,
    targetGrade,
    status: template.status,
    statusLabelKey: template.statusLabelKey,
    progress: template.progress,
    nextActionLabelKey: template.nextActionLabelKey,
    nextActionDetailKey: template.nextActionDetailKey,
  };
}

function createPayment(context: AdmissionsPortalContext, index: number): ApplicationPayment {
  const statuses = [
    {
      status: "unpaid" as const,
      statusLabelKey: "admissions.portal.payment.status.unpaid",
      helperKey: "admissions.portal.payment.helper.unpaid",
      ctaLabelKey: "admissions.portal.payment.cta.pay_now",
    },
    {
      status: "paid" as const,
      statusLabelKey: "admissions.portal.payment.status.paid",
      helperKey: "admissions.portal.payment.helper.paid",
      ctaLabelKey: "admissions.portal.payment.cta.download",
    },
    {
      status: "paid" as const,
      statusLabelKey: "admissions.portal.payment.status.paid",
      helperKey: "admissions.portal.payment.helper.paid",
      ctaLabelKey: "admissions.portal.payment.cta.download",
    },
  ] as const;
  const template = statuses[index % statuses.length];
  const lineItems = createPaymentLineItems(context.school);

  return {
    amount: context.school === "iihs" ? "Rp 2.400.000" : "Rp 2.100.000",
    dueDate: "2026-04-15",
    status: template.status,
    statusLabelKey: template.statusLabelKey,
    invoiceNumber: `INV-2026-0${index + 1}4`,
    referenceNumber: `APP-${String(index + 1).padStart(3, "0")}-${context.school.toUpperCase()}`,
    helperKey: template.helperKey,
    ctaLabelKey: template.ctaLabelKey,
    methods: [...PAYMENT_METHODS],
    lineItems,
    updates: [
      {
        id: "invoice-created",
        titleKey: "admissions.portal.payment.update.invoice_created",
        detailKey: "admissions.portal.payment.update.invoice_created_detail",
        state: "complete",
      },
      {
        id: "family-action",
        titleKey: template.status === "unpaid" ? "admissions.portal.payment.update.payment_needed" : "admissions.portal.payment.update.payment_received",
        detailKey:
          template.status === "unpaid"
            ? "admissions.portal.payment.update.payment_needed_detail"
            : "admissions.portal.payment.update.payment_received_detail",
        state: template.status === "unpaid" ? "active" : "complete",
      },
      {
        id: "finance-review",
        titleKey: "admissions.portal.payment.update.finance_review",
        detailKey:
          template.status === "paid"
            ? "admissions.portal.payment.update.finance_review_complete_detail"
            : "admissions.portal.payment.update.finance_review_pending_detail",
        state: template.status === "paid" ? "complete" : "upcoming",
      },
      {
        id: "application-release",
        titleKey: "admissions.portal.payment.update.application_release",
        detailKey:
          template.status === "paid"
            ? "admissions.portal.payment.update.application_release_detail"
            : "admissions.portal.payment.update.application_release_pending_detail",
        state: template.status === "paid" ? "active" : "upcoming",
      },
    ],
  };
}

function createPaymentLineItems(school: AdmissionsPortalContext["school"]): ApplicationPaymentLineItem[] {
  if (school === "iihs") {
    return [
      {
        id: "registration",
        labelKey: "admissions.portal.payment.line.registration",
        amount: "Rp 1.800.000",
        helperKey: "admissions.portal.payment.line.registration_helper",
      },
      {
        id: "assessment",
        labelKey: "admissions.portal.payment.line.assessment",
        amount: "Rp 400.000",
        helperKey: "admissions.portal.payment.line.assessment_helper",
      },
      {
        id: "onboarding",
        labelKey: "admissions.portal.payment.line.onboarding",
        amount: "Rp 200.000",
        helperKey: "admissions.portal.payment.line.onboarding_helper",
      },
    ];
  }

  return [
    {
      id: "registration",
      labelKey: "admissions.portal.payment.line.registration",
      amount: "Rp 1.600.000",
      helperKey: "admissions.portal.payment.line.registration_helper",
    },
    {
      id: "assessment",
      labelKey: "admissions.portal.payment.line.assessment",
      amount: "Rp 300.000",
      helperKey: "admissions.portal.payment.line.assessment_helper",
    },
    {
      id: "onboarding",
      labelKey: "admissions.portal.payment.line.onboarding",
      amount: "Rp 200.000",
      helperKey: "admissions.portal.payment.line.onboarding_helper",
    },
  ];
}

function createDocuments(index: number): ApplicationDocument[] {
  const statusPatterns = [
    ["missing", "missing", "missing", "missing"],
    ["verified", "uploaded", "missing", "missing"],
    ["missing", "missing", "missing", "missing"],
  ] as const;
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

  return labels.map((labelKey, docIndex) => {
    const status = statusPatterns[index % statusPatterns.length][docIndex];

    return {
      id: `${index + 1}-${docIndex + 1}`,
      labelKey,
      status,
      statusLabelKey: `admissions.portal.documents.status.${status}`,
      helperKey: helpers[docIndex],
    };
  });
}

function createAssessment(index: number): ApplicationAssessment {
  const templates = [
    {
      status: "not_booked" as const,
      resultStatus: "pending" as const,
      statusLabelKey: "admissions.portal.assessment.status.not_booked",
      titleKey: "admissions.portal.assessment.title.not_booked",
      helperKey: "admissions.portal.assessment.helper.not_booked",
      scheduleLabel: undefined,
      ctaLabelKey: "admissions.portal.assessment.cta.book_now",
    },
    {
      status: "completed" as const,
      resultStatus: "passed" as const,
      statusLabelKey: "admissions.portal.assessment.status.completed",
      titleKey: "admissions.portal.assessment.title.completed",
      helperKey: "admissions.portal.assessment.helper.completed",
      scheduleLabel: "18/04/2026 · 13:00 WIB",
      ctaLabelKey: "admissions.portal.assessment.cta.review_result",
    },
    {
      status: "completed" as const,
      resultStatus: "failed" as const,
      statusLabelKey: "admissions.portal.assessment.status.completed",
      titleKey: "admissions.portal.assessment.title.completed",
      helperKey: "admissions.portal.assessment.helper.completed",
      scheduleLabel: "19/04/2026 · 10:00 WIB",
      ctaLabelKey: "admissions.portal.assessment.cta.review_result",
    },
  ] as const;

  return templates[index % templates.length];
}

function createDecision(index: number): ApplicationDecision {
  const templates = [
    {
      status: "pending" as const,
      statusLabelKey: "admissions.portal.decision.status.pending",
      titleKey: "admissions.portal.decision.title.pending",
      helperKey: "admissions.portal.decision.helper.pending",
      ctaLabelKey: "admissions.portal.decision.cta.wait",
    },
    {
      status: "pending" as const,
      statusLabelKey: "admissions.portal.decision.status.pending",
      titleKey: "admissions.portal.decision.title.pending",
      helperKey: "admissions.portal.decision.helper.pending_documents",
      ctaLabelKey: "admissions.portal.decision.cta.complete_steps",
    },
    {
      status: "pending" as const,
      statusLabelKey: "admissions.portal.decision.status.pending",
      titleKey: "admissions.portal.decision.title.pending",
      helperKey: "admissions.portal.decision.helper.pending",
      ctaLabelKey: "admissions.portal.decision.cta.wait",
    },
  ] as const;

  return templates[index % templates.length];
}

function createTimeline(): ApplicationTimelineStep[] {
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
      state: "complete",
    },
    {
      id: "review",
      titleKey: "admissions.portal.timeline.review.title",
      detailKey: "admissions.portal.timeline.review.detail",
      state: "active",
    },
    {
      id: "offer",
      titleKey: "admissions.portal.timeline.offer.title",
      detailKey: "admissions.portal.timeline.offer.detail",
      state: "upcoming",
    },
    {
      id: "enrollment",
      titleKey: "admissions.portal.timeline.enrollment.title",
      detailKey: "admissions.portal.timeline.enrollment.detail",
      state: "upcoming",
    },
  ];
}
