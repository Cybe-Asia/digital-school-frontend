import { cookies } from "next/headers";
import type { SearchParamsRecord } from "@/shared/lib/search-params";
import { getParentAdmissionsContextFromMePayload } from "@/lib/dashboard-data";
import { getParentApplications } from "@/features/admissions-portal/application/get-parent-applications";
import { getParentApplicationDetail } from "@/features/admissions-portal/application/get-parent-application-detail";
import type { AdmissionsPortalContext } from "@/features/admissions-portal/domain/types";
import { createAdmissionsPortalRepository } from "@/features/admissions-portal/infrastructure/create-admissions-portal-repository";
import { fetchParentMe } from "@/features/admissions-portal/infrastructure/fetch-parent-me";

const SESSION_COOKIE_NAME = "ds-session";

/**
 * Server-side loader shared by every page under
 * /dashboard/parent/applications/[applicationId]/*. Reads the `ds-session`
 * cookie, calls the admission-service /me endpoint, and hands the resulting
 * context to the (real) admissions-portal repository. Returns `null` when
 * the session is missing or the requested application isn't visible to the
 * current parent — callers then call `notFound()`.
 *
 * The `searchParams` arg is accepted for backwards compatibility with the
 * Next.js route signature, but no context is read from it anymore — deep
 * links like `?students=[...]` are obsolete.
 */
export async function loadParentApplicationPageData(
  _searchParams: SearchParamsRecord,
  applicationId: string,
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const meResult = await fetchParentMe(token);
  if (meResult.kind !== "ok") {
    return null;
  }

  const context: AdmissionsPortalContext | null = toPortalContext(meResult.payload);
  if (!context) {
    return null;
  }

  const repository = createAdmissionsPortalRepository(token);
  const [applications, application] = await Promise.all([
    getParentApplications(repository, context),
    getParentApplicationDetail(repository, context, applicationId),
  ]);

  if (!application) {
    return null;
  }

  return {
    context,
    applications,
    application,
  };
}

function toPortalContext(
  payload: Parameters<typeof getParentAdmissionsContextFromMePayload>[0],
): AdmissionsPortalContext | null {
  const context = getParentAdmissionsContextFromMePayload(payload);
  if (!context) return null;

  return {
    parentName: context.parentName,
    email: context.email,
    school: context.school,
    students: context.students,
    hasExistingStudents: context.hasExistingStudents,
    existingChildrenCount: context.existingChildrenCount,
    locationSuburb: context.locationSuburb,
    notes: context.notes,
  };
}
