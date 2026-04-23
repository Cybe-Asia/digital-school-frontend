import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import { ApiAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/api-admissions-auth-repository";
import { getServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

/**
 * Returns the real {@link ApiAdmissionsAuthRepository} bound to the
 * configured service endpoints. There is no mock variant — every form /
 * hook in admissions-auth now talks to admission-service / auth-service
 * through the shared gateway (or the Next.js rewrite proxy on the client).
 */
export function createAdmissionsAuthRepository(): AdmissionsAuthRepository {
  return new ApiAdmissionsAuthRepository(getServiceEndpoints());
}
