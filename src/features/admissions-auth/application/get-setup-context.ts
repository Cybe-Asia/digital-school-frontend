import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { SetupContextResult } from "@/features/admissions-auth/domain/types";

export async function getSetupContext(
  repository: AdmissionsAuthRepository,
  token: string,
): Promise<SetupContextResult> {
  return repository.getSetupContext(token);
}
