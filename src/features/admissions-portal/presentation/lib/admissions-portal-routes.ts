import type { AdmissionsPortalContext } from "@/features/admissions-portal/domain/types";

export type ParentApplicationSection = "overview" | "payment" | "documents" | "schedule" | "decision";

export function buildParentApplicationId(studentName: string, index: number): string {
  const normalized = studentName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `student-${index + 1}${normalized ? `-${normalized}` : ""}`;
}

export function getParentApplicationDetailHref(context: AdmissionsPortalContext, applicationId: string): string {
  return `/dashboard/parent/applications/${encodeURIComponent(applicationId)}?${buildAdmissionsContextSearchParams(context).toString()}`;
}

export function getParentApplicationSectionHref(
  context: AdmissionsPortalContext,
  applicationId: string,
  section: Exclude<ParentApplicationSection, "overview">,
): string {
  return `/dashboard/parent/applications/${encodeURIComponent(applicationId)}/${section}?${buildAdmissionsContextSearchParams(context).toString()}`;
}

function buildAdmissionsContextSearchParams(context: AdmissionsPortalContext): URLSearchParams {
  const params = new URLSearchParams({
    parentName: context.parentName,
    email: context.email,
    school: context.school,
    hasExistingStudents: context.hasExistingStudents,
    locationSuburb: context.locationSuburb,
    students: JSON.stringify(context.students),
  });

  if (context.existingChildrenCount !== undefined) {
    params.set("existingChildrenCount", String(context.existingChildrenCount));
  }

  if (context.notes?.trim()) {
    params.set("notes", context.notes.trim());
  }

  return params;
}
