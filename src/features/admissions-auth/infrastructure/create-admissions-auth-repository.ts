import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import {
  readAdmissionsAuthRuntimeConfig,
  type AdmissionsAuthRuntimeConfig,
} from "@/features/admissions-auth/infrastructure/admissions-auth-runtime-config";
import { ApiAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/api-admissions-auth-repository";
import { MockAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/mock-admissions-auth-repository";

export function createAdmissionsAuthRepository(
  config: AdmissionsAuthRuntimeConfig = readAdmissionsAuthRuntimeConfig(),
): AdmissionsAuthRepository {
  if (config.mode === "real") {
    return new ApiAdmissionsAuthRepository(config.endpoints);
  }

  return new MockAdmissionsAuthRepository();
}
