import type { ApplicationDetail, AssessmentResultStatus, PaymentStatus } from "@/features/admissions-portal/domain/types";

export type AdmissionsJourneyStageId = "registration" | "payment" | "schedule" | "result" | "documents";
export type AdmissionsJourneyStageState = "complete" | "current" | "upcoming" | "locked" | "attention";
export type AdmissionsPortalSectionId = "overview" | "payment" | "schedule" | "documents" | "decision";
export type AdmissionsPortalSectionState = "complete" | "current" | "locked";

export type AdmissionsJourneyStage = {
  id: AdmissionsJourneyStageId;
  state: AdmissionsJourneyStageState;
};

export type AdmissionsPortalSection = {
  id: AdmissionsPortalSectionId;
  state: AdmissionsPortalSectionState;
};

export function isAssessmentPaymentCleared(application: Pick<ApplicationDetail, "payment">) {
  return application.payment.status === "paid";
}

export function isAssessmentPassed(application: Pick<ApplicationDetail, "assessment">) {
  return application.assessment.resultStatus === "passed";
}

export function isAssessmentFailed(application: Pick<ApplicationDetail, "assessment">) {
  return application.assessment.resultStatus === "failed";
}

export function isAssessmentBookingLocked(application: Pick<ApplicationDetail, "payment">) {
  return !isAssessmentPaymentCleared(application);
}

/**
 * A rejected application is a terminal negative state — parents should
 * never see the upload form again because there's no review pending. We
 * treat this as a lock on top of the assessment gate so the component
 * can branch on it for rejection-specific copy.
 */
export function isApplicationRejected(application: Pick<ApplicationDetail, "decision">) {
  return application.decision.status === "rejected";
}

export function isDocumentUploadLocked(
  application: Pick<ApplicationDetail, "payment" | "assessment" | "decision">,
) {
  if (isApplicationRejected(application)) return true;
  return !isAssessmentPassed(application);
}

export function hasOutstandingDocuments(application: Pick<ApplicationDetail, "documents">) {
  return application.documents.some((document) => document.status === "missing");
}

export function getAdmissionsJourneyStages(
  application: Pick<ApplicationDetail, "payment" | "assessment" | "documents">,
): AdmissionsJourneyStage[] {
  const paymentCleared = isAssessmentPaymentCleared(application);
  const assessmentPassed = isAssessmentPassed(application);
  const assessmentFailed = isAssessmentFailed(application);
  const assessmentCompleted = application.assessment.status === "completed";
  const documentsOutstanding = hasOutstandingDocuments(application);

  return [
    {
      id: "registration",
      state: "complete",
    },
    {
      id: "payment",
      state: paymentCleared ? "complete" : "current",
    },
    {
      id: "schedule",
      state: !paymentCleared ? "locked" : assessmentCompleted ? "complete" : "current",
    },
    {
      id: "result",
      state: !paymentCleared
        ? "locked"
        : !assessmentCompleted
          ? "upcoming"
          : assessmentFailed
            ? "attention"
            : assessmentPassed
              ? "complete"
              : "current",
    },
    {
      id: "documents",
      state: !paymentCleared
        ? "locked"
        : !assessmentPassed
          ? "locked"
          : documentsOutstanding
            ? "current"
            : "complete",
    },
  ];
}

export function getCurrentAdmissionsJourneyStage(stages: AdmissionsJourneyStage[]) {
  return stages.find((stage) => stage.state === "current" || stage.state === "attention")
    ?? stages.find((stage) => stage.state === "locked" || stage.state === "upcoming")
    ?? stages[stages.length - 1];
}

function toPortalSectionState(state: AdmissionsJourneyStageState): AdmissionsPortalSectionState {
  if (state === "complete") {
    return "complete";
  }

  if (state === "locked") {
    return "locked";
  }

  return "current";
}

export function getAdmissionsPortalSections(
  application: Pick<ApplicationDetail, "payment" | "assessment" | "documents" | "decision">,
): AdmissionsPortalSection[] {
  const stageMap = new Map(
    getAdmissionsJourneyStages(application).map((stage) => [stage.id, stage.state] as const),
  );
  // Rejection is a terminal "complete" state — there IS a final
  // decision, it's just a negative one. Marking it "complete" makes
  // the sidebar render the decision section as done (rather than
  // "current" with a prompt to wait) so the parent doesn't keep
  // refreshing looking for an offer that isn't coming.
  const rejected = isApplicationRejected(application);
  const documentsReadyForDecision =
    !isDocumentUploadLocked(application) && !hasOutstandingDocuments(application);
  const decisionState: AdmissionsPortalSectionState = rejected
    ? "complete"
    : !documentsReadyForDecision
      ? "locked"
      : application.decision.status === "offer_released" || application.decision.status === "accepted"
        ? "complete"
        : "current";

  return [
    {
      id: "overview",
      state: "complete",
    },
    {
      id: "payment",
      state: toPortalSectionState(stageMap.get("payment") ?? "current"),
    },
    {
      id: "schedule",
      state: toPortalSectionState(stageMap.get("schedule") ?? "locked"),
    },
    {
      id: "documents",
      state: toPortalSectionState(stageMap.get("documents") ?? "locked"),
    },
    {
      id: "decision",
      state: decisionState,
    },
  ];
}

export function getAssessmentResultLabelKey(resultStatus: AssessmentResultStatus) {
  return `admissions.portal.assessment.result.${resultStatus}`;
}

export function getAssessmentResultHelperKey(application: Pick<ApplicationDetail, "assessment">) {
  if (application.assessment.resultStatus === "passed") {
    return "admissions.portal.assessment.result_helper.passed";
  }

  if (application.assessment.resultStatus === "failed") {
    return "admissions.portal.assessment.result_helper.failed";
  }

  return "admissions.portal.assessment.result_helper.pending";
}

export function getAssessmentPaymentGateKey(paymentStatus: PaymentStatus) {
  if (paymentStatus === "pending_verification") {
    return "admissions.portal.schedule.gate.payment_pending";
  }

  return "admissions.portal.schedule.gate.payment_required";
}

export function getDocumentUploadGateKey(application: Pick<ApplicationDetail, "payment" | "assessment">) {
  if (!isAssessmentPaymentCleared(application)) {
    return application.payment.status === "pending_verification"
      ? "admissions.portal.documents.gate.payment_pending"
      : "admissions.portal.documents.gate.payment_required";
  }

  if (application.assessment.status === "scheduled") {
    return "admissions.portal.documents.gate.assessment_scheduled";
  }

  if (application.assessment.status === "not_booked") {
    return "admissions.portal.documents.gate.assessment_required";
  }

  if (application.assessment.resultStatus === "failed") {
    return "admissions.portal.documents.gate.assessment_failed";
  }

  return "admissions.portal.documents.gate.assessment_pending";
}
