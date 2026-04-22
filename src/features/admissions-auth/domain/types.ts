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

export type EOISubmitSuccessResult = AuthSuccessResult & {
  success: true;
  email: string;
  notificationSent: boolean;
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
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

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
    notes: string;
  }[];
};

export type SubmitStudentsResult = AuthSuccessResult | AuthFailureResult<"students">;

export type CheckVerificationResult = CheckVerificationSuccessResult | AuthFailureResult<"admissionId">;
export type VerifyEmailResult = VerifyEmailSuccessResult | AuthFailureResult<"token">;
