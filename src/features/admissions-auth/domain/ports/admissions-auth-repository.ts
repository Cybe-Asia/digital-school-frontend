import type {
  CheckVerificationResult,
  EOIInput,
  EOILeadSummary,
  EOISubmitResult,
  GoogleLoginInput,
  GoogleLoginResult,
  LoginInput,
  LoginResult,
  RequestPasswordResetInput,
  RequestPasswordResetResult,
  SendSetupOtpResult,
  SetupContextResult,
  SetupAccountInput,
  SetupAccountResult,
  SetupOtpInput,
  SubmitStudentsInput,
  SubmitStudentsResult,
  VerifyEmailResult,
  VerifySetupOtpResult,
} from "@/features/admissions-auth/domain/types";

export type AccountStatusResult =
  | { success: true; exists: boolean; hasPassword: boolean }
  | { success: false; formError?: string };

export interface AdmissionsAuthRepository {
  accountStatus(email: string): Promise<AccountStatusResult>;
  login(input: LoginInput): Promise<LoginResult>;
  startGoogleLogin(input: GoogleLoginInput): Promise<GoogleLoginResult>;
  requestPasswordReset(input: RequestPasswordResetInput): Promise<RequestPasswordResetResult>;
  submitEOI(input: EOIInput): Promise<EOISubmitResult>;
  getSetupContext(admissionId: string): Promise<SetupContextResult>;
  sendSetupOtp(phoneNumber: string): Promise<SendSetupOtpResult>;
  verifySetupOtp(input: SetupOtpInput): Promise<VerifySetupOtpResult>;
  setupAccount(input: SetupAccountInput): Promise<SetupAccountResult>;
  submitStudents(input: SubmitStudentsInput): Promise<SubmitStudentsResult>;
  listEOILeads(): Promise<EOILeadSummary[]>;
  checkVerification(admissionId: string): Promise<CheckVerificationResult>;
  verifyEmail(token: string): Promise<VerifyEmailResult>;
}
