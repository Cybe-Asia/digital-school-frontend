import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { SendSetupOtpResult } from "@/features/admissions-auth/domain/types";

export async function sendSetupOtp(
  repository: AdmissionsAuthRepository,
  phoneNumber: string,
): Promise<SendSetupOtpResult> {
  return repository.sendSetupOtp(phoneNumber);
}
