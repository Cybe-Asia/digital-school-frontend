import type {
  AdmissionsPortalContext,
  ApplicationDetail,
  ApplicationSummary,
} from "@/features/admissions-portal/domain/types";

export interface AdmissionsPortalRepository {
  getApplications(context: AdmissionsPortalContext): Promise<ApplicationSummary[]>;
  getApplicationDetail(context: AdmissionsPortalContext, applicationId: string): Promise<ApplicationDetail | null>;
}
