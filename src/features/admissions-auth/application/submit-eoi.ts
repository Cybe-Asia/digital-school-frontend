import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { EOIInput, EOISubmitResult } from "@/features/admissions-auth/domain/types";

export async function submitEOI(
  repository: AdmissionsAuthRepository,
  input: EOIInput,
): Promise<EOISubmitResult> {
  return repository.submitEOI(input);
}
