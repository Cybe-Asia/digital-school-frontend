import type { AdmissionsAdminDashboard } from "@/features/admissions-admin/domain/types";

export interface AdmissionsAdminRepository {
  getDashboard(): Promise<AdmissionsAdminDashboard>;
}
