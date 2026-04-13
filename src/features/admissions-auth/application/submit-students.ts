import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type { SubmitStudentsInput, SubmitStudentsResult } from "@/features/admissions-auth/domain/types";

export async function submitStudents(
  repository: AdmissionsAuthRepository,
  input: SubmitStudentsInput,
): Promise<SubmitStudentsResult> {
  return repository.submitStudents(input);
}
