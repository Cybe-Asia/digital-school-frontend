import type {
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
  VerifySetupOtpResult,
} from "@/features/admissions-auth/domain/types";

export interface AdmissionsAuthRepository {
  login(input: LoginInput): Promise<LoginResult>;
  startGoogleLogin(input: GoogleLoginInput): Promise<GoogleLoginResult>;
  requestPasswordReset(input: RequestPasswordResetInput): Promise<RequestPasswordResetResult>;
  submitEOI(input: EOIInput): Promise<EOISubmitResult>;
  getSetupContext(token: string): Promise<SetupContextResult>;
  sendSetupOtp(token: string): Promise<SendSetupOtpResult>;
  verifySetupOtp(input: SetupOtpInput): Promise<VerifySetupOtpResult>;
  setupAccount(input: SetupAccountInput): Promise<SetupAccountResult>;
  listEOILeads(): Promise<EOILeadSummary[]>;
}
