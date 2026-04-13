import type { AdmissionsAuthRepository } from "@/features/admissions-auth/domain/ports/admissions-auth-repository";
import { ApiAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/api-admissions-auth-repository";
import { MockAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/mock-admissions-auth-repository";

type AdmissionsApiMode = "mock" | "real";

let repository: AdmissionsAuthRepository | null = null;

function getMode(): AdmissionsApiMode {
  const mode = process.env.NEXT_PUBLIC_ADMISSIONS_API_MODE;

  if (mode === "real") {
    return "real";
  }

  return "mock";
}

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_ADMISSIONS_API_BASE_URL ?? "").replace(/\/$/, "");
}

export function createAdmissionsAuthRepository(): AdmissionsAuthRepository {
  if (repository) {
    return repository;
  }

  repository = getMode() === "real" ? new ApiAdmissionsAuthRepository(getBaseUrl()) : new MockAdmissionsAuthRepository();

  return repository;
}
