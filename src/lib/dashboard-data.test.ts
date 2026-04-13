import { getDashboardConfig, getParentAdmissionsContextFromSearchParams } from "@/lib/dashboard-data";

describe("dashboardData admissions context", () => {
  it("parses parent admissions context from dashboard search params", () => {
    const context = getParentAdmissionsContextFromSearchParams({
      parentName: "Siti Rahmawati",
      email: "parent@example.com",
      school: "iihs",
      students: JSON.stringify([
        {
          studentName: "Aisha Rahma",
          studentBirthDate: "2014-08-17",
          currentSchool: "Little Caliphs School",
          targetGrade: "year7",
        },
        {
          studentName: "Rayyan Rahma",
          studentBirthDate: "2016-01-08",
          currentSchool: "Little Caliphs School",
          targetGrade: "year8",
        },
      ]),
      hasExistingStudents: "no",
      locationSuburb: "South Jakarta",
      notes: "Needs transport info",
    });

    expect(context).toEqual({
      parentName: "Siti Rahmawati",
      email: "parent@example.com",
      school: "iihs",
      students: [
        {
          studentName: "Aisha Rahma",
          studentBirthDate: "2014-08-17",
          currentSchool: "Little Caliphs School",
          targetGrade: "year7",
        },
        {
          studentName: "Rayyan Rahma",
          studentBirthDate: "2016-01-08",
          currentSchool: "Little Caliphs School",
          targetGrade: "year8",
        },
      ],
      studentName: "Aisha Rahma",
      currentSchool: "Little Caliphs School",
      targetGrade: "year7",
      hasExistingStudents: "no",
      existingChildrenCount: undefined,
      locationSuburb: "South Jakarta",
      notes: "Needs transport info",
    });
  });

  it("builds the parent dashboard with admissions-specific dummy data", () => {
    const config = getDashboardConfig("parent", {
      parentName: "Siti Rahmawati",
      email: "parent@example.com",
      school: "iihs",
      students: [
        {
          studentName: "Aisha Rahma",
          studentBirthDate: "2014-08-17",
          currentSchool: "Little Caliphs School",
          targetGrade: "year7",
        },
        {
          studentName: "Rayyan Rahma",
          studentBirthDate: "2016-01-08",
          currentSchool: "Bright Scholars Academy",
          targetGrade: "year8",
        },
      ],
      studentName: "Aisha Rahma",
      currentSchool: "Little Caliphs School",
      targetGrade: "year7",
      hasExistingStudents: "yes",
      existingChildrenCount: 1,
      locationSuburb: "South Jakarta",
      notes: "Needs transport info",
    });

    expect(config?.admissionsContext?.studentName).toBe("Aisha Rahma");
    expect(config?.admissionsContext?.students).toHaveLength(2);
    expect(config?.metrics[0]?.value).toBe("3");
    expect(config?.metrics[0]?.trendKey).toContain("Aisha Rahma");
    expect(config?.tableRows[0]?.columnA).toBe("Aisha Rahma");
    expect(config?.tableRows[0]?.columnC).toBe("Additional form complete");
    expect(config?.parentPortal?.studentCards).toHaveLength(2);
    expect(config?.parentPortal?.summaryCards[0]?.value).toBe("2");
    expect(config?.parentPortal?.actions[0]?.titleKey).toBe("dashboard.parent.portal.student.action.book_assessment");
    expect(config?.parentPortal?.timeline[3]?.state).toBe("active");
  });
});
