import type { SearchParamsRecord } from "@/shared/lib/search-params";
import { getParentAdmissionsContextFromSearchParams } from "@/lib/dashboard-data";
import { getParentApplications } from "@/features/admissions-portal/application/get-parent-applications";
import { getParentApplicationDetail } from "@/features/admissions-portal/application/get-parent-application-detail";
import type { AdmissionsPortalContext } from "@/features/admissions-portal/domain/types";
import { createAdmissionsPortalRepository } from "@/features/admissions-portal/infrastructure/create-admissions-portal-repository";

export async function loadParentApplicationPageData(searchParams: SearchParamsRecord, applicationId: string) {
  const context = getAdmissionsPortalContextFromSearchParams(searchParams);

  if (!context) {
    return null;
  }

  const repository = createAdmissionsPortalRepository();
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

export function getAdmissionsPortalContextFromSearchParams(searchParams: SearchParamsRecord): AdmissionsPortalContext | null {
  const dashboardContext = getParentAdmissionsContextFromSearchParams(searchParams);

  if (!dashboardContext) {
    return null;
  }

  return {
    parentName: dashboardContext.parentName,
    email: dashboardContext.email,
    school: dashboardContext.school,
    students: dashboardContext.students,
    hasExistingStudents: dashboardContext.hasExistingStudents,
    existingChildrenCount: dashboardContext.existingChildrenCount,
    locationSuburb: dashboardContext.locationSuburb,
    notes: dashboardContext.notes,
  };
}
