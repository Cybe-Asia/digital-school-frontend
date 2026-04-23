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
    // With no latestPayment in the /me payload, nothing is unpaid —
    // the portal stays clear until a real invoice exists.
    expect(config?.parentPortal?.hasUnpaidPayment).toBe(false);
    // Tuition amount is an em-dash placeholder until the parent billing
    // endpoint exists OR a real admissions payment is attached.
    expect(config?.parentPortal?.paymentSummary.amount).toBe("—");
    // Unread updates count is zero now that we no longer hardcode 3.
    expect(config?.parentPortal?.unreadUpdates).toBe(0);
  });

  it("surfaces a real latestPayment amount when /me returns one", () => {
    const ctx = {
      parentName: "Demo Parent",
      email: "demo@example.com",
      school: "iiss" as const,
      students: [
        { studentName: "Ahmad", studentBirthDate: "2014-01-01", currentSchool: "SD", targetGrade: "year7" as const },
      ],
      studentName: "Ahmad",
      currentSchool: "SD",
      targetGrade: "year7" as const,
      hasExistingStudents: "no" as const,
      locationSuburb: "Jakarta",
    };
    const config = getDashboardConfig(
      "parent",
      ctx,
      null,
      { status: "paid", amount: 5_000_000, hostedInvoiceUrl: null },
    );
    expect(config?.parentPortal?.hasUnpaidPayment).toBe(false);
    expect(config?.parentPortal?.paymentSummary.amount).toBe("Rp 5.000.000");
    expect(config?.parentPortal?.paymentSummary.statusKey).toBe(
      "dashboard.parent.portal.payments.status.paid",
    );
  });

  it("flags pending invoices with a red badge + real amount", () => {
    const ctx = {
      parentName: "Demo Parent",
      email: "demo@example.com",
      school: "iiss" as const,
      students: [
        { studentName: "Ahmad", studentBirthDate: "2014-01-01", currentSchool: "SD", targetGrade: "year7" as const },
      ],
      studentName: "Ahmad",
      currentSchool: "SD",
      targetGrade: "year7" as const,
      hasExistingStudents: "no" as const,
      locationSuburb: "Jakarta",
    };
    const config = getDashboardConfig(
      "parent",
      ctx,
      null,
      { status: "pending", amount: 2_400_000, hostedInvoiceUrl: null },
    );
    expect(config?.parentPortal?.hasUnpaidPayment).toBe(true);
    expect(config?.parentPortal?.paymentSummary.amount).toBe("Rp 2.400.000");
    expect(config?.parentPortal?.paymentSummary.statusKey).toBe(
      "dashboard.parent.portal.payments.status.pending",
    );
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
