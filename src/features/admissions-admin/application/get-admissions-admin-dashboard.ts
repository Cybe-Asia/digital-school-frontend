import type { AdmissionsAdminRepository } from "@/features/admissions-admin/domain/ports/admissions-admin-repository";

export function getAdmissionsAdminDashboard(repository: AdmissionsAdminRepository) {
  return repository.getDashboard();
}
