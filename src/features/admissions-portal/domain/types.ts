import type { AdmissionsStudentProfile, SchoolCode } from "@/features/admissions-auth/domain/types";

export type ApplicationStatus =
  | "lead_received"
  | "application_in_progress"
  | "awaiting_payment"
  | "payment_review"
  | "awaiting_documents"
  | "assessment_scheduled"
  | "under_review"
  | "offer_released"
  | "accepted";

export type PaymentStatus = "unpaid" | "pending_verification" | "paid";
export type DocumentStatus = "missing" | "uploaded" | "verified";
export type AssessmentStatus = "not_booked" | "scheduled" | "completed";
export type AssessmentResultStatus = "pending" | "passed" | "failed";
export type DecisionStatus = "pending" | "offer_released" | "accepted";

export type AdmissionsPortalContext = {
  parentName: string;
  email: string;
  school: SchoolCode;
  students: AdmissionsStudentProfile[];
  hasExistingStudents: "yes" | "no";
  existingChildrenCount?: number;
  locationSuburb: string;
  notes?: string;
};

export type ApplicationSummary = {
  id: string;
  studentIndex: number;
  studentName: string;
  currentSchool: string;
  targetGrade: string;
  status: ApplicationStatus;
  statusLabelKey: string;
  progress: number;
  nextActionLabelKey: string;
  nextActionDetailKey: string;
};

export type ApplicationTimelineStep = {
  id: string;
  titleKey: string;
  detailKey: string;
  state: "complete" | "active" | "upcoming";
};

export type ApplicationPaymentMethod = {
  id: string;
  labelKey: string;
  descriptionKey: string;
};

export type ApplicationPaymentLineItem = {
  id: string;
  labelKey: string;
  amount: string;
  helperKey: string;
};

export type ApplicationPaymentUpdate = {
  id: string;
  titleKey: string;
  detailKey: string;
  state: "complete" | "active" | "upcoming";
};

export type ApplicationPayment = {
  amount: string;
  dueDate: string;
  status: PaymentStatus;
  statusLabelKey: string;
  invoiceNumber: string;
  referenceNumber: string;
  helperKey: string;
  ctaLabelKey: string;
  methods: ApplicationPaymentMethod[];
  lineItems: ApplicationPaymentLineItem[];
  updates: ApplicationPaymentUpdate[];
};

export type ApplicationDocument = {
  id: string;
  labelKey: string;
  status: DocumentStatus;
  statusLabelKey: string;
  helperKey: string;
};

export type ApplicationAssessment = {
  status: AssessmentStatus;
  resultStatus: AssessmentResultStatus;
  statusLabelKey: string;
  titleKey: string;
  helperKey: string;
  scheduleLabel?: string;
  ctaLabelKey: string;
};

export type ApplicationDecision = {
  status: DecisionStatus;
  statusLabelKey: string;
  titleKey: string;
  helperKey: string;
  ctaLabelKey: string;
};

export type ApplicationDetail = ApplicationSummary & {
  parentName: string;
  parentEmail: string;
  school: SchoolCode;
  locationSuburb: string;
  submittedAt: string;
  lastUpdatedAt: string;
  admissionsOwner: string;
  intakeLabel: string;
  studentBirthDate?: string;
  familyNotes?: string;
  payment: ApplicationPayment;
  documents: ApplicationDocument[];
  assessment: ApplicationAssessment;
  decision: ApplicationDecision;
  timeline: ApplicationTimelineStep[];
};
