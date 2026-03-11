import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { GoogleLoginInput, GoogleLoginResult } from "@/features/admissions-auth/domain/types";

export async function startGoogleLogin(
  repository: AdmissionsAuthRepository,
  input: GoogleLoginInput,
): Promise<GoogleLoginResult> {
  return repository.startGoogleLogin(input);
}
