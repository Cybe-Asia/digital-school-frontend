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
  | "accepted"
  | "enroled"
  | "rejected"
  | "withdrawn";

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
  /** Lead admissionId (e.g. LEAD-DEMO-001). Required for the Xendit
   *  invoice-create flow — payment-service uses it to find the lead
   *  and the active FeeStructure. */
  admissionId?: string;
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
  /** i18n key for the line-item label. Optional so items coming from the
   *  backend (`label`) can render their own description verbatim. */
  labelKey?: string;
  /** Literal line-item label, taken directly from the backend invoice.
   *  When set, the UI renders this instead of `labelKey`. */
  label?: string;
  amount: string;
  /** Optional helper copy. Backend-sourced items normally omit it. */
  helperKey?: string;
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
  /** When the Xendit invoice has already been created, this is the
   *  hosted checkout URL the parent should be sent to. Null when no
   *  invoice exists yet (the PayButtonClient will call the backend to
   *  create one). */
  hostedInvoiceUrl?: string | null;
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
  /** Neo4j Student node id — required for the real test-booking POST.
   *  Optional because older deep-link contexts may not carry it. */
  studentId?: string;
  studentBirthDate?: string;
  familyNotes?: string;
  payment: ApplicationPayment;
  documents: ApplicationDocument[];
  assessment: ApplicationAssessment;
  decision: ApplicationDecision;
  timeline: ApplicationTimelineStep[];
};
