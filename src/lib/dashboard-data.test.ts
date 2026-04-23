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
    // Row content changed when we moved off hardcoded mocks — pre-SIS
    // fallback now shows the admissions stage (applicantStatus) here.
    // The concrete default is "submitted" for a freshly-built context.
    expect(config?.tableRows[0]?.columnB).toBe("Admissions stage");
    expect(config?.parentPortal?.studentCards).toHaveLength(2);
    // Summary cards are now sentence-style. The first card covers today's
    // attendance — with no SIS data it falls back to a contextual
    // "no data yet" message that mentions the primary student by name.
    expect(config?.parentPortal?.summaryCards[0]?.titleKey).toBe(
      "dashboard.parent.portal.summary.attendance.title_no_data",
    );
    expect(config?.parentPortal?.summaryCards[0]?.titleValues?.student).toBe("Aisha Rahma");
    expect(config?.parentPortal?.summaryCards[0]?.tone).toBe("neutral");
    expect(config?.parentPortal?.actions[0]?.titleKey).toBe("dashboard.parent.portal.student.action.book_assessment");
    expect(config?.parentPortal?.timeline[3]?.state).toBe("active");
    // New sisToday snapshot defaults to empty until a kid has a studentId.
    expect(config?.parentPortal?.sisToday).toEqual([]);
    expect(config?.parentPortal?.sisAbsencesToday).toBe(0);
    expect(config?.parentPortal?.hasUnpaidPayment).toBe(true);
    // Tuition amount is no longer a hardcoded IDR value — it's an
    // em-dash placeholder until the parent billing endpoint exists.
    expect(config?.parentPortal?.paymentSummary.amount).toBe("—");
    // Unread updates count is zero now that we no longer hardcode 3.
    expect(config?.parentPortal?.unreadUpdates).toBe(0);
  });

  it("returns null for the parent role when no admissions context is supplied", () => {
    expect(getDashboardConfig("parent", null)).toBeNull();
    expect(getDashboardConfig("parent", undefined)).toBeNull();
  });

  it("returns null for the student and staff roles (no real API yet / redirected)", () => {
    expect(getDashboardConfig("student")).toBeNull();
    expect(getDashboardConfig("staff")).toBeNull();
  });
});
