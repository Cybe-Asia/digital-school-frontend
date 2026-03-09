import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { LoginInput, LoginResult } from "@/features/admissions-auth/domain/types";

export async function loginParent(
  repository: AdmissionsAuthRepository,
  input: LoginInput,
): Promise<LoginResult> {
  return repository.login(input);
}
