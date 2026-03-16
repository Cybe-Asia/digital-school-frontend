import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { RegisterInput, RegisterResult } from "@/features/admissions-auth/domain/types";

export async function registerParent(
  repository: AdmissionsAuthRepository,
  input: RegisterInput,
): Promise<RegisterResult> {
  return repository.register(input);
}
