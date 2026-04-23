import { additionalDetailsSchema } from "@/features/admissions-auth/schemas/additional-details-schema";

describe("additionalDetailsSchema", () => {
  it("requires the additional admissions fields", () => {
    const result = additionalDetailsSchema.safeParse({
      accessToken: "",
      students: [],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.accessToken).toContain("validation.additional.token_required");
      expect(errors.students).toContain("validation.additional.students_min");
    }
  });

  it("accepts a valid payload with per-student notes", () => {
    const result = additionalDetailsSchema.safeParse({
      accessToken: "jwt-access-token",
      students: [
        {
          studentName: "Aisha Rahma",
          studentBirthDate: "2014-08-17",
          currentSchool: "Little Caliphs School",
          targetGrade: "year7",
          targetSchool: "iihs",
          notes: "Requires school bus information.",
        },
        {
          studentName: "Rayyan Rahma",
          studentBirthDate: "2016-01-08",
          currentSchool: "Little Caliphs School",
          targetGrade: "year8",
          targetSchool: "iiss",
          notes: "",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects when a student is missing the target school", () => {
    const result = additionalDetailsSchema.safeParse({
      accessToken: "jwt-access-token",
      students: [
        {
          studentName: "Aisha Rahma",
          studentBirthDate: "2014-08-17",
          currentSchool: "Little Caliphs School",
          targetGrade: "year7",
          notes: "",
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
