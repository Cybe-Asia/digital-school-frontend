import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { SetupAccountInput, SetupAccountResult } from "@/features/admissions-auth/domain/types";

export async function setupAccount(
  repository: AdmissionsAuthRepository,
  input: SetupAccountInput,
): Promise<SetupAccountResult> {
  return repository.setupAccount(input);
}
