import {
  buildParentApplicationId,
  getParentApplicationDetailHref,
  getParentApplicationSectionHref,
} from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";

describe("admissions portal routes", () => {
  const context = {
    parentName: "Siti Rahmawati",
    email: "parent@example.com",
    school: "iihs" as const,
    students: [
      {
        studentName: "Aisha Rahma",
        studentBirthDate: "2014-08-17",
        currentSchool: "Little Caliphs School",
        targetGrade: "year7",
      },
    ],
    hasExistingStudents: "no" as const,
    locationSuburb: "South Jakarta",
    notes: "Needs transport info",
  };

  it("builds stable student application ids", () => {
    expect(buildParentApplicationId("Aisha Rahma", 0)).toBe("student-1-aisha-rahma");
  });

  it("preserves admissions context in detail and section links", () => {
    const detailHref = getParentApplicationDetailHref(context, "student-1-aisha-rahma");
    const sectionHref = getParentApplicationSectionHref(context, "student-1-aisha-rahma", "documents");

    expect(detailHref).toContain("/dashboard/parent/applications/student-1-aisha-rahma?");
    expect(detailHref).toContain("parentName=Siti+Rahmawati");
    expect(detailHref).toContain("students=%5B");
    expect(sectionHref).toContain("/documents?");
    expect(sectionHref).toContain("notes=Needs+transport+info");
  });
});
