import { ApiAdmissionsPortalRepository } from "@/features/admissions-portal/infrastructure/api-admissions-portal-repository";
import type { AdmissionsPortalContext } from "@/features/admissions-portal/domain/types";
import type {
  ParentMeFetchResult,
  ParentMeRichPayload,
} from "@/features/admissions-portal/infrastructure/fetch-parent-me";

function contextFor(payload: ParentMeRichPayload): AdmissionsPortalContext {
  return {
    parentName: payload.lead.parentName,
    email: payload.lead.email,
    school: "iiss",
    students: payload.students.map((s) => ({
      studentName: s.fullName,
      studentBirthDate: s.dateOfBirth,
      currentSchool: s.currentSchool,
      targetGrade: s.targetGradeLevel,
      applicantStatus: s.applicantStatus,
      studentId: s.studentId,
    })),
    hasExistingStudents: "no",
    locationSuburb: payload.lead.location ?? "Jakarta",
  };
}

function buildMePayload(overrides: Partial<ParentMeRichPayload> = {}): ParentMeRichPayload {
  return {
    lead: {
      admissionId: "LEAD-DEMO-001",
      email: "demo@cybe.tech",
      parentName: "Siti Rahmawati",
      whatsappNumber: "+6281200000001",
      schoolSelection: "SCH-IISS",
      location: "Jakarta",
      isVerified: true,
      existingStudents: 0,
    },
    students: [
      {
        studentId: "STU-001",
        fullName: "Ahmad Budi Santoso",
        dateOfBirth: "2012-05-01",
        currentSchool: "SD Negeri 1",
        targetGradeLevel: "year7",
        applicantStatus: "submitted",
      },
    ],
    latestPayment: {
      paymentId: "PAY-001",
      paymentType: "registration",
      status: "pending",
      amount: 2100000,
      currency: "IDR",
      hostedInvoiceUrl: "https://pay.example/invoice",
    },
    ...overrides,
  };
}

function stubFetcher(payload: ParentMeRichPayload): (token: string | undefined | null) => Promise<ParentMeFetchResult> {
  return async () => ({ kind: "ok", payload });
}

describe("ApiAdmissionsPortalRepository", () => {
  it("maps /me students into application summaries keyed by slug id", async () => {
    const payload = buildMePayload();
    const repo = new ApiAdmissionsPortalRepository("token", stubFetcher(payload));

    const applications = await repo.getApplications(contextFor(payload));

    expect(applications).toHaveLength(1);
    expect(applications[0]?.id).toBe("student-1-ahmad-budi-santoso");
    expect(applications[0]?.studentName).toBe("Ahmad Budi Santoso");
    expect(applications[0]?.status).toBe("payment_review");
    expect(applications[0]?.targetGrade).toBe("year7");
  });

  it("resolves a detail by application slug and maps payment signals", async () => {
    const payload = buildMePayload();
    const repo = new ApiAdmissionsPortalRepository("token", stubFetcher(payload));

    const detail = await repo.getApplicationDetail(contextFor(payload), "student-1-ahmad-budi-santoso");

    expect(detail).not.toBeNull();
    expect(detail?.studentName).toBe("Ahmad Budi Santoso");
    expect(detail?.payment.status).toBe("unpaid");
    expect(detail?.payment.amount).toContain("2.100.000");
    expect(detail?.decision.status).toBe("pending");
    expect(detail?.timeline.length).toBeGreaterThan(0);
    expect(detail?.documents).toHaveLength(4);
  });

  it("promotes the application to offer_released once applicantStatus is offer_issued", async () => {
    const payload = buildMePayload({
      students: [
        {
          studentId: "STU-001",
          fullName: "Ahmad Budi Santoso",
          dateOfBirth: "2012-05-01",
          currentSchool: "SD Negeri 1",
          targetGradeLevel: "year7",
          applicantStatus: "offer_issued",
        },
      ],
      latestPayment: { status: "paid", amount: 2100000, currency: "IDR" },
    });
    const repo = new ApiAdmissionsPortalRepository("token", stubFetcher(payload));

    const applications = await repo.getApplications(contextFor(payload));
    const detail = await repo.getApplicationDetail(contextFor(payload), applications[0]!.id);

    expect(applications[0]?.status).toBe("offer_released");
    expect(detail?.payment.status).toBe("paid");
    expect(detail?.decision.status).toBe("offer_released");
  });

  it("returns null for an unknown application id", async () => {
    const payload = buildMePayload();
    const repo = new ApiAdmissionsPortalRepository("token", stubFetcher(payload));

    const detail = await repo.getApplicationDetail(contextFor(payload), "student-999-nobody");

    expect(detail).toBeNull();
  });

  it("returns an empty list when the fetcher reports unauthenticated", async () => {
    const repo = new ApiAdmissionsPortalRepository(null, async () => ({ kind: "unauthenticated" }));

    const context: AdmissionsPortalContext = {
      parentName: "",
      email: "",
      school: "iiss",
      students: [],
      hasExistingStudents: "no",
      locationSuburb: "",
    };

    expect(await repo.getApplications(context)).toEqual([]);
    expect(await repo.getApplicationDetail(context, "student-1-anything")).toBeNull();
  });
});
