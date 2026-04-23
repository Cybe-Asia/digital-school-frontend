import type { AdmissionsAdminRepository } from "@/features/admissions-admin/domain/ports/admissions-admin-repository";
import { ApiAdmissionsAdminRepository } from "@/features/admissions-admin/infrastructure/api-admissions-admin-repository";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

/**
 * Build an {@link AdmissionsAdminRepository} backed by admission-service.
 *
 * Must run on the server (reads the server-scoped service endpoints) and
 * requires the SSR-injected JWT lifted from the `ds-session` cookie on the
 * admin dashboard page — the backend admin endpoints require a Bearer token
 * whose email is present in the admin allowlist.
 *
 * There is deliberately no mock fallback. Callers that cannot produce a
 * token should surface an auth error rather than papering over it with
 * fixture data.
 */
export function createAdmissionsAdminRepository(token: string): AdmissionsAdminRepository {
  const { admission } = getServerServiceEndpoints();
  return new ApiAdmissionsAdminRepository(admission, token);
}
