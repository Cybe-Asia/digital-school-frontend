import {
  getAdmissionsJourneyStages,
  getAdmissionsPortalSections,
  getAssessmentPaymentGateKey,
  getCurrentAdmissionsJourneyStage,
  getDocumentUploadGateKey,
  isAssessmentBookingLocked,
  isDocumentUploadLocked,
} from "@/features/admissions-portal/domain/application-flow";
import type { ApplicationDetail } from "@/features/admissions-portal/domain/types";

function createApplicationDetail(overrides: Partial<ApplicationDetail> = {}): ApplicationDetail {
  return {
    id: "student-1-aisha-rahma",
    studentIndex: 0,
    studentName: "Aisha Rahma",
    currentSchool: "Little Caliphs School",
    targetGrade: "year7",
    status: "payment_review",
    statusLabelKey: "admissions.portal.application.status.payment_review",
    progress: 40,
    nextActionLabelKey: "admissions.portal.application.action.track_payment",
    nextActionDetailKey: "admissions.portal.application.action_detail.track_payment",
    parentName: "Siti Rahmawati",
    parentEmail: "parent@example.com",
    school: "iihs",
    locationSuburb: "South Jakarta",
    submittedAt: "2026-03-18",
    lastUpdatedAt: "2026-03-25",
    admissionsOwner: "Farah Putri",
    intakeLabel: "AY 2026/2027",
    studentBirthDate: "2014-08-17",
    familyNotes: "Needs transport info",
    payment: {
      amount: "Rp 2.400.000",
      dueDate: "2026-04-15",
      status: "unpaid",
      statusLabelKey: "admissions.portal.payment.status.unpaid",
      invoiceNumber: "INV-2026-014",
      referenceNumber: "APP-001-IIHS",
      helperKey: "admissions.portal.payment.helper.unpaid",
      ctaLabelKey: "admissions.portal.payment.cta.pay_now",
      methods: [],
      lineItems: [],
      updates: [],
    },
    documents: [
      {
        id: "1-1",
        labelKey: "admissions.portal.documents.birth_certificate",
        status: "missing",
        statusLabelKey: "admissions.portal.documents.status.missing",
        helperKey: "admissions.portal.documents.helper.birth_certificate",
      },
    ],
    assessment: {
      status: "not_booked",
      resultStatus: "pending",
      statusLabelKey: "admissions.portal.assessment.status.not_booked",
      titleKey: "admissions.portal.assessment.title.not_booked",
      helperKey: "admissions.portal.assessment.helper.not_booked",
      ctaLabelKey: "admissions.portal.assessment.cta.book_now",
    },
    decision: {
      status: "pending",
      statusLabelKey: "admissions.portal.decision.status.pending",
      titleKey: "admissions.portal.decision.title.pending",
      helperKey: "admissions.portal.decision.helper.pending",
      ctaLabelKey: "admissions.portal.decision.cta.wait",
    },
    timeline: [],
    ...overrides,
  };
}

describe("admissions portal flow gates", () => {
  it("locks assessment booking until the test payment is cleared", () => {
    const application = createApplicationDetail();
    const stages = getAdmissionsJourneyStages(application);

    expect(isAssessmentBookingLocked(application)).toBe(true);
    expect(getAssessmentPaymentGateKey(application.payment.status)).toBe("admissions.portal.schedule.gate.payment_required");
    expect(stages.map((stage) => stage.state)).toEqual(["complete", "current", "locked", "locked", "locked"]);
    expect(getCurrentAdmissionsJourneyStage(stages)?.id).toBe("payment");
  });

  it("unlocks document upload only after a passed assessment", () => {
    const application = createApplicationDetail({
      payment: {
        ...createApplicationDetail().payment,
        status: "paid",
      },
      assessment: {
        ...createApplicationDetail().assessment,
        status: "completed",
        resultStatus: "passed",
      },
    });
    const stages = getAdmissionsJourneyStages(application);

    expect(isDocumentUploadLocked(application)).toBe(false);
    expect(stages.map((stage) => stage.state)).toEqual(["complete", "complete", "complete", "complete", "current"]);
    expect(getCurrentAdmissionsJourneyStage(stages)?.id).toBe("documents");
  });

  it("keeps document upload locked when the student does not pass the assessment", () => {
    const application = createApplicationDetail({
      payment: {
        ...createApplicationDetail().payment,
        status: "paid",
      },
      assessment: {
        ...createApplicationDetail().assessment,
        status: "completed",
        resultStatus: "failed",
      },
    });
    const stages = getAdmissionsJourneyStages(application);

    expect(isDocumentUploadLocked(application)).toBe(true);
    expect(getDocumentUploadGateKey(application)).toBe("admissions.portal.documents.gate.assessment_failed");
    expect(stages.map((stage) => stage.state)).toEqual(["complete", "complete", "complete", "attention", "locked"]);
    expect(getCurrentAdmissionsJourneyStage(stages)?.id).toBe("result");
  });

  it("keeps the sidebar sections in admissions order and locks downstream steps", () => {
    const application = createApplicationDetail();
    const sections = getAdmissionsPortalSections(application);

    expect(sections).toEqual([
      { id: "overview", state: "complete" },
      { id: "payment", state: "current" },
      { id: "schedule", state: "locked" },
      { id: "documents", state: "locked" },
      { id: "decision", state: "locked" },
    ]);
  });

  it("opens the decision step only after payment, assessment, and documents are complete", () => {
    const application = createApplicationDetail({
      payment: {
        ...createApplicationDetail().payment,
        status: "paid",
      },
      assessment: {
        ...createApplicationDetail().assessment,
        status: "completed",
        resultStatus: "passed",
      },
      documents: [
        {
          id: "1-1",
          labelKey: "admissions.portal.documents.birth_certificate",
          status: "verified",
          statusLabelKey: "admissions.portal.documents.status.verified",
          helperKey: "admissions.portal.documents.helper.birth_certificate",
        },
      ],
    });
    const sections = getAdmissionsPortalSections(application);

    expect(sections).toEqual([
      { id: "overview", state: "complete" },
      { id: "payment", state: "complete" },
      { id: "schedule", state: "complete" },
      { id: "documents", state: "complete" },
      { id: "decision", state: "current" },
    ]);
  });
});
