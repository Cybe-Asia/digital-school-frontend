import {
  buildParentApplicationId,
  getParentApplicationDetailHref,
  getParentApplicationSectionHref,
} from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";

describe("admissions portal routes", () => {
  it("builds stable student application ids", () => {
    expect(buildParentApplicationId("Aisha Rahma", 0)).toBe("student-1-aisha-rahma");
  });

  it("builds detail and section hrefs without leaking parent context into the URL", () => {
    const detailHref = getParentApplicationDetailHref("student-1-aisha-rahma");
    const sectionHref = getParentApplicationSectionHref("student-1-aisha-rahma", "documents");

    expect(detailHref).toBe("/dashboard/parent/applications/student-1-aisha-rahma");
    expect(sectionHref).toBe("/dashboard/parent/applications/student-1-aisha-rahma/documents");
    // Explicit guard: the destination page reads context from the ds-session
    // cookie, so no query string is ever appended here.
    expect(detailHref).not.toContain("?");
    expect(sectionHref).not.toContain("?");
  });
});
