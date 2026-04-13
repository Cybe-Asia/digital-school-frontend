import type { AdmissionsPortalRepository } from "@/features/admissions-portal/domain/ports/admissions-portal-repository";
import type { AdmissionsPortalContext } from "@/features/admissions-portal/domain/types";

export function getParentApplicationDetail(
  repository: AdmissionsPortalRepository,
  context: AdmissionsPortalContext,
  applicationId: string,
) {
  return repository.getApplicationDetail(context, applicationId);
}
