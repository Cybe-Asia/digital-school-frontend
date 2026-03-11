import { eoiSchema } from "@/features/admissions-auth/schemas/eoi-schema";

describe("eoiSchema", () => {
  it("requires all fields except referral code", () => {
    const result = eoiSchema.safeParse({
      parentName: "",
      email: "invalid",
      whatsapp: "abc",
      locationSuburb: "",
      occupation: "",
      hasExistingStudents: "yes",
      heardFrom: "",
      school: "iihs",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.parentName).toBeTruthy();
      expect(errors.email).toBeTruthy();
      expect(errors.whatsapp).toBeTruthy();
      expect(errors.locationSuburb).toBeTruthy();
      expect(errors.occupation).toBeTruthy();
      expect(errors.existingChildrenCount).toBeTruthy();
      expect(errors.heardFrom).toBeTruthy();
      expect(errors.referralCode).toBeUndefined();
    }
  });

  it("accepts both school enum values", () => {
    const base = {
      parentName: "Siti Rahmawati",
      email: "parent@example.com",
      whatsapp: "+62 812 3456 7890",
      locationSuburb: "South Jakarta",
      occupation: "Entrepreneur",
      hasExistingStudents: "yes" as const,
      existingChildrenCount: 2,
      heardFrom: "social-media",
    };

    expect(eoiSchema.safeParse({ ...base, school: "iihs" }).success).toBe(true);
    expect(eoiSchema.safeParse({ ...base, school: "iiss" }).success).toBe(true);
  });

  it("does not require children count when no existing students", () => {
    const result = eoiSchema.safeParse({
      parentName: "Siti Rahmawati",
      email: "parent@example.com",
      whatsapp: "+62 812 3456 7890",
      locationSuburb: "South Jakarta",
      occupation: "Entrepreneur",
      hasExistingStudents: "no",
      heardFrom: "social-media",
      school: "iihs",
    });

    expect(result.success).toBe(true);
  });
});
