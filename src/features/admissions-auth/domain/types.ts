export type LoginInput = {
  email: string;
  password: string;
};

export type SchoolCode = "iihs" | "iiss";

export type EOIInput = {
  parentName: string;
  email: string;
  whatsapp: string;
  locationSuburb: string;
  occupation: string;
  hasExistingStudents: "yes" | "no";
  existingChildrenCount?: number;
  /** How many children the family intends to enrol. */
  prospectiveChildrenCount: number;
  /** Per-child ages (0-18) captured on the EOI form. Length must equal
   *  prospectiveChildrenCount. Marketing signal. */
  prospectiveChildren: Array<{ age: number }>;
  referralCode?: string;
  heardFrom: string;
  school: SchoolCode;
};

export type SetupAccountInput = {
  accessToken: string;
  newPassword: string;
};

export type SetupOtpInput = {
  admissionId?: string;
  phoneNumber: string;
  otp: string;
};

export type SendSetupOtpInput = {
  admissionId?: string;
  phoneNumber: string;
};

export type AdmissionsStudentProfile = {
  studentName: string;
  studentBirthDate?: string;
  currentSchool: string;
  targetGrade: string;
  notes?: string;
  /** Per-child ApplicantStudent lifecycle status from admission-service
   *  (e.g. submitted, test_pending, test_approved, documents_pending,
   *  offer_issued, enrolment_paid). Populated on the dashboard from /me.
   *  Older deep-linked dashboards that don't come via /me leave this
   *  undefined and fall back to "submitted" rendering. */
  applicantStatus?: string;
  /** Neo4j Student node id. Needed for per-student actions
   *  (booking a test, uploading a document for one child, etc.). */
  studentId?: string;
};

export type RequestPasswordResetInput = {
  email: string;
};

export type GoogleLoginInput = {
  returnTo?: string;
};

export type AuthFieldErrors<TFields extends string> = Partial<Record<TFields, string>>;

export type AuthSuccessResult = {
  success: true;
  redirectTo?: string;
  message?: string;
};

export type AuthFailureResult<TFields extends string> = {
  success: false;
  fieldErrors?: AuthFieldErrors<TFields>;
  formError?: string;
};

/** Three-way outcome of submitting an EOI. Matches the backend
 *  `ProcessLeadResult` enum and is what the form's onSubmit branches
 *  on to pick the right post-submit message and route. */
export type EOISubmitAction = "verify_email" | "resume_existing" | "magic_link_sent";

export type EOISubmitSuccessResult = AuthSuccessResult & {
  success: true;
  email: string;
  notificationSent: boolean;
  /** Which of the three branches the backend resolved. Undefined on
   *  responses from older backends — caller treats undefined as
   *  `verify_email` for backwards compatibility. */
  action?: EOISubmitAction;
  /** Only present when `action === "resume_existing"`. Carries the
   *  Lead's current setup_step so the success page can route the
   *  parent to the right resume target if needed. */
  currentStep?: SetupStep;
  /** Only present when `action === "verify_email" | "resume_existing"`. */
  leadId?: string;
};

export type SetupAccountSuccessResult = AuthSuccessResult & {
  success: true;
  accountReady: boolean;
};

export type SetupContext = EOIInput;

export type SetupContextResult =
  | {
      success: true;
      context: SetupContext;
    }
  | AuthFailureResult<"token">;

export type GoogleLoginSuccessResult = AuthSuccessResult & {
  success: true;
  redirectTo: string;
};

export type EOIStatus = "new" | "qualified" | "contacted" | "nurturing" | "converted" | "rejected";

export type EOILeadSummary = {
  id: string;
  parentName: string;
  email: string;
  whatsapp: string;
  school: SchoolCode;
  status: EOIStatus;
  submittedAt: string;
};

export type AdmissionData = {
  admissionId: string;
  email: string;
  parentName: string;
  whatsappNumber: string;
  schoolSelection: string;
  location: string | null;
  occupation: string | null;
  hearAboutSchool: string | null;
  referralCode: string | null;
  existingStudents: number | null;
  prospectiveChildrenAges?: number[] | null;
  isVerified: boolean;
  /** Where this Lead is in the post-EOI setup-account wizard.
   *  See SetupStep type for the full enum. Optional in the type
   *  because old backends may not yet emit it; route guards must
   *  fall back to the email_verified default when absent. */
  setupStep?: SetupStep;
  createdAt: string;
  updatedAt: string;
};

/** Canonical state machine for `Lead.setup_step`. Matches the
 *  `STEP_*` constants in admission-service's `lead_model.rs`. The
 *  wizard guards on every setup-account route compare the page's
 *  expected step against this value and redirect mismatches to the
 *  canonical page for the actual step. See `stepToRoute`. */
export type SetupStep =
  | "eoi_submitted"
  | "email_verified"
  | "sign_in_set"
  | "students_added"
  | "application_fee_paid"
  | "test_booked"
  | "test_completed"
  | "documents_requested"
  | "documents_complete"
  | "offer_pending"
  | "closed";

export type CheckVerificationSuccessResult = {
  success: true;
  isVerified: boolean;
  admission: AdmissionData;
};

export type VerifyEmailSuccessResult = AuthSuccessResult & {
  success: true;
  admission: AdmissionData;
};

export type LoginSuccessResult = AuthSuccessResult & {
  success: true;
  accessToken: string;
  refreshToken?: string;
};

export type LoginResult = LoginSuccessResult | AuthFailureResult<keyof LoginInput>;
export type EOISubmitResult = EOISubmitSuccessResult | AuthFailureResult<keyof EOIInput>;
export type SetupAccountResult = SetupAccountSuccessResult | AuthFailureResult<keyof SetupAccountInput>;
export type SendSetupOtpSuccessResult = AuthSuccessResult & {
  success: true;
  phoneNumber: string;
  otp: string;
  expiredIn: number;
};

export type SendSetupOtpResult = SendSetupOtpSuccessResult | AuthFailureResult<"phoneNumber">;
export type VerifySetupOtpSuccessResult = AuthSuccessResult & {
  success: true;
  accessToken: string;
  admissionId: string;
  phoneNumber: string;
  jwtSessionToken?: string;
};

export type VerifySetupOtpResult = VerifySetupOtpSuccessResult | AuthFailureResult<keyof SetupOtpInput>;
export type RequestPasswordResetResult = AuthSuccessResult | AuthFailureResult<keyof RequestPasswordResetInput>;
export type GoogleLoginResult = GoogleLoginSuccessResult | AuthFailureResult<"returnTo">;
export type SubmitStudentsInput = {
  accessToken: string;
  students: {
    fullName: string;
    dateOfBirth: string;
    currentSchool: string;
    targetGradeLevel: string;
    /** Per-child target school — 'SCH-IIHS' or 'SCH-IISS'. */
    targetSchool?: string;
    notes: string;
  }[];
};

export type SubmitStudentsResult = AuthSuccessResult | AuthFailureResult<"students">;

export type CheckVerificationResult = CheckVerificationSuccessResult | AuthFailureResult<"admissionId">;
export type VerifyEmailResult = VerifyEmailSuccessResult | AuthFailureResult<"token">;
