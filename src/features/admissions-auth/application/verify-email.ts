import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { VerifyEmailResult } from "@/features/admissions-auth/domain/types";

export async function verifyEmail(
  repository: AdmissionsAuthRepository,
  token: string,
): Promise<VerifyEmailResult> {
  return repository.verifyEmail(token);
}
