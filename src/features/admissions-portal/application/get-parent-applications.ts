import type { AdmissionsPortalRepository } from "@/features/admissions-portal/domain/ports/admissions-portal-repository";
import type { AdmissionsPortalContext } from "@/features/admissions-portal/domain/types";

export function getParentApplications(repository: AdmissionsPortalRepository, context: AdmissionsPortalContext) {
  return repository.getApplications(context);
}
