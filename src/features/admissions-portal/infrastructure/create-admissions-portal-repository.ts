import type { AdmissionsPortalRepository } from "@/features/admissions-portal/domain/ports/admissions-portal-repository";
import { ApiAdmissionsPortalRepository } from "@/features/admissions-portal/infrastructure/api-admissions-portal-repository";

/**
 * Build the parent-portal repository backed by the admission-service `/me`
 * endpoint. The caller (a Next.js server component) must pass the JWT from
 * the `ds-session` cookie; we don't read cookies here because that keeps
 * this factory easy to exercise from tests with a stubbed fetcher.
 */
export function createAdmissionsPortalRepository(
  authToken: string | undefined | null,
): AdmissionsPortalRepository {
  return new ApiAdmissionsPortalRepository(authToken);
}
