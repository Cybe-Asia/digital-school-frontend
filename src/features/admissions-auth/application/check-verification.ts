import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { CheckVerificationResult } from "@/features/admissions-auth/domain/types";

export async function checkVerification(
  repository: AdmissionsAuthRepository,
  admissionId: string,
): Promise<CheckVerificationResult> {
  return repository.checkVerification(admissionId);
}
