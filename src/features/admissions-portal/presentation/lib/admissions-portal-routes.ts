export type ParentApplicationSection = "overview" | "payment" | "documents" | "schedule" | "decision";

export function buildParentApplicationId(studentName: string, index: number): string {
  const normalized = studentName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `student-${index + 1}${normalized ? `-${normalized}` : ""}`;
}

/**
 * Build the canonical URL for a parent's application detail page. The
 * destination page hydrates its own context from the `ds-session` cookie
 * via the admission-service `/me` endpoint, so we no longer round-trip the
 * admissions context through the query string.
 */
export function getParentApplicationDetailHref(applicationId: string): string {
  return `/dashboard/parent/applications/${encodeURIComponent(applicationId)}`;
}

/**
 * Build the canonical URL for a parent's application subsection (payment,
 * documents, schedule, decision). See `getParentApplicationDetailHref` for
 * why we no longer serialise context into the URL.
 */
export function getParentApplicationSectionHref(
  applicationId: string,
  section: Exclude<ParentApplicationSection, "overview">,
): string {
  return `/dashboard/parent/applications/${encodeURIComponent(applicationId)}/${section}`;
}
