import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { SetupOtpInput, VerifySetupOtpResult } from "@/features/admissions-auth/domain/types";

export async function verifySetupOtp(
  repository: AdmissionsAuthRepository,
  input: SetupOtpInput,
): Promise<VerifySetupOtpResult> {
  return repository.verifySetupOtp(input);
}
