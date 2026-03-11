import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import type {
  RequestPasswordResetInput,
  RequestPasswordResetResult,
} from "@/features/admissions-auth/domain/types";

export async function requestPasswordReset(
  repository: AdmissionsAuthRepository,
  input: RequestPasswordResetInput,
): Promise<RequestPasswordResetResult> {
  return repository.requestPasswordReset(input);
}
