import type { AdmissionsPortalRepository } from "@/features/admissions-portal/domain/ports/admissions-portal-repository";
import { MockAdmissionsPortalRepository } from "@/features/admissions-portal/infrastructure/mock-admissions-portal-repository";

export function createAdmissionsPortalRepository(): AdmissionsPortalRepository {
  return new MockAdmissionsPortalRepository();
}
