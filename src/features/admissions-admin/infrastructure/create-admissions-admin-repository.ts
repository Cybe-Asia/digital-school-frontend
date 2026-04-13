import type { AdmissionsAdminRepository } from "@/features/admissions-admin/domain/ports/admissions-admin-repository";
import { MockAdmissionsAdminRepository } from "@/features/admissions-admin/infrastructure/mock-admissions-admin-repository";

export function createAdmissionsAdminRepository(): AdmissionsAdminRepository {
  return new MockAdmissionsAdminRepository();
}
