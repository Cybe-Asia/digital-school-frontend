import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { SendSetupOtpInput, SendSetupOtpResult } from "@/features/admissions-auth/domain/types";

export async function sendSetupOtp(
  repository: AdmissionsAuthRepository,
  input: SendSetupOtpInput,
): Promise<SendSetupOtpResult> {
  return repository.sendSetupOtp(input);
}
