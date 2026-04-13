import { createAdmissionsPortalRepository } from "@/features/admissions-portal/infrastructure/create-admissions-portal-repository";
import { buildParentApplicationId } from "@/features/admissions-portal/presentation/lib/admissions-portal-routes";

describe("MockAdmissionsPortalRepository", () => {
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
      {
        studentName: "Rayyan Rahma",
        studentBirthDate: "2016-01-08",
        currentSchool: "Bright Scholars Academy",
        targetGrade: "year8",
      },
    ],
    hasExistingStudents: "yes" as const,
    existingChildrenCount: 1,
    locationSuburb: "South Jakarta",
    notes: "Needs transport info",
  };

  it("returns application summaries for each registered student", async () => {
    const repository = createAdmissionsPortalRepository();
    const applications = await repository.getApplications(context);

    expect(applications).toHaveLength(2);
    expect(applications[0]?.id).toBe("student-1-aisha-rahma");
    expect(applications[1]?.status).toBe("awaiting_documents");
  });

  it("returns a detailed application view for a known student id", async () => {
    const repository = createAdmissionsPortalRepository();
    const detail = await repository.getApplicationDetail(context, buildParentApplicationId("Aisha Rahma", 0));

    expect(detail?.studentName).toBe("Aisha Rahma");
    expect(detail?.admissionsOwner).toBe("Farah Putri");
    expect(detail?.intakeLabel).toBe("AY 2026/2027");
    expect(detail?.payment.invoiceNumber).toBe("INV-2026-014");
    expect(detail?.payment.status).toBe("unpaid");
    expect(detail?.payment.lineItems).toHaveLength(3);
    expect(detail?.payment.updates).toHaveLength(4);
    expect(detail?.documents).toHaveLength(4);
    expect(detail?.assessment.status).toBe("not_booked");
    expect(detail?.assessment.resultStatus).toBe("pending");
    expect(detail?.timeline[3]?.detailKey).toBe("admissions.portal.timeline.review.detail");
  });

  it("opens document upload only after a passed assessment", async () => {
    const repository = createAdmissionsPortalRepository();
    const detail = await repository.getApplicationDetail(context, buildParentApplicationId("Rayyan Rahma", 1));

    expect(detail?.payment.status).toBe("paid");
    expect(detail?.assessment.status).toBe("completed");
    expect(detail?.assessment.resultStatus).toBe("passed");
    expect(detail?.status).toBe("awaiting_documents");
    expect(detail?.documents.some((document) => document.status === "missing")).toBe(true);
  });

  it("returns null for an unknown application id", async () => {
    const repository = createAdmissionsPortalRepository();
    const detail = await repository.getApplicationDetail(context, "missing-id");

    expect(detail).toBeNull();
  });
});
