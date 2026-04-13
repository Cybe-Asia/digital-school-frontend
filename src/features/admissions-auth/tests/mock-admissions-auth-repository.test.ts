import { MockAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/mock-admissions-auth-repository";

describe("MockAdmissionsAuthRepository", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns the submitted EOI as setup context", async () => {
    const repository = new MockAdmissionsAuthRepository();

    await repository.submitEOI({
      parentName: "Arief Pratama",
      email: "arief@example.com",
      whatsapp: "+62 811 1111 1111",
      locationSuburb: "Bekasi",
      occupation: "Engineer",
      hasExistingStudents: "yes",
      existingChildrenCount: 2,
      referralCode: "REF-42",
      heardFrom: "friend-family",
      school: "iiss",
    });

    const result = await repository.getSetupContext("valid-token");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.context.parentName).toBe("Arief Pratama");
      expect(result.context.email).toBe("arief@example.com");
      expect(result.context.locationSuburb).toBe("Bekasi");
      expect(result.context.occupation).toBe("Engineer");
      expect(result.context.hasExistingStudents).toBe("yes");
      expect(result.context.existingChildrenCount).toBe(2);
      expect(result.context.referralCode).toBe("REF-42");
      expect(result.context.heardFrom).toBe("friend-family");
      expect(result.context.school).toBe("iiss");
    }
  });
});
